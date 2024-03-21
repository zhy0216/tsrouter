type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
    : T extends `${infer Start}:${infer Param}`
      ? { [k in Param]: string }
      : Record<string, string>;

class Trie<T> {
  _map?: Map<string, Trie<T>>;
  data?: T;
  constructor(data?: T) {
    this.data = data;
  }

  get(key: string): Trie<T> | undefined {
    return this._map?.get(key);
  }

  getOrNew(key: string): Trie<T> {
    const t = this.map.get(key);

    if (!t) {
      const nt = new Trie<T>();
      this.map.set(key, nt);
      return nt;
    }

    return t;
  }

  get map(): Map<string, Trie<T>> {
    if (!this._map) {
      this._map = new Map();
    }

    return this._map;
  }
}

interface StoreTrieData {
  parameterNames: string[];
  fn: (ctx: unknown) => Promise<Response | unknown>;
}

export type METHODS = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";

export class Router<CTX> {
  store: Map<string, Trie<StoreTrieData>> = new Map();

  getOrNewTireByMethod(method: string): Trie<StoreTrieData> {
    let trie = this.store.get(method);
    if (trie === undefined) {
      trie = new Trie();
      this.store.set(method, trie);
    }

    return trie;
  }

  _add(
    method: METHODS,
  ): <T extends string>(
    url: T,
    fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response> | unknown,
  ) => void {
    return (url, fn) => {
      let trie = this.getOrNewTireByMethod(method);

      const segments = url.split("/");
      const parameterNames: string[] = [];

      for (const segment of segments) {
        if (segment.startsWith(":")) {
          parameterNames.push(segment.slice(1));
          trie = trie.getOrNew(":");
        } else {
          trie = trie.getOrNew(segment);
        }
      }

      trie.data = { parameterNames, fn } as StoreTrieData;
    };
  }

  add = <T extends string>(
    method: METHODS,
    url: T,
    fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response> | unknown,
  ) => this._add(method)(url, fn);

  get = this._add("GET");

  post = this._add("POST");

  put = this._add("PUT");

  patch = this._add("PATCH");

  options = this._add("PATCH");

  delete = this._add("DELETE");

  _matchTrie(
    segments: string[],
    initTrie: Trie<StoreTrieData>,
  ): { trie: Trie<StoreTrieData>; parameters: string[] } | undefined {
    const paths: [Trie<StoreTrieData>, string[], number][] = [[initTrie, [], 0]];
    const segmentLength = segments.length;
    let pathLength = 1;

    while (pathLength) {
      const [curTire, parameters, index] = paths[--pathLength];
      const segment = segments[index];

      const dynamicTrie = curTire.get(":");
      if (dynamicTrie) {
        if (segmentLength - 1 === index) {
          return { trie: dynamicTrie, parameters: parameters.concat(segment) };
        }
        paths[pathLength++] = [dynamicTrie, parameters.concat(segment), index + 1];
      }

      const trie = curTire.get(segment);
      if (trie) {
        if (segmentLength - 1 === index) {
          return { trie, parameters };
        }
        paths[pathLength++] = [trie, parameters, index + 1];
      }

      const startTrie = curTire.get("*");
      if (startTrie) {
        return { trie: startTrie, parameters };
      }
    }
  }

  match(
    method: METHODS,
    url: string,
  ):
    | ((
        ctx: CTX & {
          params: Record<string, string>;
        },
      ) => Promise<Response> | unknown)
    | undefined {
    const segments = url.split("/");
    const trie: Trie<StoreTrieData> = this.getOrNewTireByMethod(method);
    const result = this._matchTrie(segments, trie);
    const data = result?.trie?.data;

    if (data) {
      const fn = data.fn;
      const parameterNames = data.parameterNames;

      return (ctx: CTX & { params: Record<string, string> }) => {
        if (result.parameters) {
          for (let i = 0; i < result.parameters.length; i++) {
            if (ctx?.params) {
              ctx.params[parameterNames[i]] = result.parameters[i];
            }
          }
        }

        return fn(ctx);
      };
    }
  }
}

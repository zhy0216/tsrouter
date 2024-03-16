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

  add<T extends string>(method: METHODS, url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
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
  }

  get<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("GET", url, fn);
  }

  post<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("POST", url, fn);
  }

  put<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("PUT", url, fn);
  }

  patch<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("PATCH", url, fn);
  }

  options<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("OPTIONS", url, fn);
  }

  delete<T extends string>(url: T, fn: (ctx: CTX & { params: ExtractRouteParams<T> }) => Promise<Response | unknown>) {
    this.add("DELETE", url, fn);
  }

  _matchTrie(segments: string[], initTrie: Trie<StoreTrieData>, parameters: string[], startIndex: number): { trie: Trie<StoreTrieData>; parameters: string[] } | undefined {
    let curTire: Trie<StoreTrieData> | undefined = initTrie;
    const laterMatchParas: { trie: Trie<StoreTrieData>; parameters: string[]; startIndex: number }[] = [];

    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      const dynamicTrie: Trie<StoreTrieData> | undefined = curTire?.get(":");
      curTire = curTire?.get(segment);
      if (!curTire) {
        if (dynamicTrie) {
          parameters.push(segment);
          curTire = dynamicTrie;
        }
      } else {
        if (dynamicTrie) {
          laterMatchParas.push({ trie: dynamicTrie, startIndex: i + 1, parameters: parameters.concat(segment) });
        }
      }
    }

    if (curTire?.data) {
      return { trie: curTire, parameters };
    }

    for (const { trie, startIndex, parameters } of laterMatchParas) {
      const result = this._matchTrie(segments, trie, parameters, startIndex);
      if (result) {
        return result;
      }
    }
  }

  match(url: string, method: string): ((ctx: CTX & { params: Record<string, string> }) => Promise<Response | unknown>) | undefined {
    const segments = url.split("/");
    const trie: Trie<StoreTrieData> = this.getOrNewTireByMethod(method);
    const result = this._matchTrie(segments, trie, [], 0);
    const data = result?.trie?.data;

    if (data) {
      const fn = data.fn;
      const parameterNames = data.parameterNames;

      return (ctx: CTX & { params: Record<string, string> }) => {
        if (result.parameters) {
          for (let i = 0; i < result.parameters.length; i++) {
            ctx.params[parameterNames[i]] = result.parameters[i];
          }
        }

        return fn(ctx);
      };
    }
  }
}

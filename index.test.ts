import { test, expect, it, describe } from "bun:test";
import { type METHODS, Router } from ".";

test("router get by params", async () => {
  const router = new Router<unknown>();
  router.get("/user/:username", async (ctx) => {
    return `hello, ${ctx.params.username}`;
  });

  const fn = router.match("GET", "/user/world");
  expect(await fn?.({ params: {} })).toBe("hello, world");
});

test("router get crossing multiple links", async () => {
  const router = new Router<unknown>();
  router.get("/user/test", async (ctx) => {
    return "hello, test";
  });

  router.get("/:action/:username", async (ctx) => {
    return `${ctx.params.action}, ${ctx.params.username}`;
  });

  const fn = router.match("GET", "/hello/world");
  expect(await fn?.({ params: {} })).toBe("hello, world");
});

test("router get may match multiple links", async () => {
  const router = new Router<unknown>();
  router.get("/hello/test", async (ctx) => {
    return "hello, test";
  });

  router.get("/:action/:username", async (ctx) => {
    return `${ctx.params.action}, ${ctx.params.username}`;
  });

  const fn = router.match("GET", "/hello/world");
  expect(await fn?.({ params: {} })).toBe("hello, world");
});

test("router post should work", async () => {
  const router = new Router<unknown>();

  router.post("/:action/:username", async (ctx) => {
    return `${ctx.params.action}|${ctx.params.username}`;
  });

  router.post("/hello/test", async (ctx) => {
    return "hello, test";
  });

  const fn = router.match("POST", "/hello/test");
  expect(await fn?.({ params: {} })).toBe("hello, test");
});

// test from https://github.com/SaltyAom/memoirist/blob/main/test/index.test.ts
describe("complex", () => {
  const router = new Router();

  const add = (method: METHODS, url: string, result: string) => router.add(method, url, () => result);
  const match = (method: METHODS, url: string): string => router.match(method, url)?.({ params: {} }) as any;

  add("GET", "/abc", "/abc");
  add("GET", "/id/:id/book", "book");
  add("GET", "/id/:id/bowl", "bowl");

  add("GET", "/", "/");
  router.add("GET", "/id/:id", (ctx) => `/id/${ctx.params.id}`);
  router.add("GET", "/id/:id/abc/def", (ctx) => `/id/${ctx.params.id}/abc/def`);
  router.add("GET", "/id/:id/abd/efd", (ctx) => `/id/${ctx.params.id}/abd/efd`);
  router.add("GET", "/id/:id/name/:name", (ctx) => `/id/${ctx.params.id}/name/${ctx.params.name}`);
  router.add("GET", "/id/:id/name/a", (ctx) => `/id/${ctx.params.id}/name/a`);
  router.add("GET", "/dynamic/:name/then/static", (ctx) => `/dynamic/${ctx.params.name}/then/static`);
  add("GET", "/deep/nested/route", "/deep/nested/route");
  add("GET", "/rest/*", "/rest/*");

  it("match root", () => {
    expect(match("GET", "/")).toEqual("/");
  });

  it("get path parameter", () => {
    expect(match("GET", "/id/1")).toEqual("/id/1");
  });

  it("get multiple path parameters", () => {
    expect(match("GET", "/id/1/name/name")).toEqual("/id/1/name/name");
  });

  it("get deep static route", () => {
    expect(match("GET", "/deep/nested/route")).toEqual("/deep/nested/route");
  });

  it("match wildcard", () => {
    expect(match("GET", "/rest/a/b/c")).toEqual("/rest/*");
  });

  it("handle mixed dynamic and static", () => {
    expect(match("GET", "/dynamic/param/then/static")).toEqual("/dynamic/param/then/static");
  });

  it("handle static path in dynamic", () => {
    expect(match("GET", "/id/1/name/a")).toEqual("/id/1/name/a");
  });

  it("handle dynamic as fallback", () => {
    expect(match("GET", "/id/1/name/ame")).toEqual("/id/1/name/ame");
  });

  it("handle trailing slash", async () => {
    const router = new Router();

    router.add("GET", "/abc/def", () => "A");
    router.add("GET", "/abc/def/", () => "A");

    expect(await router.match("GET", "/abc/def")?.({ params: {} })).toEqual("A");

    expect(await router.match("GET", "/abc/def/")?.({ params: {} })).toEqual("A");
  });
});

it("wildcard on root path", async () => {
  const router = new Router();

  router.add("GET", "/a/b", () => "ok");
  router.add("GET", "/*", () => "all");

  expect(await router.match("GET", "/a/b/c/d")?.({ params: {} })).toEqual("all");
  expect(await router.match("GET", "/")?.({ params: {} })).toEqual("all");
});

it("can overwrite wildcard", async () => {
  const router = new Router();

  router.add("GET", "/", () => "ok");
  router.add("GET", "/*", () => "all");

  expect(await router.match("GET", "/a/b/c/d")?.({ params: {} })).toEqual("all");
  expect(await router.match("GET", "/")?.({ params: {} })).toEqual("ok");
});

// it("handle static prefix wildcard", () => {
//   const router = new Memoirist();
//   router.add("GET", "/a/b", "ok");
//   router.add("GET", "/*", "all");
//
//   expect(match("GET", "/a/b/c/d")).toEqual({
//     store: "all",
//     params: {
//       "*": "a/b/c/d",
//     },
//   });
//
//   expect(match("GET", "/")).toEqual({
//     store: "all",
//     params: {
//       "*": "",
//     },
//   });
// });
//
//
// it("handle wildcard without static fallback", () => {
//   const router = new Memoirist();
//   router.add("GET", "/public/*", "foo");
//   router.add("GET", "/public-aliased/*", "foo");
//
//   expect(match("GET", "/public/takodachi.png")?.params["*"]).toBe("takodachi.png");
//   expect(match("GET", "/public/takodachi/ina.png")?.params["*"]).toBe("takodachi/ina.png");
// });
//

it("restore mangled path", () => {
  const router = new Router();
  const add = (method: METHODS, url: string, result: string) => router.add(method, url, () => result);
  const match = (method: METHODS, url: string): string => router.match(method, url)?.({ params: {} }) as any;

  add("GET", "/users/:userId", "/users/:userId");
  add("GET", "/game", "/game");
  router.add("GET", "/game/:gameId/state", (ctx) => `/game/${ctx.params.gameId}/state`);
  router.add("GET", "/game/:gameId", (ctx) => `/game/${ctx.params.gameId}`);

  expect(match("GET", "/game/1/state")).toBe("/game/1/state");
  expect(match("GET", "/game/1")).toBe("/game/1");
});

//
// it("should be a ble to register param after same prefix", () => {
//   const router = new Memoirist();
//
//   router.add("GET", "/api/abc/view/:id", "/api/abc/view/:id");
//   router.add("GET", "/api/abc/:type", "/api/abc/:type");
//
//   expect(match("GET", "/api/abc/type")).toEqual({
//     store: "/api/abc/:type",
//     params: {
//       type: "type",
//     },
//   });
//
//   expect(match("GET", "/api/abc/view/1")).toEqual({
//     store: "/api/abc/view/:id",
//     params: {
//       id: "1",
//     },
//   });
// });
//
// it("use exact match for part", () => {
//   const router = new Memoirist();
//
//   router.add("GET", "/api/search/:term", "/api/search/:term");
//   router.add("GET", "/api/abc/view/:id", "/api/abc/view/:id");
//   router.add("GET", "/api/abc/:type", "/api/abc/:type");
//
//   expect(match("GET", "/api/abc/type")?.store).toBe("/api/abc/:type");
//   expect(match("GET", "/api/awd/type")).toBe(null);
// });
//
it("not error on not found", () => {
  const router = new Router();

  router.add("GET", "/api/abc/:type", () => "/api/abc/:type");

  expect(router.match("GET", "/api")).toBeUndefined();
  expect(router.match("POST", "/api/awd/type")).toBeUndefined();
});

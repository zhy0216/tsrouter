import { test, expect } from "bun:test";
import { Router } from ".";

test("router get by params", async () => {
  const router = new Router<Request>();
  router.get("/user/:username", async (ctx) => {
    return "hello, " + ctx.params.username;
  });

  const fn = router.match("/user/world", "GET");
  expect(await fn?.({ params: {} } as any)).toBe("hello, world");
});

test("router get crossing multiple links", async () => {
  const router = new Router<Request>();
  router.get("/user/test", async (ctx) => {
    return "hello, test";
  });

  router.get("/:action/:username", async (ctx) => {
    return ctx.params.action + ", " + ctx.params.username;
  });

  const fn = router.match("/hello/world", "GET");
  expect(await fn?.({ params: {} } as any)).toBe("hello, world");
});

test("router get may match multiple links", async () => {
  const router = new Router<Request>();
  router.get("/hello/test", async (ctx) => {
    return "hello, test";
  });

  router.get("/:action/:username", async (ctx) => {
    return ctx.params.action + ", " + ctx.params.username;
  });

  const fn = router.match("/hello/world", "GET");
  expect(await fn?.({ params: {} } as any)).toBe("hello, world");
});

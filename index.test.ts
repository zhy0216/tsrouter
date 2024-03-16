import { test, expect } from "bun:test";
import { Router } from ".";

test("router get by params", async () => {
  const router = new Router<unknown>();
  router.get("/user/:username", async (ctx) => {
    return `hello, ${ctx.params.username}`;
  });

  const fn = router.match("/user/world", "GET");
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

  const fn = router.match("/hello/world", "GET");
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

  const fn = router.match("/hello/world", "GET");
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

  const fn = router.match("/hello/test", "POST");
  expect(await fn?.({ params: {} })).toBe("hello, test");
});

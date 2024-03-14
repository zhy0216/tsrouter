import {test, expect} from "bun:test"
import {Router} from "."


test("router get", async () => {
  const router = new Router<Request>()
  router.get("/user/:username", async (ctx) => {
    return "hello, " + ctx.params.username
  })

  const fn = router.match("/user/world")
  expect(await fn()).toBe("hello, world")
})

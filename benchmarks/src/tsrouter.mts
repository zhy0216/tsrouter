import { Router } from '../../index.ts'
import type { RouterInterface } from './tool.mts'
import { routes, handler } from './tool.mts'

const router = new Router()
for (const route of routes) {
  router.add(route.method, route.path, handler as any)
}

export const tsRouter: RouterInterface = {
  name: "TSRouter",
  match: (route) => {
    router.match(route.method, route.path)
  },
}

import { Router, type METHODS } from "tsrouter2";
import type { ServeOptions } from "bun";

interface MyRequest extends Request {
  query: Record<string, string | null>;
}

class BunApp {
  router = new Router<MyRequest>();

  get = this.router.get;

  serve(option?: Partial<ServeOptions>) {
    Bun.serve({
      ...option,
      fetch: (req: Request) => {
        const url = new URL(req.url);
        const fn = this.router.match(req.method as METHODS, url.pathname);
        if (fn) {
          const query = new Proxy(
            {},
            {
              get(target, p: string) {
                return url.searchParams.get(p);
              },
            },
          );
          // TODO: Match type error here
          return fn({ ...req, params: {}, query }).then<Response>((result) => (result instanceof Response ? result : new Response(result as any)));
        }

        return new Response(`404!`);
      },
    });
  }
}

const app = new BunApp();

app.get("/echo", (ctx) => ctx.query.echo);

app.serve({ port: 8888 });

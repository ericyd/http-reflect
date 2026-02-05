import { H3 } from "h3";
import * as reflect from "./reflect";
import * as status from "./status";
import * as html from "./html";

const app = new H3();

// Register routes from each module
// Mounting at the root doesn't work, we have to register routes in a different way.
// We could use this pattern everywhere, but mounting new apps "feels" nicer
reflect.register(app);
app.mount("/status", status.app);
app.mount("/html", html.app);

// Export the fetch handler for Cloudflare Workers
export default {
  async fetch(
    request: Request,
    env: any,
    ctx: ExecutionContext
  ): Promise<Response> {
    return app.fetch(request);
  },
};

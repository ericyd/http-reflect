import { EventHandlerRequest, H3, H3Event } from "h3";

export const app = new H3();

app.get("/", html);
app.post("/", html);
app.put("/", html);
app.delete("/", html);
app.options("/", html);
app.head("/", html);
app.trace("/", html);
app.connect("/", html);

function html(_event: H3Event<EventHandlerRequest>): Response {
  return new Response("<html><body><h1>Hello, World!</h1></body></html>", {
    headers: { "Content-Type": "text/html" },
  });
}

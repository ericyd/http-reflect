import { H3 } from "h3";

export const app = new H3();

app.get(
  "/",
  (event) =>
    new Response("<html><body><h1>Hello, World!</h1></body></html>", {
      headers: { "Content-Type": "text/html" },
    })
);

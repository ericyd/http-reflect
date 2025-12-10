import { H3 } from "h3";

const app = new H3();

app.get("/", async (event) => {
  return Response.json({
    validRoutes: ['/get', '/post'],
  });
});

// GET endpoint: converts query params to JSON and responds with JSON
app.get("/get", async (event) => {
  const queryParams: Record<string, string> = {};
  
  // Convert URLSearchParams to a plain object
  event.url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  
  return Response.json(queryParams);
});

// POST endpoint: accepts JSON and responds with JSON
app.post("/post", async (event) => {
  try {
    const body = await event.req.json()
    return Response.json(body);
  } catch (error) {
    // If request body is not valid JSON, return error
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
});

// Export the fetch handler for Cloudflare Workers
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request);
  },
};

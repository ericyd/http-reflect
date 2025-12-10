import { H3 } from "h3";

const app = new H3();

app.get("/", async (event) => {
  return Response.json({
    validRoutes: ['/get', '/post', '/patch'],
  });
});

function queryParamsToJson(searchParams: URLSearchParams) {
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });
  return queryParams;
}

// GET endpoint: converts query params to JSON and responds with JSON
app.get("/get", async (event) => {
  return Response.json(queryParamsToJson(event.url.searchParams));
});

// PATCH endpoint: converts query params to JSON and responds with JSON.
app.patch("/patch", async (event) => {
  return Response.json(queryParamsToJson(event.url.searchParams));
});

// POST endpoint: accepts JSON and responds with JSON. Includes query params in the response.
app.post("/post", async (event) => {
  const queryParams = queryParamsToJson(event.url.searchParams);
  try {
    const body = await event.req.json()
    return Response.json({ ...body, ...queryParams });
  } catch (error) {
    // If request body is not valid JSON, return error, but include the query params
    return Response.json(
      { 
        error: "Invalid JSON in request body",
        ...queryParams
      },
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

import { EventHandlerRequest, H3, H3Event } from "h3";

const app = new H3();

app.get("/", reflect);
app.post("/", reflect);
app.get("/get", reflect);
app.patch("/patch", reflect);
app.post("/post", reflect);
app.get(
  "/html",
  (event) =>
    new Response("<html><body><h1>Hello, World!</h1></body></html>", {
      headers: { "Content-Type": "text/html" },
    })
);

async function reflect(event: H3Event<EventHandlerRequest>): Promise<Response> {
  const queryParams = queryParamsToJson(event.url.searchParams);

  if (event.req.method === "GET") {
    return Response.json(queryParams);
  }

  try {
    const body = await event.req.json();
    return Response.json({ ...body, ...queryParams });
  } catch (error) {
    // If request body is not valid JSON, return error, but include the query params
    return Response.json(
      {
        error: "Invalid JSON in request body",
        ...queryParams,
      },
      { status: 400 }
    );
  }
}

function queryParamsToJson(searchParams: URLSearchParams) {
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });
  return queryParams;
}

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

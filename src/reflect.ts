import { EventHandlerRequest, H3, H3Event } from "h3";

export function register(app: H3): void {
  app.get("/", reflect);
  app.post("/", reflect);
  app.patch("/", reflect);
  app.put("/", reflect);
  app.delete("/", reflect);
  app.options("/", reflect);
  app.head("/", reflect);
  app.trace("/", reflect);
  app.connect("/", reflect);
}

async function reflect(event: H3Event<EventHandlerRequest>): Promise<Response> {
  const queryParams = queryParamsToJson(event.url.searchParams);

  if (event.req.method === "GET") {
    return Response.json(queryParams);
  }

  try {
    const body = await event.req.json();
    const params = { ...body, ...queryParams };
    console.log(params);
    return Response.json(params);
  } catch (error) {
    // If request body is not valid JSON, return error, but include the query params
    const params = {
      error: "Invalid JSON in request body",
      ...queryParams,
    };
    console.log(params);
    return Response.json(params, { status: 400 });
  }
}

function queryParamsToJson(searchParams: URLSearchParams) {
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });
  return queryParams;
}

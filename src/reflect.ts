import { H3, H3Event } from "h3";
import type { EventHandlerRequest } from "h3";

export function register(app: H3): void {
  registerAllMethods(app, "/", reflectRequest);
}

export function registerAllMethods(
  app: H3,
  path: string,
  handler: (event: H3Event<EventHandlerRequest>) => Response | Promise<Response>
): void {
  app.get(path, handler);
  app.post(path, handler);
  app.patch(path, handler);
  app.put(path, handler);
  app.delete(path, handler);
  app.options(path, handler);
  app.head(path, handler);
  app.trace(path, handler);
  app.connect(path, handler);
}

export async function reflectRequest(
  event: H3Event<EventHandlerRequest>
): Promise<Response> {
  const queryParams = queryParamsToJson(event.url.searchParams);

  if (event.req.method === "GET") {
    return Response.json(queryParams);
  }

  try {
    const body = await event.req.json();
    const params = { ...body, ...queryParams };
    return Response.json(params);
  } catch (error) {
    // If request body is not valid JSON, return error, but include the query params
    const params = {
      error: "Invalid JSON in request body",
      ...queryParams,
    };
    return Response.json(params, { status: 400 });
  }
}

function queryParamsToJson(
  searchParams: URLSearchParams
): Record<string, string> {
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });
  return queryParams;
}

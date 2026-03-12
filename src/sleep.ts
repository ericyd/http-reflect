import { EventHandlerRequest, H3, H3Event } from "h3";
import * as reflect from "./reflect";
import * as status from "./status";

export const app = new H3();

reflect.registerAllMethods(app, "/:duration_ms", handleReflectWithSleep);

// Ensure the /status routes sleep before responding with a status.
app.use("/:duration_ms/status/**", sleepRequest);
app.mount("/:duration_ms/status", status.app);

async function handleReflectWithSleep(
  event: H3Event<EventHandlerRequest>
): Promise<Response> {
  const sleepResponse = await sleepRequest(event);
  if (sleepResponse) {
    return sleepResponse;
  }
  return reflect.reflectRequest(event);
}

async function sleepRequest(
  event: H3Event<EventHandlerRequest>
): Promise<Response | void> {
  const durationMs = parseDurationMs(event.context.params?.duration_ms);
  if (durationMs === null) {
    return Response.json(
      { error: "Invalid duration_ms. Must be a non-negative integer." },
      { status: 400 }
    );
  }

  await sleep(durationMs);
}

function parseDurationMs(rawDuration: string | undefined): number | null {
  if (rawDuration === undefined || !/^\d+$/.test(rawDuration)) {
    return null;
  }

  return parseInt(rawDuration, 10);
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

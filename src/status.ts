import { EventHandlerRequest, H3, H3Event } from "h3";

export const app = new H3();

app.get("/:status_code", handleStatus);
app.post("/:status_code", handleStatus);
app.patch("/:status_code", handleStatus);
app.put("/:status_code", handleStatus);
app.delete("/:status_code", handleStatus);
app.options("/:status_code", handleStatus);
app.head("/:status_code", handleStatus);
app.trace("/:status_code", handleStatus);
app.connect("/:status_code", handleStatus);

function handleStatus(event: H3Event<EventHandlerRequest>): Response {
  const statusCode = parseInt(event.context.params?.status_code || "200", 10);

  // Validate status code is a valid HTTP status (100-599)
  if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
    return Response.json(
      { error: "Invalid status code. Must be between 100 and 599." },
      { status: 400 }
    );
  }

  const statusText = getStatusText(statusCode);

  return Response.json(
    {
      status: statusCode,
      statusText,
    },
    { status: statusCode }
  );
}

// Common HTTP status code text mappings
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    // 1xx Informational
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    // 2xx Success
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    // 3xx Redirection
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    // 4xx Client Error
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    // 5xx Server Error
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
  };

  return statusTexts[statusCode] || "Unknown Status";
}

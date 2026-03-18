import assert from "node:assert/strict";
import { test } from "node:test";
import { H3 } from "h3";
import * as reflect from "../src/reflect.ts";
import * as sleep from "../src/sleep.ts";
import * as status from "../src/status.ts";

function createApp(): H3 {
  const app = new H3();
  reflect.register(app);
  app.mount("/status", status.app);
  app.mount("/sleep", sleep.app);
  return app;
}

test("reflect GET returns query, headers, and body keys", async () => {
  const app = createApp();
  const response = await app.fetch(
    new Request("http://localhost/?foo=bar&x=1", {
      headers: { "x-test-header": "hello" },
    })
  );
  assert.equal(response.status, 200);
  const reflected = await response.json();
  assert.deepEqual(reflected.query, { foo: "bar", x: "1" });
  assert.equal(reflected.headers["x-test-header"], "hello");
  assert.equal(reflected.body, null);
});

test("reflect POST keeps query, headers, and body separate", async () => {
  const app = createApp();
  const response = await app.fetch(
    new Request("http://localhost/?fromQuery=2&shared=query", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-test-header": "post-header",
      },
      body: JSON.stringify({ fromBody: 1, shared: "body" }),
    })
  );

  assert.equal(response.status, 200);
  const reflected = await response.json();
  assert.deepEqual(reflected.query, {
    fromQuery: "2",
    shared: "query",
  });
  assert.deepEqual(reflected.body, {
    fromBody: 1,
    shared: "body",
  });
  assert.match(reflected.headers["content-type"] ?? "", /^application\/json\b/);
  assert.equal(reflected.headers["x-test-header"], "post-header");
});

test("reflect POST with invalid JSON returns 400", async () => {
  const app = createApp();
  const response = await app.fetch(
    new Request("http://localhost/?foo=bar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid-json",
    })
  );

  assert.equal(response.status, 400);
  const reflected = await response.json();
  assert.deepEqual(reflected.query, { foo: "bar" });
  assert.equal(reflected.body, null);
  assert.equal(reflected.error, "Invalid JSON in request body");
  assert.match(reflected.headers["content-type"] ?? "", /^application\/json\b/);
});

test("status endpoint returns requested status code and text", async () => {
  const app = createApp();
  const response = await app.fetch(new Request("http://localhost/status/418"));
  assert.equal(response.status, 418);
  assert.deepEqual(await response.json(), {
    status: 418,
    statusText: "I'm a teapot",
  });
});

test("status endpoint rejects invalid status code", async () => {
  const app = createApp();
  const response = await app.fetch(new Request("http://localhost/status/999"));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Invalid status code. Must be between 100 and 599.",
  });
});

test("sleep reflect endpoint delays before responding", async () => {
  const app = createApp();
  const sleepMs = 40;
  const startedAt = performance.now();
  const response = await app.fetch(
    new Request(`http://localhost/sleep/${sleepMs}?foo=bar`, {
      headers: { "x-test-header": "sleepy" },
    })
  );
  const elapsedMs = performance.now() - startedAt;

  assert.equal(response.status, 200);
  const reflected = await response.json();
  assert.deepEqual(reflected.query, { foo: "bar" });
  assert.equal(reflected.headers["x-test-header"], "sleepy");
  assert.equal(reflected.body, null);
  assert.ok(
    elapsedMs >= sleepMs,
    `Expected at least 25ms delay, got ${elapsedMs}ms`
  );
});

test("sleep status endpoint delays and preserves status behavior", async () => {
  const app = createApp();
  const sleepMs = 35;
  const startedAt = performance.now();
  const response = await app.fetch(
    new Request(`http://localhost/sleep/${sleepMs}/status/201`)
  );
  const elapsedMs = performance.now() - startedAt;

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    status: 201,
    statusText: "Created",
  });
  assert.ok(
    elapsedMs >= sleepMs,
    `Expected at least 20ms delay, got ${elapsedMs}ms`
  );
});

test("sleep endpoints reject invalid duration", async () => {
  const app = createApp();

  const reflectResponse = await app.fetch(
    new Request("http://localhost/sleep/not-a-number?foo=bar")
  );
  assert.equal(reflectResponse.status, 400);
  assert.deepEqual(await reflectResponse.json(), {
    error: "Invalid duration_ms. Must be a non-negative integer.",
  });

  const statusResponse = await app.fetch(
    new Request("http://localhost/sleep/not-a-number/status/200")
  );
  assert.equal(statusResponse.status, 400);
  assert.deepEqual(await statusResponse.json(), {
    error: "Invalid duration_ms. Must be a non-negative integer.",
  });
});

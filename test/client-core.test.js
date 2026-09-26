import test from "node:test";
import assert from "node:assert/strict";
import { JmapClient } from "aspose-jmap-foss";
import { JmapProtocolError } from "aspose-jmap-foss";
import { Invocation, ResultReference } from "aspose-jmap-foss";

/**
 * Helper to create a stub fetch implementation that records the last request
 * and returns canned responses based on the request URL and method.
 *
 * @param {Object} config
 * @param {string} config.sessionUrl
 * @param {Object} config.sessionData
 * @param {boolean} [config.forceEchoError] - when true, echo returns a protocol error response.
 * @returns {{fetch: function, getLastRequest: function}}
 */
function createFetchStub({ sessionUrl, sessionData, forceEchoError = false }) {
  let lastRequest = null;

  async function fetchImpl(url, options = {}) {
    lastRequest = { url, options };

    // Session GET
    if (url === sessionUrl && (!options.method || options.method === "GET")) {
      return {
        ok: true,
        status: 200,
        json: async () => sessionData,
      };
    }

    // Core API POST (echo, etc.)
    if (url === sessionData.apiUrl && options.method === "POST") {
      const envelope = JSON.parse(options.body);
      const [name, args, callId] = envelope.methodCalls[0];

      if (name === "Core/echo") {
        if (forceEchoError) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              methodResponses: [
                ["error", { type: "unknownMethod", description: "Echo not supported" }, callId],
              ],
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            methodResponses: [["Core/echo", args, callId]],
          }),
        };
      }

      // fallback generic success
      return {
        ok: true,
        status: 200,
        json: async () => ({ methodResponses: [] }),
      };
    }

    // Upload Blob POST
    if (url.startsWith(sessionData.uploadUrl.split("{accountId}")[0]) && options.method === "POST") {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          accountId: "acc123",
          blobId: "blob456",
          type: options.headers["Content-Type"],
          size:
            typeof options.body === "string"
              ? Buffer.byteLength(options.body)
              : options.body.length,
        }),
      };
    }

    // Download Blob GET
    if (url.startsWith(sessionData.downloadUrl.split("{accountId}")[0]) && options.method === "GET") {
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => new Uint8Array([9, 8, 7]).buffer,
      };
    }

    // Default: not found
    return { ok: false, status: 404 };
  }

  return {
    fetch: fetchImpl,
    getLastRequest: () => lastRequest,
  };
}

// Minimal required Session JSON (covers required fields used by client-core.js)
const SESSION_DATA = {
  apiUrl: "https://example.com/api",
  uploadUrl: "https://example.com/upload/{accountId}",
  downloadUrl:
    "https://example.com/download/{accountId}/{blobId}/{type}/{name}",
  capabilities: {},
  primaryAccounts: { core: "user-1" },
  username: "user@example.test",
};

const SESSION_URL = "https://example.com/.well-known/jmap";

test("connect() fetches session and stores it", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  const session = await client.connect();

  // Verify that the essential fields match the stubbed data.
  const expectedKeys = [
    "apiUrl",
    "uploadUrl",
    "downloadUrl",
    "capabilities",
    "primaryAccounts",
    "username",
  ];
  for (const key of expectedKeys) {
    assert.deepStrictEqual(
      session[key],
      SESSION_DATA[key],
      `Session property ${key} should match the stubbed data`
    );
  }
});

test("connect() sends Bearer Authorization header when bearerToken is set", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    bearerToken: "my-oauth-token",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const last = stub.getLastRequest();
  assert.equal(
    last.options.headers.Authorization,
    "Bearer my-oauth-token",
    "Authorization header must be the bearer token when bearerToken is set"
  );
});

test("connect() sends Basic Authorization header when bearerToken is not set", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const last = stub.getLastRequest();
  const expected = `Basic ${Buffer.from("u:p").toString("base64")}`;
  assert.equal(
    last.options.headers.Authorization,
    expected,
    "Authorization header must be unchanged Basic auth when bearerToken is not set"
  );
});

test("echo() sends correct request and returns echoed args", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const args = { hello: true, count: 42 };
  const result = await client.echo(args);

  // Verify response
  assert.deepStrictEqual(result, args, "Echo should return the same arguments object");

  // Verify request envelope
  const last = stub.getLastRequest();
  assert.equal(last.url, SESSION_DATA.apiUrl, "Echo POST should target apiUrl");
  assert.equal(last.options.method, "POST", "Echo request must be POST");
  const envelope = JSON.parse(last.options.body);
  assert.ok(Array.isArray(envelope.methodCalls), "Envelope must contain methodCalls array");
  const [name, sentArgs, callId] = envelope.methodCalls[0];
  assert.equal(name, "Core/echo", "Method name must be Core/echo");
  assert.deepStrictEqual(sentArgs, args, "Sent arguments must match provided args");
  assert.ok(typeof callId === "string" && callId.startsWith("c"), "Call ID must be generated");
  assert.deepStrictEqual(
    envelope.using,
    ["urn:ietf:params:jmap:core"],
    "Using list must contain core URN"
  );
});

test("echo() propagates protocol error as JmapProtocolError", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
    forceEchoError: true,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  await assert.rejects(
    async () => {
      await client.echo({ foo: "bar" });
    },
    (err) => {
      assert.ok(err instanceof JmapProtocolError, "Error should be JmapProtocolError");
      assert.equal(err.type, "unknownMethod");
      assert.equal(err.description, "Echo not supported");
      return true;
    },
    "Echo should throw protocol error when server returns error invocation"
  );
});

test("uploadBlob() builds correct URL and returns upload response", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const accountId = "acc123";
  const content = "Hello world";
  const contentType = "text/plain";

  const resp = await client.uploadBlob(accountId, content, contentType);

  // Verify response shape
  assert.equal(resp.accountId, "acc123");
  assert.equal(resp.blobId, "blob456");
  assert.equal(resp.type, contentType);
  assert.equal(resp.size, Buffer.byteLength(content));

  // Verify request URL and headers
  const last = stub.getLastRequest();
  const expectedUrl = SESSION_DATA.uploadUrl.replace(
    "{accountId}",
    encodeURIComponent(accountId)
  );
  assert.equal(last.url, expectedUrl, "Upload URL must have accountId expanded");
  assert.equal(last.options.method, "POST", "Upload must use POST");
  assert.equal(
    last.options.headers["Content-Type"],
    contentType,
    "Content-Type header must be set"
  );
  assert.equal(last.options.body, content, "Request body must be the raw content");
});

test("downloadBlob() builds correct URL, respects optional name, and returns Uint8Array", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const accountId = "acc123";
  const blobId = "blob456";
  const type = "application/octet-stream";
  const name = "myfile.bin";

  const data = await client.downloadBlob(accountId, blobId, type, name);

  // Verify returned data type and content
  assert.ok(data instanceof Uint8Array, "downloadBlob should return Uint8Array");
  assert.deepStrictEqual(Array.from(data), [9, 8, 7], "Returned bytes must match stubbed payload");

  // Verify request URL includes all placeholders
  const last = stub.getLastRequest();
  const base = SESSION_DATA.downloadUrl
    .replace("{accountId}", encodeURIComponent(accountId))
    .replace("{blobId}", encodeURIComponent(blobId))
    .replace("{type}", encodeURIComponent(type))
    .replace("{name}", encodeURIComponent(name));
  assert.equal(last.url, base, "Download URL must have all placeholders expanded");
  assert.equal(last.options.method, "GET", "Download must use GET");
  assert.ok(
    last.options.headers.Authorization.startsWith("Basic "),
    "Authorization header must be present"
  );
});

test("downloadBlob() without optional name omits placeholder", async (t) => {
  const stub = createFetchStub({
    sessionUrl: SESSION_URL,
    sessionData: SESSION_DATA,
  });
  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl: stub.fetch,
  });

  await client.connect();

  const accountId = "A";
  const blobId = "B";
  const type = "image/png";

  await client.downloadBlob(accountId, blobId, type);

  const last = stub.getLastRequest();
  const expected = SESSION_DATA.downloadUrl
    .replace("{accountId}", encodeURIComponent(accountId))
    .replace("{blobId}", encodeURIComponent(blobId))
    .replace("{type}", encodeURIComponent(type));
  // The template still contains "{name}" – client should leave it untouched.
  assert.equal(last.url, expected, "Download URL without name should leave {name} placeholder");
});

test("connect() follows a redirect while preserving the Authorization header", async (t) => {
  // Regression test: the default fetch redirect behavior ("follow") strips the
  // Authorization header on redirects per the WHATWG fetch spec, and real JMAP servers
  // (e.g. Stalwart) commonly 307-redirect the well-known discovery URL to the actual
  // session endpoint - so relying on fetch's own redirect-following would silently
  // return an unauthenticated/empty session instead of failing loudly.
  const finalUrl = "https://example.com/jmap/session";
  const requests = [];

  async function fetchImpl(url, options = {}) {
    requests.push({ url, options });
    if (url === SESSION_URL) {
      assert.equal(options.redirect, "manual", "initial request must disable auto-redirect");
      return {
        ok: false,
        status: 307,
        headers: { get: (name) => (name === "Location" ? finalUrl : null) },
      };
    }
    if (url === finalUrl) {
      assert.ok(
        options.headers.Authorization && options.headers.Authorization.startsWith("Basic "),
        "Authorization header must be re-sent on the redirected request"
      );
      return {
        ok: true,
        status: 200,
        json: async () => SESSION_DATA,
      };
    }
    return { ok: false, status: 404 };
  }

  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl,
  });

  const session = await client.connect();
  assert.equal(session.username, SESSION_DATA.username);
  assert.equal(requests.length, 2, "exactly one redirect hop expected");
  assert.equal(requests[1].url, finalUrl);
});

test("connect() drops the Authorization header on a cross-origin redirect", async (t) => {
  // Security: a redirect to a different origin must not carry the caller's credentials.
  const evilUrl = "https://evil.example/steal";
  const requests = [];

  async function fetchImpl(url, options = {}) {
    requests.push({ url, headers: { ...options.headers } });
    if (url === SESSION_URL) {
      return {
        ok: false,
        status: 307,
        headers: { get: (name) => (name === "Location" ? evilUrl : null) },
      };
    }
    // the redirected hop
    return { ok: true, status: 200, json: async () => SESSION_DATA };
  }

  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl,
  });

  await client.connect();
  assert.equal(requests.length, 2);
  assert.ok(requests[0].headers.Authorization, "first hop is authenticated");
  assert.equal(
    requests[1].headers.Authorization,
    undefined,
    "Authorization must not be forwarded to a different origin",
  );
});

test("sendRequest() batches multiple calls with a ResultReference into a single request", async (t) => {
  // Regression test: sendRequest() must be public (not the private _sendRequest it replaced),
  // so callers can batch multiple method calls - chained via a ResultReference back-reference
  // (RFC 8620 section 3.7) - into a single HTTP round trip instead of one request per call.
  const requests = [];

  async function fetchImpl(url, options = {}) {
    requests.push({ url, options });
    if (url === SESSION_URL) {
      return { ok: true, status: 200, json: async () => SESSION_DATA };
    }
    if (url === SESSION_DATA.apiUrl && options.method === "POST") {
      const envelope = JSON.parse(options.body);
      assert.equal(envelope.methodCalls.length, 2);
      const [, , c1Id] = envelope.methodCalls[0];
      const [, c2Args, c2Id] = envelope.methodCalls[1];
      assert.equal(c1Id, "c1");
      assert.equal(c2Id, "c2");
      assert.deepStrictEqual(c2Args["#foo"], { resultOf: "c1", name: "Core/echo", path: "/hello" });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          methodResponses: [
            ["Core/echo", { hello: "world" }, "c1"],
            ["Core/echo", { foo: "world" }, "c2"],
          ],
        }),
      };
    }
    return { ok: false, status: 404 };
  }

  const client = new JmapClient({
    sessionUrl: SESSION_URL,
    username: "u",
    password: "p",
    fetchImpl,
  });
  await client.connect();

  const first = new Invocation("Core/echo", { hello: "world" }, "c1");
  const second = new Invocation(
    "Core/echo",
    { "#foo": new ResultReference("c1", "Core/echo", "/hello").toJson() },
    "c2",
  );
  const resp = await client.sendRequest([first, second], ["urn:ietf:params:jmap:core"]);

  assert.equal(resp.methodResponses.length, 2);
  assert.deepStrictEqual(resp.methodResponses[0][1], { hello: "world" });
  assert.deepStrictEqual(resp.methodResponses[1][1], { foo: "world" });
  // Session GET + exactly one batched POST (not two).
  assert.equal(requests.length, 2);
});

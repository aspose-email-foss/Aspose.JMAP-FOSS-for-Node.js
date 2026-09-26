/**
 * Tests for the SubmissionClientMixin methods (send, cancelSend, listSubmissions)
 * using the public JmapClient entry point.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { JmapClient, EmailSubmission } from "aspose-jmap-foss";

/**
 * Minimal Session JSON required by Session.fromJson().
 */
const SESSION_JSON = {
  apiUrl: "https://example.com/api",
  downloadUrl:
    "https://example.com/download/{accountId}/{blobId}/{type}/{name}",
  uploadUrl: "https://example.com/upload/{accountId}",
  eventSourceUrl: "https://example.com/event",
  capabilities: {
    "urn:ietf:params:jmap:core": {},
    "urn:ietf:params:jmap:submission": {},
  },
  primaryAccounts: { "urn:ietf:params:jmap:submission": "u1" },
  accounts: { u1: {} },
  state: "state1",
};

/**
 * Helper to create a stub fetch implementation that records the last request
 * and returns a response based on the request payload.
 *
 * @param {function(Object):Object} responder - Function that receives the parsed
 *   request envelope and returns a response envelope object.
 * @returns {{fetchImpl:function, getLastRequest:function}}
 */
function createStubFetch(responder) {
  let lastRequest = null;
  const fetchImpl = async (url, options) => {
    // Session GET
    if (url === "https://jmap.test/.well-known/jmap" && options?.method === "GET") {
      return {
        ok: true,
        status: 200,
        json: async () => SESSION_JSON,
      };
    }

    // JMAP POST
    const body = options?.body ?? "";
    const parsed = JSON.parse(body);
    lastRequest = { url, options, envelope: parsed };
    const responseEnvelope = responder(parsed);
    return {
      ok: true,
      status: 200,
      json: async () => responseEnvelope,
    };
  };
  return {
    fetchImpl,
    getLastRequest: () => lastRequest,
  };
}

/**
 * Test: send() creates an EmailSubmission and returns the created object.
 */
test("SubmissionClientMixin.send creates EmailSubmission", async () => {
  const stub = createStubFetch((req) => {
    const [name, args, callId] = req.methodCalls[0];
    assert.equal(name, "EmailSubmission/set");
    const creationId = Object.keys(args.create)[0];
    return {
      methodResponses: [
        [
          "EmailSubmission/set",
          {
            accountId: args.accountId,
            newState: "1",
            created: {
              [creationId]: {
                id: "s123",
                identityId: args.create[creationId].identityId,
                emailId: args.create[creationId].emailId,
              },
            },
          },
          callId,
        ],
      ],
    };
  });

  const client = new JmapClient({
    sessionUrl: "https://jmap.test/.well-known/jmap",
    username: "u",
    password: "p",
    fetchImpl: stub.fetchImpl,
  });
  await client.connect();

  const emailSub = new EmailSubmission({
    identityId: "id1",
    emailId: "e1",
  });

  const result = await client.send("u1", emailSub);
  assert.ok(result instanceof EmailSubmission);
  assert.equal(result.id, "s123");
  assert.equal(result.identityId, "id1");
  assert.equal(result.emailId, "e1");

  // Verify request payload
  const last = stub.getLastRequest();
  const sentArgs = last.envelope.methodCalls[0][1];
  assert.equal(sentArgs.accountId, "u1");
  assert.ok(sentArgs.create);
  const createdKey = Object.keys(sentArgs.create)[0];
  // Compare against the fields actually set on emailSub, not its full toJson() (which
  // also includes every server-assigned field as null/undefined - those aren't sent).
  assert.equal(sentArgs.create[createdKey].identityId, "id1");
  assert.equal(sentArgs.create[createdKey].emailId, "e1");
});

/**
 * Test: cancelSend() updates an EmailSubmission's undoStatus.
 */
test("SubmissionClientMixin.cancelSend updates EmailSubmission", async () => {
  const stub = createStubFetch((req) => {
    const [name, args, callId] = req.methodCalls[0];
    assert.equal(name, "EmailSubmission/set");
    const subId = Object.keys(args.update)[0];
    return {
      methodResponses: [
        [
          "EmailSubmission/set",
          {
            accountId: args.accountId,
            newState: "2",
            updated: {
              [subId]: {
                id: subId,
                identityId: "id1",
                emailId: "e1",
                undoStatus: "canceled",
              },
            },
          },
          callId,
        ],
      ],
    };
  });

  const client = new JmapClient({
    sessionUrl: "https://jmap.test/.well-known/jmap",
    username: "u",
    password: "p",
    fetchImpl: stub.fetchImpl,
  });
  await client.connect();

  const result = await client.cancelSend("u1", "sub123");
  assert.ok(result instanceof EmailSubmission);
  assert.equal(result.id, "sub123");
  assert.equal(result.undoStatus, "canceled");

  const last = stub.getLastRequest();
  const sentArgs = last.envelope.methodCalls[0][1];
  assert.equal(sentArgs.accountId, "u1");
  // Regression test: a PatchObject key is a JSON Pointer (RFC 6901) relative to the
  // patched object - a bare top-level property name has no leading slash. A prior
  // version sent "/undoStatus" (pointing at a differently-named property instead),
  // which a real JMAP server rejects/ignores, silently breaking cancel-send.
  assert.deepEqual(sentArgs.update, { sub123: { undoStatus: "canceled" } });
});

/**
 * Test: listSubmissions() returns ids array and respects options.
 */
test("SubmissionClientMixin.listSubmissions returns ids", async () => {
  const stub = createStubFetch((req) => {
    const [name, args, callId] = req.methodCalls[0];
    assert.equal(name, "EmailSubmission/query");
    assert.equal(args.accountId, "u1");
    assert.equal(args.calculateTotal, false);
    return {
      methodResponses: [
        [
          "EmailSubmission/query",
          {
            accountId: "u1",
            queryState: "qs1",
            canCalculateChanges: false,
            position: 0,
            ids: ["subA", "subB"],
            total: null,
          },
          callId,
        ],
      ],
    };
  });

  const client = new JmapClient({
    sessionUrl: "https://jmap.test/.well-known/jmap",
    username: "u",
    password: "p",
    fetchImpl: stub.fetchImpl,
  });
  await client.connect();

  const ids = await client.listSubmissions("u1", {
    calculateTotal: false,
  });
  assert.deepEqual(ids, ["subA", "subB"]);

  const last = stub.getLastRequest();
  const sentArgs = last.envelope.methodCalls[0][1];
  assert.equal(sentArgs.accountId, "u1");
  assert.equal(sentArgs.calculateTotal, false);
});

/**
 * Test: protocol error propagates as JmapProtocolError.
 */
test("SubmissionClientMixin methods propagate protocol errors", async () => {
  const stub = createStubFetch((req) => {
    const [_, __, callId] = req.methodCalls[0];
    return {
      methodResponses: [
        ["error", { type: "unknownMethod", description: "bad" }, callId],
      ],
    };
  });

  const client = new JmapClient({
    sessionUrl: "https://jmap.test/.well-known/jmap",
    username: "u",
    password: "p",
    fetchImpl: stub.fetchImpl,
  });
  await client.connect();

  await assert.rejects(
    async () => {
      const emailSub = new EmailSubmission({
        identityId: "id1",
        emailId: "e1",
      });
      await client.send("u1", emailSub);
    },
    (err) => {
      assert.equal(err.name, "JmapProtocolError");
      assert.equal(err.type, "unknownMethod");
      return true;
    }
  );
});

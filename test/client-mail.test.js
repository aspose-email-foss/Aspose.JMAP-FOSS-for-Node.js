/**
 * Tests for the MailClientMixin methods (via the public JmapClient).
 *
 * @module client-mail.test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { JmapClient, JmapProtocolError } from "aspose-jmap-foss";
import { Mailbox } from "../src/models/Mailbox.js";

/**
 * Helper to create a client with a stub fetch implementation.
 *
 * @param {Object} responseMap - Maps method names to response envelopes.
 * @returns {{client:JmapClient, calls:Array}} Stubbed client and recorded calls.
 */
function makeClient(responseMap) {
  const calls = [];

  const fetchStub = async (url, options) => {
    calls.push({ url, options });
    // Session GET
    if (url === "https://example.com/.well-known/jmap" && options.method === "GET") {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          apiUrl: "https://example.com/api",
          uploadUrl: "https://example.com/upload/{accountId}",
          downloadUrl:
            "https://example.com/download/{accountId}/{blobId}/{type}/{name}",
          capabilities: {},
          accounts: {},
          primaryAccounts: { core: "user-1" },
          username: "user@example.test",
        }),
      };
    }
    // JMAP POST
    if (url === "https://example.com/api" && options.method === "POST") {
      const body = JSON.parse(options.body);
      const methodName = body.methodCalls[0][0];
      const resp = responseMap[methodName] ?? {};
      return {
        ok: true,
        status: 200,
        json: async () => resp,
      };
    }
    // Fallback error
    return { ok: false, status: 500, json: async () => ({}) };
  };

  const client = new JmapClient({
    sessionUrl: "https://example.com/.well-known/jmap",
    username: "u",
    password: "p",
    fetchImpl: fetchStub,
  });

  return { client, calls };
}

/**
 * Build a minimal methodResponses envelope for a given method name and callId.
 *
 * @param {string} methodName
 * @param {string} callId
 * @param {Object} result
 * @returns {Object}
 */
function envelope(methodName, callId, result) {
  return {
    methodResponses: [[methodName, result, callId]],
  };
}

// ---------- Tests ----------

await test("listMailboxes returns Mailbox objects and sends correct request", async () => {
  const callId = "c1";
  const resp = envelope("Mailbox/get", callId, {
    accountId: "a1",
    state: "1",
    list: [
      {
        id: "mb1",
        name: "Inbox",
        parentId: null,
        role: "inbox",
        sortOrder: 0,
        totalEmails: 3,
        unreadEmails: 1,
        totalThreads: 3,
        unreadThreads: 1,
        myRights: {
          mayReadItems: true,
          mayAddItems: true,
          mayRemoveItems: true,
          maySetSeen: true,
          maySetKeywords: true,
          mayCreateChild: true,
          mayRename: false,
          mayDelete: false,
          maySubmit: true,
        },
        isSubscribed: true,
      },
    ],
    notFound: [],
  });

  const { client, calls } = makeClient({ "Mailbox/get": resp });
  await client.connect();

  const list = await client.listMailboxes("a1");
  assert(Array.isArray(list));
  assert.equal(list.length, 1);
  assert.equal(list[0].id, "mb1");
  assert.equal(list[0].name, "Inbox");

  const postCall = calls.find((c) => c.url === "https://example.com/api");
  assert(postCall, "POST call not recorded");
  const body = JSON.parse(postCall.options.body);
  assert.deepStrictEqual(body.using, ["urn:ietf:params:jmap:mail"]);
  const [name, args, cid] = body.methodCalls[0];
  assert.equal(name, "Mailbox/get");
  assert.equal(args.accountId, "a1");
  assert.equal(cid, callId);
});

await test("createMailbox returns created map and notCreated errors", async () => {
  const callId = "c1";
  const resp = envelope("Mailbox/set", callId, {
    accountId: "a1",
    oldState: null,
    newState: "2",
    created: {
      "#tmp1": {
        id: "mb2",
        name: "Archive",
        parentId: null,
        role: null,
        sortOrder: 0,
        isSubscribed: false,
      },
    },
    notCreated: {
      "#tmp2": { type: "invalidProperties", description: "Bad name", properties: ["name"] },
    },
  });

  const { client, calls } = makeClient({ "Mailbox/set": resp });
  await client.connect();

  const createMap = {
    "#tmp1": new Mailbox({ name: "Archive", parentId: null, role: null, sortOrder: 0 }),
    "#tmp2": new Mailbox({ name: "", parentId: null, role: null, sortOrder: 0 }),
  };

  const result = await client.createMailbox("a1", createMap);
  assert(result.created["#tmp1"]);
  assert.equal(result.created["#tmp1"].id, "mb2");
  assert(result.notCreated["#tmp2"]);
  assert.equal(result.notCreated["#tmp2"].type, "invalidProperties");

  const postCall = calls.find((c) => c.url === "https://example.com/api");
  const body = JSON.parse(postCall.options.body);
  const [name, args] = body.methodCalls[0];
  assert.equal(name, "Mailbox/set");
  assert.deepStrictEqual(Object.keys(args.create), ["#tmp1", "#tmp2"]);
});

await test("listMessages returns EmailQueryResponse and respects optional arguments", async () => {
  const callId = "c1";
  const resp = envelope("Email/query", callId, {
    accountId: "a1",
    queryState: "q1",
    canCalculateChanges: false,
    position: 0,
    ids: ["e3", "e2", "e1"],
    total: 3,
    limit: 10,
  });

  const { client, calls } = makeClient({ "Email/query": resp });
  await client.connect();

  const result = await client.listMessages("a1", { inMailbox: "mb1" }, null, 0, 10);
  assert.equal(result.accountId, "a1");
  assert.equal(result.queryState, "q1");
  assert.equal(result.canCalculateChanges, false);
  assert.equal(result.position, 0);
  assert.deepStrictEqual(result.ids, ["e3", "e2", "e1"]);
  assert.equal(result.total, 3);
  assert.equal(result.limit, 10);

  const body = JSON.parse(calls[1].options.body);
  const [name, args] = body.methodCalls[0];
  assert.equal(name, "Email/query");
  assert.deepStrictEqual(args.filter, { inMailbox: "mb1" });
  assert.equal(args.limit, 10);
});

await test("fetchMessage returns Email objects with optional body flags", async () => {
  const callId = "c1";
  const resp = envelope("Email/get", callId, {
    accountId: "a1",
    state: "7",
    list: [
      {
        id: "e1",
        subject: "Hello",
        from: [{ name: "A", email: "a@x.test" }],
        receivedAt: "2026-08-18T10:00:00Z",
        preview: "Hi there...",
      },
    ],
    notFound: [],
  });

  const { client, calls } = makeClient({ "Email/get": resp });
  await client.connect();

  const emails = await client.fetchMessage("a1", ["e1"], ["id", "subject"], null, true);
  assert.equal(emails.length, 1);
  assert.equal(emails[0].id, "e1");
  assert.equal(emails[0].subject, "Hello");

  const body = JSON.parse(calls[1].options.body);
  const [name, args] = body.methodCalls[0];
  assert.equal(name, "Email/get");
  assert.deepStrictEqual(args.ids, ["e1"]);
  assert.deepStrictEqual(args.properties, ["id", "subject"]);
  assert.equal(args.fetchTextBodyValues, true);
});

await test("moveMessage propagates per-item notUpdated errors", async () => {
  const callId = "c1";
  const resp = envelope("Email/set", callId, {
    accountId: "a1",
    oldState: "1",
    newState: "2",
    updated: { e1: null },
    notUpdated: { e2: { type: "notFound", description: "Missing", properties: null } },
  });

  const { client, calls } = makeClient({ "Email/set": resp });
  await client.connect();

  const result = await client.moveMessage("a1", {
    e1: { mailboxIds: { mb2: true } },
    e2: { mailboxIds: { mb2: true } },
  });

  assert.deepStrictEqual(Object.keys(result.updated), ["e1"]);
  assert.equal(result.updated.e1, null);
  assert(result.notUpdated.e2);
  assert.equal(result.notUpdated.e2.type, "notFound");
});

await test("protocol error is thrown as JmapProtocolError", async () => {
  const callId = "c1";
  const resp = {
    methodResponses: [
      [
        "error",
        { type: "unknownMethod", description: "Method not supported" },
        callId,
      ],
    ],
  };

  const { client, calls } = makeClient({ "Mailbox/get": resp });
  await client.connect();

  await assert.rejects(
    async () => {
      await client.listMailboxes("a1");
    },
    (err) => {
      assert(err instanceof JmapProtocolError);
      assert.equal(err.type, "unknownMethod");
      return true;
    }
  );
});

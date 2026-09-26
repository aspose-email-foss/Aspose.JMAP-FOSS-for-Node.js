import test from "node:test";
import assert from "node:assert/strict";
import { Session, Account, CoreCapability } from "aspose-jmap-foss";

/**
 * Helper to create a minimal valid session JSON object.
 */
function minimalSessionJson() {
  return {
    capabilities: {
      "urn:ietf:params:jmap:core": {
        maxSizeUpload: 1_000_000,
        maxConcurrentUpload: 4,
        maxSizeRequest: 5_000_000,
        maxConcurrentRequests: 8,
        maxCallsInRequest: 16,
        maxObjectsInGet: 100,
        maxObjectsInSet: 50,
        collationAlgorithms: ["i;unicode-casemap"],
      },
    },
    accounts: {
      "user-1": {
        name: "Primary",
        isPersonal: true,
        isReadOnly: false,
        accountCapabilities: {},
      },
    },
    primaryAccounts: {
      "urn:ietf:params:jmap:mail": "user-1",
    },
    username: "user@example.test",
    apiUrl: "https://example.test/jmap",
    downloadUrl:
      "https://example.test/download/{accountId}/{blobId}/{type}/{name}",
    uploadUrl: "https://example.test/upload/{accountId}",
    eventSourceUrl: "https://example.test/eventsource/{accountId}",
    state: "state-123",
  };
}

test("Session.fromJson creates typed capability and account instances", async () => {
  const raw = minimalSessionJson();

  const sess = Session.fromJson(raw);

  // core capability should be a CoreCapability instance
  const coreCap = sess.capabilities["urn:ietf:params:jmap:core"];
  assert.ok(coreCap instanceof CoreCapability);
  assert.strictEqual(coreCap.maxSizeUpload, 1_000_000);
  assert.deepStrictEqual(coreCap.collationAlgorithms, ["i;unicode-casemap"]);

  // account should be an Account instance
  const acc = sess.accounts["user-1"];
  assert.ok(acc instanceof Account);
  assert.strictEqual(acc.name, "Primary");
  assert.strictEqual(acc.isPersonal, true);
  assert.strictEqual(acc.isReadOnly, false);
});

test("Session.toJson round‑trips the data unchanged", async () => {
  const raw = minimalSessionJson();
  const sess = Session.fromJson(raw);
  const roundTrip = sess.toJson();

  // deep equality of the whole structure
  assert.deepStrictEqual(roundTrip, raw);
});

test("Session.fromJson handles missing optional fields (eventSourceUrl, state)", async () => {
  const raw = {
    capabilities: {},
    accounts: {},
    primaryAccounts: {},
    username: "u@example.com",
    apiUrl: "https://example.com/jmap",
    downloadUrl: "https://example.com/download/{accountId}/{blobId}/{type}/{name}",
    uploadUrl: "https://example.com/upload/{accountId}",
    // eventSourceUrl and state omitted on purpose
  };

  const sess = Session.fromJson(raw);

  // omitted string fields default to empty string per implementation
  assert.strictEqual(sess.eventSourceUrl, "");
  assert.strictEqual(sess.state, "");

  // other required fields are present
  assert.strictEqual(sess.username, "u@example.com");
  assert.strictEqual(sess.apiUrl, "https://example.com/jmap");
});

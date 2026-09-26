import { test } from "node:test";
import assert from "node:assert/strict";
import { JmapRequestEnvelope } from "aspose-jmap-foss";

test("JmapRequestEnvelope normal (de)serialization with createdIds", () => {
  const json = {
    using: ["urn:ietf:params:jmap:core"],
    methodCalls: [
      ["Email/get", { ids: ["id1"] }, "c1"],
    ],
    createdIds: { clientId1: "serverId1" },
  };

  const envelope = JmapRequestEnvelope.fromJson(json);
  assert.ok(envelope instanceof JmapRequestEnvelope);
  assert.deepStrictEqual(envelope.using, json.using);
  assert.deepStrictEqual(envelope.createdIds, json.createdIds);
  assert.ok(Array.isArray(envelope.methodCalls));
  const call = envelope.methodCalls[0];
  assert.strictEqual(call.name, json.methodCalls[0][0]);
  assert.deepStrictEqual(call.arguments, json.methodCalls[0][1]);
  assert.strictEqual(call.methodCallId, json.methodCalls[0][2]);

  const roundTrip = envelope.toJson();
  assert.deepStrictEqual(roundTrip, json);
});

test("JmapRequestEnvelope (de)serialization when createdIds omitted", () => {
  const json = {
    using: ["urn:ietf:params:jmap:core"],
    methodCalls: [
      ["Mailbox/get", { ids: [] }, "c2"],
    ],
    // createdIds intentionally omitted
  };

  const envelope = JmapRequestEnvelope.fromJson(json);
  assert.ok(envelope instanceof JmapRequestEnvelope);
  assert.deepStrictEqual(envelope.using, json.using);
  assert.strictEqual(envelope.createdIds, null);
  assert.ok(Array.isArray(envelope.methodCalls));
  const call = envelope.methodCalls[0];
  assert.strictEqual(call.name, json.methodCalls[0][0]);
  assert.deepStrictEqual(call.arguments, json.methodCalls[0][1]);
  assert.strictEqual(call.methodCallId, json.methodCalls[0][2]);

  const roundTrip = envelope.toJson();
  const expected = { ...json };
  assert.deepStrictEqual(roundTrip, expected);
});

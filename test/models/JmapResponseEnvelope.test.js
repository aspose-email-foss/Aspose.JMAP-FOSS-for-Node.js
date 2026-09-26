import { test } from "node:test";
import assert from "node:assert/strict";
import { JmapResponseEnvelope, Invocation } from "aspose-jmap-foss";

test("JmapResponseEnvelope.fromJson and toJson round‑trip with all fields", () => {
  const raw = {
    methodResponses: [
      ["Email/get", { ids: ["id1", "id2"] }, "c1"],
    ],
    createdIds: { clientId1: "serverIdA", clientId2: "serverIdB" },
    sessionState: "12345",
  };

  const envelope = JmapResponseEnvelope.fromJson(raw);
  assert.ok(envelope instanceof JmapResponseEnvelope);
  assert.strictEqual(envelope.sessionState, "12345");
  assert.deepStrictEqual(envelope.createdIds, raw.createdIds);
  assert.strictEqual(envelope.methodResponses.length, 1);
  const inv = envelope.methodResponses[0];
  assert.ok(inv instanceof Invocation);
  assert.strictEqual(inv.name, "Email/get");
  assert.deepStrictEqual(inv.arguments, { ids: ["id1", "id2"] });
  assert.strictEqual(inv.methodCallId, "c1");

  const serialized = envelope.toJson();
  assert.deepStrictEqual(serialized, raw);
});

test("JmapResponseEnvelope handles omitted createdIds (null default) and preserves explicit null", () => {
  const rawOmitted = {
    methodResponses: [],
    sessionState: "stateA",
  };
  const envOmitted = JmapResponseEnvelope.fromJson(rawOmitted);
  assert.strictEqual(envOmitted.createdIds, null);
  const jsonOmitted = envOmitted.toJson();
  // createdIds should be present as null because the instance property is null (not undefined)
  assert.deepStrictEqual(jsonOmitted, {
    methodResponses: [],
    createdIds: null,
    sessionState: "stateA",
  });

  const rawNull = {
    methodResponses: [],
    createdIds: null,
    sessionState: "stateB",
  };
  const envNull = JmapResponseEnvelope.fromJson(rawNull);
  assert.strictEqual(envNull.createdIds, null);
  const jsonNull = envNull.toJson();
  assert.deepStrictEqual(jsonNull, rawNull);
});

test("JmapResponseEnvelope.fromJson validates input type", () => {
  assert.throws(
    () => JmapResponseEnvelope.fromJson(null),
    {
      name: "TypeError",
      message: "JmapResponseEnvelope.fromJson expects a non‑null object",
    }
  );
  assert.throws(
    () => JmapResponseEnvelope.fromJson(42),
    {
      name: "TypeError",
      message: "JmapResponseEnvelope.fromJson expects a non‑null object",
    }
  );
});

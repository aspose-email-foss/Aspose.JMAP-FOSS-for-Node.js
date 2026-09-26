import { test } from "node:test";
import assert from "node:assert/strict";
import { Invocation } from "aspose-jmap-foss";

test("Invocation toJson produces correct wire format", () => {
  const inv = new Invocation("Email/get", { ids: ["id1", "id2"] }, "c123");
  const json = inv.toJson();

  assert.deepEqual(
    json,
    ["Email/get", { ids: ["id1", "id2"] }, "c123"],
    "toJson should return the 3-element array matching the JMAP wire format"
  );
});

test("Invocation fromJson reconstructs an instance correctly", () => {
  const data = ["Mailbox/set", { create: { mb1: { name: "Inbox" } } }, "c456"];
  const inv = Invocation.fromJson(data);

  assert.ok(inv instanceof Invocation, "Result should be an Invocation instance");
  assert.equal(inv.name, data[0]);
  assert.deepEqual(inv.arguments, data[1]);
  assert.equal(inv.methodCallId, data[2]);
});

test("Invocation handles empty arguments map (edge case)", () => {
  const inv = new Invocation("Identity/get", {}, "cEmpty");
  const json = inv.toJson();

  assert.deepEqual(
    json,
    ["Identity/get", {}, "cEmpty"],
    "Empty arguments should be serialized as an empty object within the array"
  );

  const roundTrip = Invocation.fromJson(json);
  assert.deepEqual(roundTrip.arguments, {}, "Deserialized instance should retain empty arguments");
});

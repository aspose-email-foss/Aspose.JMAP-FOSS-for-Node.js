import { test } from "node:test";
import assert from "node:assert/strict";
import { Identity, EmailAddress } from "aspose-jmap-foss";

test("Identity.fromJson creates proper instance with full data", () => {
  const raw = {
    id: "id123",
    name: "John Doe",
    email: "john@example.com",
    replyTo: [
      { name: "Reply One", email: "reply1@example.com" },
      { name: null, email: "reply2@example.com" },
    ],
    bcc: [{ name: "Bcc One", email: "bcc1@example.com" }],
    textSignature: "Best regards",
    htmlSignature: "<p>Best regards</p>",
    mayDelete: true,
  };

  const identity = Identity.fromJson(raw);

  // Verify primitive fields
  assert.strictEqual(identity.id, raw.id);
  assert.strictEqual(identity.name, raw.name);
  assert.strictEqual(identity.email, raw.email);
  assert.strictEqual(identity.textSignature, raw.textSignature);
  assert.strictEqual(identity.htmlSignature, raw.htmlSignature);
  assert.strictEqual(identity.mayDelete, raw.mayDelete);

  // Verify replyTo array conversion
  assert.ok(Array.isArray(identity.replyTo));
  assert.strictEqual(identity.replyTo.length, raw.replyTo.length);
  identity.replyTo.forEach((addr, i) => {
    assert.ok(addr instanceof EmailAddress);
    assert.strictEqual(addr.name, raw.replyTo[i].name);
    assert.strictEqual(addr.email, raw.replyTo[i].email);
  });

  // Verify bcc array conversion
  assert.ok(Array.isArray(identity.bcc));
  assert.strictEqual(identity.bcc.length, raw.bcc.length);
  identity.bcc.forEach((addr, i) => {
    assert.ok(addr instanceof EmailAddress);
    assert.strictEqual(addr.name, raw.bcc[i].name);
    assert.strictEqual(addr.email, raw.bcc[i].email);
  });

  // Round‑trip to JSON should match original (order of keys may differ)
  const roundTrip = identity.toJson();
  assert.deepStrictEqual(roundTrip, raw);
});

test("Identity.fromJson handles missing optional fields and null arrays", () => {
  const raw = {
    email: "alice@example.com",
    replyTo: null,
    bcc: null,
  };

  const identity = Identity.fromJson(raw);

  // Required field
  assert.strictEqual(identity.email, raw.email);

  // Optional fields defaulted
  assert.strictEqual(identity.id, undefined);
  assert.strictEqual(identity.name, "");
  assert.strictEqual(identity.textSignature, "");
  assert.strictEqual(identity.htmlSignature, "");
  assert.strictEqual(identity.mayDelete, undefined);

  // Null arrays should stay null
  assert.strictEqual(identity.replyTo, null);
  assert.strictEqual(identity.bcc, null);

  // toJson should include the explicit nulls and defaults
  const expectedJson = {
    name: "",
    email: "alice@example.com",
    replyTo: null,
    bcc: null,
    textSignature: "",
    htmlSignature: "",
  };
  const json = identity.toJson();
  assert.deepStrictEqual(json, expectedJson);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  EmailSubmission,
  Envelope,
  Address,
  DeliveryStatus,
} from "aspose-jmap-foss";

test("EmailSubmission full (de)serialization round‑trip", async () => {
  const envelope = new Envelope(
    new Address("sender@example.com"),
    [new Address("rcpt1@example.com"), new Address("rcpt2@example.com")]
  );

  const deliveryStatus = {
    "rcpt1@example.com": new DeliveryStatus({
      smtpReply: "250 OK",
      delivered: "yes",
      displayed: "yes",
    }),
    "rcpt2@example.com": new DeliveryStatus({
      smtpReply: "550 No such user",
      delivered: "no",
      displayed: "no",
    }),
  };

  const original = new EmailSubmission({
    id: "subm-123",
    identityId: "ident-456",
    emailId: "email-789",
    threadId: "thread-001",
    envelope,
    sendAt: "2024-01-01T12:00:00Z",
    undoStatus: "pending",
    deliveryStatus,
    dsnBlobIds: ["blob-1", "blob-2"],
    mdnBlobIds: ["blob-3"],
  });

  const json = original.toJson();

  const expectedJson = {
    id: "subm-123",
    identityId: "ident-456",
    emailId: "email-789",
    threadId: "thread-001",
    envelope: envelope.toJson(),
    sendAt: "2024-01-01T12:00:00Z",
    undoStatus: "pending",
    deliveryStatus: {
      "rcpt1@example.com": deliveryStatus["rcpt1@example.com"].toJson(),
      "rcpt2@example.com": deliveryStatus["rcpt2@example.com"].toJson(),
    },
    dsnBlobIds: ["blob-1", "blob-2"],
    mdnBlobIds: ["blob-3"],
  };

  assert.deepStrictEqual(json, expectedJson, "toJson output mismatch");

  const roundTrip = EmailSubmission.fromJson(json);
  assert.deepStrictEqual(
    roundTrip,
    original,
    "fromJson did not produce an equivalent EmailSubmission instance"
  );
});

test("EmailSubmission minimal payload with null/optional fields", async () => {
  const minimalJson = {
    identityId: "ident-min",
    emailId: "email-min",
    // optional fields omitted intentionally
  };

  const instance = EmailSubmission.fromJson(minimalJson);

  // Verify required fields are set and optional ones are null/undefined as per constructor defaults
  assert.strictEqual(instance.identityId, "ident-min");
  assert.strictEqual(instance.emailId, "email-min");
  assert.strictEqual(instance.id, undefined);
  assert.strictEqual(instance.threadId, undefined);
  assert.strictEqual(instance.envelope, null);
  assert.strictEqual(instance.sendAt, undefined);
  assert.strictEqual(instance.undoStatus, undefined);
  assert.strictEqual(instance.deliveryStatus, null);
  assert.strictEqual(instance.dsnBlobIds, undefined);
  assert.strictEqual(instance.mdnBlobIds, undefined);

  const json = instance.toJson();

  const expectedJson = {
    id: undefined,
    identityId: "ident-min",
    emailId: "email-min",
    threadId: undefined,
    envelope: null,
    sendAt: undefined,
    undoStatus: undefined,
    deliveryStatus: null,
    dsnBlobIds: undefined,
    mdnBlobIds: undefined,
  };

  assert.deepStrictEqual(json, expectedJson, "toJson with minimal fields mismatch");
});

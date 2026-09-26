import { test } from "node:test";
import assert from "node:assert/strict";
import { Email, EmailBodyValue } from "../../src/models/Email.js";

/**
 * Full round‑trip (de)serialization, verifying that `toJson()` produces the expected
 * wire format (undefined properties omitted, nulls preserved) and that nested objects
 * are correctly handled.
 */
test("Email full (de)serialization with nested objects", () => {
  const input = {
    id: "msg-1",
    blobId: "blob-1",
    threadId: "thread-1",
    mailboxIds: { inbox: true },
    keywords: { $seen: true },
    size: 1024,
    receivedAt: "2023-01-01T12:00:00Z",
    messageId: ["<a@b.c>"],
    inReplyTo: null,
    references: null,
    sender: [{ name: "Alice", email: "alice@example.com" }],
    from: [{ name: null, email: "bob@example.com" }],
    to: [{ name: "Carol", email: "carol@example.com" }],
    cc: null,
    bcc: null,
    replyTo: null,
    subject: "Hello",
    sentAt: "2023-01-01T11:00:00Z",
    bodyStructure: {
      partId: "0",
      size: 100,
      headers: [],
      type: "text/plain",
    },
    bodyValues: {
      "0": {
        value: "Hello world",
        isEncodingProblem: false,
        isTruncated: false,
      },
    },
    textBody: [
      {
        partId: "0",
        size: 100,
        headers: [],
        type: "text/plain",
      },
    ],
    htmlBody: null,
    attachments: null,
    hasAttachment: false,
    preview: "Hello world",
  };

  const email = Email.fromJson(input);
  const output = email.toJson();

  // EmailBodyPart.toJson() always includes every field, with unset optional ones as
  // null (not omitted) - build the full expected shape from the minimal input.
  const fullBodyPart = (overrides) => ({
    partId: null,
    blobId: null,
    size: null,
    headers: [],
    name: null,
    type: null,
    charset: null,
    disposition: null,
    cid: null,
    language: null,
    location: null,
    subParts: null,
    ...overrides,
  });

  const expected = {
    ...input,
    bodyStructure: fullBodyPart({ partId: "0", size: 100, headers: [], type: "text/plain" }),
    textBody: input.textBody.map((part) => fullBodyPart(part)),
  };

  // Remove any undefined top‑level keys that `toJson` would have omitted
  Object.keys(expected).forEach((k) => {
    if (expected[k] === undefined) delete expected[k];
  });

  assert.deepStrictEqual(output, expected);
});

/**
 * Minimal payload – only required property supplied – defaults are applied.
 */
test("Email.fromJson applies defaults when optional fields are missing", () => {
  const minimal = {
    mailboxIds: { inbox: true },
  };

  const email = Email.fromJson(minimal);

  // Required field
  assert.deepStrictEqual(email.mailboxIds, { inbox: true });

  // Optional fields receive documented defaults / undefined
  assert.deepStrictEqual(email.keywords, {}); // default empty object
  assert.strictEqual(email.id, undefined);
  assert.strictEqual(email.blobId, undefined);
  assert.strictEqual(email.threadId, undefined);
  assert.strictEqual(email.size, undefined);
  assert.strictEqual(email.receivedAt, undefined);
  assert.strictEqual(email.messageId, null);
  assert.strictEqual(email.inReplyTo, null);
  assert.strictEqual(email.references, null);
  assert.strictEqual(email.sender, null);
  assert.strictEqual(email.from, null);
  assert.strictEqual(email.to, null);
  assert.strictEqual(email.cc, null);
  assert.strictEqual(email.bcc, null);
  assert.strictEqual(email.replyTo, null);
  assert.strictEqual(email.subject, null);
  assert.strictEqual(email.sentAt, null);
  assert.strictEqual(email.bodyStructure, undefined);
  assert.strictEqual(email.bodyValues, undefined);
  assert.strictEqual(email.textBody, undefined);
  assert.strictEqual(email.htmlBody, undefined);
  assert.strictEqual(email.attachments, undefined);
  assert.strictEqual(email.hasAttachment, undefined);
  assert.strictEqual(email.preview, undefined);
});

/**
 * EmailBodyValue round‑trip serialization.
 */
test("EmailBodyValue (de)serialization round‑trip", () => {
  const json = {
    value: "Sample body",
    isEncodingProblem: true,
    isTruncated: false,
  };
  const ev = EmailBodyValue.fromJson(json);
  assert.strictEqual(ev.value, json.value);
  assert.strictEqual(ev.isEncodingProblem, json.isEncodingProblem);
  assert.strictEqual(ev.isTruncated, json.isTruncated);
  assert.deepStrictEqual(ev.toJson(), json);
});

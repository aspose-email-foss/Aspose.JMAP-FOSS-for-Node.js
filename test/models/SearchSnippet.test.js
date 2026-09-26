import { test } from "node:test";
import assert from "node:assert/strict";
import { SearchSnippet } from "aspose-jmap-foss";

test("SearchSnippet.fromJson with all fields", () => {
  const json = {
    emailId: "mail-123",
    subject: "Hello <mark>World</mark>",
    preview: "This is a <mark>preview</mark> snippet.",
  };

  const snippet = SearchSnippet.fromJson(json);

  assert.strictEqual(snippet.emailId, json.emailId);
  assert.strictEqual(snippet.subject, json.subject);
  assert.strictEqual(snippet.preview, json.preview);
});

test("SearchSnippet.fromJson with missing optional fields", () => {
  const json = {
    emailId: "mail-456",
    // subject and preview omitted intentionally
  };

  const snippet = SearchSnippet.fromJson(json);

  assert.strictEqual(snippet.emailId, json.emailId);
  assert.strictEqual(snippet.subject, null);
  assert.strictEqual(snippet.preview, null);
});

test("SearchSnippet.toJson includes null optional fields", () => {
  const snippet = new SearchSnippet("mail-789", null, null);
  const json = snippet.toJson();

  assert.deepStrictEqual(json, {
    emailId: "mail-789",
    subject: null,
    preview: null,
  });
});

test("SearchSnippet round‑trip (fromJson → toJson)", () => {
  const original = {
    emailId: "mail-abc",
    subject: "Subject with <mark>match</mark>",
    preview: null,
  };

  const instance = SearchSnippet.fromJson(original);
  const roundTrip = instance.toJson();

  assert.deepStrictEqual(roundTrip, original);
});

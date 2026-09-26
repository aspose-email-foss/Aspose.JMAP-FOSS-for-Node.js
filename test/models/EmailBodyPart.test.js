import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EmailBodyPart } from "aspose-jmap-foss";

describe("EmailBodyPart model (de)serialization", () => {
  test("full JSON round‑trip preserves all fields including nested subParts", () => {
    const json = {
      partId: "1",
      blobId: "blob123",
      size: 1024,
      headers: [{ name: "Content-Type", value: "text/plain" }],
      name: "file.txt",
      type: "text/plain",
      charset: "utf-8",
      disposition: "attachment",
      cid: "<cid@example>",
      language: ["en"],
      location: "http://example.com",
      subParts: [
        {
          partId: "1.1",
          blobId: "blob124",
          size: 512,
          headers: [{ name: "Content-Type", value: "image/png" }],
          name: null,
          type: "image/png",
          charset: null,
          disposition: "inline",
          cid: null,
          language: null,
          location: null,
          subParts: null,
        },
      ],
    };

    const instance = EmailBodyPart.fromJson(json);
    const roundTrip = instance.toJson();

    assert.deepStrictEqual(roundTrip, json);
  });

  test("minimal JSON sets optional fields to null and produces explicit nulls on serialization", () => {
    const minimalJson = {
      size: 10,
      headers: [],
      type: "text/plain",
    };

    const instance = EmailBodyPart.fromJson(minimalJson);

    // optional scalar fields should be null
    assert.strictEqual(instance.partId, null);
    assert.strictEqual(instance.blobId, null);
    assert.strictEqual(instance.name, null);
    assert.strictEqual(instance.charset, null);
    assert.strictEqual(instance.disposition, null);
    assert.strictEqual(instance.cid, null);
    assert.strictEqual(instance.language, null);
    assert.strictEqual(instance.location, null);
    assert.strictEqual(instance.subParts, null);

    const serialized = instance.toJson();

    const expected = {
      partId: null,
      blobId: null,
      size: 10,
      headers: [],
      name: null,
      type: "text/plain",
      charset: null,
      disposition: null,
      cid: null,
      language: null,
      location: null,
      subParts: null,
    };

    assert.deepStrictEqual(serialized, expected);
  });
});

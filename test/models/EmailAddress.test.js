import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { EmailAddress } from "aspose-jmap-foss";

describe("EmailAddress model", () => {
  test("toJson produces correct wire format", () => {
    const addr = new EmailAddress("Alice", "alice@example.com");
    const json = addr.toJson();
    assert.deepStrictEqual(json, {
      name: "Alice",
      email: "alice@example.com",
    });
  });

  test("toJson preserves null name", () => {
    const addr = new EmailAddress(null, "bob@example.com");
    const json = addr.toJson();
    assert.deepStrictEqual(json, {
      name: null,
      email: "bob@example.com",
    });
  });

  test("fromJson creates instance with all fields", () => {
    const data = { name: "Carol", email: "carol@example.com" };
    const addr = EmailAddress.fromJson(data);
    assert.strictEqual(addr.name, "Carol");
    assert.strictEqual(addr.email, "carol@example.com");
  });

  test("fromJson defaults missing name to null", () => {
    const data = { email: "dave@example.com" };
    const addr = EmailAddress.fromJson(data);
    assert.strictEqual(addr.name, null);
    assert.strictEqual(addr.email, "dave@example.com");
  });

  test("round‑trip (fromJson → toJson) preserves data", () => {
    const original = { name: "Eve", email: "eve@example.com" };
    const addr = EmailAddress.fromJson(original);
    const roundTrip = addr.toJson();
    assert.deepStrictEqual(roundTrip, original);
  });
});

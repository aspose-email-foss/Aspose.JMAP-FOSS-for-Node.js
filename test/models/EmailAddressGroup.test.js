import test from "node:test";
import assert from "node:assert/strict";
import { EmailAddressGroup, EmailAddress } from "aspose-jmap-foss";

test("EmailAddressGroup serialization round‑trip with populated fields", async () => {
  const group = new EmailAddressGroup("Team", [
    new EmailAddress("Alice", "alice@example.com"),
    new EmailAddress(null, "bob@example.com"),
  ]);

  const json = group.toJson();
  assert.deepStrictEqual(json, {
    name: "Team",
    addresses: [
      { name: "Alice", email: "alice@example.com" },
      { name: null, email: "bob@example.com" },
    ],
  });

  const roundTrip = EmailAddressGroup.fromJson(json);
  assert.deepStrictEqual(roundTrip, group);
});

test("EmailAddressGroup handles null name and missing addresses", async () => {
  // fromJson with missing addresses should default to empty array
  const parsed = EmailAddressGroup.fromJson({ name: null });
  assert.strictEqual(parsed.name, null);
  assert.deepStrictEqual(parsed.addresses, []);

  // toJson on an instance with null name and empty addresses
  const emptyGroup = new EmailAddressGroup(null, []);
  const json = emptyGroup.toJson();
  assert.deepStrictEqual(json, { name: null, addresses: [] });
});

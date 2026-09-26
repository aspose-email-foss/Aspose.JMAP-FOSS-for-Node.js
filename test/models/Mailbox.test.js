import { test } from "node:test";
import assert from "node:assert/strict";
import { Mailbox, MailboxRights } from "aspose-jmap-foss";

test("Mailbox.fromJson creates instance with all properties and round‑trips via toJson", () => {
  const raw = {
    id: "mb123",
    name: "Projects",
    parentId: "parent123",
    role: "inbox",
    sortOrder: 5,
    totalEmails: 42,
    unreadEmails: 7,
    totalThreads: 30,
    unreadThreads: 4,
    myRights: {
      mayReadItems: true,
      mayAddItems: false,
      mayRemoveItems: true,
      maySetSeen: false,
      maySetKeywords: true,
      mayCreateChild: false,
      mayRename: true,
      mayDelete: false,
      maySubmit: true,
    },
    isSubscribed: true,
  };

  const mailbox = Mailbox.fromJson(raw);

  // instance fields
  assert.strictEqual(mailbox.id, raw.id);
  assert.strictEqual(mailbox.name, raw.name);
  assert.strictEqual(mailbox.parentId, raw.parentId);
  assert.strictEqual(mailbox.role, raw.role);
  assert.strictEqual(mailbox.sortOrder, raw.sortOrder);
  assert.strictEqual(mailbox.totalEmails, raw.totalEmails);
  assert.strictEqual(mailbox.unreadEmails, raw.unreadEmails);
  assert.strictEqual(mailbox.totalThreads, raw.totalThreads);
  assert.strictEqual(mailbox.unreadThreads, raw.unreadThreads);
  assert.strictEqual(mailbox.isSubscribed, raw.isSubscribed);
  assert(mailbox.myRights instanceof MailboxRights);
  for (const key of Object.keys(raw.myRights)) {
    assert.strictEqual(mailbox.myRights[key], raw.myRights[key]);
  }

  // round‑trip back to JSON
  const roundTrip = mailbox.toJson();
  assert.deepStrictEqual(roundTrip, raw);
});

test("Mailbox.fromJson handles missing optional fields and applies defaults", () => {
  const raw = {
    name: "Inbox",
  };

  const mailbox = Mailbox.fromJson(raw);

  // required field
  assert.strictEqual(mailbox.name, "Inbox");
  // optional fields default / null
  assert.strictEqual(mailbox.id, undefined);
  assert.strictEqual(mailbox.parentId, null);
  assert.strictEqual(mailbox.role, null);
  assert.strictEqual(mailbox.sortOrder, 0);
  assert.strictEqual(mailbox.isSubscribed, false);
  // server‑assigned fields remain undefined when absent
  assert.strictEqual(mailbox.totalEmails, undefined);
  assert.strictEqual(mailbox.unreadEmails, undefined);
  assert.strictEqual(mailbox.totalThreads, undefined);
  assert.strictEqual(mailbox.unreadThreads, undefined);
  assert.strictEqual(mailbox.myRights, undefined);

  // toJson should emit defined properties (including null defaults)
  const json = mailbox.toJson();
  const expected = {
    name: "Inbox",
    parentId: null,
    role: null,
    sortOrder: 0,
    isSubscribed: false,
  };
  assert.deepStrictEqual(json, expected);
});

test("Mailbox.fromJson validates input type", () => {
  assert.throws(() => Mailbox.fromJson(null), {
    name: "TypeError",
    message: "Mailbox.fromJson expects an object",
  });
});

test("MailboxRights serialization round‑trip", () => {
  const rights = new MailboxRights({
    mayReadItems: true,
    mayAddItems: true,
    mayRemoveItems: false,
    maySetSeen: true,
    maySetKeywords: false,
    mayCreateChild: true,
    mayRename: false,
    mayDelete: true,
    maySubmit: false,
  });

  const json = rights.toJson();
  const restored = MailboxRights.fromJson(json);
  assert.deepStrictEqual(restored, rights);
});

test("MailboxRights.fromJson validates input type", () => {
  assert.throws(() => MailboxRights.fromJson(123), {
    name: "TypeError",
    message: "MailboxRights.fromJson expects an object",
  });
});

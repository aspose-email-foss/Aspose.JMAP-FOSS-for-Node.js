import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailHeader } from 'aspose-jmap-foss';

test('EmailHeader.fromJson creates an instance with correct properties', () => {
  const json = { name: 'Subject', value: 'Hello World' };
  const header = EmailHeader.fromJson(json);

  assert.ok(header instanceof EmailHeader, 'Result should be an EmailHeader instance');
  assert.strictEqual(header.name, 'Subject');
  assert.strictEqual(header.value, 'Hello World');
});

test('EmailHeader.toJson returns a plain object matching the JMAP wire format', () => {
  const header = new EmailHeader('From', 'alice@example.com');
  const json = header.toJson();

  assert.deepStrictEqual(json, { name: 'From', value: 'alice@example.com' });
});

test('EmailHeader handles null values without throwing (edge case)', () => {
  const json = { name: null, value: null };
  const header = EmailHeader.fromJson(json);

  assert.strictEqual(header.name, null);
  assert.strictEqual(header.value, null);

  const serialized = header.toJson();
  assert.deepStrictEqual(serialized, { name: null, value: null });
});

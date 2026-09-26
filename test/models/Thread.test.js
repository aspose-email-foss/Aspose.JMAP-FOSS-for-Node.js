import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Thread } from 'aspose-jmap-foss';

test('Thread.fromJson creates instance with all fields', () => {
  const data = {
    id: 'thread123',
    emailIds: ['emailA', 'emailB'],
  };
  const thread = Thread.fromJson(data);
  assert.ok(thread instanceof Thread, 'Result should be a Thread instance');
  assert.equal(thread.id, data.id);
  assert.deepEqual(thread.emailIds, data.emailIds);
});

test('Thread.fromJson returns null for null or undefined input', () => {
  assert.equal(Thread.fromJson(null), null);
  assert.equal(Thread.fromJson(undefined), null);
});

test('Thread.toJson includes defined fields only', () => {
  const thread = new Thread({ id: 't1', emailIds: ['e1', 'e2'] });
  const json = thread.toJson();
  assert.deepEqual(json, { id: 't1', emailIds: ['e1', 'e2'] });
});

test('Thread.toJson omits undefined fields', () => {
  const thread = new Thread();
  const json = thread.toJson();
  assert.deepEqual(json, {});
});

test('Thread.toJson includes empty emailIds array when defined', () => {
  const thread = new Thread({ id: 't2', emailIds: [] });
  const json = thread.toJson();
  assert.deepEqual(json, { id: 't2', emailIds: [] });
});

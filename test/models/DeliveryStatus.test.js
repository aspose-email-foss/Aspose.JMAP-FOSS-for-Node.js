import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DeliveryStatus } from 'aspose-jmap-foss';

test('DeliveryStatus.fromJson creates an instance with all properties', () => {
  const json = {
    smtpReply: '250 2.0.0 OK',
    delivered: 'yes',
    displayed: 'yes',
  };
  const ds = DeliveryStatus.fromJson(json);
  assert.ok(ds instanceof DeliveryStatus);
  assert.equal(ds.smtpReply, '250 2.0.0 OK');
  assert.equal(ds.delivered, 'yes');
  assert.equal(ds.displayed, 'yes');
});

test('DeliveryStatus.fromJson handles missing optional fields', () => {
  const ds = DeliveryStatus.fromJson({});
  assert.ok(ds instanceof DeliveryStatus);
  assert.equal(ds.smtpReply, undefined);
  assert.equal(ds.delivered, undefined);
  assert.equal(ds.displayed, undefined);
});

test('DeliveryStatus.fromJson throws TypeError when input is null', () => {
  assert.throws(() => {
    // @ts-ignore – intentionally passing null to test error handling
    DeliveryStatus.fromJson(null);
  }, TypeError);
});

test('DeliveryStatus.toJson serializes defined fields only', () => {
  const ds = new DeliveryStatus({
    smtpReply: '250 2.0.0 OK',
    // delivered omitted on purpose
    displayed: 'unknown',
  });
  const json = ds.toJson();
  assert.deepEqual(json, {
    smtpReply: '250 2.0.0 OK',
    displayed: 'unknown',
  });
});

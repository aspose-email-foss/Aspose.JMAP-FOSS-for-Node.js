import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Envelope, Address } from 'aspose-jmap-foss';

test('Envelope serialization round‑trip with full data', async () => {
  const mailFrom = new Address('sender@example.com', { RET: 'HDRS', SIZE: null });
  const rcpt1 = new Address('rcpt1@example.com');
  const rcpt2 = new Address('rcpt2@example.com', { NOTIFY: 'SUCCESS' });
  const envelope = new Envelope(mailFrom, [rcpt1, rcpt2]);

  const json = envelope.toJson();
  const expectedJson = {
    mailFrom: {
      email: 'sender@example.com',
      parameters: { RET: 'HDRS', SIZE: null },
    },
    rcptTo: [
      { email: 'rcpt1@example.com' },
      { email: 'rcpt2@example.com', parameters: { NOTIFY: 'SUCCESS' } },
    ],
  };
  assert.deepEqual(json, expectedJson, 'toJson output should match expected structure');

  const deserialized = Envelope.fromJson(json);
  assert.ok(deserialized instanceof Envelope, 'Deserialized object should be an Envelope');
  assert.ok(deserialized.mailFrom instanceof Address, 'mailFrom should be an Address');
  assert.equal(deserialized.mailFrom.email, 'sender@example.com');
  assert.deepEqual(deserialized.mailFrom.parameters, { RET: 'HDRS', SIZE: null });

  assert.equal(deserialized.rcptTo.length, 2);
  assert.equal(deserialized.rcptTo[0].email, 'rcpt1@example.com');
  assert.equal(deserialized.rcptTo[0].parameters, null);
  assert.equal(deserialized.rcptTo[1].email, 'rcpt2@example.com');
  assert.deepEqual(deserialized.rcptTo[1].parameters, { NOTIFY: 'SUCCESS' });
});

test('Envelope fromJson handles missing optional parameters and empty rcptTo', async () => {
  const json = {
    mailFrom: { email: 'a@b.com' },
    rcptTo: [
      { email: 'c@d.com', parameters: { RET: null } },
      { email: 'e@f.com' },
    ],
  };

  const envelope = Envelope.fromJson(json);
  assert.ok(envelope instanceof Envelope);
  assert.equal(envelope.mailFrom.email, 'a@b.com');
  assert.equal(envelope.mailFrom.parameters, null, 'mailFrom.parameters should be null when omitted');

  assert.equal(envelope.rcptTo.length, 2);
  assert.equal(envelope.rcptTo[0].email, 'c@d.com');
  assert.deepEqual(envelope.rcptTo[0].parameters, { RET: null });
  assert.equal(envelope.rcptTo[1].email, 'e@f.com');
  assert.equal(envelope.rcptTo[1].parameters, null, 'rcptTo[1].parameters should be null when omitted');

  const roundTripJson = envelope.toJson();
  const expectedRoundTrip = {
    mailFrom: { email: 'a@b.com' },
    rcptTo: [
      { email: 'c@d.com', parameters: { RET: null } },
      { email: 'e@f.com' },
    ],
  };
  assert.deepEqual(roundTripJson, expectedRoundTrip, 'toJson should omit undefined parameters');
});

test('Envelope with empty rcptTo array serializes correctly', async () => {
  const envelope = new Envelope(new Address('sender@example.com'), []);
  const json = envelope.toJson();
  const expected = {
    mailFrom: { email: 'sender@example.com' },
    rcptTo: [],
  };
  assert.deepEqual(json, expected);
  const back = Envelope.fromJson(json);
  assert.equal(back.rcptTo.length, 0);
});

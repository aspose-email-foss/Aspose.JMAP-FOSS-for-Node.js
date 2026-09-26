/**
 * SMTP MAIL FROM / RCPT TO envelope for a submission, distinct from the message's own From/To headers.
 *
 * @typedef {Object} EnvelopeJson
 * @property {Object} mailFrom - Address JSON object.
 * @property {Object[]} rcptTo - Array of Address JSON objects.
 */

/**
 * Represents an address used in an envelope.
 *
 * @typedef {Object} AddressJson
 * @property {string} email - The email address.
 * @property {Object.<string, (string|null)>} [parameters] - SMTP parameters (e.g. {"RET":"HDRS"}).
 */
export class Address {
  /**
   * @param {string} email - The email address.
   * @param {Object.<string, (string|null)>|null} [parameters=null] - SMTP parameters.
   */
  constructor(email, parameters = null) {
    /** @type {string} */
    this.email = email;
    /** @type {Object.<string, (string|null)>|null} */
    this.parameters = parameters;
  }

  /**
   * Create an {@link Address} instance from a plain JSON object.
   *
   * @param {AddressJson} data
   * @returns {Address}
   */
  static fromJson(data) {
    return new Address(
      data.email,
      data.parameters !== undefined ? data.parameters : null
    );
  }

  /**
   * Convert this {@link Address} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {AddressJson}
   */
  toJson() {
    const json = { email: this.email };
    if (this.parameters != null) {
      json.parameters = this.parameters;
    }
    return json;
  }
}

/**
 * SMTP MAIL FROM / RCPT TO envelope for a submission.
 *
 * @typedef {Object} EnvelopeJson
 * @property {Object} mailFrom - Address JSON object.
 * @property {Object[]} rcptTo - Array of Address JSON objects.
 */
export class Envelope {
  /**
   * @param {Address} mailFrom - The MAIL FROM address.
   * @param {Address[]} rcptTo - The list of RCPT TO addresses.
   */
  constructor(mailFrom, rcptTo) {
    /** @type {Address} */
    this.mailFrom = mailFrom;
    /** @type {Address[]} */
    this.rcptTo = rcptTo;
  }

  /**
   * Create an {@link Envelope} instance from a plain JSON object.
   *
   * @param {EnvelopeJson} data
   * @returns {Envelope}
   */
  static fromJson(data) {
    const mailFrom = Address.fromJson(data.mailFrom);
    const rcptTo = Array.isArray(data.rcptTo)
      ? data.rcptTo.map((item) => Address.fromJson(item))
      : [];
    return new Envelope(mailFrom, rcptTo);
  }

  /**
   * Convert this {@link Envelope} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {EnvelopeJson}
   */
  toJson() {
    return {
      mailFrom: this.mailFrom.toJson(),
      rcptTo: this.rcptTo.map((addr) => addr.toJson()),
    };
  }
}

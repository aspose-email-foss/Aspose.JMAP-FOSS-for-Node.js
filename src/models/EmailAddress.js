/**
 * One address in a header such as From/To/Cc (RFC 8621 section 4.1.2.3).
 *
 * @class EmailAddress
 */
export class EmailAddress {
  /**
   * @param {string|null} name - The display name of the address, or `null` if not provided.
   * @param {string} email - The email address (required).
   */
  constructor(name, email) {
    /** @type {string|null} */
    this.name = name ?? null;
    /** @type {string} */
    this.email = email;
  }

  /**
   * Create an {@link EmailAddress} instance from a plain JSON object.
   *
   * @param {Object} data - The JSON representation.
   * @param {string|null} [data.name] - The display name, may be `null`.
   * @param {string} data.email - The email address.
   * @returns {EmailAddress}
   */
  static fromJson(data) {
    return new EmailAddress(
      data.hasOwnProperty('name') ? data.name : null,
      data.email
    );
  }

  /**
   * Convert this {@link EmailAddress} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {{name: (string|null), email: string}}
   */
  toJson() {
    return {
      name: this.name,
      email: this.email,
    };
  }
}

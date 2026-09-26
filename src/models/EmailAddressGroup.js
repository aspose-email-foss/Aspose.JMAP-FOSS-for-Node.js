import { EmailAddress } from "./EmailAddress.js";

/**
 * Group syntax as in From/To headers, e.g. 'Team: a@x, b@x;'.
 *
 * @class EmailAddressGroup
 */
class EmailAddressGroup {
  /**
   * @param {string|null} name
   * @param {EmailAddress[]} addresses
   */
  constructor(name = null, addresses = []) {
    /** @type {string|null} */
    this.name = name;
    /** @type {EmailAddress[]} */
    this.addresses = addresses;
  }

  /**
   * Create an {@link EmailAddressGroup} instance from a plain JSON object.
   *
   * @param {Object} data - The JSON representation.
   * @param {string|null} [data.name] - Group name, may be null.
   * @param {Object[]} [data.addresses] - Array of email address objects.
   * @returns {EmailAddressGroup}
   */
  static fromJson(data) {
    const name = data.name ?? null;
    const addresses = Array.isArray(data.addresses)
      ? data.addresses.map((addr) => EmailAddress.fromJson(addr))
      : [];
    return new EmailAddressGroup(name, addresses);
  }

  /**
   * Convert this {@link EmailAddressGroup} instance to a plain JSON object
   * suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      name: this.name,
      addresses: this.addresses.map((addr) => addr.toJson()),
    };
  }
}

export { EmailAddressGroup };

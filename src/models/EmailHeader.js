/**
 * EmailHeader JMAP data object.
 *
 * @class EmailHeader
 */
export class EmailHeader {
  /**
   * @param {string} name
   * @param {string} value
   */
  constructor(name, value) {
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.value = value;
  }

  /**
   * Create an {@link EmailHeader} instance from a plain JSON object.
   *
   * @param {Object} data - JSON representation with properties `name` and `value`.
   * @returns {EmailHeader}
   */
  static fromJson(data) {
    return new EmailHeader(data.name, data.value);
  }

  /**
   * Convert this {@link EmailHeader} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {{name: string, value: string}}
   */
  toJson() {
    return {
      name: this.name,
      value: this.value,
    };
  }
}

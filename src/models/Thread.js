/**
 * Thread model representing an ordered list of Email ids that make up a conversation.
 *
 * @class Thread
 */
export class Thread {
  /**
   * @param {Object} [params={}]
   * @param {string} [params.id] - Server-assigned identifier (omit when constructing a create payload).
   * @param {Array<string>} [params.emailIds] - Ordered list of Email ids (omit when constructing a create payload).
   */
  constructor({ id, emailIds } = {}) {
    /** @type {string|undefined} */
    this.id = id;
    /** @type {Array<string>|undefined} */
    this.emailIds = emailIds;
  }

  /**
   * Create a {@link Thread} instance from a JSON object.
   *
   * @param {Object} data - JSON representation of a Thread.
   * @param {string} [data.id]
   * @param {Array<string>} [data.emailIds]
   * @returns {Thread}
   */
  static fromJson(data) {
    if (!data) {
      return null;
    }
    const { id, emailIds } = data;
    return new Thread({ id, emailIds });
  }

  /**
   * Convert this {@link Thread} instance to a JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {};
    if (this.id !== undefined) {
      json.id = this.id;
    }
    if (this.emailIds !== undefined) {
      json.emailIds = this.emailIds;
    }
    return json;
  }
}

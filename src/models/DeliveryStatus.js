/**
 * @class DeliveryStatus
 * @classdesc Per-recipient delivery outcome, keyed by recipient email address on
 * {@link EmailSubmission}.deliveryStatus.
 *
 * @property {string} smtpReply - The SMTP reply string received from the server.
 * @property {string} delivered - Delivery status; one of "queued", "yes", "no", "unknown".
 * @property {string} displayed - Display status; one of "unknown", "yes".
 */
export class DeliveryStatus {
  /**
   * @param {Object} [init={}]
   * @param {string} [init.smtpReply]
   * @param {string} [init.delivered]
   * @param {string} [init.displayed]
   */
  constructor({ smtpReply, delivered, displayed } = {}) {
    /** @type {string|undefined} */
    this.smtpReply = smtpReply;
    /** @type {string|undefined} */
    this.delivered = delivered;
    /** @type {string|undefined} */
    this.displayed = displayed;
  }

  /**
   * Create a {@link DeliveryStatus} instance from a plain JSON object.
   *
   * @param {Object} data - The JSON representation.
   * @param {string} [data.smtpReply]
   * @param {string} [data.delivered]
   * @param {string} [data.displayed]
   * @returns {DeliveryStatus}
   */
  static fromJson(data) {
    if (typeof data !== 'object' || data === null) {
      throw new TypeError('DeliveryStatus.fromJson expects a non-null object');
    }
    const { smtpReply, delivered, displayed } = data;
    return new DeliveryStatus({ smtpReply, delivered, displayed });
  }

  /**
   * Convert this {@link DeliveryStatus} instance to a plain JSON object suitable for
   * transmission over JMAP.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {};
    if (this.smtpReply !== undefined) json.smtpReply = this.smtpReply;
    if (this.delivered !== undefined) json.delivered = this.delivered;
    if (this.displayed !== undefined) json.displayed = this.displayed;
    return json;
  }
}

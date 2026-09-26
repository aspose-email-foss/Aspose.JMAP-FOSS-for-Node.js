import { DeliveryStatus } from "./DeliveryStatus.js";
import { Envelope } from "./Envelope.js";

/**
 * One attempt to submit an Email for delivery. Analogous to what Aspose.Email's SmtpClient.Send does
 * synchronously over SMTP; here creating an EmailSubmission is what actually dispatches the message
 * via the server's outbound MTA.
 */
export class EmailSubmission {
  /**
   * @param {Object} params
   * @param {string} [params.id] - Server‑assigned identifier.
   * @param {string} params.identityId - Must reference an existing Identity.
   * @param {string} params.emailId - The Email to send; typically a draft created via Email/set.
   * @param {string} [params.threadId] - Server‑assigned thread identifier.
   * @param {Envelope|null} [params.envelope] - If null, server derives it from the Email's headers.
   * @param {string} [params.sendAt] - UTCDate string, server‑assigned.
   * @param {string} [params.undoStatus] - Server‑assigned status (pending | final | canceled).
   * @param {Object.<string, DeliveryStatus>|null} [params.deliveryStatus] - Map of recipient to delivery status.
   * @param {string[]} [params.dsnBlobIds] - Server‑assigned DSN blob identifiers.
   * @param {string[]} [params.mdnBlobIds] - Server‑assigned MDN blob identifiers.
   */
  constructor({
    id,
    identityId,
    emailId,
    threadId,
    envelope = null,
    sendAt,
    undoStatus,
    deliveryStatus = null,
    dsnBlobIds,
    mdnBlobIds,
  } = {}) {
    /** @type {string|undefined} */
    this.id = id;
    /** @type {string} */
    this.identityId = identityId;
    /** @type {string} */
    this.emailId = emailId;
    /** @type {string|undefined} */
    this.threadId = threadId;
    /** @type {Envelope|null} */
    this.envelope = envelope;
    /** @type {string|undefined} */
    this.sendAt = sendAt;
    /** @type {string|undefined} */
    this.undoStatus = undoStatus;
    /** @type {Object.<string, DeliveryStatus>|null} */
    this.deliveryStatus = deliveryStatus;
    /** @type {string[]|undefined} */
    this.dsnBlobIds = dsnBlobIds;
    /** @type {string[]|undefined} */
    this.mdnBlobIds = mdnBlobIds;
  }

  /**
   * Create an {@link EmailSubmission} instance from a plain JSON object.
   *
   * @param {Object} data - JSON representation as received from a JMAP server.
   * @returns {EmailSubmission}
   */
  static fromJson(data) {
    const {
      id,
      identityId,
      emailId,
      threadId,
      envelope,
      sendAt,
      undoStatus,
      deliveryStatus,
      dsnBlobIds,
      mdnBlobIds,
    } = data;

    const envelopeObj = envelope ? Envelope.fromJson(envelope) : null;

    const deliveryStatusObj = deliveryStatus
      ? Object.fromEntries(
          Object.entries(deliveryStatus).map(([k, v]) => [k, DeliveryStatus.fromJson(v)])
        )
      : null;

    return new EmailSubmission({
      id,
      identityId,
      emailId,
      threadId,
      envelope: envelopeObj,
      sendAt,
      undoStatus,
      deliveryStatus: deliveryStatusObj,
      dsnBlobIds,
      mdnBlobIds,
    });
  }

  /**
   * Convert this {@link EmailSubmission} instance to a plain JSON object suitable for
   * transmission to a JMAP server.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      id: this.id,
      identityId: this.identityId,
      emailId: this.emailId,
      threadId: this.threadId,
      envelope: this.envelope ? this.envelope.toJson() : null,
      sendAt: this.sendAt,
      undoStatus: this.undoStatus,
      deliveryStatus: this.deliveryStatus
        ? Object.fromEntries(
            Object.entries(this.deliveryStatus).map(([k, v]) => [k, v.toJson()])
          )
        : null,
      dsnBlobIds: this.dsnBlobIds,
      mdnBlobIds: this.mdnBlobIds,
    };
  }
}

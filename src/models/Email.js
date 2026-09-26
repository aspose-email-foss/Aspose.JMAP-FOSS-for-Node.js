import { EmailAddress } from "./EmailAddress.js";
import { EmailBodyPart } from "./EmailBodyPart.js";

/**
 * @typedef {Object.<string, boolean>} MapStringBoolean
 */

/**
 * Represents the value of a body part in an {@link Email}.
 *
 * @property {string} value - The raw body value.
 * @property {boolean} isEncodingProblem - True if there was an encoding problem.
 * @property {boolean} isTruncated - True if the value was truncated.
 */
export class EmailBodyValue {
  /**
   * @param {Object} params
   * @param {string} params.value
   * @param {boolean} params.isEncodingProblem
   * @param {boolean} params.isTruncated
   */
  constructor({ value, isEncodingProblem, isTruncated }) {
    this.value = value;
    this.isEncodingProblem = isEncodingProblem;
    this.isTruncated = isTruncated;
  }

  /**
   * Creates an {@link EmailBodyValue} from a plain JSON object.
   *
   * @param {Object} json
   * @param {string} json.value
   * @param {boolean} json.isEncodingProblem
   * @param {boolean} json.isTruncated
   * @returns {EmailBodyValue}
   */
  static fromJson(json) {
    return new EmailBodyValue({
      value: json.value,
      isEncodingProblem: json.isEncodingProblem,
      isTruncated: json.isTruncated,
    });
  }

  /**
   * Serialises this instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      value: this.value,
      isEncodingProblem: this.isEncodingProblem,
      isTruncated: this.isTruncated,
    };
  }
}

/**
 * A single email message (RFC 8621 "Email" object). Immutable content (headers, body)
 * plus mutable per‑mailbox metadata (mailboxIds, keywords).
 *
 * @property {string|undefined} id - Server‑assigned identifier.
 * @property {string|undefined} blobId - Server‑assigned blob identifier.
 * @property {string|undefined} threadId - Server‑assigned thread identifier.
 * @property {MapStringBoolean} mailboxIds - Set of mailbox ids this Email is in.
 * @property {MapStringBoolean} [keywords] - Keyword flags (e.g. $seen, $draft).
 * @property {number|undefined} size - Server‑assigned size in octets.
 * @property {string|undefined} receivedAt - Server‑assigned UTC timestamp (RFC 3339).
 * @property {string[]|null} [messageId] - Message‑Id header values.
 * @property {string[]|null} [inReplyTo] - In‑Reply‑To header values.
 * @property {string[]|null} [references] - References header values.
 * @property {EmailAddress[]|null} [sender]
 * @property {EmailAddress[]|null} [from]
 * @property {EmailAddress[]|null} [to]
 * @property {EmailAddress[]|null} [cc]
 * @property {EmailAddress[]|null} [bcc]
 * @property {EmailAddress[]|null} [replyTo]
 * @property {string|null} [subject]
 * @property {string|null} [sentAt] - Date‑time string (RFC 3339) when the message was sent.
 * @property {EmailBodyPart|undefined} bodyStructure
 * @property {Object.<string, EmailBodyValue>|undefined} bodyValues
 * @property {EmailBodyPart[]|undefined} textBody
 * @property {EmailBodyPart[]|undefined} htmlBody
 * @property {EmailBodyPart[]|undefined} attachments
 * @property {boolean|undefined} hasAttachment
 * @property {string|undefined} preview
 */
export class Email {
  /**
   * @param {Object} params
   * @param {string} [params.id]
   * @param {string} [params.blobId]
   * @param {string} [params.threadId]
   * @param {MapStringBoolean} params.mailboxIds
   * @param {MapStringBoolean} [params.keywords]
   * @param {number} [params.size]
   * @param {string} [params.receivedAt]
   * @param {string[]|null} [params.messageId]
   * @param {string[]?null} [params.inReplyTo]
   * @param {string[]|null} [params.references]
   * @param {EmailAddress[]|null} [params.sender]
   * @param {EmailAddress[]|null} [params.from]
   * @param {EmailAddress[]|null} [params.to]
   * @param {EmailAddress[]|null} [params.cc]
   * @param {EmailAddress[]|null} [params.bcc]
   * @param {EmailAddress[]|null} [params.replyTo]
   * @param {string|null} [params.subject]
   * @param {string|null} [params.sentAt]
   * @param {EmailBodyPart} [params.bodyStructure]
   * @param {Object.<string, EmailBodyValue>} [params.bodyValues]
   * @param {EmailBodyPart[]} [params.textBody]
   * @param {EmailBodyPart[]} [params.htmlBody]
   * @param {EmailBodyPart[]} [params.attachments]
   * @param {boolean} [params.hasAttachment]
   * @param {string} [params.preview]
   */
  constructor({
    id,
    blobId,
    threadId,
    mailboxIds,
    keywords = {},
    size,
    receivedAt,
    messageId = null,
    inReplyTo = null,
    references = null,
    sender = null,
    from = null,
    to = null,
    cc = null,
    bcc = null,
    replyTo = null,
    subject = null,
    sentAt = null,
    bodyStructure,
    bodyValues,
    textBody,
    htmlBody,
    attachments,
    hasAttachment,
    preview,
  }) {
    this.id = id;
    this.blobId = blobId;
    this.threadId = threadId;
    this.mailboxIds = mailboxIds;
    this.keywords = keywords;
    this.size = size;
    this.receivedAt = receivedAt;
    this.messageId = messageId;
    this.inReplyTo = inReplyTo;
    this.references = references;
    this.sender = sender;
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.replyTo = replyTo;
    this.subject = subject;
    this.sentAt = sentAt;
    this.bodyStructure = bodyStructure;
    this.bodyValues = bodyValues;
    this.textBody = textBody;
    this.htmlBody = htmlBody;
    this.attachments = attachments;
    this.hasAttachment = hasAttachment;
    this.preview = preview;
  }

  /**
   * Creates an {@link Email} instance from a plain JSON object.
   *
   * @param {Object} json
   * @returns {Email}
   */
  static fromJson(json) {
    const mapArray = (arr, Ctor) => {
      if (arr === undefined) return undefined;
      if (arr === null) return null;
      return arr.map(Ctor.fromJson);
    };

    const bodyValues = json.bodyValues
      ? Object.fromEntries(
          Object.entries(json.bodyValues).map(([k, v]) => [k, EmailBodyValue.fromJson(v)])
        )
      : undefined;

    return new Email({
      id: json.id,
      blobId: json.blobId,
      threadId: json.threadId,
      mailboxIds: json.mailboxIds,
      keywords: json.keywords ?? {},
      size: json.size,
      receivedAt: json.receivedAt,
      messageId: json.messageId ?? null,
      inReplyTo: json.inReplyTo ?? null,
      references: json.references ?? null,
      sender: mapArray(json.sender, EmailAddress),
      from: mapArray(json.from, EmailAddress),
      to: mapArray(json.to, EmailAddress),
      cc: mapArray(json.cc, EmailAddress),
      bcc: mapArray(json.bcc, EmailAddress),
      replyTo: mapArray(json.replyTo, EmailAddress),
      subject: json.subject ?? null,
      sentAt: json.sentAt ?? null,
      bodyStructure: json.bodyStructure ? EmailBodyPart.fromJson(json.bodyStructure) : undefined,
      bodyValues,
      textBody: mapArray(json.textBody, EmailBodyPart),
      htmlBody: mapArray(json.htmlBody, EmailBodyPart),
      attachments: mapArray(json.attachments, EmailBodyPart),
      hasAttachment: json.hasAttachment,
      preview: json.preview,
    });
  }

  /**
   * Serialises this {@link Email} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const mapArray = (arr) => {
      if (arr === undefined) return undefined;
      if (arr === null) return null;
      return arr.map((x) => x.toJson());
    };

    const bodyValuesJson = this.bodyValues
      ? Object.fromEntries(
          Object.entries(this.bodyValues).map(([k, v]) => [k, v.toJson()])
        )
      : undefined;

    const json = {
      id: this.id,
      blobId: this.blobId,
      threadId: this.threadId,
      mailboxIds: this.mailboxIds,
      keywords: this.keywords,
      size: this.size,
      receivedAt: this.receivedAt,
      messageId: this.messageId,
      inReplyTo: this.inReplyTo,
      references: this.references,
      sender: mapArray(this.sender),
      from: mapArray(this.from),
      to: mapArray(this.to),
      cc: mapArray(this.cc),
      bcc: mapArray(this.bcc),
      replyTo: mapArray(this.replyTo),
      subject: this.subject,
      sentAt: this.sentAt,
      bodyStructure: this.bodyStructure ? this.bodyStructure.toJson() : undefined,
      bodyValues: bodyValuesJson,
      textBody: mapArray(this.textBody),
      htmlBody: mapArray(this.htmlBody),
      attachments: mapArray(this.attachments),
      hasAttachment: this.hasAttachment,
      preview: this.preview,
    };

    // Omit undefined properties for a minimal payload
    Object.keys(json).forEach((k) => json[k] === undefined && delete json[k]);
    return json;
  }
}

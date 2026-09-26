import { EmailAddress } from "./EmailAddress.js";

/**
 * A sending identity (name/email/replyTo used as the From when submitting mail);
 * analogous to configuring a MailAddress + display name on Aspose's SmtpClient.
 *
 * @typedef {Object} IdentityInit
 * @property {string} [id] - Server‑assigned identifier (omit when creating).
 * @property {string} [name] - Display name (default: empty string).
 * @property {string} email - Email address (required).
 * @property {EmailAddress[]|null} [replyTo] - Optional reply‑to addresses.
 * @property {EmailAddress[]|null} [bcc] - Optional BCC addresses.
 * @property {string} [textSignature] - Text signature (default: empty string).
 * @property {string} [htmlSignature] - HTML signature (default: empty string).
 * @property {boolean} [mayDelete] - Server‑assigned flag (omit when creating).
 */

/**
 * Model class representing a JMAP Identity.
 */
export class Identity {
  /**
   * @param {IdentityInit} init
   */
  constructor({
    id,
    name = "",
    email,
    replyTo = null,
    bcc = null,
    textSignature = "",
    htmlSignature = "",
    mayDelete,
  } = {}) {
    /** @type {string|undefined} */
    this.id = id;
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.email = email;
    /** @type {EmailAddress[]|null} */
    this.replyTo = replyTo;
    /** @type {EmailAddress[]|null} */
    this.bcc = bcc;
    /** @type {string} */
    this.textSignature = textSignature;
    /** @type {string} */
    this.htmlSignature = htmlSignature;
    /** @type {boolean|undefined} */
    this.mayDelete = mayDelete;
  }

  /**
   * Create an {@link Identity} instance from a plain JSON object received from the JMAP server.
   *
   * @param {Object} data - Raw JSON data.
   * @returns {Identity}
   */
  static fromJson(data) {
    const {
      id,
      name = "",
      email,
      replyTo,
      bcc,
      textSignature = "",
      htmlSignature = "",
      mayDelete,
    } = data;

    return new Identity({
      id,
      name,
      email,
      replyTo: replyTo ? replyTo.map((e) => EmailAddress.fromJson(e)) : null,
      bcc: bcc ? bcc.map((e) => EmailAddress.fromJson(e)) : null,
      textSignature,
      htmlSignature,
      mayDelete,
    });
  }

  /**
   * Convert this {@link Identity} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {};

    if (this.id !== undefined) json.id = this.id;
    if (this.name !== undefined) json.name = this.name;
    if (this.email !== undefined) json.email = this.email;
    if (this.replyTo !== undefined)
      json.replyTo = this.replyTo ? this.replyTo.map((a) => a.toJson()) : null;
    if (this.bcc !== undefined)
      json.bcc = this.bcc ? this.bcc.map((a) => a.toJson()) : null;
    if (this.textSignature !== undefined) json.textSignature = this.textSignature;
    if (this.htmlSignature !== undefined) json.htmlSignature = this.htmlSignature;
    if (this.mayDelete !== undefined) json.mayDelete = this.mayDelete;

    return json;
  }
}

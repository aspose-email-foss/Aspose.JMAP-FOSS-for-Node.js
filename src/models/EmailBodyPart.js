import { EmailHeader } from "./EmailHeader.js";

/**
 * One node of the Email's MIME bodyStructure tree.
 */
export class EmailBodyPart {
  /**
   * @param {Object} params
   * @param {string|null} [params.partId] - Identifier for this part.
   * @param {string|null} [params.blobId] - Blob identifier (Id) for the part's content.
   * @param {number} params.size - Size in bytes of the part.
   * @param {EmailHeader[]} params.headers - List of headers for the part.
   * @param {string|null} [params.name] - Filename, from Content‑Disposition or Content‑Type.
   * @param {string} params.type - MIME type, e.g. "text/plain".
   * @param {string|null} [params.charset] - Character set of the part.
   * @param {string|null} [params.disposition] - Disposition, e.g. "inline" or "attachment".
   * @param {string|null} [params.cid] - Content‑Id for inline references.
   * @param {string[]|null} [params.language] - Languages applicable to the part.
   * @param {string|null} [params.location] - Location URI.
   * @param {EmailBodyPart[]|null} [params.subParts] - Child parts of this node.
   */
  constructor({
    partId = null,
    blobId = null,
    size,
    headers,
    name = null,
    type,
    charset = null,
    disposition = null,
    cid = null,
    language = null,
    location = null,
    subParts = null,
  }) {
    this.partId = partId;
    this.blobId = blobId;
    this.size = size;
    this.headers = headers;
    this.name = name;
    this.type = type;
    this.charset = charset;
    this.disposition = disposition;
    this.cid = cid;
    this.language = language;
    this.location = location;
    this.subParts = subParts;
  }

  /**
   * Create an {@link EmailBodyPart} instance from a plain JSON object.
   *
   * @param {Object} json - The JSON representation received from a JMAP server.
   * @param {string|null} [json.partId]
   * @param {string|null} [json.blobId]
   * @param {number} json.size
   * @param {Object[]} json.headers
   * @param {string|null} [json.name]
   * @param {string} json.type
   * @param {string|null} [json.charset]
   * @param {string|null} [json.disposition]
   * @param {string|null} [json.cid]
   * @param {string[]|null} [json.language]
   * @param {string|null} [json.location]
   * @param {Object[]|null} [json.subParts]
   * @returns {EmailBodyPart}
   */
  static fromJson(json) {
    const headers = Array.isArray(json.headers)
      ? json.headers.map((h) => EmailHeader.fromJson(h))
      : [];

    const subParts = Array.isArray(json.subParts)
      ? json.subParts.map((sp) => EmailBodyPart.fromJson(sp))
      : null;

    return new EmailBodyPart({
      partId: json.partId ?? null,
      blobId: json.blobId ?? null,
      size: json.size,
      headers,
      name: json.name ?? null,
      type: json.type,
      charset: json.charset ?? null,
      disposition: json.disposition ?? null,
      cid: json.cid ?? null,
      language: json.language ?? null,
      location: json.location ?? null,
      subParts,
    });
  }

  /**
   * Convert this {@link EmailBodyPart} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {
      partId: this.partId,
      blobId: this.blobId,
      size: this.size,
      headers: this.headers.map((h) => h.toJson()),
      name: this.name,
      type: this.type,
      charset: this.charset,
      disposition: this.disposition,
      cid: this.cid,
      language: this.language,
      location: this.location,
      subParts: this.subParts
        ? this.subParts.map((sp) => sp.toJson())
        : null,
    };
    // Remove undefined properties to keep output clean (optional but harmless)
    Object.keys(json).forEach(
      (k) => json[k] === undefined && delete json[k]
    );
    return json;
  }
}

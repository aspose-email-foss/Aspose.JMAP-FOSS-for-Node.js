/**
 * Highlighted subject/preview snippet for an Email id matched by a filter's text search.
 *
 * @class
 */
export class SearchSnippet {
  /**
   * @param {string} emailId - Identifier of the email.
   * @param {string|null} [subject=null] - Subject with optional <mark></mark> tags around matches.
   * @param {string|null} [preview=null] - Preview snippet with optional <mark></mark> tags around matches.
   */
  constructor(emailId, subject = null, preview = null) {
    /** @type {string} */
    this.emailId = emailId;
    /** @type {string|null} */
    this.subject = subject;
    /** @type {string|null} */
    this.preview = preview;
  }

  /**
   * Create a {@link SearchSnippet} instance from a plain JSON object.
   *
   * @param {Object} data - The JSON representation.
   * @param {string} data.emailId
   * @param {string|null} [data.subject]
   * @param {string|null} [data.preview]
   * @returns {SearchSnippet}
   */
  static fromJson(data) {
    return new SearchSnippet(
      /** @type {string} */ (data.emailId),
      data.hasOwnProperty('subject') ? /** @type {string|null} */ (data.subject) : null,
      data.hasOwnProperty('preview') ? /** @type {string|null} */ (data.preview) : null
    );
  }

  /**
   * Convert this {@link SearchSnippet} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      emailId: this.emailId,
      subject: this.subject,
      preview: this.preview,
    };
  }
}

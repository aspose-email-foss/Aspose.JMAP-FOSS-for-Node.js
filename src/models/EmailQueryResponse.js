/**
 * Response of an Email/query call (RFC 8620 section 5.5).
 *
 * @class EmailQueryResponse
 */
export class EmailQueryResponse {
  /**
   * @param {Object} params
   * @param {string} params.accountId - The id of the account used for the call.
   * @param {string} params.queryState - A string encoding the current state of the query.
   * @param {boolean} params.canCalculateChanges - Whether the server can calculate changes for this query.
   * @param {number} params.position - The zero-based index of the first result in `ids`.
   * @param {string[]} params.ids - The list of email ids that match the query.
   * @param {number|null} [params.total] - Total number of results matching the filter, if requested.
   * @param {number|null} [params.limit] - The limit that was applied, if the server clamped it.
   */
  constructor({
    accountId,
    queryState,
    canCalculateChanges,
    position,
    ids,
    total = null,
    limit = null,
  } = {}) {
    if (accountId === undefined) {
      throw new TypeError("EmailQueryResponse: 'accountId' is required");
    }
    if (queryState === undefined) {
      throw new TypeError("EmailQueryResponse: 'queryState' is required");
    }
    if (canCalculateChanges === undefined) {
      throw new TypeError("EmailQueryResponse: 'canCalculateChanges' is required");
    }
    if (position === undefined) {
      throw new TypeError("EmailQueryResponse: 'position' is required");
    }
    if (ids === undefined) {
      throw new TypeError("EmailQueryResponse: 'ids' is required");
    }
    this.accountId = accountId;
    this.queryState = queryState;
    this.canCalculateChanges = canCalculateChanges;
    this.position = position;
    this.ids = ids;
    this.total = total;
    this.limit = limit;
  }

  /**
   * Create an {@link EmailQueryResponse} instance from a plain JSON object.
   *
   * @param {Object} json
   * @param {string} json.accountId
   * @param {string} json.queryState
   * @param {boolean} json.canCalculateChanges
   * @param {number} json.position
   * @param {string[]} json.ids
   * @param {number|null} [json.total]
   * @param {number|null} [json.limit]
   * @returns {EmailQueryResponse}
   */
  static fromJson(json) {
    return new EmailQueryResponse({
      accountId: json.accountId,
      queryState: json.queryState,
      canCalculateChanges: json.canCalculateChanges,
      position: json.position ?? 0,
      ids: json.ids ?? [],
      total: json.total ?? null,
      limit: json.limit ?? null,
    });
  }

  /**
   * Convert this {@link EmailQueryResponse} to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const obj = {
      accountId: this.accountId,
      queryState: this.queryState,
      canCalculateChanges: this.canCalculateChanges,
      position: this.position,
      ids: this.ids,
    };
    if (this.total !== null && this.total !== undefined) {
      obj.total = this.total;
    }
    if (this.limit !== null && this.limit !== undefined) {
      obj.limit = this.limit;
    }
    return obj;
  }
}

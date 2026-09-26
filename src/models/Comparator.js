/**
 * One entry of an Email/query `sort` argument.
 *
 * @class Comparator
 */
export class Comparator {
  /**
   * @param {Object} params
   * @param {string} params.property - e.g. `receivedAt`, `from`, `subject`, `size`.
   * @param {boolean} [params.isAscending=true] - Sort direction; `true` for ascending.
   * @param {string|null} [params.collation] - Optional collation identifier.
   */
  constructor({ property, isAscending = true, collation = null } = {}) {
    if (property === undefined) {
      throw new TypeError("Comparator: 'property' is required");
    }
    this.property = property;
    this.isAscending = isAscending;
    this.collation = collation;
  }

  /**
   * Create a {@link Comparator} instance from a plain JSON object.
   *
   * @param {Object} json
   * @param {string} json.property
   * @param {boolean} [json.isAscending]
   * @param {string|null} [json.collation]
   * @returns {Comparator}
   */
  static fromJson(json) {
    return new Comparator({
      property: json.property,
      isAscending: json.isAscending ?? true,
      collation: json.collation ?? null,
    });
  }

  /**
   * Convert this {@link Comparator} to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const obj = {
      property: this.property,
      isAscending: this.isAscending,
    };
    if (this.collation !== null && this.collation !== undefined) {
      obj.collation = this.collation;
    }
    return obj;
  }
}

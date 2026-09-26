/**
 * @typedef {string} Id
 * String of 1 to 255 characters from the base64url alphabet ([A-Za-z0-9_-]).
 * Case‑sensitive. Never re‑used for a different object once assigned.
 *
 * @typedef {number} Int
 * Signed integer, JSON number, no fractional part.
 *
 * @typedef {number} UnsignedInt
 * Non‑negative integer, JSON number, no fractional part.
 *
 * @typedef {string} Date
 * Date‑time string per RFC 3339, e.g. `2026-08-18T10:00:00Z`.
 *
 * @typedef {string} UTCDate
 * Date‑time string per RFC 3339 with a zero UTC offset, e.g. `2026-08-18T10:00:00Z`.
 *
 * @typedef {Object.<string, *>} PatchObject
 * A JSON object where each key is a JSON Pointer (RFC 6901) relative to the object
 * being patched, and each value is either the new value to set at that path or
 * `null` to remove the path. Not exported as a runtime symbol.
 */

/**
 * Base class for all JMAP‑related errors.
 */
export class JmapError extends Error {
  /**
   * @param {string} [message]
   * @param {ErrorOptions} [options]
   */
  constructor(message, options) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

/**
 * Represents a protocol‑level error returned by the JMAP server.
 *
 * @extends JmapError
 */
export class JmapProtocolError extends JmapError {
  /**
   * @param {string} type - Machine‑readable error identifier (e.g. `unknownMethod`).
   * @param {string|null} [description] - Human‑readable description, if any.
   */
  constructor(type, description = null) {
    super(`${type}: ${description ?? ''}`.trim());
    /** @type {string} */
    this.type = type;
    /** @type {string|null} */
    this.description = description;
  }
}

/**
 * Represents a network‑level failure (e.g. fetch rejected, non‑2xx response).
 *
 * @extends JmapError
 */
export class JmapNetworkError extends JmapError {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause = null) {
    super(message, cause ? { cause } : undefined);
    /** @type {Error|null} */
    this.cause = cause ?? null;
  }
}

/**
 * Standard error shape returned per‑id in `notCreated`, `notUpdated`, `notDestroyed`.
 */
export class SetError {
  /**
   * @param {string} type - e.g. `invalidProperties`, `notFound`, `forbidden`, `tooLarge`.
   * @param {string|null} [description]
   * @param {Array<string>|null} [properties] - Which properties of the create/update failed, if applicable.
   */
  constructor(type, description = null, properties = null) {
    /** @type {string} */
    this.type = type;
    /** @type {string|null} */
    this.description = description;
    /** @type {Array<string>|null} */
    this.properties = properties;
  }

  /**
   * Create a {@link SetError} from a plain JSON object.
   * @param {Object} data
   * @returns {SetError}
   */
  static fromJson(data) {
    return new SetError(
      /** @type {string} */ (data.type),
      data.description ?? null,
      data.properties ?? null
    );
  }

  /**
   * Convert this instance to a plain JSON object suitable for transmission.
   * @returns {Object}
   */
  toJson() {
    const obj = { type: this.type };
    if (this.description != null) obj.description = this.description;
    if (this.properties != null) obj.properties = this.properties;
    return obj;
  }
}

/**
 * Standard top‑level method‑call error, returned as an `'error'` method response.
 */
export class MethodError {
  /**
   * @param {string} type - e.g. `unknownMethod`, `invalidArguments`, `accountNotFound`, `serverFail`.
   * @param {string|null} [description]
   */
  constructor(type, description = null) {
    /** @type {string} */
    this.type = type;
    /** @type {string|null} */
    this.description = description;
  }

  /**
   * Create a {@link MethodError} from a plain JSON object.
   * @param {Object} data
   * @returns {MethodError}
   */
  static fromJson(data) {
    return new MethodError(
      /** @type {string} */ (data.type),
      data.description ?? null
    );
  }

  /**
   * Convert this instance to a plain JSON object.
   * @returns {Object}
   */
  toJson() {
    const obj = { type: this.type };
    if (this.description != null) obj.description = this.description;
    return obj;
  }
}

/**
 * A back‑reference used inside a request argument to point at a value produced by an earlier method call.
 */
export class ResultReference {
  /**
   * @param {string} resultOf - Identifier of the earlier method call.
   * @param {string} name - Name of the result property to reference.
   * @param {string} path - JSON Pointer into the referenced result.
   */
  constructor(resultOf, name, path) {
    /** @type {string} */
    this.resultOf = resultOf;
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.path = path;
  }

  /**
   * Create a {@link ResultReference} from a plain JSON object.
   * @param {Object} data
   * @returns {ResultReference}
   */
  static fromJson(data) {
    return new ResultReference(
      /** @type {string} */ (data.resultOf),
      /** @type {string} */ (data.name),
      /** @type {string} */ (data.path)
    );
  }

  /**
   * Convert this instance to a plain JSON object.
   * @returns {Object}
   */
  toJson() {
    return {
      resultOf: this.resultOf,
      name: this.name,
      path: this.path,
    };
  }
}

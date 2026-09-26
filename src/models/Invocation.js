/**
 * Represents a single JMAP method invocation tuple.
 *
 * @class Invocation
 * @property {string} name - The JMAP method name (e.g., "Email/get").
 * @property {Object.<string, any>} arguments - The method arguments as a map from argument name to value.
 * @property {string} methodCallId - Client‑chosen identifier echoed back in the response.
 */
export class Invocation {
  /**
   * @param {string} name
   * @param {Object.<string, any>} args - The method arguments.
   * @param {string} methodCallId
   */
  constructor(name, args, methodCallId) {
    this.name = name;
    this.arguments = args;
    this.methodCallId = methodCallId;
  }

  /**
   * Creates an {@link Invocation} instance from its wire-format 3-element JSON array
   * `[name, arguments, methodCallId]` (RFC 8620 section 3.2) - never an object.
   *
   * @param {[string, Object.<string, any>, string]} data - The JSON array representation.
   * @returns {Invocation}
   */
  static fromJson(data) {
    if (!Array.isArray(data) || data.length !== 3) {
      throw new Error("Invocation JSON must be a 3-element array [name, arguments, methodCallId]");
    }
    const [name, args, methodCallId] = data;
    return new Invocation(name, args, methodCallId);
  }

  /**
   * Serialises this instance to its wire-format 3-element JSON array
   * `[name, arguments, methodCallId]` (RFC 8620 section 3.2).
   *
   * @returns {[string, Object.<string, any>, string]}
   */
  toJson() {
    return [this.name, this.arguments, this.methodCallId];
  }
}

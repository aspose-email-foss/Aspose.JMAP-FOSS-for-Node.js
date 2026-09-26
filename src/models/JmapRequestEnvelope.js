import { Invocation } from "./Invocation.js";

/**
 * @typedef {Object.<string, string>} CreatedIdsMap
 */

/**
 * Represents the JMAP request envelope posted to the session API URL.
 *
 * @property {string[]} using - Capability URNs this request depends on; must include
 *   `"urn:ietf:params:jmap:core"`.
 * @property {Invocation[]} methodCalls - Ordered list of JMAP method invocations.
 * @property {CreatedIdsMap|null} createdIds - Optional map of client‑generated IDs to
 *   server‑assigned IDs, or `null` if not used.
 */
export class JmapRequestEnvelope {
  /**
   * @param {string[]} using
   * @param {Invocation[]} methodCalls
   * @param {CreatedIdsMap|null} [createdIds=null]
   */
  constructor(using, methodCalls, createdIds = null) {
    /** @type {string[]} */
    this.using = using;
    /** @type {Invocation[]} */
    this.methodCalls = methodCalls;
    /** @type {CreatedIdsMap|null} */
    this.createdIds = createdIds;
  }

  /**
   * Creates a {@link JmapRequestEnvelope} instance from a plain JSON object.
   *
   * @param {Object} data - Parsed JSON object.
   * @param {string[]} data.using
   * @param {Array} data.methodCalls
   * @param {Object<string,string>|null} [data.createdIds]
   * @returns {JmapRequestEnvelope}
   */
  static fromJson(data) {
    const { using, methodCalls, createdIds = null } = data;
    const invocations = methodCalls.map((call) => Invocation.fromJson(call));
    return new JmapRequestEnvelope(using, invocations, createdIds);
  }

  /**
   * Serialises this envelope to a plain JSON object suitable for `fetch` transmission.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {
      using: this.using,
      methodCalls: this.methodCalls.map((inv) => inv.toJson()),
    };
    if (this.createdIds !== null && this.createdIds !== undefined) {
      json.createdIds = this.createdIds;
    }
    return json;
  }
}

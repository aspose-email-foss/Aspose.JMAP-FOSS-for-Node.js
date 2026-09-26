import { Invocation } from "./Invocation.js";

/**
 * The JSON body returned from apiUrl. Deliberately NOT named bare "Response" for the same reason
 * JmapRequestEnvelope isn't named "Request" - see that object's description.
 *
 * @class JmapResponseEnvelope
 */
export class JmapResponseEnvelope {
  /**
   * @param {Invocation[]} methodResponses - Required. Array of method invocation results.
   * @param {Object.<string, string>|null} [createdIds=null] - Optional map of client‑supplied creation IDs to server‑assigned IDs.
   * @param {string} sessionState - Required. The current session state string.
   */
  constructor(methodResponses, createdIds = null, sessionState) {
    /** @type {Invocation[]} */
    this.methodResponses = methodResponses;
    /** @type {Object.<string, string>|null} */
    this.createdIds = createdIds;
    /** @type {string} */
    this.sessionState = sessionState;
  }

  /**
   * Creates a {@link JmapResponseEnvelope} instance from a plain JSON object.
   *
   * @param {Object} data - The raw JSON object received from the JMAP server.
   * @returns {JmapResponseEnvelope}
   */
  static fromJson(data) {
    if (typeof data !== "object" || data === null) {
      throw new TypeError("JmapResponseEnvelope.fromJson expects a non‑null object");
    }

    const methodResponses = Array.isArray(data.methodResponses)
      ? data.methodResponses.map((inv) => Invocation.fromJson(inv))
      : [];

    const createdIds = data.createdIds !== undefined ? data.createdIds : null;
    const sessionState = data.sessionState;

    return new JmapResponseEnvelope(methodResponses, createdIds, sessionState);
  }

  /**
   * Serialises this {@link JmapResponseEnvelope} instance to a plain JSON object suitable for
   * transmission or inspection.
   *
   * @returns {Object}
   */
  toJson() {
    const json = {
      methodResponses: this.methodResponses.map((inv) => inv.toJson()),
      sessionState: this.sessionState,
    };

    // Preserve `createdIds` even when it is explicitly null, but omit if undefined.
    if (this.createdIds !== undefined) {
      json.createdIds = this.createdIds;
    }

    return json;
  }
}

/**
 * Mixin providing Submission‑related JMAP methods.
 *
 * @module SubmissionClientMixin
 */

import { Invocation } from "./models/Invocation.js";
import { EmailSubmission } from "./models/EmailSubmission.js";
import { Comparator } from "./models/Comparator.js";
import { JmapError } from "./models/CommonTypes.js";

/**
 * @typedef {Object} SubmissionQueryOptions
 * @property {Object|null} [filter] - Filter object as defined by the JMAP spec.
 * @property {Comparator[]|null} [sort] - Array of {@link Comparator} objects.
 * @property {number} [position] - Zero‑based start position (default 0).
 * @property {number|null} [limit] - Maximum number of ids to return.
 * @property {boolean} [calculateTotal] - Whether to request a total count.
 */

/**
 * @type {Object}
 */
export const SubmissionClientMixin = {
  /**
   * Sends an email by creating an {@link EmailSubmission}.
   *
   * @param {string} accountId - The account identifier.
   * @param {EmailSubmission} emailSubmission - The email submission to send.
   * @returns {Promise<EmailSubmission|null>} The created {@link EmailSubmission} or `null` if not created.
   * @throws {JmapError} When the response cannot be parsed.
   */
  async send(accountId, emailSubmission) {
    if (!(emailSubmission instanceof EmailSubmission)) {
      throw new JmapError("emailSubmission must be an instance of EmailSubmission");
    }
    const creationId = `c${Math.random().toString(36).substring(2, 10)}`;
    const args = {
      accountId,
      create: {
        [creationId]: emailSubmission.toJson(),
      },
    };
    const callId = `c${this._callIdCounter++}`;
    const inv = new Invocation("EmailSubmission/set", args, callId);
    const resp = await this.sendRequest([inv], ["urn:ietf:params:jmap:submission"]);
    const result = resp.methodResponses.find(
      (r) => r[0] === "EmailSubmission/set" && r[2] === callId
    );
    if (!result) {
      throw new JmapError("Missing response for send");
    }
    const data = result[1];
    const created = data.created?.[creationId];
    // Per RFC 8620 section 5.3, a "created" entry is PARTIAL: the server only includes
    // fields it assigned/defaulted (id, sendAt, undoStatus, ...), not the full object -
    // merge it onto the client-submitted object (server fields win) before parsing.
    return created ? EmailSubmission.fromJson({ ...emailSubmission.toJson(), ...created }) : null;
  },

  /**
   * Cancels a previously sent {@link EmailSubmission}.
   *
   * @param {string} accountId - The account identifier.
   * @param {string} submissionId - The identifier of the EmailSubmission to cancel.
   * @returns {Promise<EmailSubmission|null>} The updated {@link EmailSubmission} or `null` if not updated.
   * @throws {JmapError} When the response cannot be parsed.
   */
  async cancelSend(accountId, submissionId) {
    const args = {
      accountId,
      update: {
        // A PatchObject key is a JSON Pointer (RFC 6901) relative to the object being
        // patched - a bare top-level property name has no leading slash; "/undoStatus"
        // would instead point at a property literally named the empty string, which a
        // real JMAP server rejects/ignores.
        [submissionId]: { undoStatus: "canceled" },
      },
    };
    const callId = `c${this._callIdCounter++}`;
    const inv = new Invocation("EmailSubmission/set", args, callId);
    const resp = await this.sendRequest([inv], ["urn:ietf:params:jmap:submission"]);
    const result = resp.methodResponses.find(
      (r) => r[0] === "EmailSubmission/set" && r[2] === callId
    );
    if (!result) {
      throw new JmapError("Missing response for cancelSend");
    }
    const data = result[1];
    const updated = data.updated?.[submissionId];
    return updated ? EmailSubmission.fromJson(updated) : null;
  },

  /**
   * Lists EmailSubmission identifiers matching optional query criteria.
   *
   * @param {string} accountId - The account identifier.
   * @param {SubmissionQueryOptions} [options] - Optional query parameters.
   * @returns {Promise<string[]>} Array of EmailSubmission ids.
   * @throws {JmapError} When the response cannot be parsed.
   */
  async listSubmissions(accountId, options = {}) {
    const {
      filter = null,
      sort = null,
      position = 0,
      limit = null,
      calculateTotal = false,
    } = options;

    const args = {
      accountId,
      filter,
      sort: sort ? sort.map((c) => c.toJson()) : null,
      position,
      limit,
      calculateTotal,
    };

    // Remove undefined/null entries to keep the request tidy
    Object.keys(args).forEach(
      (k) => (args[k] === undefined || args[k] === null) && delete args[k]
    );

    const callId = `c${this._callIdCounter++}`;
    const inv = new Invocation("EmailSubmission/query", args, callId);
    const resp = await this.sendRequest([inv], ["urn:ietf:params:jmap:submission"]);
    const result = resp.methodResponses.find(
      (r) => r[0] === "EmailSubmission/query" && r[2] === callId
    );
    if (!result) {
      throw new JmapError("Missing response for listSubmissions");
    }
    const data = result[1];
    return Array.isArray(data.ids) ? data.ids : [];
  },
};

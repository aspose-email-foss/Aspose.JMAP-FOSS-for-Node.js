/**
 * Mail module mixin for {@link JmapClient}.
 *
 * @module MailClientMixin
 */

import { Invocation } from "./models/Invocation.js";
import { Comparator } from "./models/Comparator.js";
import { EmailQueryResponse } from "./models/EmailQueryResponse.js";
import { Email } from "./models/Email.js";
import { Identity } from "./models/Identity.js";
import { Mailbox } from "./models/Mailbox.js";
import { SearchSnippet } from "./models/SearchSnippet.js";
import { SetError } from "./models/CommonTypes.js";

/**
 * @typedef {Object.<string, Mailbox>} MailboxCreateMap
 * @typedef {Object.<string, Object.<string, any>>} PatchMap
 * @typedef {Object.<string, Email>} EmailCreateMap
 * @typedef {Object.<string, Identity>} IdentityCreateMap
 */

/**
 * Mixin providing mail‑related JMAP methods.
 *
 * All methods assume the client instance already has a connected session.
 */
export const MailClientMixin = {
  /**
   * List mailboxes (Mailbox/get).
   *
   * @param {string} accountId
   * @param {string[]|null} [ids=null]
   * @param {string[]|null} [properties=null]
   * @returns {Promise<Mailbox[]>}
   */
  async listMailboxes(accountId, ids = null, properties = null) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId };
    if (ids !== null) args.ids = ids;
    if (properties !== null) args.properties = properties;

    const methodCalls = [new Invocation("Mailbox/get", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Mailbox/get" && r[2] === callId
    );
    const data = result ? result[1] : {};
    return data.list ? data.list.map(Mailbox.fromJson) : [];
  },

  /**
   * Get specific mailboxes (Mailbox/get).
   *
   * @param {string} accountId
   * @param {string[]} ids
   * @param {string[]|null} [properties=null]
   * @returns {Promise<Object.<string, Mailbox>>} Map of id → Mailbox.
   */
  async getMailbox(accountId, ids, properties = null) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, ids };
    if (properties !== null) args.properties = properties;

    const methodCalls = [new Invocation("Mailbox/get", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Mailbox/get" && r[2] === callId
    );
    const data = result ? result[1] : {};
    const map = {};
    if (data.list) {
      for (const mb of data.list) {
        const obj = Mailbox.fromJson(mb);
        map[obj.id] = obj;
      }
    }
    return map;
  },

  /**
   * Create mailboxes (Mailbox/set).
   *
   * @param {string} accountId
   * @param {MailboxCreateMap} createMap Map of client‑generated ids → {@link Mailbox} instances.
   * @returns {Promise<Object>} Result containing `created`, `notCreated`, `oldState`, `newState`.
   */
  async createMailbox(accountId, createMap) {
    const callId = `c${this._callIdCounter++}`;
    const createJson = {};
    for (const [cid, mb] of Object.entries(createMap)) {
      createJson[cid] = mb.toJson();
    }
    const args = { accountId, create: createJson };
    const methodCalls = [new Invocation("Mailbox/set", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Mailbox/set" && r[2] === callId
    );
    const data = result ? result[1] : {};

    const created = {};
    if (data.created) {
      for (const [cid, mb] of Object.entries(data.created)) {
        // Per RFC 8620 section 5.3, a "created" entry is PARTIAL: the server only
        // includes fields it assigned/defaulted (typically just the new id), not the
        // full object - merge it onto the client-submitted object (server fields win)
        // before parsing, since Mailbox.fromJson requires the full required-field set.
        const submitted = createMap[cid] ? createMap[cid].toJson() : {};
        created[cid] = Mailbox.fromJson({ ...submitted, ...mb });
      }
    }
    const notCreated = {};
    if (data.notCreated) {
      for (const [cid, err] of Object.entries(data.notCreated)) {
        notCreated[cid] = SetError.fromJson(err);
      }
    }
    return {
      created,
      notCreated,
      oldState: data.oldState ?? null,
      newState: data.newState,
    };
  },

  /**
   * Delete mailboxes (Mailbox/set with `destroy`).
   *
   * @param {string} accountId
   * @param {string[]} destroyIds
   * @returns {Promise<Object>} Result containing `destroyed` and `notDestroyed`.
   */
  async deleteMailbox(accountId, destroyIds) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, destroy: destroyIds };
    const methodCalls = [new Invocation("Mailbox/set", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Mailbox/set" && r[2] === callId
    );
    const data = result ? result[1] : {};

    const notDestroyed = {};
    if (data.notDestroyed) {
      for (const [id, err] of Object.entries(data.notDestroyed)) {
        notDestroyed[id] = SetError.fromJson(err);
      }
    }
    return {
      destroyed: data.destroyed ?? [],
      notDestroyed,
    };
  },

  /**
   * List messages (Email/query).
   *
   * @param {string} accountId
   * @param {Object|null} [filter=null]
   * @param {Comparator[]|null} [sort=null]
   * @param {number} [position=0]
   * @param {number|null} [limit=null]
   * @returns {Promise<EmailQueryResponse>} The full Email/query response.
   */
  async listMessages(accountId, filter = null, sort = null, position = 0, limit = null) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, position };
    if (filter !== null) args.filter = filter;
    if (sort !== null) args.sort = sort.map((c) => c.toJson());
    if (limit !== null) args.limit = limit;

    const methodCalls = [new Invocation("Email/query", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Email/query" && r[2] === callId
    );
    const data = result ? result[1] : {};
    return EmailQueryResponse.fromJson(data);
  },

  /**
   * Fetch messages (Email/get).
   *
   * @param {string} accountId
   * @param {string[]} ids
   * @param {string[]|null} [properties=null]
   * @param {string[]|null} [bodyProperties=null]
   * @param {boolean} [fetchTextBody=false]
   * @param {boolean} [fetchHTMLBody=false]
   * @param {boolean} [fetchAllBodyValues=false]
   * @param {number|null} [maxBodyValueBytes=null]
   * @returns {Promise<Email[]>}
   */
  async fetchMessage(
    accountId,
    ids,
    properties = null,
    bodyProperties = null,
    fetchTextBody = false,
    fetchHTMLBody = false,
    fetchAllBodyValues = false,
    maxBodyValueBytes = null
  ) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, ids };
    if (properties !== null) args.properties = properties;
    if (bodyProperties !== null) args.bodyProperties = bodyProperties;
    if (fetchTextBody) args.fetchTextBodyValues = true;
    if (fetchHTMLBody) args.fetchHTMLBodyValues = true;
    if (fetchAllBodyValues) args.fetchAllBodyValues = true;
    if (maxBodyValueBytes !== null) args.maxBodyValueBytes = maxBodyValueBytes;

    const methodCalls = [new Invocation("Email/get", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Email/get" && r[2] === callId
    );
    const data = result ? result[1] : {};
    return data.list ? data.list.map(Email.fromJson) : [];
  },

  /**
   * Move messages (Email/set – update `mailboxIds`).
   *
   * @param {string} accountId
   * @param {PatchMap} updateMap Map of emailId → patch object (e.g. { mailboxIds: { "mb2": true } }).
   * @returns {Promise<Object>} Result containing `updated`, `notUpdated`, `oldState`, `newState`.
   */
  async moveMessage(accountId, updateMap) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, update: updateMap };
    const methodCalls = [new Invocation("Email/set", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Email/set" && r[2] === callId
    );
    const data = result ? result[1] : {};

    const updated = {};
    if (data.updated) {
      for (const [id, mail] of Object.entries(data.updated)) {
        updated[id] = mail ? Email.fromJson(mail) : null;
      }
    }
    const notUpdated = {};
    if (data.notUpdated) {
      for (const [id, err] of Object.entries(data.notUpdated)) {
        notUpdated[id] = SetError.fromJson(err);
      }
    }
    return {
      updated,
      notUpdated,
      oldState: data.oldState ?? null,
      newState: data.newState,
    };
  },

  /**
   * Set message keywords (Email/set – update `keywords`).
   *
   * @param {string} accountId
   * @param {PatchMap} updateMap Map of emailId → patch object (e.g. { keywords: { "$seen": true } }).
   * @returns {Promise<Object>} Same shape as {@link moveMessage}.
   */
  async setMessageKeyword(accountId, updateMap) {
    // Keyword updates are performed via the same endpoint as moveMessage.
    return this.moveMessage(accountId, updateMap);
  },

  /**
   * Delete messages (Email/set with `destroy`).
   *
   * @param {string} accountId
   * @param {string[]} destroyIds
   * @returns {Promise<Object>} Result containing `destroyed` and `notDestroyed`.
   */
  async deleteMessage(accountId, destroyIds) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId, destroy: destroyIds };
    const methodCalls = [new Invocation("Email/set", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Email/set" && r[2] === callId
    );
    const data = result ? result[1] : {};

    const notDestroyed = {};
    if (data.notDestroyed) {
      for (const [id, err] of Object.entries(data.notDestroyed)) {
        notDestroyed[id] = SetError.fromJson(err);
      }
    }
    return {
      destroyed: data.destroyed ?? [],
      notDestroyed,
    };
  },

  /**
   * List identities (Identity/get).
   *
   * @param {string} accountId
   * @param {string[]|null} [ids=null]
   * @param {string[]|null} [properties=null]
   * @returns {Promise<Identity[]>}
   */
  async listIdentities(accountId, ids = null, properties = null) {
    const callId = `c${this._callIdCounter++}`;
    const args = { accountId };
    if (ids !== null) args.ids = ids;
    if (properties !== null) args.properties = properties;

    const methodCalls = [new Invocation("Identity/get", args, callId)];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:mail"]);

    const result = resp.methodResponses.find(
      (r) => r[0] === "Identity/get" && r[2] === callId
    );
    const data = result ? result[1] : {};
    return data.list ? data.list.map(Identity.fromJson) : [];
  },
};

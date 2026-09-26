/**
 * Represents a named set of Emails (a JMAP mailbox).
 *
 * @class Mailbox
 */
export class Mailbox {
  /**
   * @param {object} params
   * @param {string} [params.id] - Server-assigned identifier.
   * @param {string} params.name - Human‑readable name (required).
   * @param {string|null} [params.parentId] - Identifier of the parent mailbox, if any.
   * @param {string|null} [params.role] - Standard role (e.g. "inbox", "sent", …) or null.
   * @param {number} [params.sortOrder=0] - Ordering hint for UI.
   * @param {number} [params.totalEmails] - Server‑assigned total email count.
   * @param {number} [params.unreadEmails] - Server‑assigned unread email count.
   * @param {number} [params.totalThreads] - Server‑assigned total thread count.
   * @param {number} [params.unreadThreads] - Server‑assigned unread thread count.
   * @param {MailboxRights} [params.myRights] - Rights granted to the authenticated user.
   * @param {boolean} [params.isSubscribed=false] - Subscription flag.
   */
  constructor({
    id,
    name,
    parentId = null,
    role = null,
    sortOrder = 0,
    totalEmails,
    unreadEmails,
    totalThreads,
    unreadThreads,
    myRights,
    isSubscribed = false,
  } = {}) {
    if (typeof name !== "string") {
      throw new TypeError("Mailbox 'name' must be a string");
    }
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.role = role;
    this.sortOrder = sortOrder;
    this.totalEmails = totalEmails;
    this.unreadEmails = unreadEmails;
    this.totalThreads = totalThreads;
    this.unreadThreads = unreadThreads;
    this.myRights = myRights;
    this.isSubscribed = isSubscribed;
  }

  /**
   * Create a {@link Mailbox} instance from a plain JSON object received from the JMAP server.
   *
   * @param {Object} data - Raw JSON data.
   * @returns {Mailbox}
   */
  static fromJson(data) {
    if (typeof data !== "object" || data === null) {
      throw new TypeError("Mailbox.fromJson expects an object");
    }
    return new Mailbox({
      id: data.id,
      name: data.name,
      parentId: data.parentId ?? null,
      role: data.role ?? null,
      sortOrder: data.sortOrder ?? 0,
      totalEmails: data.totalEmails,
      unreadEmails: data.unreadEmails,
      totalThreads: data.totalThreads,
      unreadThreads: data.unreadThreads,
      myRights: data.myRights ? MailboxRights.fromJson(data.myRights) : undefined,
      isSubscribed: data.isSubscribed ?? false,
    });
  }

  /**
   * Convert this {@link Mailbox} instance to a plain JSON object suitable for JMAP transport.
   *
   * @returns {Object}
   */
  toJson() {
    const obj = {
      name: this.name,
    };
    if (this.id !== undefined) obj.id = this.id;
    if (this.parentId !== undefined) obj.parentId = this.parentId;
    if (this.role !== undefined) obj.role = this.role;
    if (this.sortOrder !== undefined) obj.sortOrder = this.sortOrder;
    if (this.totalEmails !== undefined) obj.totalEmails = this.totalEmails;
    if (this.unreadEmails !== undefined) obj.unreadEmails = this.unreadEmails;
    if (this.totalThreads !== undefined) obj.totalThreads = this.totalThreads;
    if (this.unreadThreads !== undefined) obj.unreadThreads = this.unreadThreads;
    if (this.myRights !== undefined) obj.myRights = this.myRights.toJson();
    if (this.isSubscribed !== undefined) obj.isSubscribed = this.isSubscribed;
    return obj;
  }
}

/**
 * Rights granted on a mailbox to the authenticated user.
 *
 * @class MailboxRights
 */
export class MailboxRights {
  /**
   * @param {object} params
   * @param {boolean} params.mayReadItems
   * @param {boolean} params.mayAddItems
   * @param {boolean} params.mayRemoveItems
   * @param {boolean} params.maySetSeen
   * @param {boolean} params.maySetKeywords
   * @param {boolean} params.mayCreateChild
   * @param {boolean} params.mayRename
   * @param {boolean} params.mayDelete
   * @param {boolean} params.maySubmit
   */
  constructor({
    mayReadItems,
    mayAddItems,
    mayRemoveItems,
    maySetSeen,
    maySetKeywords,
    mayCreateChild,
    mayRename,
    mayDelete,
    maySubmit,
  } = {}) {
    this.mayReadItems = Boolean(mayReadItems);
    this.mayAddItems = Boolean(mayAddItems);
    this.mayRemoveItems = Boolean(mayRemoveItems);
    this.maySetSeen = Boolean(maySetSeen);
    this.maySetKeywords = Boolean(maySetKeywords);
    this.mayCreateChild = Boolean(mayCreateChild);
    this.mayRename = Boolean(mayRename);
    this.mayDelete = Boolean(mayDelete);
    this.maySubmit = Boolean(maySubmit);
  }

  /**
   * Create a {@link MailboxRights} instance from a plain JSON object.
   *
   * @param {Object} data - Raw JSON data.
   * @returns {MailboxRights}
   */
  static fromJson(data) {
    if (typeof data !== "object" || data === null) {
      throw new TypeError("MailboxRights.fromJson expects an object");
    }
    return new MailboxRights({
      mayReadItems: data.mayReadItems,
      mayAddItems: data.mayAddItems,
      mayRemoveItems: data.mayRemoveItems,
      maySetSeen: data.maySetSeen,
      maySetKeywords: data.maySetKeywords,
      mayCreateChild: data.mayCreateChild,
      mayRename: data.mayRename,
      mayDelete: data.mayDelete,
      maySubmit: data.maySubmit,
    });
  }

  /**
   * Convert this {@link MailboxRights} instance to a plain JSON object.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      mayReadItems: this.mayReadItems,
      mayAddItems: this.mayAddItems,
      mayRemoveItems: this.mayRemoveItems,
      maySetSeen: this.maySetSeen,
      maySetKeywords: this.maySetKeywords,
      mayCreateChild: this.mayCreateChild,
      mayRename: this.mayRename,
      mayDelete: this.mayDelete,
      maySubmit: this.maySubmit,
    };
  }
}

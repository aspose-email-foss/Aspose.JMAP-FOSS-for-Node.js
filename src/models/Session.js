/**
 * @typedef {Object.<string, Object>} CapabilitiesMap
 * @typedef {Object.<string, Account>} AccountsMap
 * @typedef {Object.<string, string>} PrimaryAccountsMap
 */

/**
 * Represents the JMAP Session resource.
 *
 * @class Session
 */
export class Session {
  /**
   * @type {CapabilitiesMap}
   */
  capabilities;

  /**
   * @type {AccountsMap}
   */
  accounts;

  /**
   * @type {PrimaryAccountsMap}
   */
  primaryAccounts;

  /**
   * @type {string}
   */
  username;

  /**
   * @type {string}
   */
  apiUrl;

  /**
   * @type {string}
   */
  downloadUrl;

  /**
   * @type {string}
   */
  uploadUrl;

  /**
   * @type {string}
   */
  eventSourceUrl;

  /**
   * @type {string}
   */
  state;

  /**
   * Creates a new {@link Session} instance.
   */
  constructor() {
    this.capabilities = {};
    this.accounts = {};
    this.primaryAccounts = {};
    this.username = '';
    this.apiUrl = '';
    this.downloadUrl = '';
    this.uploadUrl = '';
    this.eventSourceUrl = '';
    this.state = '';
  }

  /**
   * Creates a {@link Session} from a plain JSON object.
   *
   * @param {Object} data The raw JSON data.
   * @returns {Session}
   */
  static fromJson(data) {
    const sess = new Session();

    sess.capabilities = {};
    if (data.capabilities) {
      for (const [k, v] of Object.entries(data.capabilities)) {
        // Convert the core capability to a typed instance when possible.
        if (k === 'urn:ietf:params:jmap:core' && v && typeof v === 'object') {
          sess.capabilities[k] = CoreCapability.fromJson(v);
        } else {
          sess.capabilities[k] = v;
        }
      }
    }

    sess.accounts = {};
    if (data.accounts) {
      for (const [k, v] of Object.entries(data.accounts)) {
        sess.accounts[k] = Account.fromJson(v);
      }
    }

    sess.primaryAccounts = data.primaryAccounts ? { ...data.primaryAccounts } : {};
    sess.username = data.username ?? '';
    sess.apiUrl = data.apiUrl ?? '';
    sess.downloadUrl = data.downloadUrl ?? '';
    sess.uploadUrl = data.uploadUrl ?? '';
    sess.eventSourceUrl = data.eventSourceUrl ?? '';
    sess.state = data.state ?? '';

    return sess;
  }

  /**
   * Serialises this {@link Session} to a plain JSON object.
   *
   * @returns {Object}
   */
  toJson() {
    const caps = {};
    for (const [k, v] of Object.entries(this.capabilities || {})) {
      caps[k] = v && typeof v.toJson === 'function' ? v.toJson() : v;
    }

    const accs = {};
    for (const [k, v] of Object.entries(this.accounts || {})) {
      accs[k] = v.toJson();
    }

    return {
      capabilities: caps,
      accounts: accs,
      primaryAccounts: { ...this.primaryAccounts },
      username: this.username,
      apiUrl: this.apiUrl,
      downloadUrl: this.downloadUrl,
      uploadUrl: this.uploadUrl,
      eventSourceUrl: this.eventSourceUrl,
      state: this.state,
    };
  }
}

/**
 * Represents an account entry inside a JMAP Session.
 *
 * @class Account
 */
export class Account {
  /**
   * @type {string|undefined}
   */
  name;

  /**
   * @type {boolean|undefined}
   */
  isPersonal;

  /**
   * @type {boolean|undefined}
   */
  isReadOnly;

  /**
   * @type {Object.<string, Object>}
   */
  accountCapabilities;

  /**
   * Creates a new {@link Account} instance.
   */
  constructor() {
    this.accountCapabilities = {};
  }

  /**
   * Creates an {@link Account} from a plain JSON object.
   *
   * @param {Object} data The raw JSON data.
   * @returns {Account}
   */
  static fromJson(data) {
    const acc = new Account();
    acc.name = data.name;
    acc.isPersonal = data.isPersonal;
    acc.isReadOnly = data.isReadOnly;
    acc.accountCapabilities = data.accountCapabilities ? { ...data.accountCapabilities } : {};
    return acc;
  }

  /**
   * Serialises this {@link Account} to a plain JSON object.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      name: this.name,
      isPersonal: this.isPersonal,
      isReadOnly: this.isReadOnly,
      accountCapabilities: { ...this.accountCapabilities },
    };
  }
}

/**
 * Represents the Core capability object inside a JMAP Session.
 *
 * @class CoreCapability
 */
export class CoreCapability {
  /**
   * @type {number|undefined}
   */
  maxSizeUpload;

  /**
   * @type {number|undefined}
   */
  maxConcurrentUpload;

  /**
   * @type {number|undefined}
   */
  maxSizeRequest;

  /**
   * @type {number|undefined}
   */
  maxConcurrentRequests;

  /**
   * @type {number|undefined}
   */
  maxCallsInRequest;

  /**
   * @type {number|undefined}
   */
  maxObjectsInGet;

  /**
   * @type {number|undefined}
   */
  maxObjectsInSet;

  /**
   * @type {string[]|undefined}
   */
  collationAlgorithms;

  /**
   * Creates a new {@link CoreCapability} instance.
   */
  constructor() {}

  /**
   * Creates a {@link CoreCapability} from a plain JSON object.
   *
   * @param {Object} data The raw JSON data.
   * @returns {CoreCapability}
   */
  static fromJson(data) {
    const cap = new CoreCapability();
    cap.maxSizeUpload = data.maxSizeUpload;
    cap.maxConcurrentUpload = data.maxConcurrentUpload;
    cap.maxSizeRequest = data.maxSizeRequest;
    cap.maxConcurrentRequests = data.maxConcurrentRequests;
    cap.maxCallsInRequest = data.maxCallsInRequest;
    cap.maxObjectsInGet = data.maxObjectsInGet;
    cap.maxObjectsInSet = data.maxObjectsInSet;
    cap.collationAlgorithms = data.collationAlgorithms ? [...data.collationAlgorithms] : undefined;
    return cap;
  }

  /**
   * Serialises this {@link CoreCapability} to a plain JSON object.
   *
   * @returns {Object}
   */
  toJson() {
    return {
      maxSizeUpload: this.maxSizeUpload,
      maxConcurrentUpload: this.maxConcurrentUpload,
      maxSizeRequest: this.maxSizeRequest,
      maxConcurrentRequests: this.maxConcurrentRequests,
      maxCallsInRequest: this.maxCallsInRequest,
      maxObjectsInGet: this.maxObjectsInGet,
      maxObjectsInSet: this.maxObjectsInSet,
      collationAlgorithms: this.collationAlgorithms ? [...this.collationAlgorithms] : undefined,
    };
  }
}

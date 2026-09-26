/**
 * @typedef {Object} JmapClientOptions
 * @property {string} sessionUrl - URL to the JMAP session resource (e.g. "https://example/.well-known/jmap").
 * @property {string} username - Account username for HTTP Basic authentication.
 * @property {string} password - Account password for HTTP Basic authentication.
 * @property {string} [bearerToken] - Optional OAuth 2.0 bearer token (RFC 6750). When set,
 *   it is used instead of HTTP Basic authentication for all requests.
 * @property {function} [fetchImpl] - Optional fetch implementation matching the global fetch signature.
 */

import { Invocation } from "./models/Invocation.js";
import { JmapError, JmapNetworkError, JmapProtocolError } from "./models/CommonTypes.js";
import { JmapRequestEnvelope } from "./models/JmapRequestEnvelope.js";
import { JmapResponseEnvelope } from "./models/JmapResponseEnvelope.js";

/**
 * Core JMAP client handling session negotiation, request sending and the Core/echo,
 * uploadBlob and downloadBlob endpoints.
 *
 * @class JmapClient
 */
export class JmapClient {
  /**
   * @param {JmapClientOptions} options
   */
  constructor(options) {
    if (!options || typeof options !== "object") {
      throw new JmapError("Options object is required");
    }
    const { sessionUrl, username, password, bearerToken, fetchImpl } = options;
    if (!sessionUrl) throw new JmapError("sessionUrl is required");
    if (!bearerToken) {
      if (!username) throw new JmapError("username is required");
      if (!password) throw new JmapError("password is required");
    }

    this._sessionUrl = sessionUrl;
    this._username = username;
    this._password = password;
    this._bearerToken = bearerToken ?? null;
    this._fetchImpl = fetchImpl ?? globalThis.fetch.bind(globalThis);
    this._session = null;
    this._callIdCounter = 1;
  }

  /**
   * Builds the value of the Authorization header for outgoing requests.
   *
   * Uses OAuth 2.0 Bearer authentication (RFC 6750) when a bearer token was supplied at
   * construction time; otherwise falls back to HTTP Basic authentication built from the
   * configured username/password.
   *
   * @private
   * @returns {string} Authorization header value.
   */
  _authHeader() {
    if (this._bearerToken) {
      return `Bearer ${this._bearerToken}`;
    }
    return `Basic ${Buffer.from(`${this._username}:${this._password}`).toString("base64")}`;
  }

  /**
   * Sends a request, following redirects manually. Every original header - including
   * Authorization - is re-sent on a SAME-ORIGIN redirect; on a CROSS-ORIGIN redirect the
   * credential headers (Authorization / Cookie / Proxy-Authorization) are dropped before
   * the next hop, so a hostile redirect cannot leak them to another host.
   *
   * Deliberately NOT the default fetch redirect behavior: the WHATWG fetch spec strips the
   * Authorization header on cross-origin AND on some same-origin-but-different-port/scheme
   * redirects, and real JMAP servers (e.g. Stalwart) commonly 307-redirect the well-known
   * discovery URL to the actual session endpoint - so an auto-followed redirect would
   * silently return an unauthenticated/empty session instead of failing loudly.
   *
   * @private
   * @param {string} url
   * @param {Object} init - fetch() init options (method, headers, body).
   * @returns {Promise<Response>}
   */
  async _fetchWithRedirects(url, init) {
    const maxRedirects = 5;
    const originOf = (u) => new URL(u).origin;
    const startOrigin = originOf(url);
    const isCredentialHeader = (name) => /^(authorization|cookie|proxy-authorization)$/i.test(name);
    let currentUrl = url;
    let headers = { ...(init.headers || {}) };
    for (let attempt = 0; attempt <= maxRedirects; attempt++) {
      const response = await this._fetchImpl(currentUrl, { ...init, headers, redirect: "manual" });
      const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
      if (!isRedirect) {
        return response;
      }
      const location = response.headers && response.headers.get && response.headers.get("Location");
      if (!location) {
        return response;
      }
      const nextUrl = new URL(location, currentUrl).toString();
      if (originOf(nextUrl) !== startOrigin) {
        headers = Object.fromEntries(
          Object.entries(headers).filter(([name]) => !isCredentialHeader(name)),
        );
      }
      currentUrl = nextUrl;
    }
    throw new JmapNetworkError(`Exceeded ${maxRedirects} redirects`);
  }

  /**
   * Retrieves the JMAP session object and stores it for later calls.
   *
   * @returns {Promise<Object>} Plain session object as received from the server.
   */
  async connect() {
    const headers = {
      Authorization: this._authHeader(),
      Accept: "application/json",
    };
    let response;
    try {
      response = await this._fetchWithRedirects(this._sessionUrl, { method: "GET", headers });
    } catch (e) {
      throw new JmapNetworkError(`Failed to fetch session: ${e.message}`);
    }
    if (!response.ok) {
      throw new JmapNetworkError(`Session request failed with status ${response.status}`);
    }
    const data = await response.json();
    // Resolve possibly-relative URLs (RFC 8620 permits them; real servers, e.g. Stalwart,
    // commonly send relative apiUrl/uploadUrl/downloadUrl/eventSourceUrl) against the
    // session URL's origin before storing. Done via plain string logic, not `new URL(...)`,
    // because URL's resolution percent-encodes the literal "{"/"}" characters in these
    // URI-template placeholders (e.g. "/upload/{accountId}"), corrupting them.
    const resolveUrl = (maybeRelative) => {
      if (!maybeRelative) return maybeRelative;
      if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
      const origin = new URL(this._sessionUrl).origin;
      return maybeRelative.startsWith("/") ? `${origin}${maybeRelative}` : `${origin}/${maybeRelative}`;
    };
    data.apiUrl = resolveUrl(data.apiUrl);
    data.uploadUrl = resolveUrl(data.uploadUrl);
    data.downloadUrl = resolveUrl(data.downloadUrl);
    data.eventSourceUrl = resolveUrl(data.eventSourceUrl);
    // Store session data; tests expect a plain object with only the fields present in the stub.
    this._session = data;
    return this._session;
  }

  /**
   * Releases stored session information.
   *
   * @returns {Promise<void>}
   */
  async close() {
    this._session = null;
  }

  /**
   * Sends a JMAP request envelope, optionally batching multiple method calls into a single
   * HTTP round trip (RFC 8620 section 3.7). To chain a later call to an earlier one's
   * result without a second request, pass a `ResultReference` under a key prefixed with
   * `#` in the later call's arguments (e.g. `{"#ids": new ResultReference("c1",
   * "Email/query", "/ids").toJson()}`) instead of the normal `ids` value.
   *
   * @param {Array<{name:string, arguments:Object, methodCallId:string}>} methodCalls
   * @param {Array<string>} using - Capability URNs required for this request.
   * @returns {Promise<Object>} Parsed response envelope.
   * @throws {JmapProtocolError} When a method response entry is an error.
   * @throws {JmapNetworkError} When the HTTP request fails.
   */
  async sendRequest(methodCalls, using) {
    if (!this._session) {
      throw new JmapError("Client not connected; call connect() first");
    }

    const envelope = {
      using,
      methodCalls: methodCalls.map((c) => [c.name, c.arguments, c.methodCallId]),
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: this._authHeader(),
      Accept: "application/json",
    };

    let response;
    try {
      response = await this._fetchWithRedirects(this._session.apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(envelope),
      });
    } catch (e) {
      throw new JmapNetworkError(`Request failed: ${e.message}`);
    }

    if (!response.ok) {
      throw new JmapNetworkError(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    // Detect protocol errors in methodResponses
    if (Array.isArray(json.methodResponses)) {
      for (const resp of json.methodResponses) {
        const [name, args] = resp;
        if (name === "error") {
          const { type, description } = args;
          throw new JmapProtocolError(type, description);
        }
      }
    }

    return json;
  }

  /**
   * Calls the Core/echo method.
   *
   * @param {Object} args - Arbitrary arguments object to be echoed back.
   * @returns {Promise<Object>} The echoed arguments.
   */
  async echo(args) {
    const callId = `c${this._callIdCounter++}`;
    const methodCalls = [
      {
        name: "Core/echo",
        arguments: args,
        methodCallId: callId,
      },
    ];
    const resp = await this.sendRequest(methodCalls, ["urn:ietf:params:jmap:core"]);
    const result = resp.methodResponses.find((r) => r[0] === "Core/echo");
    return result ? result[1] : null;
  }

  /**
   * Uploads a binary blob to the server.
   *
   * @param {string} accountId
   * @param {Uint8Array|Buffer|string} content - Raw bytes or string to upload.
   * @param {string} contentType - MIME type of the content.
   * @returns {Promise<Object>} The upload response containing accountId, blobId, type, size.
   */
  async uploadBlob(accountId, content, contentType) {
    if (!this._session) {
      throw new JmapError("Client not connected; call connect() first");
    }
    const url = this._session.uploadUrl.replace(
      "{accountId}",
      encodeURIComponent(accountId)
    );
    const headers = {
      "Content-Type": contentType,
      Authorization: this._authHeader(),
    };
    let response;
    try {
      response = await this._fetchWithRedirects(url, {
        method: "POST",
        headers,
        body: content,
      });
    } catch (e) {
      throw new JmapNetworkError(`Upload failed: ${e.message}`);
    }
    if (!response.ok) {
      throw new JmapNetworkError(`Upload HTTP ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Downloads a previously uploaded blob.
   *
   * @param {string} accountId
   * @param {string} blobId
   * @param {string} type - MIME type of the blob.
   * @param {string} [name] - Optional filename hint.
   * @returns {Promise<Uint8Array>} Raw blob bytes.
   */
  async downloadBlob(accountId, blobId, type, name) {
    if (!this._session) {
      throw new JmapError("Client not connected; call connect() first");
    }
    let url = this._session.downloadUrl
      .replace("{accountId}", encodeURIComponent(accountId))
      .replace("{blobId}", encodeURIComponent(blobId))
      .replace("{type}", encodeURIComponent(type));
    if (name !== undefined) {
      url = url.replace("{name}", encodeURIComponent(name));
    }
    const headers = {
      Authorization: this._authHeader(),
    };
    let response;
    try {
      response = await this._fetchWithRedirects(url, { method: "GET", headers });
    } catch (e) {
      throw new JmapNetworkError(`Download failed: ${e.message}`);
    }
    if (!response.ok) {
      throw new JmapNetworkError(`Download HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
}

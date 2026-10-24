import type {BrowserResponse} from './response/browser.ts';
import type {HTTPTransport, UserAgentOptions, UserAgentRequestOptions} from './types.ts';
import {FetchTransport} from './transport/http/fetch.ts';
import {AsyncHooks} from '@mojojs/util';

export {UserAgentHeaders} from './headers.ts';
export {BrowserResponse} from './response/browser.ts';
export type {HTTPTransport, UserAgentOptions, UserAgentRequestOptions} from './types.ts';

type UserAgentHook = (ua: BrowserUserAgent, ...args: any[]) => any;

export default class BrowserUserAgent<R extends BrowserResponse = BrowserResponse> {
  /**
   * Base URL to be used to resolve all relative request URLs with.
   */
  baseURL: string | URL | undefined;
  /**
   * User-agent hooks.
   */
  hooks = new AsyncHooks();
  /**
   * Transport backend to perform HTTP requests with.
   */
  httpTransport: HTTPTransport;
  /**
   * Maximum number of redirects to follow, defaults to `20` (only Node.js).
   */
  maxRedirects: number;
  /**
   * Name of user-agent to send with `User-Agent` header.
   */
  name: string | undefined;

  constructor(options: UserAgentOptions = {}) {
    this.baseURL = options.baseURL;
    this.maxRedirects = options.maxRedirects ?? 20;
    this.name = options.name;

    this.httpTransport = new FetchTransport();
  }

  /**
   * Add a hook to extend the user-agent.
   */
  addHook(name: string, fn: UserAgentHook): this {
    this.hooks.addHook(name, fn);
    return this;
  }

  /**
   * Perform `DELETE` request.
   */
  async delete(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'DELETE', ...options});
  }

  /**
   * Perform `GET` request.
   */
  async get(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'GET', ...options});
  }

  /**
   * Perform `HEAD` request.
   */
  async head(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'HEAD', ...options});
  }

  /**
   * Perform `OPTIONS` request.
   */
  async options(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'OPTIONS', ...options});
  }

  /**
   * Perform `PATCH` request.
   */
  async patch(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'PATCH', ...options});
  }

  /**
   * Perform `POST` request.
   */
  async post(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'POST', ...options});
  }

  /**
   * Perform `PUT` request.
   */
  async put(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<R> {
    return await this.request({url, method: 'PUT', ...options});
  }

  /**
   * Perform HTTP request.
   */
  async request(config: UserAgentRequestOptions): Promise<R> {
    const filtered = this._filterConfig(config);
    await this.hooks.runHook('request', this, filtered);
    let res = await this.httpTransport.request(filtered);
    if (this.maxRedirects > 0) res = await this._handleRedirect(config, filtered.url, res);
    // Subclasses with their own response type wrap the response
    return res as R;
  }

  _filterConfig(options: UserAgentRequestOptions): Record<string, any> {
    // Copy everything that gets modified, so options can be reused for more requests
    const url = new URL(options.url ?? '/', this.baseURL);
    const config = {...options, url, headers: {...options.headers}};

    // Auth (credentials are not allowed in URLs passed to fetch)
    if (url.username !== '' || url.password !== '') {
      config.auth ??= decodeURIComponent(`${url.username}:${url.password}`);
      url.username = url.password = '';
    }

    // Query
    if (config.query !== undefined) {
      const params = url.searchParams;
      for (const [name, value] of Object.entries(config.query)) {
        params.append(name, value);
      }
    }

    // Headers
    if (this.name !== undefined) config.headers['User-Agent'] = this.name;

    // Auth (UTF-8)
    if (config.auth !== undefined) {
      const bytes = new TextEncoder().encode(config.auth);
      config.headers.Authorization = 'Basic ' + btoa(String.fromCharCode(...bytes));
    }

    // Body
    const hasType = Object.keys(config.headers).some(name => name.toLowerCase() === 'content-type');
    if (config.json !== undefined) {
      if (hasType === false) config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.json);
    } else if (config.form !== undefined) {
      if (hasType === false) config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      config.body = new URLSearchParams(config.form).toString();
    }

    return config;
  }

  async _handleRedirect(config: Record<string, any>, base: URL, res: BrowserResponse): Promise<BrowserResponse> {
    const redirected: number = config.redirected ?? 0;
    if (redirected >= this.maxRedirects) return res;

    const location = res.get('Location');
    if (location === null) return res;
    const url = new URL(location, base);

    // Credentials must not leak to other hosts (header names are case-insensitive)
    const remove = ['authorization', 'cookie', 'host', 'referer'];
    const headers: Record<string, string> = {...config.headers};

    // New followup request
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
      for (const name of Object.keys(headers)) {
        const lowerCase = name.toLowerCase();
        if (remove.includes(lowerCase) || lowerCase.startsWith('content-')) delete headers[name];
      }

      const newConfig = {
        headers,
        method: res.statusCode === 303 || config.method === 'POST' ? 'GET' : config.method,
        redirected: redirected + 1,
        signal: config.signal,
        url
      };
      return this.request(newConfig);

      // Same request again
    } else if (res.statusCode === 307 || res.statusCode === 308) {
      for (const name of Object.keys(headers)) {
        if (remove.includes(name.toLowerCase())) delete headers[name];
      }

      const sameConfig = {...config, auth: undefined, headers, query: undefined, redirected: redirected + 1, url};
      return this.request(sameConfig);
    }

    return res;
  }
}

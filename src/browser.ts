import type {BrowserResponse} from './response/browser.js';
import type {HTTPTransport, UserAgentOptions, UserAgentRequestOptions} from './types.js';
import {FetchTransport} from './transport/http/fetch.js';
import {AsyncHooks} from '@mojojs/util';

export {UserAgentHeaders} from './headers.js';
export {BrowserResponse} from './response/browser.js';

type UserAgentHook = (ua: BrowserUserAgent, ...args: any[]) => any;

export default class BrowserUserAgent {
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
   * Maximum number of redirects to follow, default to `0`.
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
  async delete(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'DELETE', ...options});
  }

  /**
   * Perform `GET` request.
   */
  async get(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'GET', ...options});
  }

  /**
   * Perform `HEAD` request.
   */
  async head(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'HEAD', ...options});
  }

  /**
   * Perform `OPTIONS` request.
   */
  async options(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'OPTIONS', ...options});
  }

  /**
   * Perform `PATCH` request.
   */
  async patch(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'PATCH', ...options});
  }

  /**
   * Perform `POST` request.
   */
  async post(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'POST', ...options});
  }

  /**
   * Perform `PUT` request.
   */
  async put(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<BrowserResponse> {
    return await this.request({url, method: 'PUT', ...options});
  }

  /**
   * Perform HTTP request.
   */
  async request(config: UserAgentRequestOptions): Promise<BrowserResponse> {
    const filtered = this._filterConfig(config);
    await this.hooks.runHook('request', this, filtered);
    let res = await this.httpTransport.request(filtered);
    if (this.maxRedirects > 0) res = await this._handleRedirect(config, res);
    return res;
  }

  _filterConfig(config: UserAgentRequestOptions): UserAgentRequestOptions {
    if (!(config.url instanceof URL)) config.url = new URL(config.url ?? '/', this.baseURL);

    // Query
    const url: URL = config.url;
    if (config.query !== undefined) {
      const params = url.searchParams;
      for (const [name, value] of Object.entries(config.query)) {
        params.append(name, value as string);
      }
    }

    // Headers
    if (config.headers === undefined) config.headers = {};
    if (this.name !== undefined) config.headers['User-Agent'] = this.name;

    // Auth
    if (config.auth !== undefined) config.headers['Authorization'] = 'Basic ' + btoa(decodeURIComponent(config.auth));

    // Body
    if (config.json !== undefined) {
      if (config.headers['Content-Type'] === undefined) config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(config.json);
    } else if (config.form !== undefined) {
      if (config.headers['Content-Type'] === undefined) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      config.body = new URLSearchParams(config.form).toString();
    }

    return config;
  }

  async _handleRedirect(config: Record<string, any>, res: BrowserResponse): Promise<BrowserResponse> {
    const redirected: number = config.redirected ?? 0;
    if (redirected >= this.maxRedirects) return res;

    const location = res.get('Location');
    if (location === null) return res;
    const url = new URL(location, config.url);

    // New followup request
    const remove = ['Authorization', 'Cookie', 'Host', 'Referer'];
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
      const newConfig = {
        headers: config.headers,
        insecure: config.insecure,
        method: res.statusCode === 303 || config.method === 'POST' ? 'GET' : config.method,
        redirected: redirected + 1,
        url
      };

      remove.push(...Object.keys(newConfig.headers).filter(name => name.toLowerCase().startsWith('content-')));
      remove.forEach(name => delete newConfig.headers[name]);

      return this.request(newConfig);

      // Same request again
    } else if (res.statusCode === 307 || res.statusCode === 308) {
      config.url = url;
      config.redirected = redirected + 1;
      remove.forEach(name => delete config.headers[name]);

      return this.request(config);
    }

    return res;
  }
}

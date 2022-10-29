import type {UserAgentOptions, UserAgentRequestOptions} from './types.js';
import BrowserUserAgent from './browser.js';
import {NodeResponse} from './response/node.js';
import {UndiciTransport} from './transport/http/undici.js';

export {UserAgentHeaders} from './headers.js';
export {BrowserResponse} from './response/browser.js';
export {NodeResponse} from './response/node.js';

export default class NodeUserAgent extends BrowserUserAgent {
  constructor(options: UserAgentOptions = {}) {
    super(options);

    this.httpTransport = new UndiciTransport({
      insecure: options.insecure,
      keepAlive: options.keepAlive
    });
  }

  /**
   * Perform `DELETE` request.
   */
  async delete(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'DELETE', ...options});
  }

  /**
   * Perform `GET` request.
   */
  async get(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'GET', ...options});
  }

  /**
   * Perform `HEAD` request.
   */
  async head(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'HEAD', ...options});
  }

  /**
   * Perform `OPTIONS` request.
   */
  async options(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'OPTIONS', ...options});
  }

  /**
   * Perform `PATCH` request.
   */
  async patch(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'PATCH', ...options});
  }

  /**
   * Perform `POST` request.
   */
  async post(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'POST', ...options});
  }

  /**
   * Perform `PUT` request.
   */
  async put(url: string | URL = '/', options: UserAgentRequestOptions = {}): Promise<NodeResponse> {
    return await this.request({url, method: 'PUT', ...options});
  }

  /**
   * Perform HTTP request.
   */
  async request(config: UserAgentRequestOptions): Promise<NodeResponse> {
    return new NodeResponse(await super.request(config));
  }
}

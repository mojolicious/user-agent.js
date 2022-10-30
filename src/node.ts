import type {UserAgentOptions, UserAgentRequestOptions} from './types.js';
import BrowserUserAgent from './browser.js';
import {NodeResponse} from './response/node.js';
import {UndiciTransport} from './transport/http/undici.js';

export {UserAgentHeaders} from './headers.js';
export {BrowserResponse} from './response/browser.js';
export {NodeResponse} from './response/node.js';

interface NodeUserAgent {
  /**
   * Perform `DELETE` request.
   */
  delete(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `GET` request.
   */
  get(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `HEAD` request.
   */
  head(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `OPTIONS` request.
   */
  options(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `PATCH` request.
   */
  patch(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `POST` request.
   */
  post(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
  /**
   * Perform `PUT` request.
   */
  put(url?: string | URL, options?: UserAgentRequestOptions): Promise<NodeResponse>;
}

class NodeUserAgent extends BrowserUserAgent {
  constructor(options: UserAgentOptions = {}) {
    super(options);

    this.httpTransport = new UndiciTransport({
      insecure: options.insecure,
      keepAlive: options.keepAlive
    });
  }

  /**
   * Perform HTTP request.
   */
  async request(config: UserAgentRequestOptions): Promise<NodeResponse> {
    return new NodeResponse(await super.request(config));
  }
}

export default NodeUserAgent;

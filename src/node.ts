import type {UserAgentOptions, UserAgentRequestOptions} from './types.js';
import BrowserUserAgent from './browser.js';
import {NodeResponse} from './response/node.js';
import {UndiciTransport} from './transport/http/undici.js';

export {UserAgentHeaders} from './headers.js';
export {BrowserResponse} from './response/browser.js';
export {NodeResponse} from './response/node.js';

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

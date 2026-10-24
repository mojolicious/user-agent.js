import type {UserAgentOptions, UserAgentRequestOptions} from './types.ts';
import BrowserUserAgent from './browser.ts';
import {NodeResponse} from './response/node.ts';
import {UndiciTransport} from './transport/http/undici.ts';

export {UserAgentHeaders} from './headers.ts';
export {BrowserResponse} from './response/browser.ts';
export {NodeResponse} from './response/node.ts';
export type {HTTPTransport, UserAgentOptions, UserAgentRequestOptions} from './types.ts';

class NodeUserAgent extends BrowserUserAgent<NodeResponse> {
  /**
   * Transport backend to perform HTTP requests with.
   */
  declare httpTransport: UndiciTransport;

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

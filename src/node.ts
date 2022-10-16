import type {UserAgentOptions} from './types.js';
import BrowserUserAgent from './browser.js';
import {UndiciTransport} from './transport/http/undici.js';

export {UserAgentHeaders} from './headers.js';
export {UserAgentResponse} from './response.js';

export default class NodeUserAgent extends BrowserUserAgent {
  constructor(options: UserAgentOptions = {}) {
    super(options);

    this.httpTransport = new UndiciTransport({
      insecure: options.insecure ?? false,
      keepAlive: options.keepAlive ?? null
    });
  }
}

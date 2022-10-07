import type {HTTPTransport} from './types.js';
import BrowserUserAgent from './browser.js';
import {UndiciTransport} from './transport/http/undici.js';

export {UserAgentHeaders} from './headers.js';
export {UserAgentResponse} from './response.js';

export default class NodeUserAgent extends BrowserUserAgent {
  httpTransport: HTTPTransport = new UndiciTransport();
}

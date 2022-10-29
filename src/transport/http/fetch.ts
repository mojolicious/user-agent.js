import type {UserAgentRequestOptions} from '../../types.js';
import {BrowserResponse} from '../../response/browser.js';
import {expandFormData} from '../../utils.js';

export class FetchTransport {
  async request(options: UserAgentRequestOptions): Promise<BrowserResponse> {
    const formData = expandFormData(options.formData, FormData);

    return BrowserResponse.fromWeb(
      await fetch(options.url ?? '', {
        body: formData !== undefined ? formData : options.body,
        headers: options.headers,
        method: options.method,
        signal: options.signal
      })
    );
  }
}

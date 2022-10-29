import type {UserAgentRequestOptions} from '../../types.js';
import {BrowserResponse} from '../../response/browser.js';

export class FetchTransport {
  async request(options: UserAgentRequestOptions): Promise<BrowserResponse> {
    let formData: FormData | undefined;
    if (options.formData instanceof FormData) {
      formData = options.formData;
    } else if (options.formData !== undefined) {
      formData = new FormData();
      for (const [name, value] of Object.entries(options.formData)) {
        if (typeof value === 'string') formData.append(name, value);
      }
    }

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

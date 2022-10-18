import type {UserAgentRequestOptions} from '../../types.js';
import {UserAgentResponse} from '../../response.js';

export class FetchTransport {
  async request(options: UserAgentRequestOptions): Promise<UserAgentResponse> {
    let formData: FormData | undefined;
    if (options.formData !== undefined) {
      formData = new FormData();
      for (const [name, value] of Object.entries(options.formData)) {
        formData.append(name, value);
      }
    }

    return UserAgentResponse.fromWeb(
      await fetch(options.url ?? '', {
        body: formData !== undefined ? formData : options.body,
        headers: options.headers,
        method: options.method
      })
    );
  }
}

import type {UserAgentRequestOptions} from '../../types.js';
import {UserAgentResponse} from '../../response.js';

export class FetchTransport {
  async request(options: UserAgentRequestOptions): Promise<UserAgentResponse> {
    return UserAgentResponse.fromWeb(
      await fetch(options.url ?? '', {
        body: options.body,
        headers: options.headers,
        method: options.method
      })
    );
  }
}

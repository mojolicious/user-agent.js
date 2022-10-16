import type {UserAgentRequestOptions} from '../../types.js';
import {UserAgentResponse} from '../../response.js';

export class FetchTransport {
  async request({body, headers, method, url}: UserAgentRequestOptions): Promise<UserAgentResponse> {
    return UserAgentResponse.fromWeb(await fetch(url ?? '', {body, headers, method}));
  }
}

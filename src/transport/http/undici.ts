import type {UserAgentRequestOptions} from '../../types.js';
import {format} from 'node:url';
import {UserAgentResponse} from '../../response.js';
import tough from 'tough-cookie';
import {Agent, fetch} from 'undici';

export class UndiciTransport {
  cookieJar: tough.CookieJar | null = new tough.CookieJar();

  async request(options: UserAgentRequestOptions): Promise<UserAgentResponse> {
    const url = (options.url ?? '').toString();
    const cookies = await this._loadCookies(url);
    const agent = {
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
      connect: options.insecure === true ? {rejectUnauthorized: false} : {}
    };

    const res = UserAgentResponse.fromWeb(
      await fetch(url, {
        body: options.body,
        headers: cookies === null ? options.headers : {...options.headers, Cookie: cookies},
        method: options.method,
        redirect: 'manual',
        dispatcher: new Agent(agent)
      })
    );

    await this._storeCookies(url, res.headers.getAll('Set-Cookie'));

    return res;
  }

  _cookieURL(url: string): string {
    return format(new URL(url), {auth: false, fragment: false, search: false});
  }

  async _loadCookies(url: string): Promise<string | null> {
    const cookieJar = this.cookieJar;
    if (cookieJar === null) return null;

    const cookies = await cookieJar.getCookies(this._cookieURL(url));
    if (cookies.length > 0) return cookies.map(cookie => cookie.cookieString()).join('; ');
    return null;
  }

  async _storeCookies(url: string, headers: string[]): Promise<void> {
    const cookieJar = this.cookieJar;
    if (cookieJar === null) return;

    const cookieURL = this._cookieURL(url);
    for (const cookie of headers.map(value => tough.Cookie.parse(value))) {
      if (cookie !== undefined) await cookieJar.setCookie(cookie, cookieURL);
    }
  }
}

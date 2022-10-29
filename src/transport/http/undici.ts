import type {HTTPTransportOptions, UserAgentRequestOptions} from '../../types.js';
import {format} from 'node:url';
import {UserAgentHeaders} from '../../headers.js';
import {BrowserResponse} from '../../response/browser.js';
import {termEscape} from '@mojojs/util';
import tough from 'tough-cookie';
import {Agent, FormData, fetch} from 'undici';

export class UndiciTransport {
  agent: Agent;
  cookieJar: tough.CookieJar | null = new tough.CookieJar();

  constructor(options: HTTPTransportOptions) {
    const keepAliveTimeout = options.keepAlive ?? 1000;
    this.agent = new Agent({
      connect: options.insecure === true ? {rejectUnauthorized: false} : {},
      interceptors: {Client: process.env.MOJO_CLIENT_DEBUG === '1' ? [debugInterceptor] : []},
      keepAliveTimeout: keepAliveTimeout,
      keepAliveMaxTimeout: keepAliveTimeout,
      pipelining: options.keepAlive === null ? 0 : 1
    });
  }

  async request(options: UserAgentRequestOptions): Promise<BrowserResponse> {
    const url = (options.url ?? '').toString();
    const cookies = await this._loadCookies(url);

    let formData: FormData | undefined;
    if (options.formData instanceof FormData) {
      formData = options.formData;
    } else if (options.formData !== undefined) {
      formData = new FormData();
      for (const [name, value] of Object.entries(options.formData)) {
        formData.append(name, value);
      }
    }

    const res = BrowserResponse.fromWeb(
      await fetch(url, {
        body: formData !== undefined ? formData : options.body,
        dispatcher: this.agent,
        headers: cookies === null ? options.headers : {...options.headers, Cookie: cookies},
        method: options.method,
        redirect: 'manual',
        signal: options.signal
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

// Very sketchy API with broken types, will probably need to be changed with undici updates
class DebugInterceptor {
  handler: any;

  constructor(handler: any) {
    this.handler = handler;
  }

  onConnect(...args: any[]): any {
    return this.handler.onConnect(...args);
  }

  onError(...args: any[]): any {
    return this.handler.onError(...args);
  }

  onUpgrade(...args: any[]): any {
    return this.handler.onUpgrade(...args);
  }

  onHeaders(...args: any[]): any {
    const headers = new UserAgentHeaders(args[1].map((buffer: Buffer) => buffer.toString()));
    process.stderr.write(`-- Client <<< Server\n${args[0]} ${args[3]}\n${headers.toString()}`);
    return this.handler.onHeaders(...args);
  }

  onData(...args: any[]): any {
    process.stderr.write(termEscape(`-- Client <<< Server\n${args[0]}\n`));
    return this.handler.onData(...args);
  }

  onComplete(...args: any[]): any {
    return this.handler.onComplete(...args);
  }

  onBodySent(...args: any[]): any {
    if (this.handler.onBodySent !== undefined) return this.handler.onComplete(...args);
  }
}

function debugInterceptor(dispatch: any) {
  return function interceptedDispatch(opts: any, handler: any) {
    const headers = new UserAgentHeaders(opts.headers);
    process.stderr.write(`-- Client >>> Server\n${opts.method} ${opts.path}\n${headers.toString()}`);
    return dispatch(opts, new DebugInterceptor(handler));
  };
}

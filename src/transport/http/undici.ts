import type {HTTPTransportOptions, UserAgentRequestOptions} from '../../types.ts';
import type {IncomingHttpHeaders} from 'node:http';
import type {Duplex} from 'node:stream';
import {format} from 'node:url';
import {UserAgentHeaders} from '../../headers.ts';
import {BrowserResponse} from '../../response/browser.ts';
import {expandFormData} from '../../utils.ts';
import {termEscape} from '@mojojs/util';
import {Cookie, CookieJar} from 'tough-cookie';
import {Agent, type Dispatcher, FormData, fetch} from 'undici';

export class UndiciTransport {
  agent: Dispatcher;
  cookieJar: CookieJar | null = new CookieJar();

  constructor(options: HTTPTransportOptions) {
    const keepAliveTimeout = options.keepAlive ?? 1000;
    const agent = new Agent({
      connect: options.insecure === true ? {rejectUnauthorized: false} : {},
      keepAliveTimeout: keepAliveTimeout,
      keepAliveMaxTimeout: keepAliveTimeout,
      pipelining: options.keepAlive === null ? 0 : 1
    });
    this.agent = process.env.MOJO_CLIENT_DEBUG === '1' ? agent.compose(debugInterceptor) : agent;
  }

  async request(options: UserAgentRequestOptions): Promise<BrowserResponse> {
    const url = (options.url ?? '').toString();
    const cookies = await this._loadCookies(url);
    const formData = expandFormData(options.formData, FormData);

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
    for (const cookie of headers.map(value => Cookie.parse(value))) {
      if (cookie !== undefined) await cookieJar.setCookie(cookie, cookieURL);
    }
  }
}

class DebugHandler implements Dispatcher.DispatchHandler {
  handler: Dispatcher.DispatchHandler;

  constructor(handler: Dispatcher.DispatchHandler) {
    this.handler = handler;
  }

  onRequestStart(controller: Dispatcher.DispatchController, context: any): void {
    this.handler.onRequestStart?.(controller, context);
  }

  onRequestUpgrade(
    controller: Dispatcher.DispatchController,
    statusCode: number,
    headers: IncomingHttpHeaders,
    socket: Duplex
  ): void {
    this.handler.onRequestUpgrade?.(controller, statusCode, headers, socket);
  }

  onResponseStart(
    controller: Dispatcher.DispatchController,
    statusCode: number,
    headers: IncomingHttpHeaders,
    statusMessage?: string
  ): void {
    // Raw headers preserve the original case
    const raw = new UserAgentHeaders(((controller.rawHeaders ?? []) as Buffer[]).map(buffer => buffer.toString()));
    process.stderr.write(`-- Client <<< Server\n${statusCode} ${statusMessage}\n${raw.toString()}`);
    this.handler.onResponseStart?.(controller, statusCode, headers, statusMessage);
  }

  onResponseData(controller: Dispatcher.DispatchController, chunk: Buffer): void {
    process.stderr.write(termEscape(`-- Client <<< Server\n${chunk}\n`));
    this.handler.onResponseData?.(controller, chunk);
  }

  onResponseEnd(controller: Dispatcher.DispatchController, trailers: IncomingHttpHeaders): void {
    this.handler.onResponseEnd?.(controller, trailers);
  }

  onResponseError(controller: Dispatcher.DispatchController, error: Error): void {
    this.handler.onResponseError?.(controller, error);
  }
}

function debugInterceptor(dispatch: Dispatcher['dispatch']): Dispatcher['dispatch'] {
  return function interceptedDispatch(opts, handler) {
    const headers = new UserAgentHeaders(Object.entries(opts.headers as Record<string, string>).flat());
    process.stderr.write(`-- Client >>> Server\n${opts.method} ${opts.path}\n${headers.toString()}`);
    return dispatch(opts, new DebugHandler(handler));
  };
}

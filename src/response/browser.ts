import type {ResponseOptions, WebResponse} from '../types.js';
import type {JSONValue} from '@mojojs/util';
import {UserAgentHeaders} from '../headers.js';
import DOM from '@mojojs/dom';

export class BrowserResponse {
  body: ReadableStream<Uint8Array> | null;
  headers: UserAgentHeaders;
  statusCode: number;
  statusMessage: string;

  constructor(options: ResponseOptions) {
    this.body = options.body;
    this.headers = options.headers;
    this.statusCode = options.statusCode;
    this.statusMessage = options.statusMessage;
  }

  async data(): Promise<Uint8Array> {
    const body = this.body;
    if (body === null) return new Uint8Array();

    let result = new Uint8Array(0);
    const reader = body.getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {done, value} = await reader.read();
      if (done === true) break;

      const newResult = new Uint8Array(result.length + value.length);
      newResult.set(result);
      newResult.set(value, result.length);
      result = newResult;
    }

    return result;
  }

  static fromWeb(res: WebResponse): BrowserResponse {
    const headers = UserAgentHeaders.fromWeb(res.headers);
    return new BrowserResponse({body: res.body, headers, statusCode: res.status, statusMessage: res.statusText});
  }

  get(name: string): string | null {
    return this.headers.get(name);
  }

  async html(): Promise<DOM> {
    return new DOM(await this.text());
  }

  /**
   * Check if response has a `4xx` response status code.
   */
  get isClientError(): boolean {
    const statusCode = this.statusCode;
    return statusCode >= 400 && statusCode <= 499;
  }

  /**
   * Check if response has a `4xx` or `5xx` response status code.
   */
  get isError(): boolean {
    return this.isClientError || this.isServerError;
  }

  /**
   * Check if response has a `3xx` response status code.
   */
  get isRedirect(): boolean {
    const statusCode = this.statusCode;
    return statusCode >= 300 && statusCode <= 399;
  }

  /**
   * Check if response has a `5xx` response status code.
   */
  get isServerError(): boolean {
    const statusCode = this.statusCode;
    return statusCode >= 500 && statusCode <= 599;
  }

  /**
   * Check if response has a `2xx` response status code.
   */
  get isSuccess(): boolean {
    const statusCode = this.statusCode;
    return statusCode >= 200 && statusCode <= 299;
  }

  async json<T = JSONValue>(): Promise<T> {
    return JSON.parse((await this.text()).toString());
  }

  async text(charset = 'utf-8'): Promise<string> {
    return new TextDecoder(charset).decode(await this.data());
  }

  async xml(): Promise<DOM> {
    return new DOM(await this.text(), {xml: true});
  }
}

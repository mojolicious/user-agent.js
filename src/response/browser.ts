import type {ResponseOptions, WebResponse} from '../types.ts';
import type {JSONValue} from '@mojojs/util';
import {UserAgentHeaders} from '../headers.ts';
import DOM from '@mojojs/dom';

/**
 * User-agent response class.
 */
export class BrowserResponse {
  /**
   * Response body as a readable stream.
   */
  body: ReadableStream<Uint8Array> | null;
  /**
   * Response headers.
   */
  headers: UserAgentHeaders;
  /**
   * Response status code.
   */
  statusCode: number;
  /**
   * Response status message.
   */
  statusMessage: string;

  constructor(options: ResponseOptions) {
    this.body = options.body;
    this.headers = options.headers;
    this.statusCode = options.statusCode;
    this.statusMessage = options.statusMessage;
  }

  /**
   * Get response body as a `Uint8Array`.
   */
  async data(): Promise<Uint8Array> {
    const body = this.body;
    if (body === null) return new Uint8Array();
    return new Uint8Array(await new Response(body).arrayBuffer());
  }

  /**
   * Create response from a Fetch API response.
   */
  static fromWeb(res: WebResponse): BrowserResponse {
    const headers = UserAgentHeaders.fromWeb(res.headers);
    return new this({body: res.body, headers, statusCode: res.status, statusMessage: res.statusText});
  }

  /**
   * Get response header value.
   */
  get(name: string): string | null {
    return this.headers.get(name);
  }

  /**
   * Parse response body as HTML with `@mojojs/dom`.
   */
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

  /**
   * Parse response body as JSON.
   */
  async json<T = JSONValue>(): Promise<T> {
    return JSON.parse(await this.text());
  }

  /**
   * Get response body as a string.
   */
  async text(charset = 'utf-8'): Promise<string> {
    return new TextDecoder(charset).decode(await this.data());
  }

  /**
   * Parse response body as XML with `@mojojs/dom`.
   */
  async xml(): Promise<DOM> {
    return new DOM(await this.text(), {xml: true});
  }
}

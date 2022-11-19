import type {UserAgentHeaders} from './headers.js';
import type {BrowserResponse} from './response/browser.js';

export interface HTTPTransport {
  request: (options: UserAgentRequestOptions) => Promise<BrowserResponse>;
}

export interface HTTPTransportOptions {
  insecure?: boolean;
  keepAlive?: number | null;
}

export interface UserAgentOptions {
  baseURL?: string | URL;
  insecure?: boolean;
  keepAlive?: number | null;
  maxRedirects?: number;
  name?: string;
}

export interface UserAgentRequestOptions {
  auth?: string;
  body?: string;
  form?: Record<string, string>;
  formData?: Record<string, string | {content?: string | Blob; filename?: string; file?: string}> | FormData;
  headers?: Record<string, string>;
  json?: any;
  method?: string;
  query?: Record<string, string>;
  signal?: AbortSignal;
  url?: string | URL;
}

export interface ResponseOptions {
  body: ReadableStream<Uint8Array> | null;
  headers: UserAgentHeaders;
  statusCode: number;
  statusMessage: string;
}

export interface WebResponse {
  body: ReadableStream<Uint8Array> | null | any;
  headers: Headers;
  status: number;
  statusText: string;
}

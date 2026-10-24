import type {UserAgentHeaders} from './headers.ts';
import type {BrowserResponse} from './response/browser.ts';

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
  // The undici and DOM types for ReadableStream are not compatible
  body: ReadableStream<Uint8Array> | null | any;
  headers: WebHeaders;
  status: number;
  statusText: string;
}

export interface WebHeaders {
  forEach: (fn: (value: string, key: string) => void) => void;
}

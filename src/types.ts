import type {UserAgentHeaders} from './headers.js';
import type {UserAgentResponse} from './response.js';

export interface HTTPTransport {
  request: (options: UserAgentRequestOptions) => Promise<UserAgentResponse>;
}

export interface UserAgentOptions {
  baseURL?: string | URL;
  maxRedirects?: number;
  name?: string;
}

export interface UserAgentRequestOptions {
  auth?: string;
  body?: string;
  form?: Record<string, string>;
  formData?: Record<string, any>;
  headers?: Record<string, string>;
  insecure?: boolean;
  json?: any;
  method?: string;
  query?: Record<string, string>;
  url?: string | URL;
}

export interface UserAgentResponseOptions {
  body: ReadableStream<Uint8Array> | null;
  headers: UserAgentHeaders;
  statusCode: number;
  statusMessage: string;
}

export interface WebResponse {
  body: ReadableStream<Uint8Array> | null;
  headers: Headers;
  status: number;
  statusText: string;
}

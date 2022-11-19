type HeaderBuffer = Record<string, {normalCase: string; values: string[]}>;

const HOP_BY_HOP = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
];

/**
 * HTTP header class.
 */
export class UserAgentHeaders {
  _headers?: HeaderBuffer;
  _init: string[];

  constructor(init: string[] = []) {
    this._init = init;
  }

  /**
   * Append header value.
   */
  append(name: string, value: string): void {
    const lowerCase = name.toLowerCase();
    const headers = this._getHeaders();
    if (headers[lowerCase] === undefined) return this.set(name, value);

    if (lowerCase === 'set-cookie') {
      headers[lowerCase].values.push(value);
    } else {
      headers[lowerCase].values = [[...headers[lowerCase].values, value].join(', ')];
    }
  }

  /**
   * Clone headers.
   */
  clone(): UserAgentHeaders {
    return new UserAgentHeaders(this.toArray());
  }

  /**
   * Remove hop-by-hop headers that should not be retransmitted.
   */
  dehop(): void {
    const headers = this._getHeaders();
    HOP_BY_HOP.forEach(name => delete headers[name]);
  }

  static fromWeb(headers: Headers): UserAgentHeaders {
    const init: string[] = [];
    headers.forEach((value, key) => init.push(key, value));
    return new UserAgentHeaders(init);
  }

  /**
   * Get header value.
   */
  get(name: string): string | null {
    const header = this._getHeaders()[name.toLowerCase()];
    if (header === undefined) return null;
    return header.values.join(', ');
  }

  /**
   * Get all headers values individually.
   */
  getAll(name: string): string[] {
    const values = this._getHeaders()[name.toLowerCase()]?.values ?? [];
    return [...values];
  }

  /**
   * Remove header.
   */
  remove(name: string): void {
    delete this._getHeaders()[name.toLowerCase()];
  }

  /**
   * Set header value.
   */
  set(name: string, value: string): void {
    const lowerCase = name.toLowerCase();
    this._getHeaders()[lowerCase] = {normalCase: name, values: [value]};
  }

  /**
   * Convert headers into a plain array of name/value pairs.
   */
  toArray(): string[] {
    const array = [];

    for (const header of Object.values(this._getHeaders())) {
      for (const value of header.values) {
        array.push(header.normalCase, value);
      }
    }

    return array;
  }

  /**
   * Convert headers into a plain object.
   */
  toObject(): Record<string, string> {
    const object: Record<string, string> = {};
    for (const header of Object.values(this._getHeaders())) {
      object[header.normalCase] = header.values.join(', ');
    }
    return object;
  }

  /**
   * Convert headers to string.
   */
  toString(): string {
    const lines: string[] = [];

    for (const header of Object.values(this._getHeaders())) {
      for (const value of header.values) {
        lines.push(`${header.normalCase}: ${value}\r\n`);
      }
    }

    return lines.join('') + '\r\n';
  }

  _getHeaders(): HeaderBuffer {
    if (this._headers === undefined) {
      const headers: HeaderBuffer = (this._headers = {});
      const init = this._init;
      for (let i = 0; i < init.length; i += 2) {
        const name = init[i];
        const value = init[i + 1];
        const lowerCase = name.toLowerCase();
        if (headers[lowerCase] === undefined) {
          headers[lowerCase] = {normalCase: name, values: [value]};
        } else {
          headers[lowerCase].values.push(value);
        }
      }
    }
    return this._headers;
  }
}

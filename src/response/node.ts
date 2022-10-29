import type {Writable} from 'node:stream';
import {Readable} from 'node:stream';
import {BrowserResponse} from './browser.js';

export class NodeResponse extends BrowserResponse {
  /**
   * Get message body as a readable stream.
   */
  createReadStream(): Readable | null {
    if (this.body === null) return null;
    return Readable.fromWeb(this.body as any);
  }

  /**
   * Pipe message body to writable stream.
   */
  async pipe(writer: Writable): Promise<void> {
    const stream = this.createReadStream();
    if (stream === null) return;
    return await new Promise((resolve, reject) => {
      stream.on('error', reject).pipe(writer).on('unpipe', resolve);
    });
  }
}

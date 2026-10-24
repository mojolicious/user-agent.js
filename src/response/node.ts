import {Readable, type Writable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {BrowserResponse} from './browser.ts';

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
    await pipeline(stream, writer);
  }
}

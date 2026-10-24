import type {AddressInfo} from 'node:net';
import assert from 'node:assert/strict';
import http from 'node:http';
import UserAgent, {type NodeResponse, type UserAgentOptions} from '@mojojs/user-agent';

const server = http.createServer((req, res) => res.end('Hello TypeScript!'));
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));

const options: UserAgentOptions = {baseURL: `http://127.0.0.1:${(server.address() as AddressInfo).port}`};
const ua = new UserAgent(options);
ua.httpTransport.cookieJar = null;
const res: NodeResponse = await ua.get('/');
assert.equal(res.statusCode, 200);
assert.equal(await res.text(), 'Hello TypeScript!');
server.close();

console.log('TypeScript consumer works');

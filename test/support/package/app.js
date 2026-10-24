import assert from 'node:assert/strict';
import http from 'node:http';
import UserAgent from '@mojojs/user-agent';

const server = http.createServer((req, res) => res.end('Hello JavaScript!'));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

const ua = new UserAgent({baseURL: `http://127.0.0.1:${server.address().port}`});
const res = await ua.get('/');
assert.equal(res.statusCode, 200);
assert.equal(await res.text(), 'Hello JavaScript!');
server.close();

console.log('JavaScript consumer works');

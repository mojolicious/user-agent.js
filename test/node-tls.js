import UserAgent from '../lib/node.js';
import mojo, {Server} from '@mojojs/core';
import t from 'tap';

t.test('UserAgent (node TLS)', async t => {
  const app = mojo();

  if (app.mode === 'development') app.log.level = 'debug';

  app.get('/', ctx => ctx.render({text: `HTTPS: ${ctx.req.isSecure}`}));

  const server = new Server(app, {listen: [`https://127.0.0.1`], quiet: true});
  await server.start();
  const ua = new UserAgent({baseURL: server.urls[0]});

  await t.test('HTTPS (self signed cert is accepted in insecure mode)', async () => {
    const res = await ua.get('/', {insecure: true});
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'HTTPS: true');
  });

  await t.test('HTTPS (self signed cert is rejected by default)', async () => {
    let result;
    try {
      await ua.get('/');
    } catch (error) {
      result = error;
    }
    t.match(result, {cause: {code: 'DEPTH_ZERO_SELF_SIGNED_CERT'}});
  });

  await server.stop();
});

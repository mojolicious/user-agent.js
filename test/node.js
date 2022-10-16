import UserAgent from '../lib/node.js';
import {app} from './support/test-app/index.js';
import {Server} from '@mojojs/core';
import t from 'tap';

t.test('UserAgent (node)', async t => {
  const server = new Server(app, {listen: ['http://*'], quiet: true});
  await server.start();
  const ua = new UserAgent({baseURL: server.urls[0], name: 'mojo 1.0', maxRedirects: 0});

  await t.test('Hello World', async t => {
    const res = await ua.get('/hello');
    t.equal(res.statusCode, 200);
    t.equal(res.statusMessage, 'OK');
    t.equal(await res.text(), 'Hello World!');
  });

  await t.test('Custom request', async t => {
    const res = await ua.request({url: '/hello'});
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'Hello World!');

    const res2 = await ua.request({});
    t.equal(res2.statusCode, 404);
  });

  await t.test('Status', async t => {
    const res = await ua.get('/status?status=200');
    t.ok(res.isSuccess);
    t.not(res.isError);
    t.not(res.isClientError);
    t.not(res.isServerError);
    t.not(res.isRedirect);
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), '');

    const res2 = await ua.get('/status?status=201');
    t.ok(res2.isSuccess);
    t.not(res2.isError);
    t.not(res2.isClientError);
    t.not(res2.isServerError);
    t.not(res2.isRedirect);
    t.equal(res2.statusCode, 201);
    t.equal(await res2.text(), '');

    const res3 = await ua.get('/status?status=302');
    t.not(res3.isSuccess);
    t.not(res3.isError);
    t.not(res3.isClientError);
    t.not(res3.isServerError);
    t.ok(res3.isRedirect);
    t.equal(res3.statusCode, 302);
    t.equal(await res3.text(), '');

    const res4 = await ua.get('/status?status=404');
    t.not(res4.isSuccess);
    t.ok(res4.isError);
    t.ok(res4.isClientError);
    t.not(res4.isServerError);
    t.not(res4.isRedirect);
    t.equal(res4.statusCode, 404);
    t.equal(await res4.text(), '');

    const res5 = await ua.get('/status?status=500');
    t.not(res5.isSuccess);
    t.ok(res5.isError);
    t.not(res5.isClientError);
    t.ok(res5.isServerError);
    t.not(res5.isRedirect);
    t.equal(res5.statusCode, 500);
    t.equal(await res5.text(), '');

    const res6 = await ua.get('/status?status=599');
    t.not(res6.isSuccess);
    t.ok(res6.isError);
    t.not(res6.isClientError);
    t.ok(res6.isServerError);
    t.not(res6.isRedirect);
    t.equal(res6.statusCode, 599);
    t.equal(await res6.text(), '');

    const res7 = await ua.get('/status?status=299');
    t.ok(res7.isSuccess);
    t.not(res7.isError);
    t.not(res7.isClientError);
    t.not(res7.isServerError);
    t.not(res7.isRedirect);
    t.equal(res7.statusCode, 299);
    t.equal(await res7.text(), '');
  });

  await t.test('Headers', async t => {
    const res = await ua.get('/headers?header=user-agent');
    t.equal(res.statusCode, 200);
    t.equal(res.get('X-Test'), 'works too');
    t.equal(res.get('X-Test2'), 'just, works, too');
    t.equal(await res.text(), 'mojo 1.0');

    const res2 = await ua.get('/headers?header=test', {headers: {test: 'works'}});
    t.equal(res2.statusCode, 200);
    t.equal(res2.get('X-Test'), 'works too');
    t.equal(res2.get('X-Test2'), 'just, works, too');
    t.equal(await res2.text(), 'works');
  });

  await t.test('Body', async t => {
    const res = await ua.put('/body', {body: 'Body works!'});
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'Body works!');

    const res2 = await ua.put('/body', {body: 'I ♥ Mojolicious!'});
    t.equal(res2.statusCode, 200);
    t.equal(await res2.text(), 'I ♥ Mojolicious!');
  });

  await t.test('Query', async t => {
    const res = await ua.get('/headers', {query: {header: 'user-agent'}});
    t.equal(res.statusCode, 200);
    t.equal(res.get('X-Test'), 'works too');
    t.equal(await res.text(), 'mojo 1.0');

    const res2 = await ua.get('/status', {query: {status: 201, test: 'works'}});
    t.equal(res2.statusCode, 201);
    t.equal(res2.get('X-Test'), 'works');
    t.equal(await res2.text(), '');
  });

  await t.test('JSON', async t => {
    const res = await ua.get('/hello.json');
    t.equal(res.statusCode, 200);
    t.same(await res.json(), {hello: 'world'});
  });

  await t.test('Form', async t => {
    const res = await ua.post('/form', {form: {foo: 'works'}});
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'Form: works, missing');

    const res2 = await ua.post('/form', {form: {foo: 'works', bar: 'too'}});
    t.equal(res2.statusCode, 200);
    t.equal(await res2.text(), 'Form: works, too');

    const res3 = await ua.post('/form', {json: {foo: 'works', bar: 'too'}});
    t.equal(res3.statusCode, 200);
    t.equal(await res3.text(), 'Form: missing, missing');

    const res4 = await ua.post('/form', {form: {foo: 'w(o-&2F%2F)r k  s', bar: '%&!@#$%^&*&&%'}});
    t.equal(res4.statusCode, 200);
    t.equal(await res4.text(), 'Form: w(o-&2F%2F)r k  s, %&!@#$%^&*&&%');
  });

  await t.test('Methods', async t => {
    const res = await ua.delete('/methods');
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'DELETE');

    const res2 = await ua.get('/methods');
    t.equal(res2.statusCode, 200);
    t.equal(await res2.text(), 'GET');

    const res3 = await ua.options('/methods');
    t.equal(res3.statusCode, 200);
    t.equal(await res3.text(), 'OPTIONS');

    const res4 = await ua.patch('/methods');
    t.equal(res4.statusCode, 200);
    t.equal(await res4.text(), 'PATCH');

    const res5 = await ua.post('/methods');
    t.equal(res5.statusCode, 200);
    t.equal(await res5.text(), 'POST');

    const res6 = await ua.put('/methods');
    t.equal(res6.statusCode, 200);
    t.equal(await res6.text(), 'PUT');

    const res7 = await ua.head('/hello');
    t.equal(res7.statusCode, 200);
    t.equal(res7.get('Content-Length'), '12');
    t.equal(await res7.text(), '');

    const res8 = await ua.request({method: 'PUT', url: '/methods'});
    t.equal(res8.statusCode, 200);
    t.equal(await res8.text(), 'PUT');
  });

  await t.test('Basic authentication', async t => {
    const res = await ua.get('/auth/basic', {auth: 'foo:bar'});
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'basic: foo:bar, body: nothing');

    const res2 = await ua.get('/auth/basic');
    t.equal(res2.statusCode, 200);
    t.equal(await res2.text(), 'basic: nothing, body: nothing');

    const res3 = await ua.post('/auth/basic', {auth: 'foo:bar:baz', body: 'test'});
    t.equal(res3.statusCode, 200);
    t.equal(await res3.text(), 'basic: foo:bar:baz, body: test');
  });

  await t.test('Redirect', async t => {
    const hello = new URL('/hello', ua.baseURL);
    const res = await ua.post('/redirect/301', {query: {location: hello.toString()}});
    t.equal(res.statusCode, 301);
    t.equal(res.get('Location'), hello.toString());
    t.equal(await res.text(), '');

    ua.maxRedirects = 1;
    const res2 = await ua.post('/redirect/301', {query: {location: hello.toString()}});
    t.equal(res2.statusCode, 200);
    t.same(res2.get('Location'), undefined);
    t.equal(await res2.text(), 'Hello World!');

    const res3 = await ua.post('/redirect/302', {query: {location: hello.toString()}});
    t.equal(res3.statusCode, 200);
    t.same(res3.get('Location'), undefined);
    t.equal(await res3.text(), 'Hello World!');

    const res4 = await ua.post('/redirect/303', {query: {location: hello.toString()}});
    t.equal(res4.statusCode, 200);
    t.same(res4.get('Location'), undefined);
    t.equal(await res4.text(), 'Hello World!');

    const res5 = await ua.post('/redirect/333', {query: {location: hello.toString()}});
    t.equal(res5.statusCode, 333);
    t.equal(res5.get('Location'), hello.toString());
    t.equal(await res5.text(), '');

    const again = new URL('/redirect/again', ua.baseURL);
    const res6 = await ua.post('/redirect/301', {query: {location: again.toString()}});
    t.equal(res6.statusCode, 302);
    t.equal(res6.get('Location'), hello.toString());
    t.equal(await res6.text(), '');

    ua.maxRedirects = 2;
    const res7 = await ua.post('/redirect/301', {query: {location: again.toString()}});
    t.equal(res7.statusCode, 200);
    t.same(res7.get('Location'), undefined);
    t.equal(await res7.text(), 'Hello World!');

    ua.maxRedirects = 5;
    const res8 = await ua.get('/redirect/infinite/0/302');
    t.equal(res8.statusCode, 302);
    t.match(res8.get('Location'), /\/infinite\/6/);
    t.equal(await res8.text(), '');

    const res9 = await ua.get('/redirect/infinite/0/307');
    t.equal(res9.statusCode, 307);
    t.match(res9.get('Location'), /\/infinite\/6/);
    t.equal(await res9.text(), '');
    ua.maxRedirects = 0;
  });

  await t.test('Redirect (header removal)', async t => {
    function defaultOptions() {
      return {
        headers: {
          Authorization: 'one',
          Cookie: 'two',
          Referer: 'three',
          'Content-Disposition': 'four',
          'X-Test': 'five'
        },
        body: 'works'
      };
    }

    ua.maxRedirects = 3;
    const res = await ua.put('/redirect/introspect', defaultOptions());
    t.equal(res.statusCode, 200);
    t.same(await res.json(), {
      method: 'PUT',
      headers: {
        authorization: 'one',
        content: 'four',
        cookie: 'two',
        referer: 'three',
        test: 'five'
      },
      body: 'works'
    });

    const res2 = await ua.put('/redirect/introspect/301', defaultOptions());
    t.equal(res2.statusCode, 200);
    t.same(await res2.json(), {method: 'PUT', headers: {test: 'five'}, body: ''});

    const res3 = await ua.put('/redirect/introspect/302', defaultOptions());
    t.equal(res3.statusCode, 200);
    t.same(await res3.json(), {method: 'PUT', headers: {test: 'five'}, body: ''});

    const res4 = await ua.put('/redirect/introspect/303', defaultOptions());
    t.equal(res4.statusCode, 200);
    t.same(await res4.json(), {method: 'GET', headers: {test: 'five'}, body: ''});

    const res5 = await ua.put('/redirect/introspect/307', defaultOptions());
    t.equal(res5.statusCode, 200);
    t.same(await res5.json(), {method: 'PUT', headers: {content: 'four', test: 'five'}, body: 'works'});

    const res6 = await ua.put('/redirect/introspect/308', defaultOptions());
    t.equal(res6.statusCode, 200);
    t.same(await res6.json(), {method: 'PUT', headers: {content: 'four', test: 'five'}, body: 'works'});

    const res7 = await ua.post('/redirect/introspect/302', defaultOptions());
    t.equal(res7.statusCode, 200);
    t.same(await res7.json(), {method: 'GET', headers: {test: 'five'}, body: ''});
  });

  await t.test('HTML/XML', async t => {
    const res = await ua.get('/test.html');
    const html = await res.html();
    t.equal(html.at('div').text(), 'Test123');

    const res2 = await ua.get('/test.xml');
    const xml = await res2.xml();
    t.equal(xml.find('script p').length, 1);
    t.equal(xml.at('script p').text(), 'Hello');

    const res3 = await ua.get('/test.xml');
    const html2 = await res3.html();
    t.same(html2.at('script p'), null);
  });

  await t.test('Cookie', async () => {
    const res = await ua.get('/cookie');
    t.equal(res.statusCode, 200);
    t.equal(await res.text(), 'Cookie: not present');

    const res2 = await ua.get('/cookie');
    t.equal(res2.statusCode, 200);
    t.equal(await res2.text(), 'Cookie: present');

    const res3 = await ua.get('/cookie');
    t.equal(res3.statusCode, 200);
    t.equal(await res3.text(), 'Cookie: present');

    ua.httpTransport.cookieJar = null;
    const res4 = await ua.get('/cookie');
    t.equal(res4.statusCode, 200);
    t.equal(await res4.text(), 'Cookie: not present');
  });

  await t.test('Keep-alive', async t => {
    const ua = new UserAgent({baseURL: server.urls[0], keepAlive: 1000});
    const res = await ua.get('/hello');
    t.equal(res.statusCode, 200);
    t.equal(res.get('Connection'), 'keep-alive');
    t.equal(await res.text(), 'Hello World!');

    const ua2 = new UserAgent({baseURL: server.urls[0], keepAlive: null});
    const res2 = await ua2.get('/hello');
    t.equal(res2.statusCode, 200);
    t.equal(res2.get('Connection'), 'close');
    t.equal(await res2.text(), 'Hello World!');
  });

  await server.stop();
});

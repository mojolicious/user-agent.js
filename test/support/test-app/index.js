import mojo from '@mojojs/core';

export const app = mojo();

if (app.mode === 'development') app.log.level = 'debug';

app.static.publicPaths.push(app.home.child('..', '..', '..', 'dist').toString());

app.get('/hello', ctx => ctx.render({text: 'Hello World!'}));

app.get('/status', ctx => {
  const test = ctx.req.query.get('test') ?? 'missing';
  ctx.res.set('X-Test', test);
  return ctx.render({text: '', status: parseInt(ctx.req.query.get('status'))});
});

app.get('/headers', ctx => {
  const name = ctx.req.query.get('header');
  const value = ctx.req.get(name) || 'fail';
  ctx.res.set('X-Test', 'works too');
  ctx.res.append('X-Test2', 'just').append('X-Test2', 'works').append('X-Test2', 'too');
  return ctx.render({text: value});
});

app.put('/body', async ctx => {
  const body = await ctx.req.text();
  return ctx.render({text: body});
});

app.post('/form', async ctx => {
  const form = await ctx.req.form();
  const foo = form.get('foo') ?? 'missing';
  const bar = form.get('bar') ?? 'missing';
  return ctx.render({text: `Form: ${foo}, ${bar}`});
});

app.post('/form/data', async ctx => {
  const form = await ctx.req.form();
  const data = {first: form.get('first') ?? 'missing', second: form.get('second') ?? 'missing'};
  return ctx.render({json: data});
});

app.get('/hello', {ext: 'json'}, ctx => ctx.render({json: {hello: 'world'}}));

app.get('/hello', {ext: 'yaml'}, ctx => ctx.render({yaml: {hello: 'world'}}));

app.any('/methods', ctx => ctx.render({text: ctx.req.method}));

app.any('/test.html').to(ctx => ctx.render({text: '<div>Test<br>123</div>'}));

app
  .any('/test.xml')
  .to(ctx => ctx.render({text: "<?xml version='1.0' encoding='UTF-8'?><script><p>Hello</p></script>"}));

app.any('/auth/basic', async ctx => {
  const auth = ctx.req.userinfo ?? 'nothing';
  const body = (await ctx.req.text()) || 'nothing';
  return ctx.render({text: `basic: ${auth}, body: ${body}`});
});

app.post('/redirect/:code', async ctx => {
  const location = ctx.req.query.get('location');
  await ctx.res.status(ctx.stash.code).set('Location', location).send();
});

app.get('/redirect/again', ctx => ctx.redirectTo('hello'));

app
  .get('/redirect/infinite/:num/:code', ctx => {
    const code = ctx.stash.code;
    const num = parseInt(ctx.stash.num) + 1;
    ctx.redirectTo('infinite', {status: code, values: {code, num}});
  })
  .name('infinite');

app
  .any('/redirect/introspect', async ctx => {
    await ctx.render({
      json: {
        method: ctx.req.method,
        headers: {
          authorization: ctx.req.get('Authorization') ?? undefined,
          content: ctx.req.get('Content-Disposition') ?? undefined,
          cookie: ctx.req.get('Cookie') ?? undefined,
          referer: ctx.req.get('Referer') ?? undefined,
          test: ctx.req.get('X-Test') ?? undefined
        },
        body: await ctx.req.text()
      }
    });
  })
  .name('introspect');

app.any('/redirect/introspect/:code', ctx => ctx.redirectTo('introspect', {status: ctx.stash.code}));

app.get('/cookie', ctx => {
  const foo = ctx.req.getCookie('foo') ?? 'not present';
  if (foo === 'not present') ctx.res.setCookie('foo', 'present');
  return ctx.render({text: `Cookie: ${foo}`});
});

app.get('/gzip', ctx => ctx.render({text: 'a'.repeat(2048)}));

app.get('/abort', async () => {
  // Do nothing
});

app.start();

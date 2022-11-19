import {UserAgentHeaders} from '../lib/node.js';
import t from 'tap';

t.test('Headers', t => {
  t.test('Basics', t => {
    const headers = new UserAgentHeaders();
    t.same(headers.toObject(), {});
    t.same(headers.get('Foo'), null);
    t.same(headers.toArray(), []);

    const headers2 = new UserAgentHeaders(['Accept', 'text/plain']);
    t.same(headers2.toObject(), {Accept: 'text/plain'});
    t.equal(headers2.get('Accept'), 'text/plain');
    t.same(headers2.get('Foo'), null);
    headers2.set('Foo', 'bar');
    t.same(headers2.get('Foo'), 'bar');
    t.same(headers2.get('fOO'), 'bar');
    t.same(headers2.toObject(), {Accept: 'text/plain', Foo: 'bar'});
    t.same(headers2.toArray(), ['Accept', 'text/plain', 'Foo', 'bar']);
    headers2.set('Foo', 'yada');
    t.same(headers2.toArray(), ['Accept', 'text/plain', 'Foo', 'yada']);
    headers2.append('Foo', 'baz');
    t.same(headers2.toArray(), ['Accept', 'text/plain', 'Foo', 'yada, baz']);
    t.equal(headers2.toString(), 'Accept: text/plain\r\nFoo: yada, baz\r\n\r\n');
    headers2.remove('Foo');
    t.same(headers2.toArray(), ['Accept', 'text/plain']);
    t.same(headers2.get('Foo'), null);

    t.end();
  });

  t.test('Cookies', t => {
    const headers = new UserAgentHeaders();
    headers.append('Set-Cookie', 'one=foo');
    t.equal(headers.get('Set-Cookie'), 'one=foo');
    t.same(headers.getAll('Set-Cookie'), ['one=foo']);
    t.same(headers.toArray(), ['Set-Cookie', 'one=foo']);
    t.same(headers.toObject(), {'Set-Cookie': 'one=foo'});
    headers.append('Set-Cookie', 'two=bar');
    t.equal(headers.get('Set-Cookie'), 'one=foo, two=bar');
    t.same(headers.getAll('Set-Cookie'), ['one=foo', 'two=bar']);
    t.same(headers.toArray(), ['Set-Cookie', 'one=foo', 'Set-Cookie', 'two=bar']);
    t.same(headers.toObject(), {'Set-Cookie': 'one=foo, two=bar'});

    t.end();
  });

  t.test('Clone', t => {
    const headers = new UserAgentHeaders();
    headers.append('Connection', 'close');
    headers.append('Connection', 'keep-alive');
    t.equal(headers.get('Connection'), 'close, keep-alive');
    const clone = headers.clone();
    headers.set('Connection', 'nothing');
    t.equal(headers.get('Connection'), 'nothing');
    t.equal(clone.get('Connection'), 'close, keep-alive');

    const headers2 = new UserAgentHeaders();
    headers2.set('Expect', '100-continue');
    const clone2 = headers2.clone();
    t.equal(headers2.get('Expect'), '100-continue');
    t.equal(clone2.get('Expect'), '100-continue');
    clone2.set('Expect', 'nothing');
    t.equal(headers2.get('Expect'), '100-continue');
    t.equal(clone2.get('Expect'), 'nothing');
    clone2.set('Foo', 'bar');
    t.same(headers2.toObject(), {Expect: '100-continue'});
    t.same(clone2.toObject(), {Expect: 'nothing', Foo: 'bar'});
    const clone3 = clone2.clone();
    clone2.remove('Foo');
    t.same(clone2.toObject(), {Expect: 'nothing'});
    t.same(clone3.toObject(), {Expect: 'nothing', Foo: 'bar'});

    t.end();
  });

  t.test('Dehop', t => {
    const fail = {
      Connection: 'fail',
      'Keep-Alive': 'fail',
      'Proxy-Authenticate': 'fail',
      'Proxy-Authorization': 'fail',
      Server: 'pass',
      TE: 'fail',
      Trailer: 'fail',
      'Transfer-Encoding': 'fail',
      Upgrade: 'fail'
    };
    const headers = new UserAgentHeaders(Object.entries(fail).flat());
    t.same(headers.toObject(), fail);
    headers.dehop();
    t.same(headers.toObject(), {Server: 'pass'});

    t.end();
  });

  t.end();
});

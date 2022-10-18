<p align="center">
  <a href="https://mojojs.org">
    <picture>
      <source srcset="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo-dark.png?raw=true" media="(prefers-color-scheme: dark)">
      <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
    </picture>
  </a>
</p>

[![](https://github.com/mojolicious/user-agent.js/workflows/test/badge.svg)](https://github.com/mojolicious/user-agent.js/actions)
[![Coverage Status](https://coveralls.io/repos/github/mojolicious/user-agent.js/badge.svg?branch=main)](https://coveralls.io/github/mojolicious/user-agent.js?branch=main)
[![npm](https://img.shields.io/npm/v/@mojojs/user-agent.svg)](https://www.npmjs.com/package/@mojojs/user-agent)

A powerful user-agent for Node.js and browsers. Written in TypeScript. **VERY EXPERIMENTAL!**

```js
import UserAgent from '@mojojs/user-agent';

const ua = new UserAgent();
const res = await ua.get('https://mojolicious.org');
const dom = await res.html();
const title = dom.at('title').text();
```

The API is heavily inspired by the [Fetch Standard](https://fetch.spec.whatwg.org) and should feel familar if you've
used `fetch` before.

### User-Agent Options

The user agent can be initialized with a few options, but none of them are required.

```js
const ua = new UserAgent({

  // Base URL to be used to resolve all relative request URLs with
  baseURL: 'http://127.0.0.1:3000',

  // Disable TLS certificate validation (only Node.js)
  insecure: true,

  // Keep-alive timeout, disabled with `null`, defaults to 1000 (only Node.js)
  keepAlive: 3000,

  // Maximum number of redirects to follow, defaults to 20 (only Node.js)
  maxRedirects: 5,

  // Name of user agent to send with `User-Agent` header (only Node.js)
  name: 'mojoUA/1.0'
});
```

### Request Config

Every request is represented by a config object that contains various properties to describe every part of the HTTP
request.

```js
const res = await ua.request({

  // HTTP method for request
  method: 'GET',

  // URL of request target as a string or URL object, may be be relative to `ua.baseURL`
  url: new URL('https://mojolicious.org'),

  // Headers to include in request
  headers: {Accept: '*/*', Authorization: 'token 123456789abcdef'},

  // Object with key/value pairs to be sent with the query string
  query: {fieldA: 'first value', fieldB: 'second value'},

  // Request body as a string
  body: 'Some content to send with request',

  // Data structure to be send in JSON format
  json: {hello: ['world']},

  // Object with key/value pairs to be sent in `application/x-www-form-urlencoded` format
  form: {fieldA: 'first value', fieldB: 'second value'},

  // Object with key/value pairs  to be sent in `multipart/form-data` format
  formData: {fieldA: 'first value', fieldB: 'second value'},

  // Basic authentication
  auth: 'user:password'
});
```

The `request` method returns a `Promise` that resolves with a response object, right after the response
status line and headers have been received. But before any data from the response body has been read, which can be
handled in a separate step later on.

### Request Shortcuts

Since every request includes at least `method` and `url` values, there are HTTP method specific shortcuts you can use
instead of `request`.

```js
const res = await ua.delete('https://mojolicious.org');
const res = await ua.get('https://mojolicious.org');
const res = await ua.head('https://mojolicious.org');
const res = await ua.options('https://mojolicious.org');
const res = await ua.patch('https://mojolicious.org');
const res = await ua.post('https://mojolicious.org');
const res = await ua.put('https://mojolicious.org');
```

All remaining config values can be passed with a second argument to any one of the shortcut methods.

```js
const res = await ua.post('/search', {form: {q: 'mojo'}});
```

### Response Headers

Status line information and response headers are available right away with the response object.

```js
// Status code and message
const statusCode = res.statusCode;
const statusMessage = res.statusMessage;

// Headers
const contentType = res.get('Content-Type');

// 2xx
const isSuccess = res.isSuccess;

// 3xx
const isRedirect = res.isRedirect;

// 4xx
const isClientError = res.isClientError;

// 5xx
const isServerError = res.isServerError;

// 4xx or 5xx
const isError = res.isError;
```

### Response Body

The reponse body can be received in various formats. Most of them will result once again in a new `Promise`, resolving
to different results however.

```js
// ReadableStream
const stream = res.body;

// String
const text = await res.text();

// Uint8Array
const data = await res.data();

// Parsed JSON
const data = await res.json();

// Parsed HTML via `@mojojs/dom`
const dom = await res.html();
const title = dom.at('title').text();

// Parsed XML via `@mojojs/dom`
const dom = await res.xml();
```

For HTML and XML parsing [@mojojs/dom](https://www.npmjs.com/package/@mojojs/dom) will be used. Making it very easy to
extract information from documents with just a CSS selector and almost no code at all.

### Cookies

By default, for Node.js, a [tough-cookie](https://www.npmjs.com/package/tough-cookie) based cookie jar will be used for
state keeping, and you can reconfigure it however you like.

```js
ua.httpTransport.cookieJar.allowSpecialUseDomain = true;
```

Of course you can also just disable cookies completely.

```js
ua.httpTransport.cookieJar = null;
```

In browsers the native browser cookie jar will be used instead.

### Compression

Responses with `gzip` or `deflate` content encoding will be decompressed transparently.

### Introspection

With Node.js you can set the `MOJO_CLIENT_DEBUG` environment variable to get some advanced diagnostics information
printed to `STDERR`.

```
$ MOJO_CLIENT_DEBUG=1 node myapp.js
-- Client >>> Server
GET /hello.html
accept: */*
accept-language: *
sec-fetch-mode: cors
accept-encoding: gzip, deflate

-- Client <<< Server
200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 12
Date: Mon, 02 May 2022 23:32:34 GMT
Connection: close

Hello World!
```

## Installation

All you need is Node.js 16.8.0 (or newer).

```
$ npm install @mojojs/user-agent
```

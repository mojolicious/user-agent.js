
# Changelog

This package strictly follows [Semantic Versioning](https://semver.org).

## v1.0.0 (2026-10-24)

First major release.

### Breaking Changes

  * Removed support for Node.js versions older than 22.19.
  * Updated `@mojojs/dom` to version 4.0, recursive text extraction with `res.html()` now excludes `<script>` and
    `<style>` elements, and selectors like `#id` no longer match namespaced attributes like `foo:id`.
  * Updated `undici` to version 8.0.
  * Updated `tough-cookie` to version 6.0, the cookie jar can no longer be reconfigured after it has been created.
  * The `auth` option is no longer URL decoded, only credentials from the URL are.

### Features

  * Added `HTTPTransport`, `UserAgentOptions` and `UserAgentRequestOptions` type exports.
  * Added browser specific TypeScript types for the `browser` export condition.
  * Added `sideEffects` flag to `package.json` for better tree shaking with bundlers.
  * Added support for credentials in URLs, like `https://user:password@mojolicious.org`.

### Bug Fixes

  * Fixed security issues with `@mojojs/dom` by requiring a newer version.
  * Fixed a bug where `authorization` and `cookie` headers in lower case would be sent to other hosts after redirects.
  * Fixed a bug where the `auth` option would be sent to other hosts after `307` and `308` redirects.
  * Fixed a bug where the `query` option would be added again to the URL after `307` and `308` redirects.
  * Fixed a bug where the options passed to request methods would be modified.
  * Fixed a bug where the `signal` option would be ignored after `301`, `302` and `303` redirects.
  * Fixed a bug where the `auth` option could not contain characters outside of Latin-1.
  * Fixed a bug where `Content-Type` headers in lower case would be combined with the default for `json` and `form`
    requests.
  * Fixed a bug where `res.pipe()` would not reject when writing to the stream failed.
  * Fixed a bug where the TypeScript type of `ua.httpTransport` with Node.js did not include `cookieJar`.
  * Fixed a bug where the TypeScript types of Node.js request methods other than `request` did not return a
    `NodeResponse`.
  * Fixed a bug where `res.data()` was very slow for large response bodies.
  * Added a CI job that tests the published package with JavaScript and TypeScript applications, as well as browser
    bundles.

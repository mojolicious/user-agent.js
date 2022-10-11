import {app} from './support/test-app/index.js';
import {Server} from '@mojojs/core';
import {chromium} from 'playwright';
import t from 'tap';

t.test('UserAgent (browser)', async t => {
  const server = new Server(app, {listen: ['http://*'], quiet: true});
  await server.start();

  const browser = await chromium.launch(process.env.TEST_HEADLESS === '0' ? {headless: false, slowMo: 500} : {});
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = server.urls[0].toString();

  await page.goto(`${url}static/browser.html`);
  t.equal(await page.innerText('#hello'), 'Hello World!');

  await context.close();
  await browser.close();
  await server.stop();
});

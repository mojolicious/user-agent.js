import {app} from './support/test-app/index.js';
import {Server, util} from '@mojojs/core';
import {firefox} from 'playwright';
import t from 'tap';

t.test('UserAgent (firefox)', async t => {
  const server = new Server(app, {listen: ['http://*'], quiet: true});
  await server.start();

  const browser = await firefox.launch(process.env.TEST_HEADLESS === '0' ? {headless: false, slowMo: 500} : {});
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = server.urls[0];
  url.host = '127.0.0.1';

  const assertLogs = [];
  page.on('console', message => {
    const type = message.type();
    const text = message.text();
    if (type === 'assert') {
      assertLogs.push(text);
    } else if (/^Failed to load resource/.test(text) === false) {
      console.warn(`${type}: ${text}`);
    }
  });

  await page.goto(`${url}static/browser.html`);
  t.equal(await page.innerText('#tests'), 'Tests finished!');

  t.same(assertLogs, []);

  // Increase to 30000 for headful debugging in the browser
  util.sleep(3);

  await context.close();
  await browser.close();
  await server.stop();
});

import os from 'node:os';
import {app} from './support/test-app/index.js';
import {Server, util} from '@mojojs/core';
import Path from '@mojojs/path';
import {firefox} from 'playwright';
import t from 'tap';

t.test('UserAgent (firefox)', async t => {
  const server = new Server(app, {listen: ['http://*'], quiet: true});
  await server.start();

  // Firefox 157 fails to start on macOS 27 when it can't access "~/Library/Application Support/Firefox"
  // (microsoft/playwright#42768), so it gets its own home, which is reused because macOS protects it from deletion
  const options = process.env.TEST_HEADLESS === '0' ? {headless: false, slowMo: 500} : {};
  if (process.platform === 'darwin') {
    const home = await new Path(os.tmpdir(), 'mojo-user-agent-firefox').mkdir({recursive: true});
    options.env = {...process.env, CFFIXED_USER_HOME: home.toString()};
  }
  const browser = await firefox.launch(options);
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
  await util.sleep(3);

  await context.close();
  await browser.close();
  await server.stop();
});

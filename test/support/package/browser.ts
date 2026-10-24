import UserAgent, {type BrowserResponse} from '@mojojs/user-agent';

const ua = new UserAgent({baseURL: 'https://mojolicious.org'});
const res: BrowserResponse = await ua.get('/');
// @ts-expect-error Node.js streams are not available in browsers
res.createReadStream();
console.log(await res.text());

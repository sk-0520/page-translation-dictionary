// Mode: development
// Browser: chrome
// GEN: 2022-12-06T19:06:10+09:00
import * as page from '../scripts/extension/page/page';
import * as extensions from '../scripts/extension/extensions';

page.boot(new extensions.Extension(extensions.BrowserKind.Chrome, false));


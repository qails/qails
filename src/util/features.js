/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

import { existsSync } from 'fs';
import { resolve } from 'path';

const { DOCUMENT_ROOT } = process.env;
const filename = 'config/model.js';
const configFile = resolve(process.cwd(), DOCUMENT_ROOT, filename);
const defaultFeatures = require(`../${filename}`);
// eslint-disable-next-line
let features = defaultFeatures;
if (existsSync(configFile)) {
  const customFeatures = require(configFile);
  features = { ...defaultFeatures, ...customFeatures };
}

export default features;

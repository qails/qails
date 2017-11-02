/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import importFresh from 'import-fresh';

export default (name) => {
  const { DOCUMENT_ROOT } = process.env;
  const filename = 'config/model.js';
  const configInQails = resolve(__dirname, `../${filename}`);
  const configInProject = resolve(process.cwd(), DOCUMENT_ROOT, filename);
  const defaultFeatures = require(configInQails);
  // eslint-disable-next-line
  let features = defaultFeatures;
  if (configInQails !== configInProject && existsSync(configInProject)) {
    const customFeatures = importFresh(configInProject);
    features = { ...defaultFeatures, ...customFeatures };
  }
  return features[name];
};

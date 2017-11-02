/* eslint global-require: 0 */

import fs from 'fs-extra';
import path from 'path';
import should from 'should';
import importFresh from 'import-fresh';

describe('模型特征配置', () => {
  it('项目中没有配置文件时，使用qails默认配置', () => {
    const features = require('../../src/util/features').default;
    should(features('MODEL_REGISTRY')).be.false();
  });

  it('项目中存在配置文件且包含配置项时，应该使用配置文件中的配置', () => {
    const root = '.tmp';
    const configFolder = path.resolve(process.cwd(), root, 'config');
    const modelConfig = path.resolve(configFolder, 'model.js');
    const originValue = process.env.DOCUMENT_ROOT;
    fs.ensureDirSync(configFolder);
    fs.writeFileSync(modelConfig, `module.exports = {
      MODEL_REGISTRY: true,
      MODEL_UUID: { type: 'v1' },
      MODEL_SOFTDELETE: 'deletedAt'
    };`);
    process.env.DOCUMENT_ROOT = root;

    const features = require('../../src/util/features').default;
    features('MODEL_REGISTRY').should.be.true();
    features('MODEL_MASK').should.be.false();
    features('MODEL_UUID').should.have.property('type', 'v1');
    const { Model } = importFresh('../../src/util/base');
    // eslint-disable-next-line
    const User = class extends Model {};
    process.env.DOCUMENT_ROOT = originValue;
    fs.removeSync(configFolder);
  });

  it('所有选项设置为true时Model应该初始化正常', () => {
    const root = '.tmp/true';
    const configFolder = path.resolve(process.cwd(), root, 'config');
    const modelConfig = path.resolve(configFolder, 'model.js');
    const originValue = process.env.DOCUMENT_ROOT;
    fs.ensureDirSync(configFolder);
    fs.writeFileSync(modelConfig, `module.exports = {
      MODEL_REGISTRY: true,
      MODEL_VIRTUALS: true,
      MODEL_VISIBILITY: true,
      MODEL_PAGINATION: true,
      MODEL_BASE: true,
      MODEL_CASCADEDELETE: true,
      MODEL_MASK: true,
      MODEL_UUID: true,
      MODEL_JSONCOLUMNS: true,
      MODEL_MAGICCASE: true,
      MODEL_SOFTDELETE: true
    };`);
    process.env.DOCUMENT_ROOT = root;
    const features = require('../../src/util/features').default;
    features('MODEL_JSONCOLUMNS').should.be.true();
    const { Model } = importFresh('../../src/util/base');
    // eslint-disable-next-line
    const User = class extends Model {};
    process.env.DOCUMENT_ROOT = originValue;
    fs.removeSync(configFolder);
  });

  it('所有选项设置为false时Model应该初始化正常', () => {
    const root = '.tmp/false';
    const configFolder = path.resolve(process.cwd(), root, 'config');
    const modelConfig = path.resolve(configFolder, 'model.js');
    const originValue = process.env.DOCUMENT_ROOT;
    fs.ensureDirSync(configFolder);
    fs.writeFileSync(modelConfig, `module.exports = {
      MODEL_REGISTRY: false,
      MODEL_VIRTUALS: false,
      MODEL_VISIBILITY: false,
      MODEL_PAGINATION: false,
      MODEL_BASE: false,
      MODEL_CASCADEDELETE: false,
      MODEL_MASK: false,
      MODEL_UUID: false,
      MODEL_JSONCOLUMNS: false,
      MODEL_MAGICCASE: false,
      MODEL_SOFTDELETE: false
    };`);
    process.env.DOCUMENT_ROOT = root;
    const features = require('../../src/util/features').default;
    features('MODEL_JSONCOLUMNS').should.be.false();
    const { Model } = importFresh('../../src/util/base');
    // eslint-disable-next-line
    const User = class extends Model {};
    process.env.DOCUMENT_ROOT = originValue;
    fs.removeSync(configFolder);
  });
});

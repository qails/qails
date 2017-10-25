import fs from 'fs-extra';
import path from 'path';
import should from 'should';
import importFresh from 'import-fresh';

describe('模型特征配置', () => {
  it('项目中没有配置文件时，使用qails默认配置', () => {
    const features = importFresh('../../src/util/features').default;
    should(features).have.property('MODEL_REGISTRY', false);
  });

  it.skip('项目中存在配置文件且包含配置项时，应该使用配置文件中的配置', () => {
    const root = 'test/application';
    process.env.DOCUMENT_ROOT = 'test/application';
    const configFolder = path.resolve(process.cwd(), root, 'config');
    const modelConfig = path.resolve(configFolder, 'modle.js');
    fs.ensureDirSync(configFolder);
    fs.writeFileSync(modelConfig, 'module.exports = { MODEL_REGISTRY: true};');
    const features = importFresh('../../src/util/features').default;
    features.should.have.property('MODEL_REGISTRY', true);
    features.should.have.property('MODEL_UUID', false);

    fs.removeSync(configFolder);
  });
});

import fs from 'fs-extra';
import path from 'path';
import should from 'should';
import { features } from '../../src';

describe('模型特征配置', () => {
  it('项目中没有配置文件时，使用qails默认配置', () => {
    should(features('MODEL_REGISTRY')).be.false();
  });

  it('项目中存在配置文件且包含配置项时，应该使用配置文件中的配置', () => {
    const root = 'test/.tmp';
    const originValue = process.env.DOCUMENT_ROOT;
    process.env.DOCUMENT_ROOT = root;
    const configFolder = path.resolve(process.cwd(), root, 'config');
    const modelConfig = path.resolve(configFolder, 'model.js');
    fs.ensureDirSync(configFolder);
    fs.writeFileSync(modelConfig, 'module.exports = { MODEL_REGISTRY: true};');
    features('MODEL_REGISTRY').should.be.true();
    features('MODEL_UUID').should.be.false();
    process.env.DOCUMENT_ROOT = originValue;

    fs.removeSync(configFolder);
  });
});

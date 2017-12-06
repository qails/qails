# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.1.0"></a>
# [3.1.0](https://github.com/qails/qails/compare/v2.3.10...v3.1.0) (2017-12-06)


### Bug Fixes

* Fix test error ([ffaabac](https://github.com/qails/qails/commit/ffaabac))
* 为DOCUMENT_ROOT环境变量设置默认值src，避免无该环境变量时qails应用无法启动的问题 ([24ff9a5](https://github.com/qails/qails/commit/24ff9a5))


### Features

* 为查询关联模型embed参数增加别名withRelated ([72dc91f](https://github.com/qails/qails/commit/72dc91f))
* 修改resource构造函数参数，将collection参数改成model ([0e0ab05](https://github.com/qails/qails/commit/0e0ab05))
* 修改了Qails构造函数，初始化参数传递更加灵活 ([74eb5d1](https://github.com/qails/qails/commit/74eb5d1))
* 增加对低版本node提示 ([8f112c7](https://github.com/qails/qails/commit/8f112c7))
* 对GraphQL获取列表增加分页参数检查 ([662bbb3](https://github.com/qails/qails/commit/662bbb3))
* 将bookshelf模型配置放到profiles中管理，统一使用dotenv配置文件 ([efa86d9](https://github.com/qails/qails/commit/efa86d9))
* 将checkurl内置于qails中，减少jenkins发布的配置工作 ([d17aa6d](https://github.com/qails/qails/commit/d17aa6d))
* 将envelope改成中间件模式，增加代码的灵活性 ([af569b7](https://github.com/qails/qails/commit/af569b7))
* 新增graphql中间件 ([a59390e](https://github.com/qails/qails/commit/a59390e))


### Performance Improvements

* 使用delete重置process.env变量 ([39d201e](https://github.com/qails/qails/commit/39d201e))
* 增加了异常捕捉和输出，系统稳定性进一步得到提升 ([c8eb245](https://github.com/qails/qails/commit/c8eb245))
* 更改profile参数方式 ([73a96e9](https://github.com/qails/qails/commit/73a96e9))
* 移除bin目录下babel/eslint/knex ([c1574a3](https://github.com/qails/qails/commit/c1574a3))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/qails/qails/compare/v2.3.10...v3.0.0) (2017-12-01)


### Bug Fixes

* Fix test error ([ffaabac](https://github.com/qails/qails/commit/ffaabac))
* 为DOCUMENT_ROOT环境变量设置默认值src，避免无该环境变量时qails应用无法启动的问题 ([24ff9a5](https://github.com/qails/qails/commit/24ff9a5))


### Features

* 为查询关联模型embed参数增加别名withRelated ([72dc91f](https://github.com/qails/qails/commit/72dc91f))
* 修改resource构造函数参数，将collection参数改成model ([0e0ab05](https://github.com/qails/qails/commit/0e0ab05))
* 修改了Qails构造函数，初始化参数传递更加灵活 ([74eb5d1](https://github.com/qails/qails/commit/74eb5d1))
* 增加对低版本node提示 ([8f112c7](https://github.com/qails/qails/commit/8f112c7))
* 将bookshelf模型配置放到profiles中管理，统一使用dotenv配置文件 ([efa86d9](https://github.com/qails/qails/commit/efa86d9))
* 将checkurl内置于qails中，减少jenkins发布的配置工作 ([d17aa6d](https://github.com/qails/qails/commit/d17aa6d))
* 将envelope改成中间件模式，增加代码的灵活性 ([af569b7](https://github.com/qails/qails/commit/af569b7))
* 新增graphql中间件 ([a59390e](https://github.com/qails/qails/commit/a59390e))


### Performance Improvements

* 使用delete重置process.env变量 ([39d201e](https://github.com/qails/qails/commit/39d201e))
* 增加了异常捕捉和输出，系统稳定性进一步得到提升 ([c8eb245](https://github.com/qails/qails/commit/c8eb245))
* 更改profile参数方式 ([73a96e9](https://github.com/qails/qails/commit/73a96e9))
* 移除bin目录下babel/eslint/knex ([c1574a3](https://github.com/qails/qails/commit/c1574a3))



<a name="3.0.0-alpha.0"></a>
# [3.0.0-alpha.0](https://github.com/qails/qails/compare/v2.3.10...v3.0.0-alpha.0) (2017-11-16)


### Bug Fixes

* Fix test error ([ffaabac](https://github.com/qails/qails/commit/ffaabac))
* 为DOCUMENT_ROOT环境变量设置默认值src，避免无该环境变量时qails应用无法启动的问题 ([24ff9a5](https://github.com/qails/qails/commit/24ff9a5))


### Features

* 为查询关联模型embed参数增加别名withRelated ([72dc91f](https://github.com/qails/qails/commit/72dc91f))
* 修改resource构造函数参数，将collection参数改成model ([0e0ab05](https://github.com/qails/qails/commit/0e0ab05))
* 修改了Qails构造函数，初始化参数传递更加灵活 ([74eb5d1](https://github.com/qails/qails/commit/74eb5d1))
* 增加对低版本node提示 ([8f112c7](https://github.com/qails/qails/commit/8f112c7))
* 将envelope改成中间件模式，增加代码的灵活性 ([af569b7](https://github.com/qails/qails/commit/af569b7))
* 新增graphql中间件 ([a59390e](https://github.com/qails/qails/commit/a59390e))


### Performance Improvements

* 增加了异常捕捉和输出，系统稳定性进一步得到提升 ([c8eb245](https://github.com/qails/qails/commit/c8eb245))



<a name="2.3.10"></a>
## [2.3.10](https://github.com/qailsjs/qails/compare/v2.3.9...v2.3.10) (2017-10-25)


### Bug Fixes

* Fix bookshelf-cascade-delete error ([d026ad6](https://github.com/qailsjs/qails/commit/d026ad6))



<a name="2.3.9"></a>
## [2.3.9](https://github.com/qailsjs/qails/compare/v2.3.8...v2.3.9) (2017-10-25)



<a name="2.3.8"></a>
## [2.3.8](https://github.com/qailsjs/qails/compare/v2.3.7...v2.3.8) (2017-10-25)



<a name="2.3.7"></a>
## [2.3.7](https://github.com/qailsjs/qails/compare/v2.3.6...v2.3.7) (2017-10-25)



<a name="2.3.6"></a>
## [2.3.6](https://github.com/qailsjs/qails/compare/v2.3.5...v2.3.6) (2017-10-20)


### Bug Fixes

* Repair spelling errors: middlewave -> middleware ([25259da](https://github.com/qailsjs/qails/commit/25259da))



<a name="2.3.5"></a>
## [2.3.5](https://github.com/qailsjs/qails/compare/v2.3.4...v2.3.5) (2017-10-20)


### Bug Fixes

* 修改单词拼写错误 ([78e6aa7](https://github.com/qailsjs/qails/commit/78e6aa7))



<a name="2.3.4"></a>
## [2.3.4](https://github.com/qailsjs/qails/compare/v2.3.3...v2.3.4) (2017-10-20)



<a name="2.3.3"></a>
## [2.3.3](https://github.com/qailsjs/qails/compare/v2.3.2...v2.3.3) (2017-10-13)


### Bug Fixes

* bookshelf-json-columns[@zhongzhi107](https://github.com/zhongzhi107)/bookshelf-json-columns ([91b068e](https://github.com/qailsjs/qails/commit/91b068e))



<a name="2.3.2"></a>
## [2.3.2](https://github.com/qailsjs/qails/compare/v2.3.1...v2.3.2) (2017-10-13)



<a name="2.3.1"></a>
## [2.3.1](https://github.com/qailsjs/qails/compare/v2.3.0...v2.3.1) (2017-10-13)



<a name="2.3.0"></a>
# [2.3.0](https://github.com/qailsjs/qails/compare/v2.2.1...v2.3.0) (2017-10-10)


### Features

* 在graphql接口中增加对关联对象的查询控制参数 ([650f13d](https://github.com/qailsjs/qails/commit/650f13d))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/qailsjs/qails/compare/v2.2.0...v2.2.1) (2017-09-29)



<a name="2.2.0"></a>
# [2.2.0](https://github.com/qailsjs/qails/compare/v2.1.1...v2.2.0) (2017-09-29)


### Features

* **bookshelf:** 修改模型配置方式 ([0cf1b7e](https://github.com/qailsjs/qails/commit/0cf1b7e))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/qailsjs/qails/compare/v2.1.0...v2.1.1) (2017-09-29)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/qailsjs/qails/compare/v2.0.2...v2.1.0) (2017-09-28)


### Features

* Add soft delete feature ([728ff83](https://github.com/qailsjs/qails/commit/728ff83))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/qailsjs/qails/compare/v2.0.1...v2.0.2) (2017-09-15)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/qailsjs/qails/compare/v2.0.0...v2.0.1) (2017-09-15)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/qailsjs/qails/compare/v1.6.2...v2.0.0) (2017-08-31)


### Features

* Add engines property in package.json ([2cfa8a2](https://github.com/qailsjs/qails/commit/2cfa8a2))
* 增加GraphQL ([4555caf](https://github.com/qailsjs/qails/commit/4555caf))



<a name="1.6.2"></a>
## [1.6.2](https://github.com/qailsjs/qails/compare/v1.6.1...v1.6.2) (2017-08-29)


### Bug Fixes

* 修改日志输出格式，便于统一压缩打包 ([00a1833](https://github.com/qailsjs/qails/commit/00a1833))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/qailsjs/qails/compare/v1.6.0...v1.6.1) (2017-07-18)



<a name="1.6.0"></a>
# [1.6.0](https://github.com/qailsjs/qails/compare/v1.5.1...v1.6.0) (2017-07-17)


### Features

* 内置中间件支持自定义参数 ([7ef4c65](https://github.com/qailsjs/qails/commit/7ef4c65))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/qailsjs/qails/compare/v1.5.0...v1.5.1) (2017-07-04)


### Bug Fixes

* middleware must be a function! ([c210844](https://github.com/qailsjs/qails/commit/c210844))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/qailsjs/qails/compare/v1.4.1...v1.5.0) (2017-07-04)


### Features

* 增加 cookie 和 session 支持 ([8860f36](https://github.com/qailsjs/qails/commit/8860f36))
* 支持自定义qails中间件的顺序，或者增加业务中间件 ([0165dae](https://github.com/qailsjs/qails/commit/0165dae))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/qailsjs/qails/compare/v1.4.0...v1.4.1) (2017-06-10)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/qailsjs/qails/compare/v1.3.0...v1.4.0) (2017-06-10)


### Features

* 将koa-router封装到qails，能简化编程代码量 ([f997915](https://github.com/qailsjs/qails/commit/f997915))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/qailsjs/qails/compare/v1.2.1...v1.3.0) (2017-06-09)


### Features

* 支持pug模版 ([35e54e8](https://github.com/qailsjs/qails/commit/35e54e8))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/qailsjs/qails/compare/v1.2.0...v1.2.1) (2017-06-09)


### Bug Fixes

* cors origin can not match port ([3e8b6f2](https://github.com/qailsjs/qails/commit/3e8b6f2))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/qailsjs/qails/compare/v1.1.1...v1.2.0) (2017-06-09)


### Features

* CORS support ([076634c](https://github.com/qailsjs/qails/commit/076634c))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/qailsjs/qails/compare/v1.1.0...v1.1.1) (2017-06-09)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/zhongzhi107/qails/compare/v1.0.7...v1.1.0) (2017-06-06)


### Features

* Support static files ([e24ab19](https://github.com/zhongzhi107/qails/commit/e24ab19))



<a name="1.0.7"></a>
## [1.0.7](https://github.com/zhongzhi107/qails/compare/v1.0.6...v1.0.7) (2017-06-05)



<a name="1.0.6"></a>
## [1.0.6](https://github.com/zhongzhi107/qails/compare/v1.0.5...v1.0.6) (2017-06-05)



<a name="1.0.5"></a>
## [1.0.5](https://github.com/zhongzhi107/qails/compare/v1.0.4...v1.0.5) (2017-06-01)


### Bug Fixes

* Update the resource using the updating event and return the resource not updated in the result ([972f4ca](https://github.com/zhongzhi107/qails/commit/972f4ca))



<a name="1.0.4"></a>
## [1.0.4](https://github.com/zhongzhi107/qails/compare/v1.0.3...v1.0.4) (2017-06-01)



<a name="1.0.3"></a>
## [1.0.3](https://github.com/zhongzhi107/qails/compare/v1.0.2...v1.0.3) (2017-06-01)



<a name="1.0.2"></a>
## [1.0.2](https://github.com/zhongzhi107/qails/compare/v1.0.1...v1.0.2) (2017-06-01)



<a name="1.0.1"></a>
## 1.0.1 (2017-06-01)

# qails
An API-driven framework for building nodejs apps, using MVC conventions. It only will provide a structure, inspired on Ruby on Rails, that will allow you to organise better your projects, initialise your own or third party libraries, call in a easy way your models, helpers, etc.

## Status

[![npm version](https://badge.fury.io/js/qails.svg)](https://badge.fury.io/js/qails)
[![Build Status](https://travis-ci.org/qails/qails.svg?branch=master)](https://travis-ci.org/qails/qails)
[![Coverage Status](https://coveralls.io/repos/github/qails/qails/badge.svg)](https://coveralls.io/github/qails/qails)
[![Dependency Status](https://david-dm.org/qails/qails.svg)](https://david-dm.org/qails/qails)

## Commands
```
# start
npm start

# lint
npm run lint

# build
npm run build
```

## Todo
- magicCase 插件在 modelbase 插件的 `update()` 中不起作用

## 依赖
- bodyParse 中间件必须启用，http verb 中默认不包含 `PUT` `PATCH` `DELETE`

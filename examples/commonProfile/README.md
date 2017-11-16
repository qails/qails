# Helloworld

本例演示了如何在 qails 中加载两种配置文件：

1. 不区分环境的项目通用配置，它可以是一个文件，也可以是多个文件。
2. 区分环境的专用配置，它包含四种类型：
    - env.local
    - env.development
    - env.beta
    - env.production

## 加载原则
当 key 值相同时，以先加载的配置为准

## 安装启动
在当前目录运行下面的命令，服务启动后访问 `http://localhost:12345` 即可看到效果。

```
npm install && npm start
```

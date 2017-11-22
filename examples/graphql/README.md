# Qails Example: GraphQL

本例演示如何使用 qails 实现 GraphQL server。

## 前提

- 需要有 `MySQL` 环境
- node >= 7.6 (推荐)

## 安装

1. 修改实例项目根目录下的 `.env` 中的数据库连接信息

    ```
    # mysql服务器地址
    MYSQL_HOST=localhost
    # mysql用户名
    MYSQL_USER=root
    # mysql密码
    MYSQL_PASSWORD=
    # mysql数据库名
    MYSQL_DATABASE=qails_example
    ```

2. 安装依赖和初始化数据库

    ```
    npm install && npm run seed && npm start
    ```

3. 访问 `http://localhost:12345/graphql` 即可看到效果。

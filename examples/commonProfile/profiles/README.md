# Profiles

在开发过程中，我们的软件会面对不同的运行环境，比如开发环境、测试环境、生产环境，而我们的软件在不同的环境中，有的配置可能会不一样，比如数据源配置、日志文件配置、以及一些软件运行过程中的基本配置，那每次我们将软件部署到不同的环境时，都需要修改相应的配置文件，这样来回修改，是个很麻烦的事情。我们需要一种方法能够让我们不用修改配置就能发布到不同的环境中的解决方案。熟悉 Java 的人可能知道，maven 有一个 profiles 的方案就是用来解决这类问题的。

在 qails 中，我们使用 [dotenv](https://github.com/motdotla/dotenv) 模拟了一套类似 maven 的 profile 方案。

## 工作原理

1. 工程初始化完成后，会在工程根目录建一个名为 `.env` 的配置文件，这个文件里只包含一个配置项，即 `NODE_ENV`

    ```
    # 设置当前环境类型，可选值有：[local/development/beta/production]
    NODE_ENV=local
    ```

2. 根据 `NODE_ENV` 的值加载 `profiles/${NODE_ENV}` 目录中的配置文件，因为使用的是递归加载，故目录中（包含子目录）的所有 `.env` 文件都会加载，可以按实际情况随意分组配置文件。

3. 最后加载公用配置 `profiles/common`，加载规则同上。

## 用法

直接从 `process.env` 中获取

```
const { NODE_ENV } = process.env;
```

也可以对 `process.env` 赋值来改变配置

```
process.env.NODE_ENV = 'production';
const { NODE_ENV } = process.env;
```

## 注意事项

- 目录加载的顺序如下:
    - /.env
    - /profiles/${NODE_ENV}/\*\*/*.env
    - /profiles/common/\*\*/*.env
- 文件按文件名顺序加载
- key值重复的配置 **先加载的有效**。
- 不应该在 `.env` 文件中存放除 `NODE_ENV` 外的其他配置。
- 只支持**字符串**类型变量，如果需要布尔型的开关变量，使用时必须做字符串比较
    ```
    if (process.env.ENABLE === 'true') {
      // do something
    }
    ```

/**
 * 配置 bookshelf 模型具有的特性
 * 实际上是通过该配置决定使用哪些 bookshelf 插件
 */

module.exports = {
  // 让 Model 具有自动注册到中央位置的功能
  MODEL_REGISTRY: false,
  // 让 Model 具有返回虚拟字段的功能
  MODEL_VIRTUALS: false,
  // 让 Model 调用 toJSON 方法时具有显示／隐藏某些字段的功能
  MODEL_VISIBILITY: false,
  // 让 Model 具有分页功能
  MODEL_PAGINATION: true,
  // 让 Model 具有时间戳、数据校验和部分CURD功能
  MODEL_BASE: true,
  // 让 Model 具有删除关联数据功能
  MODEL_CASCADEDELETE: true,
  // 让 Model 具有返回自定义字段的功能
  MODEL_MASK: true,
  // 让 Model 具有自动生成UUID的功能
  MODEL_UUID: false,
  // 让 Model 具有自动存储序列化对象的能力
  MODEL_JSONCOLUMNS: false,
  // 让 Model 具有自动转换对象 key 拼写的能力
  MODEL_MAGICCASE: false,
  // 让 Model 具有软删除记录的能力
  MODEL_SOFTDELETE: false
};
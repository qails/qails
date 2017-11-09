/**
 * 本路由使用 qails.resource 生成
 * 自动创建模型的 CRUD 操作，包含：
 *   - get /posts
 *   - get /posts/:id
 *   - post /posts
 *   - put/patch /posts/:id
 *   - delete /posts/:id
 */
import { Resource } from 'qails';
import Post from '../models/post';

export default Resource.define(Post);

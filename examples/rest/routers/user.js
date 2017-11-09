/**
 * 本路由使用 qails.resource 生成
 * 自动创建模型的 CRUD 操作，包含：
 *   - get /users
 *   - get /users/:id
 *   - post /users
 *   - put/patch /users/:id
 *   - delete /users/:id
 */
import { Resource } from 'qails';
import User from '../models/user';

export default Resource.define(User);

const dotenv = require('dotenv');

// 确保个性化profile先加载
dotenv.config({ path: './profiles/env.local' });

// 通用profile后加载
dotenv.config({ path: './profiles/env.common' });

// 可以加载多个通用profile，只要确保配置项的 key 值不重复即可
// dotenv.config({ path: './profiles/env.common2' });

require('./index');

/**
 * 默认配置文件
 *
 * 环境变量会覆盖这些默认值
 */

export default {
  // 版本信息
  version: '1.0.0',

  // 资源配置
  resources: {
    // 真题数据源
    questions: {
      // 本地存储路径
      localPath: './src/data/questions.json',

      // 远程API配置（可选）
      remote: {
        enabled: false,
        url: process.env.RESOURCE_API_URL || 'https://api.example.com',
        apiKey: process.env.RESOURCE_API_KEY || '',
      },

      // 自动更新间隔（毫秒）
      autoUpdateInterval: 24 * 60 * 60 * 1000, // 24小时
    },

    // 参考答案配置
    answers: {
      localPath: './src/data/answers.json',
    },
  },

  // 缓存配置
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' || true,
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 缓存时间（秒）
    maxSize: 100, // 最大缓存条目数
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
    file: process.env.LOG_FILE || null, // null 表示不写文件
  },

  // 对话配置
  conversation: {
    // 单次消息最大长度
    maxMessageLength: 5000,

    // 对话历史保留条数
    maxHistory: 20,

    // 答待用户回复的超时时间（毫秒）
    replyTimeout: 5 * 60 * 1000, // 5分钟
  },

  // 引导配置
  guidance: {
    // 每次引导的步骤数
    maxSteps: 5,

    // 是否提供多角度分析
    enableMultiplePerspectives: true,

    // 参考答案展示方式：full（完整）、summary（摘要）、none（不展示）
    answerDisplayMode: 'summary',
  },

  // OpenClaw 配置
  openclaw: {
    endpoint: process.env.OPENCLAW_ENDPOINT || 'ws://localhost:8080',
  },
};

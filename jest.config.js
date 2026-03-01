export default {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],

  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',  // 排除主入口
    '!src/config/**',  // 排除配置文件
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 转换配置
  transform: {},

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  // 设置
  verbose: true,
  coverage: true,
};

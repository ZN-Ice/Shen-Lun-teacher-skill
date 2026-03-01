/**
 * 日志工具
 *
 * 提供统一的日志记录功能，支持不同日志级别
 */

import fs from 'fs/promises';
import path from 'path';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  constructor(level = 'info', logFile = null) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.info;
    this.logFile = logFile;
  }

  /**
   * 格式化日志消息
   *
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @returns {string} 格式化后的日志
   */
  format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  /**
   * 写入日志
   *
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   */
  async write(level, message) {
    const formatted = this.format(level, message);

    // 输出到控制台
    console.log(formatted);

    // 写入文件（如果配置了）
    if (this.logFile) {
      try {
        await fs.appendFile(this.logFile, formatted + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Debug 级别日志
   *
   * @param {string} message - 日志消息
   */
  async debug(message) {
    if (this.level <= LOG_LEVELS.debug) {
      await this.write('debug', message);
    }
  }

  /**
   * Info 级别日志
   *
   * @param {string} message - 日志消息
   */
  async info(message) {
    if (this.level <= LOG_LEVELS.info) {
      await this.write('info', message);
    }
  }

  /**
   * Warn 级别日志
   *
   * @param {string} message - 日志消息
   */
  async warn(message) {
    if (this.level <= LOG_LEVELS.warn) {
      await this.write('warn', message);
    }
  }

  /**
   * Error 级别日志
   *
   * @param {string} message - 日志消息
   */
  async error(message) {
    if (this.level <= LOG_LEVELS.error) {
      await this.write('error', message);
    }
  }
}

// 创建默认 logger 实例
let defaultLogger = null;

/**
 * 获取或创建 logger 实例
 *
 * @param {string} level - 日志级别
 * @param {string} logFile - 日志文件路径
 * @returns {Logger} logger 实例
 */
export function getLogger(level = 'info', logFile = null) {
  if (!defaultLogger) {
    defaultLogger = new Logger(level, logFile);
  }
  return defaultLogger;
}

// 导出默认实例
export const logger = getLogger();

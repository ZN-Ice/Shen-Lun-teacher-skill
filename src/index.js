#!/usr/bin/env node

/**
 * 申论老师 - OpenClaw 接入主入口
 *
 * 这是 OpenClaw Skill 的主入口文件，负责接收用户消息并协调各个模块进行处理
 *
 * @module shenlun-teacher
 */

import { InteractionModule } from './modules/interaction.js';
import { ResourceModule } from './modules/resource.js';
import { GuideModule } from './modules/guide.js';
import { logger } from './utils/logger.js';
import config from './config/default.js';

// 初始化模块
const interactionModule = new InteractionModule();
const resourceModule = new ResourceModule();
const guideModule = new GuideModule(config);

/**
 * OpenClaw 主处理函数
 * 处理来自 OpenClaw 的用户消息
 *
 * @param {Object} context - 消息上下文
 * @param {string} context.message - 用户消息内容
 * @param {string} context.userId - 用户ID
 * @param {string} context.sessionId - 会话ID
 * @param {string} context.platform - 平台标识 (feishu/telegram/discord等)
 * @param {Object} context.metadata - 其他元数据
 * @returns {Promise<Object>} 处理结果
 * @returns {string} return.reply - 回复内容
 * @returns {Array} return.actions - 后续动作
 * @returns {Array} return.attachments - 附件
 */
export async function handleMessage(context) {
  const { message, userId, sessionId, platform } = context;

  try {
    logger.info(`[${platform}] User ${userId} (session: ${sessionId}): ${message}`);

    // 通过交互模块处理消息
    const result = await interactionModule.handleMessage(message, {
      userId,
      sessionId,
      platform,
      resourceModule,
      guideModule,
    });

    logger.info(`Reply: ${result.reply.substring(0, 100)}...`);

    return result;
  } catch (error) {
    logger.error(`Error handling message: ${error.message}`);
    return {
      reply: '抱歉，处理过程中出现了一些问题。请稍后再试。',
      actions: [],
      attachments: [],
    };
  }
}

/**
 * OpenClaw 健康检查函数
 * 用于检查 Skill 是否正常运行
 *
 * @returns {Promise<Object>} 健康状态
 * @returns {boolean} return.healthy - 是否健康
 * @returns {string} return.version - 版本号
 * @returns {string} return.status - 状态描述
 */
export async function healthCheck() {
  try {
    // 检查资源模块是否可访问
    const resourceHealth = await resourceModule.healthCheck();

    return {
      healthy: true,
      version: config.version,
      status: 'running',
      resources: resourceHealth,
    };
  } catch (error) {
    return {
      healthy: false,
      version: config.version,
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * 初始化函数
 * 在 Skill 加载时调用，用于初始化资源、加载数据等
 */
export async function initialize() {
  logger.info('Initializing 申论老师 Skill...');

  try {
    // 初始化资源模块
    await resourceModule.initialize();
    logger.info('Resource module initialized');

    // 初始化引导模块
    await guideModule.initialize();
    logger.info('Guide module initialized');

    logger.info('申论老师 Skill initialized successfully');
    return { success: true };
  } catch (error) {
    logger.error(`Failed to initialize: ${error.message}`);
    throw error;
  }
}

/**
 * 导出供 OpenClaw 使用的接口
 */
export default {
  handleMessage,
  healthCheck,
  initialize,
};

// 如果直接运行此文件（用于测试）
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('申论老师 Skill v' + config.version);
  console.log('这是 OpenClaw Skill 的主入口文件');
  console.log('请通过 OpenClaw 平台接入使用');
}

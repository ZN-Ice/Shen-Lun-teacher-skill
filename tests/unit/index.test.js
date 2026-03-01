/**
 * 主入口测试
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { handleMessage, healthCheck, initialize } from '../src/index.js';

describe('Main Entry', () => {
  beforeEach(async () => {
    await initialize();
  });

  describe('handleMessage', () => {
    it('should handle help message', async () => {
      const context = {
        message: '帮助',
        userId: 'test-user',
        sessionId: 'test-session',
        platform: 'feishu',
      };

      const result = await handleMessage(context);

      expect(result).toHaveProperty('reply');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('attachments');
      expect(result.reply).toContain('申论老师');
    });

    it('should handle list questions message', async () => {
      const context = {
        message: '真题',
        userId: 'test-user',
        sessionId: 'test-session',
        platform: 'feishu',
      };

      const result = await handleMessage(context);

      expect(result.reply).toContain('真题');
    });

    it('should handle get question message', async () => {
      const context = {
        message: '给我一道真题',
        userId: 'test-user',
        sessionId: 'test-session',
        platform: 'feishu',
      };

      const result = await handleMessage(context);

      expect(result.reply).toContain('真题');
    });

    it('should handle unknown message gracefully', async () => {
      const context = {
        message: '随便说点啥',
        userId: 'test-user',
        sessionId: 'test-session',
        platform: 'feishu',
      };

      const result = await handleMessage(context);

      expect(result.reply).toBeTruthy();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const health = await healthCheck();

      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('version');
      expect(health).toHaveProperty('status');
      expect(health.healthy).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should initialize without errors', async () => {
      await expect(initialize()).resolves.not.toThrow();
    });
  });
});

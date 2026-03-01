/**
 * 引导模块测试
 */

import { describe, it, expect } from '@jest/globals';
import { GuideModule } from '../src/modules/guide.js';

describe('GuideModule', () => {
  let guideModule;

  beforeEach(() => {
    guideModule = new GuideModule({});
  });

  describe('Initialization', () => {
    it('should initialize without errors', async () => {
      await expect(guideModule.initialize()).resolves.not.toThrow();
    });
  });

  describe('startGuidance', () => {
    it('should start guidance with intro message', async () => {
      const question = {
        id: 'q001',
        year: '2023',
        region: '国考',
        level: '副省级',
        title: '第一题',
        question: '题目内容',
        requirements: '作答要求',
      };

      const result = await guideModule.startGuidance('q001', 'user123', question);

      expect(result.phase).toBe('intro');
      expect(result.message).toContain('2023年');
      expect(result.message).toContain('国考');
    });

    it('should create user progress', async () => {
      const question = {
        id: 'q001',
        year: '2023',
        region: '国考',
        level: '副省级',
        title: '第一题',
        question: '题目内容',
        requirements: '作答要求',
      };

      await guideModule.startGuidance('q001', 'user123', question);

      const progress = guideModule.getUserProgress('user123');
      expect(progress).toBeTruthy();
      expect(progress.questionId).toBe('q001');
      expect(progress.step).toBe(1);
    });
  });

  describe('analyzeUserIdea', () => {
    it('should analyze user idea and provide feedback', async () => {
      const question = {
        id: 'q001',
        question: '根据"给定资料1"，请谈谈C市是如何推动人才生态建设的。',
        requirements: '准确、全面、有条理。不超过200字。',
      };

      const userIdea = '关键词是人才生态建设，作答要求是概括C市的具体做法';

      const result = await guideModule.analyzeUserIdea('q001', 'user123', userIdea, question);

      expect(result.phase).toBe('idea_feedback');
      expect(result.message).toBeTruthy();
    });
  });

  describe('analyzeAnswer', () => {
    it('should analyze user answer and return score', async () => {
      const userAnswer = 'C市通过优化政策体系、搭建服务平台、完善评价机制等方式，推动人才生态建设。';
      const referenceAnswer = {
        score: '20',
        keyPoints: ['优化政策', '搭建平台', '完善机制'],
      };

      const result = await guideModule.analyzeAnswer('q001', 'user123', userAnswer, referenceAnswer);

      expect(result.score).toBeTruthy();
      expect(result.score.estimated).toBeGreaterThan(0);
      expect(result.strengths).toBeInstanceOf(Array);
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('expandPerspectives', () => {
    it('should expand perspectives', async () => {
      const question = {
        id: 'q001',
      };

      const result = await guideModule.expandPerspectives('q001', question);

      expect(result).toContain('思路一');
      expect(result).toContain('思路二');
    });
  });

  describe('generateAnalysisReport', () => {
    it('should generate analysis report', () => {
      const analysis = {
        score: { estimated: 18, full: 20 },
        strengths: ['答案结构清晰'],
        weaknesses: ['需要更精炼'],
        suggestions: ['多练习真题'],
      };

      const referenceAnswer = {
        score: '20',
        keyPoints: ['要点1', '要点2'],
      };

      const report = guideModule.generateAnalysisReport(analysis, referenceAnswer, 'summary');

      expect(report).toContain('得分预估');
      expect(report).toContain('18/20');
      expect(report).toContain('优点');
      expect(report).toContain('待改进');
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      const question = {
        id: 'q001',
        year: '2023',
        region: '国考',
        level: '副省级',
        title: '第一题',
        question: '题目内容',
        requirements: '作答要求',
      };

      await guideModule.startGuidance('q001', 'user123', question);
      const progress = guideModule.getUserProgress('user123');

      expect(progress).toBeTruthy();
      expect(progress.questionId).toBe('q001');
    });

    it('should return null for non-existent user', () => {
      const progress = guideModule.getUserProgress('nonexistent');
      expect(progress).toBeNull();
    });
  });

  describe('clearUserProgress', () => {
    it('should clear user progress', async () => {
      const question = {
        id: 'q001',
        year: '2023',
        region: '国考',
        level: '副省级',
        title: '第一题',
        question: '题目内容',
        requirements: '作答要求',
      };

      await guideModule.startGuidance('q001', 'user123', question);
      guideModule.clearUserProgress('user123');

      const progress = guideModule.getUserProgress('user123');
      expect(progress).toBeNull();
    });
  });
});

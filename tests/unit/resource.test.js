/**
 * 资源模块测试
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ResourceModule } from '../src/modules/resource.js';

describe('ResourceModule', () => {
  let resourceModule;

  beforeEach(() => {
    resourceModule = new ResourceModule({
      questions: {
        localPath: './src/data/questions.json',
      },
      answers: {
        localPath: './src/data/answers.json',
      },
    });
  });

  describe('Initialization', () => {
    it('should initialize without errors', async () => {
      await expect(resourceModule.initialize()).resolves.not.toThrow();
    });

    it('should load questions from local storage', async () => {
      await resourceModule.initialize();
      expect(resourceModule.questions.length).toBeGreaterThan(0);
    });

    it('should load answers from local storage', async () => {
      await resourceModule.initialize();
      expect(resourceModule.answers.length).toBeGreaterThan(0);
    });
  });

  describe('getQuestions', () => {
    beforeEach(async () => {
      await resourceModule.initialize();
    });

    it('should return all questions without filters', () => {
      const questions = resourceModule.getQuestions();
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should filter by year', () => {
      const questions = resourceModule.getQuestions({ year: '2023' });
      questions.forEach(q => expect(q.year).toBe('2023'));
    });

    it('should filter by region', () => {
      const questions = resourceModule.getQuestions({ region: '国考' });
      questions.forEach(q => expect(q.region).toBe('国考'));
    });

    it('should filter by difficulty', () => {
      const questions = resourceModule.getQuestions({ difficulty: 'easy' });
      questions.forEach(q => expect(q.difficulty).toBe('easy'));
    });
  });

  describe('getQuestionById', () => {
    beforeEach(async () => {
      await resourceModule.initialize();
    });

    it('should return question by ID', () => {
      const question = resourceModule.getQuestionById('q001');
      expect(question).toBeTruthy();
      expect(question.id).toBe('q001');
    });

    it('should return null for non-existent ID', () => {
      const question = resourceModule.getQuestionById('q999');
      expect(question).toBeNull();
    });
  });

  describe('getAnswer', () => {
    beforeEach(async () => {
      await resourceModule.initialize();
    });

    it('should return answer for existing question', () => {
      const answer = resourceModule.getAnswer('q001');
      expect(answer).toBeTruthy();
      expect(answer.questionId).toBe('q001');
    });

    it('should return null for non-existent question', () => {
      const answer = resourceModule.getAnswer('q999');
      expect(answer).toBeNull();
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      await resourceModule.initialize();
      const health = await resourceModule.healthCheck();
      expect(health.initialized).toBe(true);
      expect(health.status).toBe('ok');
    });
  });
});

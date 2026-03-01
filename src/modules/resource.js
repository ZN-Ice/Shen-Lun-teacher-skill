/**
 * 资源模块
 *
 * 负责管理申论真题和参考答案资源
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import { httpClient } from '../utils/http-client.js';
import { cache } from '../utils/cache.js';

class ResourceModule {
  constructor(config) {
    this.config = config?.resources || {};
    this.questions = [];
    this.answers = [];
    this.initialized = false;
  }

  /**
   * 初始化资源模块
   */
  async initialize() {
    try {
      // 加载本地真题数据
      await this.loadQuestions();

      // 加载本地答案数据
      await this.loadAnswers();

      this.initialized = true;
      logger.info('Resource module initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize resource module: ${error.message}`);
      throw error;
    }
  }

  /**
   * 加载本地真题数据
   */
  async loadQuestions() {
    try {
      const dataPath = path.join(process.cwd(), this.config.questions.localPath);
      const data = await fs.readFile(dataPath, 'utf-8');
      this.questions = JSON.parse(data);
      logger.info(`Loaded ${this.questions.length} questions from local storage`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Questions data file not found, creating default data');
        await this.createDefaultQuestions();
      } else {
        logger.error(`Failed to load questions: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * 加载本地答案数据
   */
  async loadAnswers() {
    try {
      const dataPath = path.join(process.cwd(), this.config.answers.localPath);
      const data = await fs.readFile(dataPath, 'utf-8');
      this.answers = JSON.parse(data);
      logger.info(`Loaded ${this.answers.length} answers from local storage`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Answers data file not found, creating default data');
        await this.createDefaultAnswers();
      } else {
        logger.error(`Failed to load answers: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * 创建默认真题数据
   */
  async createDefaultQuestions() {
    const defaultQuestions = [
      {
        id: 'q001',
        year: '2023',
        region: '国考',
        level: '副省级',
        title: '第一题',
        question: '根据"给定资料1"，请谈谈C市是如何推动人才生态建设的。',
        requirements: '准确、全面、有条理。不超过200字。',
        score: 20,
        difficulty: 'medium',
        tags: ['人才', '生态建设', '创新'],
      },
      {
        id: 'q002',
        year: '2023',
        region: '国考',
        level: '地市级',
        title: '第一题',
        question: '根据"给定资料1"，请概括L县在推进乡村产业发展中的主要做法。',
        requirements: '准确、简明。不超过150字。',
        score: 15,
        difficulty: 'easy',
        tags: ['乡村振兴', '产业发展', '三农'],
      },
      {
        id: 'q003',
        year: '2022',
        region: '国考',
        level: '副省级',
        title: '第二题',
        question: '根据"给定资料2"，请你分析"数字鸿沟"产生的原因，并提出解决对策。',
        requirements: '分析准确，对策具体。不超过350字。',
        score: 25,
        difficulty: 'hard',
        tags: ['数字化', '社会公平', '对策'],
      },
    ];

    this.questions = defaultQuestions;

    // 保存到文件
    const dataPath = path.join(process.cwd(), this.config.questions.localPath);
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(defaultQuestions, null, 2), 'utf-8');

    logger.info(`Created default questions data with ${defaultQuestions.length} questions`);
  }

  /**
   * 创建默认答案数据
   */
  async createDefaultAnswers() {
    const defaultAnswers = [
      {
        id: 'a001',
        questionId: 'q001',
        score: '20',
        keyPoints: [
          '优化人才政策体系，出台人才引进和培养政策',
          '搭建人才服务平台，提供全方位服务',
          '完善人才评价机制，建立多元化评价体系',
          '营造良好人才环境，提升城市吸引力',
        ],
        fullAnswer: 'C市通过优化政策体系、搭建服务平台、完善评价机制、营造良好环境等方式，推动人才生态建设。一是出台人才引进和培养政策，加大政策支持力度；二是搭建一站式服务平台，提供全方位服务保障；三是建立多元化评价机制，激发人才创新活力；四是营造尊重人才的社会氛围，提升城市对人才的吸引力。',
        source: '官方参考答案',
      },
      {
        id: 'a002',
        questionId: 'q002',
        score: '15',
        keyPoints: [
          '发展特色农业，打造品牌',
          '推进产业融合，延长产业链',
          '加强科技支撑，提升品质',
          '培育新型经营主体，带动农户增收',
        ],
        fullAnswer: 'L县主要做法包括：一是发展特色农业，打造农产品品牌，提升市场竞争力；二是推进产业融合，发展农产品加工和乡村旅游，延长产业链条；三是加强科技支撑，引进先进技术，提升农产品品质；四是培育龙头企业、合作社等新型经营主体，通过"企业+农户"模式带动农户增收致富。',
        source: '官方参考答案',
      },
      {
        id: 'a003',
        questionId: 'q003',
        score: '25',
        keyPoints: [
          '原因：基础设施差距、数字技能缺乏、设计服务不足、政策支持不够',
          '对策：完善基础设施、加强培训教育、优化产品设计、强化政策保障',
        ],
        fullAnswer: '"数字鸿沟"产生的原因主要包括：一是基础设施不完善，部分地区网络覆盖不足；二是群体数字技能缺乏，老年人等群体使用数字技术困难；三是产品设计和服务不够友好，用户体验不佳；四是政策支持和保障不到位。\n\n解决对策：第一，加快数字基础设施建设，推进网络全覆盖；第二，加强数字技能培训教育，提高全民数字素养；第三，优化数字产品设计，提供适老化等服务；第四，完善政策法规，为消除数字鸿沟提供制度保障。',
        source: '官方参考答案',
      },
    ];

    this.answers = defaultAnswers;

    // 保存到文件
    const dataPath = path.join(process.cwd(), this.config.answers.localPath);
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(defaultAnswers, null, 2), 'utf-8');

    logger.info(`Created default answers data with ${defaultAnswers.length} answers`);
  }

  /**
   * 获取真题列表
   *
   * @param {Object} filters - 过滤条件
   * @param {string} filters.year - 年份
   * @param {string} filters.region - 地区
   * @param {string} filters.level - 级别
   * @param {string} filters.difficulty - 难度
   * @returns {Array} 真题列表
   */
  getQuestions(filters = {}) {
    let results = [...this.questions];

    // 应用过滤条件
    if (filters.year) {
      results = results.filter((q) => q.year === filters.year);
    }
    if (filters.region) {
      results = results.filter((q) => q.region === filters.region);
    }
    if (filters.level) {
      results = results.filter((q) => q.level === filters.level);
    }
    if (filters.difficulty) {
      results = results.filter((q) => q.difficulty === filters.difficulty);
    }

    return results;
  }

  /**
   * 根据 ID 获取真题
   *
   * @param {string} questionId - 真题ID
   * @returns {Object|null} 真题数据
   */
  getQuestionById(questionId) {
    return this.questions.find((q) => q.id === questionId) || null;
  }

  /**
   * 根据标签搜索真题
   *
   * @param {string} tag - 标签
   * @returns {Array} 真题列表
   */
  searchByTag(tag) {
    return this.questions.filter((q) => q.tags && q.tags.includes(tag));
  }

  /**
   * 获取参考答案
   *
   * @param {string} questionId - 真题ID
   * @returns {Object|null} 参考答案
   */
  getAnswer(questionId) {
    // 先检查缓存
    const cacheKey = `answer:${questionId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const answer = this.answers.find((a) => a.questionId === questionId) || null;

    // 缓存结果
    if (answer) {
      cache.set(cacheKey, answer, 3600);
    }

    return answer;
  }

  /**
   * 获取答案要点
   *
   * @param {string} questionId - 真题ID
   * @returns {Array} 答案要点
   */
  getAnswerKeyPoints(questionId) {
    const answer = this.getAnswer(questionId);
    return answer ? answer.keyPoints : [];
  }

  /**
   * 健康检查
   *
   * @returns {Promise<Object>} 健康状态
   */
  async healthCheck() {
    return {
      initialized: this.initialized,
      questionsCount: this.questions.length,
      answersCount: this.answers.length,
      status: 'ok',
    };
  }
}

export { ResourceModule };

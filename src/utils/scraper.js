/**
 * 网页爬虫工具
 *
 * 用于从爱真题等网站爬取申论真题和解析
 */

import { httpClient } from './http-client.js';
import { logger } from './logger.js';
import { JSDOM } from 'jsdom';

class Scraper {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://www.aipta.com';
    this.timeout = options.timeout || 30000; // 30秒超时
    this.userAgent = options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.retryDelay = options.retryDelay || 2000;
  }

  /**
   * 获取网页内容
   *
   * @param {string} url - 目标URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 解析后的数据
   */
  async fetchPage(url, options = {}) {
    try {
      logger.debug(`Fetching page: ${url}`);

      const response = await httpClient.request(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        timeout: options.timeout || this.timeout,
      });

      return response;
    } catch (error) {
      logger.error(`Failed to fetch page ${url}: ${error.message}`);
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  /**
   * 解析爱真题网站
   *
   * @param {string} url - 爱真题页面URL
   * @returns {Promise<Array>} 解析后的真题列表
   */
  async scrapeAipta(url) {
    try {
      const html = await this.fetchPage(url);

      // 创建 DOM 环境
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // 查找真题列表 - 需要根据实际网站结构调整
      const questions = this.parseAiptaQuestions(document);

      logger.info(`Scraped ${questions.length} questions from ${url}`);
      return questions;
    } catch (error) {
      logger.error(`Failed to scrape Aipta: ${error.message}`);
      throw error;
    }
  }

  /**
   * 解析爱真题页面的真题列表
   *
   * @param {Document} document - DOM 文档
   * @returns {Array} 真题列表
   */
  parseAiptaQuestions(document) {
    const questions = [];

    try {
      // 根据爱真题网站的实际结构调整选择器
      // 这里是常见的结构，需要根据实际情况修改

      // 查找所有真题链接
      const questionLinks = document.querySelectorAll('a[href*="/zt/"], a[href*="试卷"], a[href*="真题"]');

      questionLinks.forEach((link, index) => {
        const title = link.textContent.trim();
        const href = link.getAttribute('href');

        // 跳过空标题或非真题链接
        if (!title || title.length < 5) return;
        if (!href || href.includes('javascript')) return;

        // 提取年份和地区信息
        const yearMatch = title.match(/(20\d{2})/);
        const year = yearMatch ? yearMatch[1] : '';

        const regionMatch = title.match(/(湖南|北京|上海|广东|江苏|浙江|山东|四川|湖北)/);
        const region = regionMatch ? regionMatch[1] : '';

        // 判断级别
        const level = title.includes('省考') ? '省考' : title.includes('国考') ? '国考' : '';

        // 构建完整 URL
        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

        questions.push({
          id: `q_aipta_${Date.now()}_${index}`,
          source: 'aipta',
          title,
          year,
          region: region || '湖南', // 默认湖南
          level: level || '省考',
          url: fullUrl,
          scrapedAt: new Date().toISOString(),
        });
      });

      // 去重
      const uniqueQuestions = questions.filter((q, i, arr) =>
        i === arr.findIndex(t => t.title === q.title)
      );

      return uniqueQuestions;
    } catch (error) {
      logger.error(`Failed to parse Aipta questions: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取真题详情
   *
   * @param {string} url - 真题详情页URL
   * @returns {Promise<Object>} 真题详情
   */
  async getQuestionDetail(url) {
    try {
      const html = await this.fetchPage(url);

      const dom = new JSDOM(html);
      const document = dom.window.document;

      // 提取题目内容
      const questionContent = this.extractQuestionContent(document);
      const requirements = this.extractRequirements(document);
      const answer = await this.extractAnswer(url);

      return {
        question: questionContent,
        requirements,
        answer,
        url,
      };
    } catch (error) {
      logger.error(`Failed to get question detail from ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 提取题目内容
   *
   * @param {Document} document - DOM 文档
   * @returns {string} 题目内容
   */
  extractQuestionContent(document) {
    // 根据实际网站结构调整
    const contentSelectors = [
      '.question-content',
      '.exam-content',
      '.paper-content',
      '.content',
      'article',
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.body.textContent.substring(0, 1000);
  }

  /**
   * 提取作答要求
   *
   * @param {Document} document - DOM 文档
   * @returns {string} 作答要求
   */
  extractRequirements(document) {
    // 常见的作答要求关键词
    const keywords = ['要求', '不超过', '字数', '条理', '准确', '全面'];
    const text = document.body.textContent;

    for (const keyword of keywords) {
      const index = text.indexOf(keyword);
      if (index !== -1) {
        // 提取关键词附近的文本
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + 100);
        return text.substring(start, end).trim();
      }
    }

    return '准确、全面、有条理';
  }

  /**
   * 提取参考答案
   *
   * @param {string} url - 真题URL
   * @returns {Promise<Object|null>} 参考答案
   */
  async extractAnswer(url) {
    try {
      // 尝试访问答案页面（通常在原URL后加上 /answer 或 /jx）
      const answerUrls = [
        `${url}/answer`,
        `${url}/jx`,
        `${url.replace('/zt/', '/jx/')}`,
      ];

      for (const answerUrl of answerUrls) {
        try {
          const html = await this.fetchPage(answerUrl);
          const dom = new JSDOM(html);
          const document = dom.window.document;

          // 查找答案内容
          const answerSelectors = [
            '.answer-content',
            '.jx-content',
            '.reference-answer',
            '.answer',
          ];

          for (const selector of answerSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 50) {
              return {
                content: element.textContent.trim(),
                url: answerUrl,
                source: 'aipta',
              };
            }
          }
        } catch (error) {
          // 继续尝试下一个URL
          continue;
        }
      }

      return null;
    } catch (error) {
      logger.warn(`Failed to extract answer: ${error.message}`);
      return null;
    }
  }

  /**
   * 批量下载真题
   *
   * @param {string} baseUrl - 基础URL
   * @param {number} limit - 下载限制数量
   * @returns {Promise<Array>} 下载的真题列表
   */
  async downloadQuestions(baseUrl, limit = 50) {
    try {
      logger.info(`Starting batch download from ${baseUrl}, limit: ${limit}`);

      // 获取真题列表
      const questions = await this.scrapeAipta(baseUrl);

      // 限制下载数量
      const limitedQuestions = questions.slice(0, limit);

      logger.info(`Found ${questions.length} questions, downloading ${limitedQuestions.length}`);

      // 获取每道题的详情
      const details = [];
      for (let i = 0; i < limitedQuestions.length; i++) {
        const q = limitedQuestions[i];
        logger.debug(`Downloading detail ${i + 1}/${limitedQuestions.length}: ${q.title}`);

        try {
          const detail = await this.getQuestionDetail(q.url);
          details.push({
            ...q,
            ...detail,
          });

          // 延迟，避免请求过快
          if (i < limitedQuestions.length - 1) {
            await this.sleep(1000);
          }
        } catch (error) {
          logger.warn(`Failed to download detail for ${q.title}: ${error.message}`);
        }
      }

      logger.info(`Downloaded ${details.length} question details`);
      return details;
    } catch (error) {
      logger.error(`Batch download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 转换为标准真题格式
   *
   * @param {Object} rawQuestion - 原始真题数据
   * @returns {Object} 标准格式真题
   */
  normalizeQuestion(rawQuestion) {
    return {
      id: rawQuestion.id,
      year: rawQuestion.year,
      region: rawQuestion.region,
      level: rawQuestion.level,
      title: rawQuestion.title || rawQuestion.id.split('_').pop(),
      question: rawQuestion.question || rawQuestion.question_content || '',
      requirements: rawQuestion.requirements || '准确、全面、有条理',
      score: this.estimateScore(rawQuestion.question),
      difficulty: this.estimateDifficulty(rawQuestion.question),
      tags: this.extractTags(rawQuestion.question),
      source: rawQuestion.source,
      url: rawQuestion.url,
    };
  }

  /**
   * 转换为标准答案格式
   *
   * @param {Object} rawQuestion - 原始真题数据
   * @returns {Object} 标准格式答案
   */
  normalizeAnswer(rawQuestion) {
    return {
      id: `a_${rawQuestion.id.replace('q_', '')}`,
      questionId: rawQuestion.id,
      score: this.estimateScore(rawQuestion.question).toString(),
      keyPoints: this.extractKeyPoints(rawQuestion.answer?.content),
      fullAnswer: rawQuestion.answer?.content || '',
      source: rawQuestion.answer?.source || 'aipta',
      url: rawQuestion.answer?.url,
    };
  }

  /**
   * 估算分数
   *
   * @param {string} questionText - 题目文本
   * @returns {number} 估算分数
   */
  estimateScore(questionText) {
    if (!questionText) return 20;

    // 根据字数估算分数
    if (questionText.length < 200) return 15;
    if (questionText.length < 400) return 20;
    if (questionText.length < 600) return 25;
    return 30;
  }

  /**
   * 估算难度
   *
   * @param {string} questionText - 题目文本
   * @returns {string} 难度等级
   */
  estimateDifficulty(questionText) {
    if (!questionText) return 'medium';

    const text = questionText.toLowerCase();

    // 根据关键词判断难度
    if (text.includes('概括') || text.includes('总结')) {
      return 'easy';
    }
    if (text.includes('分析') || text.includes('论述')) {
      return 'medium';
    }
    if (text.includes('对策') || text.includes('建议') || text.includes('启示')) {
      return 'hard';
    }

    return 'medium';
  }

  /**
   * 提取标签
   *
   * @param {string} text - 文本
   * @returns {Array} 标签列表
   */
  extractTags(text) {
    if (!text) return [];

    const tags = [];
    const keywords = [
      '人才', '生态', '乡村振兴', '产业发展', '数字化',
      '创新', '治理', '服务', '政策', '发展',
      '经济', '社会', '文化', '教育', '医疗',
    ];

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // 去重
  }

  /**
   * 提取答案要点
   *
   * @param {string} answerText - 答案文本
   * @returns {Array} 要点列表
   */
  extractKeyPoints(answerText) {
    if (!answerText) return [];

    const keyPoints = [];

    // 按换行或标点分割
    const sentences = answerText.split(/[\n。；；;]/);

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 10 && trimmed.length < 100) {
        // 提取要点关键词
        if (trimmed.match(/^(一|二|三|四|五|第一|第二|第三|首先|其次|再次|最后)/)) {
          keyPoints.push(trimmed.substring(trimmed.indexOf('是') + 2 || 0));
        }
      }
    });

    return keyPoints.length > 0 ? keyPoints : [answerText.substring(0, 50)];
  }

  /**
   * 睡眠函数
   *
   * @param {number} ms - 毫秒
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { Scraper };

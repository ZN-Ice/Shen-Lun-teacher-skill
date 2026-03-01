/**
 * 引导模块
 *
 * 负责引导用户答题、分析答案、提供优化建议
 */

import { logger } from '../utils/logger.js';

class GuideModule {
  constructor(config) {
    this.config = config?.guidance || {};
    this.userProgress = new Map();
  }

  /**
   * 初始化引导模块
   */
  async initialize() {
    logger.info('Guide module initialized');
  }

  /**
   * 开始答题引导
   *
   * @param {string} questionId - 真题ID
   * @param {string} userId - 用户ID
   * @param {Object} question - 真题数据
   * @returns {Object} 引导响应
   */
  async startGuidance(questionId, userId, question) {
    logger.info(`Starting guidance for user ${userId}, question ${questionId}`);

    // 初始化用户进度
    this.userProgress.set(userId, {
      questionId,
      step: 1,
      startTime: Date.now(),
    });

    return {
      phase: 'intro',
      message: this.generateIntroMessage(question),
      nextAction: 'analyze_materials',
    };
  }

  /**
   * 生成引导介绍消息
   *
   * @param {Object} question - 真题数据
   * @returns {string} 介绍消息
   */
  generateIntroMessage(question) {
    return `很好！我们来看这道真题：\n\n` +
           `【${question.year}年 ${question.region} ${question.level} ${question.title}】\n\n` +
           `📋 题目要求：\n${question.question}\n\n` +
           `⚠️ 注意：${question.requirements}\n\n` +
           `让我们分步骤来分析这道题。\n\n` +
           `第一步：仔细阅读题目，找出关键词和作答要求。\n` +
           `你觉得这道题的关键词是什么？作答时要注意什么？`;
  }

  /**
   * 分析用户思路
   *
   * @param {string} questionId - 真题ID
   * @param {string} userId - 用户ID
   * @param {string} userIdea - 用户思路
   * @param {Object} question - 真题数据
   * @returns {Object} 分析响应
   */
  async analyzeUserIdea(questionId, userId, userIdea, question) {
    logger.info(`Analyzing user idea for ${userId}, question ${questionId}`);

    const feedback = this.generateIdeaFeedback(userIdea, question);

    // 更新用户进度
    const progress = this.userProgress.get(userId);
    if (progress) {
      progress.step = 2;
    }

    return {
      phase: 'idea_feedback',
      message: feedback.message,
      highlights: feedback.highlights,
      suggestions: feedback.suggestions,
      nextAction: 'draft_answer',
    };
  }

  /**
   * 生成思路反馈
   *
   * @param {string} userIdea - 用户思路
   * @param {Object} question - 真题数据
   * @returns {Object} 反馈内容
   */
  generateIdeaFeedback(userIdea, question) {
    const feedback = {
      highlights: [],
      suggestions: [],
      message: '',
    };

    // 简单的关键词匹配（实际可以使用更复杂的NLP）
    const keywords = this.extractKeywords(question.question);

    const matchedKeywords = keywords.filter(kw => userIdea.includes(kw));

    if (matchedKeywords.length > 0) {
      feedback.highlights.push(`✓ 你识别到了以下关键词：${matchedKeywords.join('、')}`);
    } else {
      feedback.suggestions.push('建议重新审题，找出题目中的关键词');
    }

    // 检查字数要求
    const lengthMatch = question.requirements.match(/不超过(\d+)字/);
    if (lengthMatch) {
      const maxLength = parseInt(lengthMatch[1]);
      feedback.suggestions.push(`注意字数限制：不超过${maxLength}字`);
    }

    // 生成消息
    feedback.message = this.buildFeedbackMessage(feedback);

    return feedback;
  }

  /**
   * 提取关键词
   *
   * @param {string} text - 文本
   * @returns {Array} 关键词列表
   */
  extractKeywords(text) {
    const keywords = [];
    const patterns = [
      /概括|总结|归纳/, // 概括类动词
      /分析|探讨|论述/, // 分析类动词
      /对策|建议|措施/, // 对策类词汇
      /原因|影响|意义/, // 原因类词汇
      /做法|经验|启示/, // 做法类词汇
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    });

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 构建反馈消息
   *
   * @param {Object} feedback - 反馈数据
   * @returns {string} 反馈消息
   */
  buildFeedbackMessage(feedback) {
    let message = '';

    if (feedback.highlights.length > 0) {
      message += '很好！你的分析有这些亮点：\n\n';
      feedback.highlights.forEach(h => {
        message += `${h}\n`;
      });
      message += '\n';
    }

    if (feedback.suggestions.length > 0) {
      message += '不过，还有几点可以改进：\n\n';
      feedback.suggestions.forEach(s => {
        message += `• ${s}\n`;
      });
    }

    message += '\n现在可以开始构思你的答案框架了。需要我提供一些答题模板吗？';

    return message;
  }

  /**
   * 分析用户答案
   *
   * @param {string} questionId - 真题ID
   * @param {string} userId - 用户ID
   * @param {string} userAnswer - 用户答案
   * @param {Object} referenceAnswer - 参考答案
   * @returns {Object} 分析结果
   */
  async analyzeAnswer(questionId, userId, userAnswer, referenceAnswer) {
    logger.info(`Analyzing answer for ${userId}, question ${questionId}`);

    const analysis = {
      score: this.estimateScore(userAnswer, referenceAnswer),
      strengths: [],
      weaknesses: [],
      suggestions: [],
      scoreBreakdown: {},
    };

    // 分析答案结构
    const structure = this.analyzeStructure(userAnswer);
    analysis.scoreBreakdown.structure = structure.score;
    if (structure.score > 0) {
      analysis.strengths.push(structure.strength);
    } else {
      analysis.weaknesses.push(structure.weakness);
    }

    // 分析内容完整性
    const content = this.analyzeContent(userAnswer, referenceAnswer);
    analysis.scoreBreakdown.content = content.score;
    if (content.score > 0) {
      analysis.strengths.push(content.strength);
    } else {
      analysis.weaknesses.push(content.weakness);
    }

    // 分析语言表达
    const language = this.analyzeLanguage(userAnswer);
    analysis.scoreBreakdown.language = language.score;
    if (language.score > 0) {
      analysis.strengths.push(language.strength);
    } else {
      analysis.weaknesses.push(language.weakness);
    }

    // 生成优化建议
    analysis.suggestions = this.generateSuggestions(analysis);

    // 更新用户进度
    const progress = this.userProgress.get(userId);
    if (progress) {
      progress.step = 3;
      progress.completed = true;
    }

    return analysis;
  }

  /**
   * 估算分数
   *
   * @param {string} userAnswer - 用户答案
   * @param {Object} referenceAnswer - 参考答案
   * @returns {Object} 分数信息
   */
  estimateScore(userAnswer, referenceAnswer) {
    const fullScore = parseInt(referenceAnswer.score);
    const userLength = userAnswer.length;

    // 简单评分逻辑（实际可以使用更复杂的算法）
    let score = 0;

    // 检查答案长度
    if (userLength > 50) {
      score = fullScore * 0.6; // 基础分
    }

    // 检查要点覆盖
    const keyPoints = referenceAnswer.keyPoints || [];
    let coveredPoints = 0;
    keyPoints.forEach(point => {
      if (userAnswer.includes(point.substring(0, 4))) {
        coveredPoints++;
      }
    });

    if (keyPoints.length > 0) {
      score += (coveredPoints / keyPoints.length) * fullScore * 0.4;
    }

    return {
      estimated: Math.min(fullScore, Math.round(score)),
      full: fullScore,
    };
  }

  /**
   * 分析答案结构
   *
   * @param {string} answer - 答案
   * @returns {Object} 结构分析
   */
  analyzeStructure(answer) {
    const sentences = answer.split(/[。！？；\n]/).filter(s => s.trim());
    const hasStructure = sentences.length >= 3;

    if (hasStructure) {
      return {
        score: 10,
        strength: '答案结构清晰，分段合理',
      };
    } else {
      return {
        score: 5,
        strength: '',
        weakness: '建议增加段落层次，使答案更有条理',
      };
    }
  }

  /**
   * 分析内容完整性
   *
   * @param {string} userAnswer - 用户答案
   * @param {Object} referenceAnswer - 参考答案
   * @returns {Object} 内容分析
   */
  analyzeContent(userAnswer, referenceAnswer) {
    const keyPoints = referenceAnswer.keyPoints || [];
    let covered = 0;

    keyPoints.forEach(point => {
      if (userAnswer.length > 100) {
        covered++;
      }
    });

    const coverage = keyPoints.length > 0 ? covered / keyPoints.length : 0;

    if (coverage >= 0.7) {
      return {
        score: 15,
        strength: '要点覆盖全面，内容充实',
      };
    } else if (coverage >= 0.4) {
      return {
        score: 10,
        strength: '主要要点已覆盖，但可以更全面',
      };
    } else {
      return {
        score: 5,
        strength: '',
        weakness: '要点覆盖不足，建议补充遗漏的要点',
      };
    }
  }

  /**
   * 分析语言表达
   *
   * @param {string} answer - 答案
   * @returns {Object} 语言分析
   */
  analyzeLanguage(answer) {
    const words = answer.split('');
    const avgWordLength = words.length / answer.split(/\s+/).length;

    if (answer.length > 100 && avgWordLength > 1.5) {
      return {
        score: 10,
        strength: '语言表达流畅，用词准确',
      };
    } else {
      return {
        score: 7,
        strength: '语言表达基本清晰',
        weakness: '建议用词更精炼，避免口语化表达',
      };
    }
  }

  /**
   * 生成优化建议
   *
   * @param {Object} analysis - 分析结果
   * @returns {Array} 建议列表
   */
  generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.weaknesses.length > 0) {
      suggestions.push(...analysis.weaknesses);
    }

    suggestions.push('建议多练习真题，熟悉不同题型的答题要点');
    suggestions.push('注意控制字数，既要充分又要精炼');

    return suggestions;
  }

  /**
   * 生成分析报告
   *
   * @param {Object} analysis - 分析结果
   * @param {Object} referenceAnswer - 参考答案
   * @param {string} answerDisplayMode - 答案展示模式
   * @returns {string} 分析报告
   */
  generateAnalysisReport(analysis, referenceAnswer, answerDisplayMode) {
    let report = '';

    report += '我分析了你的答案，整体来看：\n\n';

    // 分数
    report += `📊 **得分预估：${analysis.score.estimated}/${analysis.score.full}分**\n\n`;

    // 优点
    if (analysis.strengths.length > 0) {
      report += '✅ **优点：**\n';
      analysis.strengths.forEach(s => {
        report += `- ${s}\n`;
      });
      report += '\n';
    }

    // 待改进
    if (analysis.weaknesses.length > 0) {
      report += '⚠️ **待改进：**\n';
      analysis.weaknesses.forEach(w => {
        report += `- ${w}\n`;
      });
      report += '\n';
    }

    // 优化建议
    if (analysis.suggestions.length > 0) {
      report += '💡 **优化建议：**\n';
      analysis.suggestions.slice(0, 3).forEach(s => {
        report += `- ${s}\n`;
      });
      report += '\n';
    }

    // 参考答案
    if (answerDisplayMode === 'summary' && referenceAnswer) {
      report += '📝 **参考答案要点：**\n';
      referenceAnswer.keyPoints.forEach(point => {
        report += `- ${point}\n`;
      });
      report += '\n';
      report += '需要我展示完整参考答案吗？';
    }

    return report;
  }

  /**
   * 拓展答题思路
   *
   * @param {string} questionId - 真题ID
   * @param {Object} question - 真题数据
   * @returns {string} 拓展思路
   */
  async expandPerspectives(questionId, question) {
    logger.info(`Expanding perspectives for question ${questionId}`);

    return `针对这道题目，我提供几种不同的答题思路供你参考：\n\n` +
           `**思路一：结构化分析**\n` +
           `按照"是什么-为什么-怎么办"的逻辑展开\n\n` +
           `**思路二：问题导向**\n` +
           `从问题出发，逐个分析原因和对策\n\n` +
           `**思路三：政策分析**\n` +
           `结合相关政策文件，分析政策导向和实施路径\n\n` +
           `你可以根据材料内容和个人理解，选择适合的思路进行答题。`;
  }

  /**
   * 获取用户进度
   *
   * @param {string} userId - 用户ID
   * @returns {Object|null} 用户进度
   */
  getUserProgress(userId) {
    return this.userProgress.get(userId) || null;
  }

  /**
   * 清除用户进度
   *
   * @param {string} userId - 用户ID
   */
  clearUserProgress(userId) {
    this.userProgress.delete(userId);
  }
}

export { GuideModule };

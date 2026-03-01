/**
 * 交互模块
 *
 * 负责处理用户消息、生成回复、管理对话历史
 */

import { logger } from '../utils/logger.js';

class InteractionModule {
  constructor() {
    this.conversationHistory = new Map();
    this.userStates = new Map();
  }

  /**
   * 处理用户消息
   *
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleMessage(message, context) {
    const { userId, sessionId, resourceModule, guideModule } = context;

    // 清理消息
    const cleanMessage = message.trim();

    // 识别用户意图
    const intent = this.recognizeIntent(cleanMessage);

    // 根据意图处理
    let result;
    switch (intent) {
      case 'help':
        result = this.handleHelp();
        break;
      case 'list_questions':
        result = await this.handleListQuestions(context);
        break;
      case 'get_question':
        result = await this.handleGetQuestion(cleanMessage, context);
        break;
      case 'submit_idea':
        result = await this.handleSubmitIdea(cleanMessage, context);
        break;
      case 'submit_answer':
        result = await this.handleSubmitAnswer(cleanMessage, context);
        break;
      case 'expand_perspectives':
        result = await this.handleExpandPerspectives(context);
        break;
      case 'show_reference':
        result = await this.handleShowReference(context);
        break;
      case 'status':
        result = this.handleStatus(context);
        break;
      case 'reset':
        result = this.handleReset(context);
        break;
      default:
        result = await this.handleDefault(cleanMessage, context);
    }

    // 保存对话历史
    this.saveConversation(userId, sessionId, cleanMessage, result.reply);

    return result;
  }

  /**
   * 识别用户意图
   *
   * @param {string} message - 用户消息
   * @returns {string} 意图
   */
  recognizeIntent(message) {
    const lowerMessage = message.toLowerCase();

    // 帮助
    if (/帮助|help|怎么用|使用说明/.test(lowerMessage)) {
      return 'help';
    }

    // 列出真题
    if (/真题|列表|list|所有题目/.test(lowerMessage)) {
      return 'list_questions';
    }

    // 获取真题
    if (/给我一道|来道题|推荐题目|new|next/.test(lowerMessage)) {
      return 'get_question';
    }

    // 提交思路
    if (/思路|想法|我认为|我觉得/.test(lowerMessage) && this.userStates.has(this.getLastUserId())) {
      return 'submit_idea';
    }

    // 提交答案
    if (/我的答案|答案是|参考答案/.test(lowerMessage) || message.length > 50) {
      return 'submit_answer';
    }

    // 拓展思路
    if (/拓展|多角度|更多思路|expand/.test(lowerMessage)) {
      return 'expand_perspectives';
    }

    // 显示参考答案
    if (/参考答案|标准答案|答案要点|show answer/.test(lowerMessage)) {
      return 'show_reference';
    }

    // 状态
    if (/状态|status|进度/.test(lowerMessage)) {
      return 'status';
    }

    // 重置
    if (/重置|reset|重新开始/.test(lowerMessage)) {
      return 'reset';
    }

    return 'default';
  }

  /**
   * 获取最后的用户ID（临时方法）
   */
  getLastUserId() {
    // 这个方法需要根据实际情况实现
    return null;
  }

  /**
   * 处理帮助请求
   *
   * @returns {Object} 处理结果
   */
  handleHelp() {
    const reply = `我是申论老师，你的智能申论学习助手！🎓\n\n` +
                 `我可以帮你：\n\n` +
                 `📚 **真题练习**\n` +
                 `- 说"给我一道真题"或"来道题"\n\n` +
                 `💡 **答题引导**\n` +
                 `- 跟随步骤分析题目，理清答题思路\n\n` +
                 `✍️ **答案点评**\n` +
                 `- 提交你的答案，我会给出分析和建议\n\n` +
                 `🔄 **思路拓展**\n` +
                 `- 说"拓展思路"获取多种答题角度\n\n` +
                 `📖 **参考答案**\n` +
                 `- 查看参考答案要点进行对比学习\n\n` +
                 `你想从哪里开始？`;

    return {
      reply,
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理列出真题请求
   *
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleListQuestions(context) {
    const { resourceModule } = context;
    const questions = resourceModule.getQuestions();

    let reply = `目前共有 **${questions.length}** 道真题：\n\n`;

    questions.forEach((q, index) => {
      reply += `${index + 1}. 【${q.year}年 ${q.region} ${q.level}】\n` +
               `   ${q.title}\n` +
               `   难度：${this.getDifficultyEmoji(q.difficulty)}\n\n`;
    });

    reply += `回复"来道题"或"推荐题目"开始练习，\n` +
             `或指定题目编号，如"来第1题"`;

    return {
      reply,
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理获取真题请求
   *
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleGetQuestion(message, context) {
    const { userId, resourceModule, guideModule } = context;

    // 解析用户指定的题目
    let question;
    const numberMatch = message.match(/第?(\d+)题/);

    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      const questions = resourceModule.getQuestions();
      question = questions[index];
    } else {
      // 随机选择一道题
      const questions = resourceModule.getQuestions();
      const randomIndex = Math.floor(Math.random() * questions.length);
      question = questions[randomIndex];
    }

    if (!question) {
      return {
        reply: '抱歉，没有找到这道题。请说"真题"查看所有题目。',
        actions: [],
        attachments: [],
      };
    }

    // 开始引导
    const guidance = await guideModule.startGuidance(question.id, userId, question);

    // 保存用户状态
    this.userStates.set(userId, {
      currentQuestion: question,
      phase: 'intro',
    });

    return {
      reply: guidance.message,
      actions: [{ type: 'set_phase', phase: guidance.phase }],
      attachments: [],
    };
  }

  /**
   * 处理提交思路请求
   *
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleSubmitIdea(message, context) {
    const { userId, guideModule } = context;
    const state = this.userStates.get(userId);

    if (!state || !state.currentQuestion) {
      return {
        reply: '请先获取一道真题：说"给我一道真题"或"来道题"',
        actions: [],
        attachments: [],
      };
    }

    const feedback = await guideModule.analyzeUserIdea(
      state.currentQuestion.id,
      userId,
      message,
      state.currentQuestion
    );

    // 更新用户状态
    state.phase = 'idea_feedback';

    return {
      reply: feedback.message,
      actions: [{ type: 'set_phase', phase: feedback.phase }],
      attachments: [],
    };
  }

  /**
   * 处理提交答案请求
   *
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleSubmitAnswer(message, context) {
    const { userId, resourceModule, guideModule } = context;
    const state = this.userStates.get(userId);

    if (!state || !state.currentQuestion) {
      return {
        reply: '请先获取一道真题：说"给我一道真题"或"来道题"',
        actions: [],
        attachments: [],
      };
    }

    // 获取参考答案
    const referenceAnswer = resourceModule.getAnswer(state.currentQuestion.id);

    // 分析答案
    const analysis = await guideModule.analyzeAnswer(
      state.currentQuestion.id,
      userId,
      message,
      referenceAnswer || { keyPoints: [], score: '100' }
    );

    // 生成分析报告
    const report = guideModule.generateAnalysisReport(
      analysis,
      referenceAnswer,
      this.config?.guidance?.answerDisplayMode || 'summary'
    );

    return {
      reply: report,
      actions: [{ type: 'set_phase', phase: 'completed' }],
      attachments: [],
    };
  }

  /**
   * 处理拓展思路请求
   *
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleExpandPerspectives(context) {
    const { userId, guideModule } = context;
    const state = this.userStates.get(userId);

    if (!state || !state.currentQuestion) {
      return {
        reply: '请先获取一道真题：说"给我一道真题"或"来道题"',
        actions: [],
        attachments: [],
      };
    }

    const perspectives = await guideModule.expandPerspectives(
      state.currentQuestion.id,
      state.currentQuestion
    );

    return {
      reply: perspectives,
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理显示参考答案请求
   *
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleShowReference(context) {
    const { userId, resourceModule } = context;
    const state = this.userStates.get(userId);

    if (!state || !state.currentQuestion) {
      return {
        reply: '请先获取一道真题：说"给我一道真题"或"来道题"',
        actions: [],
        attachments: [],
      };
    }

    const answer = resourceModule.getAnswer(state.currentQuestion.id);

    if (!answer) {
      return {
        reply: '抱歉，暂时没有这道题的参考答案。',
        actions: [],
        attachments: [],
      };
    }

    let reply = `**参考答案**\n\n`;
    reply += `得分：${answer.score}分\n\n`;
    reply += `**要点：**\n`;
    answer.keyPoints.forEach(point => {
      reply += `- ${point}\n`;
    });
    reply += `\n**完整答案：**\n${answer.fullAnswer}\n\n`;
    reply += `来源：${answer.source}`;

    return {
      reply,
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理状态查询
   *
   * @param {Object} context - 上下文
   * @returns {Object} 处理结果
   */
  handleStatus(context) {
    const { userId, guideModule } = context;
    const state = this.userStates.get(userId);
    const progress = guideModule?.getUserProgress(userId);

    let reply = '**当前状态：**\n\n';

    if (state) {
      reply += `📚 当前题目：${state.currentQuestion.year}年 ${state.currentQuestion.region}\n`;
      reply += `📍 当前进度：${this.getPhaseName(state.phase)}\n`;
    } else {
      reply += `📚 当前没有进行中的题目\n`;
    }

    if (progress) {
      reply += `⏱️ 练习时间：${Math.round((Date.now() - progress.startTime) / 60000)}分钟\n`;
      reply += `📝 完成进度：第 ${progress.step} 步\n`;
    }

    return {
      reply,
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理重置请求
   *
   * @param {Object} context - 上下文
   * @returns {Object} 处理结果
   */
  handleReset(context) {
    const { userId, guideModule } = context;

    // 清除用户状态
    this.userStates.delete(userId);
    guideModule?.clearUserProgress(userId);

    return {
      reply: '已重置！可以开始新的练习了。说"给我一道真题"开始吧！',
      actions: [],
      attachments: [],
    };
  }

  /**
   * 处理默认消息
   *
   * @param {string} message - 用户消息
   * @param {Object} context - 上下文
   * @returns {Promise<Object>} 处理结果
   */
  async handleDefault(message, context) {
    const { userId } = context;
    const state = this.userStates.get(userId);

    // 如果用户有进行中的题目，尝试理解消息为思路或答案
    if (state && state.currentQuestion) {
      // 如果消息较长，视为提交答案
      if (message.length > 30) {
        return await this.handleSubmitAnswer(message, context);
      } else {
        return await this.handleSubmitIdea(message, context);
      }
    }

    // 否则返回帮助信息
    return this.handleHelp();
  }

  /**
   * 保存对话历史
   *
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   * @param {string} userMessage - 用户消息
   * @param {string} reply - 回复
   */
  saveConversation(userId, sessionId, userMessage, reply) {
    const key = `${userId}:${sessionId}`;

    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }

    const history = this.conversationHistory.get(key);
    history.push({
      user: userMessage,
      bot: reply,
      timestamp: Date.now(),
    });

    // 限制历史记录长度
    if (history.length > 20) {
      history.shift();
    }
  }

  /**
   * 获取对话历史
   *
   * @param {string} userId - 用户ID
   * @param {string} sessionId - 会话ID
   * @returns {Array} 对话历史
   */
  getConversationHistory(userId, sessionId) {
    const key = `${userId}:${sessionId}`;
    return this.conversationHistory.get(key) || [];
  }

  /**
   * 获取难度表情
   *
   * @param {string} difficulty - 难度
   * @returns {string} 表情
   */
  getDifficultyEmoji(difficulty) {
    const emojiMap = {
      easy: '⭐',
      medium: '⭐⭐',
      hard: '⭐⭐⭐',
    };
    return emojiMap[difficulty] || '⭐';
  }

  /**
   * 获取阶段名称
   *
   * @param {string} phase - 阶段
   * @returns {string} 阶段名称
   */
  getPhaseName(phase) {
    const phaseNames = {
      intro: '题目介绍',
      idea_feedback: '思路反馈',
      completed: '已完成',
    };
    return phaseNames[phase] || phase;
  }
}

export { InteractionModule };

#!/usr/bin/env node

/**
 * 随机推荐真题（含材料）
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function recommendQuestion() {
  // 初始化
  const resourceModule = new ResourceModule({
    resources: config.resources,
  });

  await resourceModule.initialize();

  // 查找湖南省考真题
  const hunanQuestions = resourceModule.getQuestions({ region: '湖南省考' });

  if (hunanQuestions.length === 0) {
    console.log('❌ 暂无湖南省考真题');
    return;
  }

  // 随机选择一道
  const randomIndex = Math.floor(Math.random() * hunanQuestions.length);
  const question = hunanQuestions[randomIndex];

  console.log('🎯 为你推荐一道真题：\n');

  // 显示题目
  console.log('═'.repeat(70));
  console.log(`【${question.year} ${question.region} ${question.level} ${question.title}】`);
  console.log('═'.repeat(70));
  console.log();

  // 显示材料
  console.log('📖 【给定资料】');
  console.log('─'.repeat(70));

  if (question.materials) {
    const materialKeys = Object.keys(question.materials).sort();
    materialKeys.forEach(key => {
      console.log();
      console.log(question.materials[key]);
    });
  } else {
    console.log('\n（暂无材料数据）');
  }

  console.log();
  console.log('─'.repeat(70));
  console.log();

  // 显示题目
  console.log('📋 【题目要求】');
  console.log();
  console.log(question.question);
  console.log();

  console.log(`⚠️  注意：${question.requirements}`);
  console.log();

  const difficultyEmoji = question.difficulty === 'easy' ? '⭐' :
                          question.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';
  console.log(`📊 分值：${question.score}分  |  难度：${difficultyEmoji}`);
  console.log(`🏷️  标签：${question.tags.join('、')}`);
  console.log();

  // 获取参考答案要点
  const answer = resourceModule.getAnswer(question.id);
  if (answer) {
    console.log('💡 【答题提示】');
    console.log('（需要查看完整参考答案，请回复"参考答案"）');
    console.log();
  }

  console.log('─'.repeat(70));
  console.log('💭 【答题建议】');
  console.log();
  console.log('1. 先仔细阅读给定资料，理解材料内容');
  console.log('2. 理清题目要求，明确作答方向');
  console.log('3. 构思答题框架，列出要点');
  console.log('4. 组织语言，条理清晰地作答');
  console.log();
  console.log('准备好后，可以告诉我你的答案，我会帮你分析和优化！');
  console.log('─'.repeat(70));
}

recommendQuestion().catch(console.error);

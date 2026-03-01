#!/usr/bin/env node

/**
 * 湖南省考真题专项测试
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function testHunanQuestions() {
  console.log('=== 湖南省考 2025年 申论真题 ===\n');

  // 初始化资源模块
  const resourceModule = new ResourceModule({
    resources: config.resources,
  });

  await resourceModule.initialize();

  // 查找湖南省考真题
  const hunanQuestions = resourceModule.getQuestions({ region: '湖南省考' });
  console.log(`📚 找到 ${hunanQuestions.length} 道湖南省考真题\n`);

  // 显示所有湖南省考真题
  hunanQuestions.forEach((q, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${index + 1}. 【${q.year}年 ${q.region} ${q.level} ${q.title}】`);
    console.log(`${'='.repeat(60)}\n`);

    console.log(`📋 题目要求：\n${q.question}\n`);
    console.log(`⚠️  注意：${q.requirements}\n`);
    console.log(`📊 分值：${q.score}分  |  难度：${q.difficulty === 'easy' ? '⭐' : q.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}`);
    console.log(`🏷️  标签：${q.tags.join('、')}\n`);

    // 获取参考答案
    const answer = resourceModule.getAnswer(q.id);
    if (answer) {
      console.log('--- 参考答案 ---\n');
      console.log(`📊 得分：${answer.score}分\n`);
      console.log(`📝 要点：\n`);
      answer.keyPoints.forEach((point, i) => {
        console.log(`   ${i + 1}. ${point}`);
      });
      console.log(`\n📖 完整答案：\n${answer.fullAnswer}\n`);
      console.log(`来源：${answer.source}\n`);
    } else {
      console.log('⚠️  暂无参考答案\n');
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('=== 测试完成 ===');
}

testHunanQuestions().catch(console.error);

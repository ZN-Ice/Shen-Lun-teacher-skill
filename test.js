#!/usr/bin/env node

/**
 * 简单测试脚本
 * 测试申论老师的基本功能
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function test() {
  console.log('=== 申论老师测试 ===\n');

  // 初始化资源模块
  const resourceModule = new ResourceModule({
    resources: config.resources,
  });

  await resourceModule.initialize();
  console.log('✅ 资源模块初始化成功\n');

  // 显示当前真题数量
  const questions = resourceModule.getQuestions();
  console.log(`📚 当前真题库共有 ${questions.length} 道题\n`);

  // 列出所有真题
  console.log('--- 真题列表 ---\n');
  questions.forEach((q, index) => {
    console.log(`${index + 1}. 【${q.year}年 ${q.region} ${q.level}】`);
    console.log(`   ${q.title}`);
    console.log(`   题目：${q.question.substring(0, 50)}...`);
    console.log(`   难度：${q.difficulty === 'easy' ? '⭐' : q.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}`);
    console.log();
  });

  // 查找2023年真题
  const year2023 = resourceModule.getQuestions({ year: '2023' });
  console.log(`\n📌 2023年真题：${year2023.length} 道\n`);

  // 随机推荐一道题
  const randomIndex = Math.floor(Math.random() * questions.length);
  const randomQuestion = questions[randomIndex];
  console.log('--- 随机推荐 ---\n');
  console.log(`【${randomQuestion.year}年 ${randomQuestion.region} ${randomQuestion.level} ${randomQuestion.title}】\n`);
  console.log(`📋 题目要求：\n${randomQuestion.question}\n`);
  console.log(`⚠️ 注意：${randomQuestion.requirements}\n`);
  console.log(`📊 分值：${randomQuestion.score}分  |  难度：${randomQuestion.difficulty}\n`);

  // 获取参考答案
  const answer = resourceModule.getAnswer(randomQuestion.id);
  if (answer) {
    console.log('--- 参考答案要点 ---\n');
    answer.keyPoints.forEach((point, index) => {
      console.log(`${index + 1}. ${point}`);
    });
    console.log(`\n来源：${answer.source}\n`);
  } else {
    console.log('⚠️ 暂无参考答案\n');
  }

  console.log('=== 测试完成 ===');
}

test().catch(console.error);

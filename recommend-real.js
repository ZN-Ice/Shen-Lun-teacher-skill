#!/usr/bin/env node

/**
 * 推荐真实真题（从爱真题爬取）
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function recommendRealQuestion() {
  console.log('🎯 为你推荐：从爱真题网站爬取的真实真题\n');

  // 初始化
  const resourceModule = new ResourceModule({
    resources: config.resources,
  });

  await resourceModule.initialize();

  // 查找爱真题来源的真题
  const aiptaQuestions = resourceModule.getQuestions().filter(q => q.source === '爱真题');

  if (aiptaQuestions.length === 0) {
    console.log('❌ 暂无爬取的真题\n');
    return;
  }

  const question = aiptaQuestions[0];

  // 显示题目信息
  console.log('═'.repeat(80));
  console.log(`【${question.year} ${question.region} ${question.level}】`);
  console.log('════════════════════════════════════════════════════════════════════════\n');

  console.log('📖 【给定资料】\n');

  // 显示材料
  if (question.materials && question.materials.intro) {
    console.log(question.materials.intro);
    console.log();
  }

  if (question.materials) {
    for (const [key, value] of Object.entries(question.materials)) {
      if (key !== 'intro' && !key.includes('questions')) {
        console.log(value);
        console.log();
      }
    }
  }

  // 显示作答要求
  if (question.materials && question.materials.questions) {
    console.log('─'.repeat(80));
    console.log('📋 【作答要求】\n');
    console.log(question.materials.questions);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`📊 分值：${question.score}分  |  难度：⭐⭐⭐`);
  console.log(`🏷️  标签：${question.tags.join('、')}`);
  console.log(`🔗 来源：爱真题`);
  console.log(`🔗 链接：${question.url}`);
  console.log('═'.repeat(80));

  console.log('\n💭 【答题提示】\n');
  console.log('这是一套完整的申论试卷，包含：\n');
  console.log('• 4个给定材料（约4000字）');
  console.log('• 4道作答题目（总分100分）');
  console.log('• 第1题：概括题（15分）');
  console.log('• 第2题：分析+对策题（20分）');
  console.log('• 第3题：应用文写作（25分）');
  console.log('• 第4题：大作文（40分）');

  console.log('\n─'.repeat(80));
  console.log('💡 答题建议：\n');
  console.log('1. 先仔细阅读所有给定材料，理解材料内容\n');
  console.log('2. 按照作答要求的顺序，逐一作答\n');
  console.log('3. 注意每道题的字数限制\n');
  console.log('4. 留足时间给第4题的大作文\n');
  console.log('\n准备好后，可以告诉我你的答案，我会帮你分析和优化！');
  console.log('─'.repeat(80));
  console.log('\n🎉 这是从爱真题网站爬取的**真实**真题！\n');
}

recommendRealQuestion().catch(console.error);

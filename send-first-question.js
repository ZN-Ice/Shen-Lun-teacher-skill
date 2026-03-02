import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

/**
 * 发送一道第一题，包含题目和对应的材料
 */
async function sendFirstQuestion() {
  const resourceModule = new ResourceModule({ resources: config.resources });
  await resourceModule.initialize();

  // 筛选出所有第一题
  const allQuestions = resourceModule.getQuestions();
  const firstQuestions = allQuestions.filter(q => q.title.includes('第一题'));

  if (firstQuestions.length === 0) {
    console.log('❌ 没有找到第一题\n');
    return;
  }

  // 随机选择一道第一题
  const question = firstQuestions[Math.floor(Math.random() * firstQuestions.length)];

  console.log('📋 题目推送\n');
  console.log('═'.repeat(70));
  console.log('【' + question.year + ' ' + question.region + ' ' + question.level + ' ' + question.title + '】');
  console.log('═'.repeat(70));
  console.log();

  // 显示题目要求
  console.log('📋 【题目要求】\n');
  console.log(question.question);
  console.log();
  console.log('⚠️  注意：' + question.requirements);
  console.log();

  // 显示对应的材料
  console.log('─'.repeat(70));
  console.log('📖 【给定资料】\n');

  if (question.materials && Object.keys(question.materials).length > 0) {
    // 如果有材料，显示所有关联的材料
    for (const [materialNum, materialContent] of Object.entries(question.materials)) {
      console.log('────────────────────────────────────────────────────────────\n');
      console.log('📌 给定资料' + materialNum + '\n');
      console.log(materialContent);
      console.log();
    }
  } else {
    console.log('（本题暂无给定资料）\n');
  }

  console.log('─'.repeat(70));
  console.log();
  console.log('📊 分值：' + question.score + '分  |  难度：' + (question.difficulty === 'easy' ? '⭐' : question.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'));
  console.log('🏷️  标签：' + question.tags.join('、'));
  console.log('🔗 来源：' + question.source);
  console.log();

  console.log('══'.repeat(70));
  console.log('💭 【答题提示】\n');
  console.log('1. 仔细阅读上方的给定资料，理解材料内容');
  console.log('2. 结合题目要求，明确作答方向和重点');
  console.log('3. 构思答题框架，列出要点');
  console.log('4. 组织语言，条理清晰地作答，注意字数限制');
  console.log();
  console.log('准备好后，可以告诉我你的答案，我会帮你分析和优化！');
  console.log('══'.repeat(70));
  console.log();
}

sendFirstQuestion().catch(console.error);

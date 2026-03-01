import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function sendRandomQuestion() {
  const resourceModule = new ResourceModule({ resources: config.resources });
  await resourceModule.initialize();

  // 随机选择一道题
  const questions = resourceModule.getQuestions();
  const question = questions[Math.floor(Math.random() * questions.length)];

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

  // 提取题目引用的材料编号
  const referencedMaterials = [];
  const patterns = [
    /["']?["']?给定资料(\d+)["']?["']?/g,
    /["']?["']?材料(\d+)["']?["']?/g,
  ];

  for (const pattern of patterns) {
    const matches = question.question.match(pattern);
    if (matches) {
      const num = matches[0].match(/\d+/)?.[0];
      if (num && !referencedMaterials.includes(num)) {
        referencedMaterials.push(num);
      }
    }
  }

  // 显示引用的材料
  console.log('─'.repeat(70));
  console.log('📖 【给定资料（与题目相关）】\n');

  if (question.materials && Object.keys(question.materials).length > 0) {
    if (referencedMaterials.length === 0) {
      console.log('（该题目未明确引用特定材料，可能需要综合所有给定资料）\n');
    }

    for (const materialNum of referencedMaterials) {
      if (question.materials[materialNum]) {
        console.log('────────────────────────────────────────────────────────────\n');
        console.log(question.materials[materialNum]);
        console.log();
      }
    }
  }

  console.log('─'.repeat(70));
  console.log();
  console.log('📊 分值：' + question.score + '分  |  难度：' + (question.difficulty === 'easy' ? '⭐' : question.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'));
  console.log('🏷️  标签：' + question.tags.join('、'));
  console.log('🔗 来源：' + question.source);
  console.log();

  console.log('══'.repeat(70));
  console.log('💭 【答题提示】\n');
  console.log('1. 仔细阅读上方显示的给定资料');
  console.log('2. 理清题目要求，明确作答方向');
  console.log('3. 构思答题框架，列出要点');
  console.log('4. 组织语言，条理清晰地作答');
  console.log();
  console.log('准备好后，可以告诉我你的答案，我会帮你分析和优化！');
  console.log('══'.repeat(70));
  console.log();
}

sendRandomQuestion().catch(console.error);

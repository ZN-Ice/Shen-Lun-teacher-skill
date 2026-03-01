#!/usr/bin/env node

/**
 * 申论老师 CLI 工具（改进版）
 *
 * 实现材料与问题的绑定显示
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

// 初始化资源模块
const resourceModule = new ResourceModule({
  resources: config.resources,
});

/**
 * 推荐真题
 */
async function recommendQuestion(args) {
  console.log('🎯 推荐真题...\n');

  try {
    await resourceModule.initialize();

    let questions;

    if (args.random) {
      // 随机推荐
      questions = resourceModule.getQuestions();
      const randomIndex = Math.floor(Math.random() * questions.length);
      questions = [questions[randomIndex]];
    } else if (args.region) {
      // 按地区筛选
      questions = resourceModule.getQuestions({ region: args.region });
      if (questions.length === 0) {
        console.log(`⚠️  没有找到 ${args.region} 的真题\n`);
        return;
      }
    } else if (args.year) {
      // 按年份筛选
      questions = resourceModule.getQuestions({ year: args.year });
      if (questions.length === 0) {
        console.log(`⚠️  没有找到 ${args.year} 年的真题\n`);
        return;
      }
    } else if (args.difficulty) {
      // 按难度筛选
      questions = resourceModule.getQuestions({ difficulty: args.difficulty });
      if (questions.length === 0) {
        console.log(`⚠️  没有找到 ${args.difficulty} 难度的真题\n`);
        return;
      }
    } else {
      // 默认推荐一道
      questions = resourceModule.getQuestions();
      const randomIndex = Math.floor(Math.random() * questions.length);
      questions = [questions[randomIndex]];
    }

    // 显示题目
    displayQuestion(questions[0], args);

  } catch (error) {
    console.error(`\n❌ 推荐失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 显示题目（改进版，支持材料绑定）
 */
function displayQuestion(question, options = {}) {
  console.log('═'.repeat(70));
  console.log(`【${question.year} ${question.region} ${question.level} ${question.title}】`);
  console.log('═'.repeat(70));
  console.log();

  // 显示材料（只显示相关的）
  if (options.showMaterials && question.materials) {
    console.log('📖 【给定资料】\n');
    console.log('─'.repeat(70));

    // 提取题目要求中引用的材料编号
    const referencedMaterials = extractReferencedMaterials(question.question);

    // 如果没有找到引用的材料编号，显示所有材料
    if (referencedMaterials.length === 0) {
      console.log('（所有材料）\n');
      for (const [key, value] of Object.entries(question.materials)) {
        if (key !== 'questions' && !key.startsWith('intro')) {
          console.log(value);
          console.log();
        }
      }
    } else {
      // 只显示被引用的材料
      console.log(`（根据题目要求，显示以下材料）\n`);
      for (const materialNum of referencedMaterials) {
        if (question.materials[materialNum]) {
          console.log(question.materials[materialNum]);
          console.log();
        }
      }
    }

    console.log('─'.repeat(70));
    console.log();
  }

  // 显示题目要求
  console.log('📋 【题目要求】\n');
  console.log(question.question);
  console.log();

  console.log(`⚠️  注意：${question.requirements}`);
  console.log();

  const difficultyEmoji = question.difficulty === 'easy' ? '⭐' :
                          question.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';
  console.log(`📊 分值：${question.score}分  |  难度：${difficultyEmoji}`);
  console.log(`🏷️  标签：${question.tags.join('、')}`);
  console.log(`🔗 来源：${question.source}`);

  if (question.url) {
    console.log(`🔗 链接：${question.url}`);
  }

  console.log();

  // 显示参考答案
  if (options.showAnswer) {
    const answer = resourceModule.getAnswer(question.id);
    if (answer) {
      console.log('─'.repeat(70));
      console.log('✍️  【参考答案】\n');
      console.log(`📊 得分：${answer.score}分\n`);
      console.log('📝 要点：\n');
      answer.keyPoints.forEach((point, i) => {
        console.log(`   ${i + 1}. ${point}`);
      });
      console.log(`\n📖 完整答案：\n${answer.fullAnswer}\n`);
      console.log(`来源：${answer.source}`);
    } else {
      console.log('⚠️  暂无参考答案');
    }
    console.log();
  }

  console.log('═'.repeat(70));
}

/**
 * 提取题目要求中引用的材料编号
 */
function extractReferencedMaterials(questionText) {
  const referencedMaterials = [];

  // 匹配 "给定资料1"、"给定资料2"、"材料1"、"材料2" 等模式
  const patterns = [
    /["']?["']?给定资料(\d+)["']?["']?/g,
    /["']?["']?材料(\d+)["']?["']?/g,
    /["']?["']?资料(\d+)["']?["']?/g,
    /["']?["']?给定材料(\d+)["']?["']?/g,
  ];

  for (const pattern of patterns) {
    const matches = questionText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const num = match.match(/\d+/)?.[0];
        if (num && !referencedMaterials.includes(num)) {
          referencedMaterials.push(num);
        }
      });
    }
  }

  return referencedMaterials;
}

/**
 * 命令处理
 */
async function handleCommand() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎯 申论老师 CLI 工具\n');

  try {
    await resourceModule.initialize();

    switch (command) {
      case 'recommend':
      case 'r':
        await recommendQuestion(args.slice(1));
        break;

      case 'test':
        await runTest();
        break;

      default:
        showHelp();
    }
  } catch (error) {
    console.error(`\n❌ 执行失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 运行测试
 */
async function runTest() {
  console.log('🧪 CLI 功能测试\n');

  console.log('1. 测试材料提取：');
  const testCases = [
    { text: '根据"给定资料1"' },
    { text: '根据"给定资料2"、"给定资料3"' },
    { text: '参考"材料1"和"材料2"' },
  ];

  testCases.forEach((testCase, i) => {
    const materials = extractReferencedMaterials(testCase.text);
    console.log(`   测试 ${i + 1}: "${testCase.text}"`);
    console.log(`   提取结果: 材料${materials.join(', ')}\n`);
  });

  console.log('2. 测试题目推荐：');
  const questions = resourceModule.getQuestions();

  if (questions.length === 0) {
    console.log('   ⚠️  真题库为空\n');
    return;
  }

  console.log(`   找到 ${questions.length} 道真题，随机推荐一道...\n`);

  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];

  console.log('═════════════════════════════════════════════════════════════════════');
  console.log('【推荐真题】');
  console.log('═════════════════════════════════════════════════════════════════════');
  console.log();
  console.log(`【${question.year} ${question.region} ${question.level} ${question.title}】`);
  console.log();

  // 显示题目
  console.log('📋 【题目要求】\n');
  console.log(question.question);
  console.log();

  // 提取并显示相关材料
  const referencedMaterials = extractReferencedMaterials(question.question);

  if (question.materials && Object.keys(question.materials).length > 0) {
    console.log('📖 【给定资料】');
    console.log('（根据题目要求，显示以下材料）\n');
    console.log('─'.repeat(70));

    if (referencedMaterials.length === 0) {
      // 如果没有找到引用的材料编号，显示 intro
      if (question.materials.intro) {
        console.log(question.materials.intro);
        console.log();
      }

      // 显示所有材料
      for (const [key, value] of Object.entries(question.materials)) {
        if (key !== 'questions' && !key.startsWith('intro')) {
          console.log(value);
          console.log();
        }
      }
    } else {
      // 只显示被引用的材料
      for (const materialNum of referencedMaterials) {
        if (question.materials[materialNum]) {
          console.log(question.materials[materialNum]);
          console.log();
        }
      }
    }

    console.log('─'.repeat(70));
  }

  console.log();
  console.log('✅ 测试完成！\n');
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log('═'.repeat(60));
  console.log('【命令说明】');
  console.log('═'.repeat(60));
  console.log('\n用法: npm run cli <命令> [选项]\n');

  console.log('\n📋 命令:');
  console.log('  recommend, r      推荐真题（支持材料绑定）');
  console.log('  test             测试 CLI 功能\n');

  console.log('\n⚙️  选项:');
  console.log('  --region <region>     按地区筛选 (例: 湖南省考)');
  console.log('  --year <year>         按年份筛选 (例: 2025年)');
  console.log('  --difficulty <diff>   按难度筛选 (easy|medium|hard)');
  console.log('  -R, --random          随机推荐');
  console.log('  -m, --materials        显示给定资料（仅显示相关材料）');
  console.log('  -a, --answer           显示参考答案\n');

  console.log('\n💡 特性:');
  console.log('  • 材料绑定：根据题目要求，只显示相关的给定资料');
  console.log('  • 智能提取：自动识别题目中引用的材料编号');
  console.log('  • 灵活显示：支持"给定资料1"、"材料1"等多种引用方式\n');

  console.log('\n💻 示例:');
  console.log('  npm run cli recommend');
  console.log('  npm run cli recommend -m');
  console.log('  npm run cli recommend --region "湖南省考"');
  console.log('  npm run cli test');

  console.log('\n' + '═'.repeat(60) + '\n');
}

// 执行命令
handleCommand();

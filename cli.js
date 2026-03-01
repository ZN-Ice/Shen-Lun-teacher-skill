#!/usr/bin/env node

/**
 * 申论老师 CLI 工具（简化版）
 *
 * 命令行接口，提供真题推荐、查询等功能
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

// 初始化资源模块
const resourceModule = new ResourceModule({
  resources: config.resources,
});

/**
 * 命令处理函数
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

      case 'list':
      case 'l':
        await listQuestions(args.slice(1));
        break;

      case 'status':
      case 'st':
        await showStatus();
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
 * 推荐真题
 */
async function recommendQuestion(args) {
  const options = parseOptions(args);
  const showMaterials = options.m || options.materials;
  const showAnswer = options.a || options.answer;

  let questions = resourceModule.getQuestions();

  // 筛选条件
  if (options.region) {
    questions = questions.filter(q => q.region === options.region);
  }
  if (options.year) {
    questions = questions.filter(q => q.year === options.year);
  }
  if (options.difficulty) {
    questions = questions.filter(q => q.difficulty === options.difficulty);
  }

  if (questions.length === 0) {
    console.log('⚠️  没有找到符合条件的真题\n');
    return;
  }

  // 随机选择
  const question = options.random
    ? questions[Math.floor(Math.random() * questions.length)]
    : questions[0];

  displayQuestion(question, { showMaterials, showAnswer });
}

/**
 * 列出真题
 */
async function listQuestions(args) {
  const options = parseOptions(args);
  let questions = resourceModule.getQuestions();

  // 筛选条件
  if (options.region) {
    questions = questions.filter(q => q.region === options.region);
  }
  if (options.year) {
    questions = questions.filter(q => q.year === options.year);
  }
  if (options.difficulty) {
    questions = questions.filter(q => q.difficulty === options.difficulty);
  }

  console.log(`📋 找到 ${questions.length} 道真题:\n`);
  console.log('═'.repeat(60));

  questions.forEach((q, index) => {
    console.log(`\n${index + 1}. 【${q.year} ${q.region} ${q.level} ${q.title}】`);
    console.log(`   分值：${q.score}分 | 难度：${q.difficulty}`);
    console.log(`   标签：${q.tags.join('、')}`);
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`\n总计: ${questions.length} 道真题\n`);
}

/**
 * 查看状态
 */
async function showStatus() {
  const questions = resourceModule.getQuestions();

  console.log('═'.repeat(60));
  console.log('【真题库状态】');
  console.log('═'.repeat(60));
  console.log(`\n📚 总题数: ${questions.length} 道\n`);

  // 按地区统计
  const byRegion = {};
  questions.forEach(q => {
    byRegion[q.region] = (byRegion[q.region] || 0) + 1;
  });

  console.log('📍 按地区:');
  Object.entries(byRegion).forEach(([region, count]) => {
    console.log(`   ${region}: ${count} 道`);
  });

  // 按年份统计
  const byYear = {};
  questions.forEach(q => {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  });

  console.log('\n📅 按年份:');
  Object.entries(byYear).sort().reverse().forEach(([year, count]) => {
    console.log(`   ${year}: ${count} 道`);
  });

  // 按难度统计
  const byDifficulty = {};
  questions.forEach(q => {
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  });

  console.log('\n⭐ 按难度:');
  const difficultyEmoji = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };
  Object.entries(byDifficulty).forEach(([diff, count]) => {
    console.log(`   ${difficultyEmoji[diff]} ${diff}: ${count} 道`);
  });

  console.log('\n' + '═'.repeat(60) + '\n');
}

/**
 * 显示题目
 */
function displayQuestion(question, options = {}) {
  console.log('═'.repeat(70));
  console.log(`【${question.year} ${question.region} ${question.level} ${question.title}】`);
  console.log('═'.repeat(70));
  console.log();

  if (options.showMaterials && question.materials) {
    console.log('📖 【给定资料】\n');
    console.log('─'.repeat(70));
    if (question.materials.intro) {
      console.log(question.materials.intro);
      console.log();
    }
    for (const [key, value] of Object.entries(question.materials)) {
      if (key !== 'intro' && !key.includes('questions')) {
        console.log(value);
        console.log();
      }
    }
  }

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
  console.log();
  console.log('💭 【答题提示】\n');
  console.log('1. 先仔细阅读给定资料，理解材料内容');
  console.log('2. 理清题目要求，明确作答方向');
  console.log('3. 构思答题框架，列出要点');
  console.log('4. 组织语言，条理清晰地作答');
  console.log();
  console.log('准备好后，可以告诉我你的答案，我会帮你分析和优化！');
  console.log('─'.repeat(70));
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('═'.repeat(60));
  console.log('【命令说明】');
  console.log('═'.repeat(60));
  console.log('\n用法: npm run cli <命令> [选项]\n');

  console.log('\n📋 命令:');
  console.log('  recommend, r      推荐一道真题');
  console.log('  list, l          列出所有真题');
  console.log('  status, st       查看真题库状态\n');

  console.log('\n⚙️  选项:');
  console.log('  --region <region>     按地区筛选 (例: 湖南省考)');
  console.log('  --year <year>         按年份筛选 (例: 2025年)');
  console.log('  --difficulty <diff>   按难度筛选 (easy|medium|hard)');
  console.log('  -R, --random          随机推荐');
  console.log('  -m, --materials        显示给定资料');
  console.log('  -a, --answer           显示参考答案\n');

  console.log('\n💡 示例:');
  console.log('  npm run cli recommend');
  console.log('  npm run cli recommend -R -m -a');
  console.log('  npm run cli recommend --region "湖南省考"');
  console.log('  npm run cli list --year "2025年"');
  console.log('  npm run cli list --difficulty "hard"');
  console.log('  npm run cli status\n');

  console.log('═'.repeat(60) + '\n');
}

/**
 * 解析选项
 */
function parseOptions(args) {
  const options = {
    random: false,
    region: null,
    year: null,
    difficulty: null,
    materials: false,
    answer: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-R' || arg === '--random') {
      options.random = true;
    } else if (arg === '-m' || arg === '--materials') {
      options.materials = true;
    } else if (arg === '-a' || arg === '--answer') {
      options.answer = true;
    } else if (arg.startsWith('--region=')) {
      options.region = arg.split('=')[1];
    } else if (arg.startsWith('--year=')) {
      options.year = arg.split('=')[1];
    } else if (arg.startsWith('--difficulty=')) {
      options.difficulty = arg.split('=')[1];
    }
  }

  return options;
}

// 执行命令
handleCommand();

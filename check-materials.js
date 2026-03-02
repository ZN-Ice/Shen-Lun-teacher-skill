#!/usr/bin/env node

/**
 * 检查题目的材料关联情况
 */

import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function checkMaterials() {
  const resourceModule = new ResourceModule({ resources: config.resources });
  await resourceModule.initialize();

  const questions = resourceModule.getQuestions();

  console.log('═'.repeat(70));
  console.log('【题目材料关联检查】');
  console.log('═'.repeat(70));
  console.log();
  console.log(`📚 总题数: ${questions.length} 道`);
  console.log();

  let hasMaterialsCount = 0;
  let noMaterialsCount = 0;

  for (const question of questions) {
    console.log('─'.repeat(70));
    console.log(`【${question.year} ${question.region} ${question.level} ${question.title}】`);
    console.log(`ID: ${question.id}`);
    console.log(`题目: ${question.question.substring(0, 80)}...`);
    console.log();

    if (question.materials && Object.keys(question.materials).length > 0) {
      hasMaterialsCount++;
      console.log(`✅ 包含材料: ${Object.keys(question.materials).length} 个`);
      Object.keys(question.materials).forEach(num => {
        const preview = question.materials[num].substring(0, 50);
        console.log(`   - 材料${num}: ${preview}...`);
      });
    } else {
      noMaterialsCount++;
      console.log(`❌ 不包含材料`);
    }

    console.log();
  }

  console.log('═'.repeat(70));
  console.log('【统计结果】');
  console.log('═'.repeat(70));
  console.log();
  console.log(`✅ 包含材料的题目: ${hasMaterialsCount} 道`);
  console.log(`❌ 不包含材料的题目: ${noMaterialsCount} 道`);
  console.log();
}

checkMaterials().catch(console.error);

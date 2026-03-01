#!/usr/bin/env node

/**
 * 从爱真题网站爬取湖南省考申论真题
 */

import { Scraper } from './src/utils/scraper.js';
import { ResourceModule } from './src/modules/resource.js';
import config from './src/config/default.js';

async function scrapeAiptaQuestions() {
  console.log('🌐 开始从爱真题网站爬取湖南省考真题...\n');

  const scraper = new Scraper({
    baseUrl: 'https://www.aipta.com',
    timeout: 30000,
  });

  try {
    // 爬取湖南省考申论真题
    const url = 'https://www.aipta.com/zt/sk/hn/sl/';
    console.log(`📍 目标URL: ${url}\n`);

    console.log('⏳ 正在获取真题列表...\n');

    const questions = await scraper.downloadQuestions(url, 10);

    if (questions.length === 0) {
      console.log('⚠️  未能获取到真题，可能原因：');
      console.log('  1. 网络连接问题');
      console.log('  2. 网站结构变化');
      console.log('  3. 被反爬虫拦截\n');
      return;
    }

    console.log(`✅ 成功爬取 ${questions.length} 道真题！\n`);

    // 显示爬取的真题
    console.log('═'.repeat(70));
    console.log('【爬取的真题列表】');
    console.log('═'.repeat(70));

    questions.forEach((q, index) => {
      console.log(`\n${index + 1}. 【${q.year}年 ${q.region}】`);
      console.log(`   标题：${q.title}`);
      console.log(`   来源：${q.source}`);
      console.log(`   URL：${q.url}`);

      if (q.question) {
        console.log(`   题目：${q.question.substring(0, 50)}...`);
      }

      if (q.answer) {
        console.log(`   答案：${q.answer.content ? '有' : '无'}`);
      }

      console.log(`   难度：${q.difficulty}`);
      console.log(`   标签：${q.tags ? q.tags.join(', ') : '无'}`);
    });

    console.log('\n' + '═'.repeat(70));

    // 转换为标准格式
    console.log('\n🔄 正在转换为标准格式...\n');

    const resourceModule = new ResourceModule({
      resources: config.resources,
    });
    await resourceModule.initialize();

    // 添加爬取的真题
    let addedCount = 0;
    for (const q of questions) {
      try {
        const normalizedQ = scraper.normalizeQuestion(q);
        await resourceModule.addQuestion(normalizedQ);

        if (q.answer) {
          const normalizedA = scraper.normalizeAnswer(q);
          await resourceModule.addAnswer(normalizedA);
        }

        addedCount++;
        console.log(`✅ 已添加：${q.title}`);
      } catch (error) {
        console.error(`❌ 添加失败：${q.title} - ${error.message}`);
      }
    }

    console.log(`\n✅ 成功添加 ${addedCount} 道真题到数据库！\n`);

    // 保存到文件
    await resourceModule.saveQuestions();
    await resourceModule.saveAnswers();

    console.log('💾 数据已保存到文件！\n');

    // 显示统计
    const allQuestions = resourceModule.getQuestions();
    console.log('═'.repeat(70));
    console.log('【数据库统计】');
    console.log('═'.repeat(70));
    console.log(`\n📚 总题数：${allQuestions.length} 道`);

    // 按地区统计
    const byRegion = {};
    allQuestions.forEach(q => {
      byRegion[q.region] = (byRegion[q.region] || 0) + 1;
    });

    console.log('\n📍 按地区：');
    Object.entries(byRegion).forEach(([region, count]) => {
      console.log(`   ${region}：${count} 道`);
    });

    // 按年份统计
    const byYear = {};
    allQuestions.forEach(q => {
      byYear[q.year] = (byYear[q.year] || 0) + 1;
    });

    console.log('\n📅 按年份：');
    Object.entries(byYear).sort().reverse().forEach(([year, count]) => {
      console.log(`   ${year}：${count} 道`);
    });

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 爬取完成！\n');

  } catch (error) {
    console.error('\n❌ 爬取失败：', error.message);
    console.error('\n详细错误：', error.stack);
  }
}

scrapeAiptaQuestions().catch(console.error);

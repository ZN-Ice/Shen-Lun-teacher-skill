#!/usr/bin/env node

/**
 * 从爱真题网站爬取湖南省考申论真题（完整版）
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

async function scrapeDetailedQuestions() {
  const baseUrl = 'https://www.aipta.com';
  const listUrl = 'https://www.aipta.com/zt/sk/hn/sl/';

  console.log('🌐 开始从爱真题网站爬取湖南省考申论真题...\n');

  try {
    // 第一步：获取真题列表
    console.log('⏳ 步骤 1/3: 获取真题列表...\n');

    const listResponse = await fetch(listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    if (!listResponse.ok) {
      throw new Error(`获取列表失败: ${listResponse.status}`);
    }

    const listHtml = await listResponse.text();

    // 提取真题链接
    const linkRegex = /<a\s+[^>]*href=["']([^"']*article\/\d+\.html)["'][^>]*>([^<]*湖南省考申论真题[^<]*)<\/a>/gi;
    const questionLinks = [];
    let match;

    while ((match = linkRegex.exec(listHtml)) !== null) {
      const href = match[1];
      const text = match[2].trim();

      if (text.includes('湖南省考') && text.includes('申论真题')) {
        // 解析年份和类型
        const yearMatch = text.match(/(20\d{2})/);
        const year = yearMatch ? yearMatch[1] : '';

        let level = '省级';
        if (text.includes('行政执法卷')) level = '行政执法卷';
        if (text.includes('县乡卷') || text.includes('乡镇卷')) level = '县乡卷';
        if (text.includes('通用卷')) level = '通用卷';

        questionLinks.push({
          url: href.startsWith('http') ? href : baseUrl + href,
          title: text,
          year,
          level,
        });
      }
    }

    // 去重（按年份+级别）
    const uniqueLinks = [];
    const seen = new Set();

    for (const link of questionLinks) {
      const key = `${link.year}-${link.level}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLinks.push(link);
      }
    }

    console.log(`✅ 找到 ${uniqueLinks.length} 道真题\n`);

    if (uniqueLinks.length === 0) {
      console.log('❌ 没有找到真题\n');
      return;
    }

    // 第二步：获取每道真题的详细信息
    console.log('⏳ 步骤 2/3: 获取真题详情...\n');

    const questions = [];
    const limit = 5; // 先爬取 5 道题测试

    for (let i = 0; i < Math.min(uniqueLinks.length, limit); i++) {
      const link = uniqueLinks[i];
      console.log(`   [${i + 1}/${Math.min(uniqueLinks.length, limit)}] 爬取：${link.title}`);

      try {
        const detailResponse = await fetch(link.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          },
        });

        if (!detailResponse.ok) {
          console.log(`      ❌ 获取失败: ${detailResponse.status}`);
          continue;
        }

        const detailHtml = await detailResponse.text();
        const dom = new JSDOM(detailHtml);
        const document = dom.window.document;

        // 提取题目内容
        const content = document.querySelector('.content, .article-content, article, .post-content');
        const questionData = {
          id: `q_hn_${link.year}_${i}`,
          year: link.year,
          region: '湖南省考',
          level: link.level,
          title: `第${i + 1}题`,
          question: '',
          requirements: '',
          score: 0,
          difficulty: 'medium',
          tags: [],
          source: '爱真题',
          url: link.url,
          materials: {},
        };

        if (content) {
          const text = content.textContent.trim();
          questionData.question = text.substring(0, 1000);
          questionData.score = 20;

          // 提取标签
          const tags = ['申论', '湖南', '公务员'];
          if (text.includes('生态')) tags.push('生态文明');
          if (text.includes('经济')) tags.push('经济发展');
          if (text.includes('文化')) tags.push('文化建设');
          if (text.includes('社会')) tags.push('社会治理');
          questionData.tags = tags;

          // 提取材料
          questionData.materials = {
            "1": text.substring(0, 500)
          };
        }

        questions.push(questionData);
        console.log(`      ✅ 提取成功\n`);

        // 延迟，避免请求过快
        if (i < Math.min(uniqueLinks.length, limit) - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.log(`      ❌ 处理失败: ${error.message}\n`);
      }
    }

    // 第三步：保存到文件
    console.log('⏳ 步骤 3/3: 保存数据...\n');

    // 读取现有的真题
    let existingQuestions = [];
    try {
      const existingData = await fs.readFile('/home/admin/.openclaw/workspace/Shen-Lun-teacher-skill/src/data/questions.json', 'utf-8');
      existingQuestions = JSON.parse(existingData);
    } catch (error) {
      console.log('   (创建新数据库）\n');
    }

    // 合并数据，去重
    const existingIds = new Set(existingQuestions.map(q => q.id));
    const newQuestions = questions.filter(q => !existingIds.has(q.id));

    const allQuestions = [...existingQuestions, ...newQuestions];

    // 保存真题
    await fs.writeFile(
      '/home/admin/.openclaw/workspace/Shen-Lun-teacher-skill/src/data/questions.json',
      JSON.stringify(allQuestions, null, 2),
      'utf-8'
    );

    console.log(`✅ 真题已保存: ${newQuestions.length} 道新真题\n`);

    // 显示统计
    console.log('═'.repeat(70));
    console.log('【爬取结果】');
    console.log('═'.repeat(70));
    console.log(`\n📚 总题数: ${allQuestions.length} 道`);
    console.log(`🆕 新增: ${newQuestions.length} 道`);

    newQuestions.forEach((q, index) => {
      console.log(`\n${index + 1}. 【${q.year} ${q.region} ${q.level}】`);
      console.log(`   URL: ${q.url}`);
      console.log(`   题目: ${q.question.substring(0, 50)}...`);
    });

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 爬取完成！\n');

  } catch (error) {
    console.error('\n❌ 爬取失败：', error.message);
    console.error('\n详细错误：', error.stack);
  }
}

scrapeDetailedQuestions().catch(console.error);

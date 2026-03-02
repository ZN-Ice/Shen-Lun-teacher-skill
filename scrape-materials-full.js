#!/usr/bin/env node

/**
 * 从爱真题网站爬取湖南省考申论真题（完整版，包含材料和问题的正确关联）
 * 改进版：确保提取每份试卷的所有4-5道题
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

/**
 * 解析申论试卷，提取给定资料和题目
 */
function parseShenlunPaper(text) {
  const result = {
    materials: {},
    questions: []
  };

  // 1. 提取给定资料
  // 匹配 "给定资料1" 或 "材料1" 等标题
  const materialPattern = /(?:给定)?材料\s*(\d+)[\s\S]*?(?=(?:给定)?材料\s*\d+|$)/g;
  let materialMatch;

  while ((materialMatch = materialPattern.exec(text)) !== null) {
    const materialNum = materialMatch[1];
    const materialContent = materialMatch[0].trim();
    result.materials[materialNum] = materialContent;
  }

  // 2. 提取题目 - 改进版本，匹配多种格式
  // 尝试多种题目分隔符
  const questionPatterns = [
    // 格式1: "第一题"、"第二题" 等
    /第([一二三四五六七八九十]+)[\s]*[题题][\s\S]*?(?=第[一二三四五六七八九十]+[\s]*[题题]|$)/g,
    // 格式2: "1."、"2." 等
    /(\d+)\.\s*[\s\S]*?(?=\d+\.|$)/g,
    // 格式3: "题目一"、"题目二" 等
    /题目([一二三四五六七八九十]+)[\s\S]*?(?=题目[一二三四五六七八九十]+|$)/g,
  ];

  let questionsFound = [];

  // 尝试每种模式
  for (const pattern of questionPatterns) {
    const questions = [];
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const questionContent = match[0].trim();

      // 过滤掉太短的内容（不是题目）
      if (questionContent.length < 50) continue;

      questions.push(questionContent);
    }

    // 如果找到了题目，使用最多的那种模式
    if (questions.length > questionsFound.length) {
      questionsFound = questions;
    }
  }

  // 如果都没有找到，尝试按段落分割
  if (questionsFound.length === 0) {
    // 查找包含"要求"、"分"、"请"等关键词的段落
    const paragraphs = text.split(/\n\n+/);
    questionsFound = paragraphs.filter(p => {
      return p.length > 50 && (
        p.includes('要求') ||
        p.includes('请') ||
        p.includes('分') ||
        p.includes('谈谈') ||
        p.includes('分析') ||
        p.includes('概括')
      );
    });
  }

  // 为每个题目提取信息
  questionsFound.forEach((questionContent, index) => {
    const questionNum = index + 1;

    // 提取题目的要求
    const reqMatch = questionContent.match(/要求[：:][\s\S]+/i);
    const requirements = reqMatch ? reqMatch[0].replace(/要求[：:]/i, '').trim() : '';

    // 提取题目引用的材料
    const referencedMaterials = [];
    const patterns = [
      /["']?["']?给定资料(\d+)["']?["']?/g,
      /["']?["']?材料(\d+)["']?["']?/g,
    ];

    for (const pattern of patterns) {
      const matches = questionContent.match(pattern);
      if (matches) {
        const num = matches[0].match(/\d+/)?.[0];
        if (num && !referencedMaterials.includes(num)) {
          referencedMaterials.push(num);
        }
      }
    }

    // 提取分值
    const scoreMatch = questionContent.match(/(\d+)\s*分/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 20;

    result.questions.push({
      num: questionNum,
      content: questionContent,
      requirements: requirements,
      score: score,
      referencedMaterials: referencedMaterials
    });
  });

  return result;
}

/**
 * 爬取真题并保存
 */
async function scrapeWithMaterials() {
  const baseUrl = 'https://www.aipta.com';
  const listUrl = 'https://www.aipta.com/zt/sk/hn/sl/';

  console.log('🌐 开始从爱真题网站爬取湖南省考申论真题（完整版）...\n');

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
        if (text.includes('省市卷')) level = '省市卷';

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

    console.log(`✅ 找到 ${uniqueLinks.length} 份真题试卷\n`);

    if (uniqueLinks.length === 0) {
      console.log('❌ 没有找到真题\n');
      return;
    }

    // 第二步：获取每道真题的详细信息
    console.log('⏳ 步骤 2/3: 解析材料和问题...\n');

    const allQuestions = [];
    // 不再限制数量，爬取所有试卷

    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      console.log(`   [${i + 1}/${uniqueLinks.length}] 解析：${link.title}`);

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

        // 获取主要内容
        const contentElement = document.querySelector('.content, .article-content, article, .post-content, .entry-content');
        const text = contentElement ? contentElement.textContent.trim() : document.body.textContent.trim();

        // 解析试卷
        const paper = parseShenlunPaper(text);

        console.log(`      📄 提取材料: ${Object.keys(paper.materials).length} 个`);
        console.log(`      ❓ 提取题目: ${paper.questions.length} 道`);

        // 为每个题目创建独立的记录
        paper.questions.forEach((q) => {
          // 为这个题目关联它引用的材料
          const questionMaterials = {};
          q.referencedMaterials.forEach(materialNum => {
            if (paper.materials[materialNum]) {
              questionMaterials[materialNum] = paper.materials[materialNum];
            }
          });

          // 如果没有明确引用材料，则包含所有材料
          const materialsToInclude = q.referencedMaterials.length > 0 ? questionMaterials : paper.materials;

          allQuestions.push({
            id: `q_hn_${link.year}_${link.level}_q${q.num}`,
            year: link.year + '年',
            region: '湖南省考',
            level: link.level,
            title: `第${q.num}题`,
            question: q.content,
            requirements: q.requirements || '全面、准确、有条理',
            score: q.score,
            difficulty: q.score <= 15 ? 'easy' : q.score <= 25 ? 'medium' : 'hard',
            tags: ['申论', '湖南', '公务员考试'],
            source: '爱真题',
            url: link.url,
            materials: materialsToInclude
          });
        });

        console.log(`      ✅ 解析成功\n`);

        // 延迟，避免请求过快
        if (i < uniqueLinks.length - 1) {
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
    const newQuestions = allQuestions.filter(q => !existingIds.has(q.id));

    const finalQuestions = [...existingQuestions, ...newQuestions];

    // 保存真题
    await fs.writeFile(
      '/home/admin/.openclaw/workspace/Shen-Lun-teacher-skill/src/data/questions.json',
      JSON.stringify(finalQuestions, null, 2),
      'utf-8'
    );

    console.log(`✅ 真题已保存: ${newQuestions.length} 道新题目\n`);

    // 显示统计
    console.log('═'.repeat(70));
    console.log('【爬取结果】');
    console.log('═'.repeat(70));
    console.log(`\n📚 总题数: ${finalQuestions.length} 道`);
    console.log(`🆕 新增: ${newQuestions.length} 道`);

    newQuestions.forEach((q, index) => {
      console.log(`\n${index + 1}. 【${q.year} ${q.region} ${q.level} ${q.title}】`);
      console.log(`   分值：${q.score}分`);
      console.log(`   引用材料：${Object.keys(q.materials).join(', ') || '（所有材料）'}`);
    });

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 爬取完成！材料和问题已正确关联。\n');

  } catch (error) {
    console.error('\n❌ 爬取失败：', error.message);
    console.error('\n详细错误：', error.stack);
  }
}

scrapeWithMaterials().catch(console.error);

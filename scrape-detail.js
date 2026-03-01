#!/usr/bin/env node

/**
 * 深度爬取爱真题真题内容
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

async function scrapeSingleQuestion() {
  const url = 'https://www.aipta.com/article/10284.html';

  console.log('🌐 爬取真题详情...\n');
  console.log(`📍 URL: ${url}\n`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 保存完整HTML
  await fs.writeFile('/tmp/aipta_full_page.html', html);

  // 查找主要内容区域
  const contentSelectors = [
    '.detail-boxartzt',
    '.article-content',
    '.content',
    '#content',
    'article',
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) {
      console.log(`✅ 找到内容区: ${selector}\n`);
      break;
    }
  }

  if (!contentElement) {
    console.log('❌ 未找到内容区域\n');
    return;
  }

  const text = contentElement.textContent;

  // 提取不同部分
  console.log('═'.repeat(70));
  console.log('【提取的内容】');
  console.log('═'.repeat(70));

  // 查找给定资料
  const materials = text.match(/给定资料[^\n]*\n([^]*?)(?=作答要求|$)/s);
  if (materials) {
    console.log('\n📖 【给定资料】\n');
    console.log(materials[1].substring(0, 1000));
    console.log('\n...（截取部分）\n');
  }

  // 查找作答要求
  const requirements = text.match(/作答要求[^\n]*\n([^]*?)(?=参考答案|$)/s);
  if (requirements) {
    console.log('\n📋 【作答要求】\n');
    console.log(requirements[1].substring(0, 500));
  }

  // 查找参考答案
  const answers = text.match(/参考答案[^\n]*\n([^]*?)$/s);
  if (answers) {
    console.log('\n✍️  【参考答案】\n');
    console.log(answers[1].substring(0, 500));
  }

  console.log('\n═'.repeat(70));
  console.log(`\n💾 完整HTML已保存到: /tmp/aipta_full_page.html\n`);
  console.log('📝 完整文本长度:', text.length, '字符\n');

  // 显示原始HTML的class名称
  console.log('🔍 页面结构分析:\n');
  const divs = contentElement.querySelectorAll('div');
  const classList = new Set();
  divs.forEach(div => {
    const className = div.className;
    if (className && className.length < 50) {
      classList.add(className);
    }
  });

  console.log('找到的 class 名称:');
  Array.from(classList).slice(0, 20).forEach(cls => {
    console.log(`  .${cls}`);
  });

  console.log('\n✅ 分析完成！\n');
}

scrapeSingleQuestion().catch(console.error);

#!/usr/bin/env node

/**
 * 测试访问爱真题网站
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';

async function testAiptaAccess() {
  const url = 'https://www.aipta.com/zt/sk/hn/sl/';

  console.log('🌐 测试访问爱真题网站...\n');
  console.log(`📍 URL: ${url}\n`);

  try {
    console.log('⏳ 正在获取网页内容...\n');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.log('❌ 无法访问网页\n');
      return;
    }

    const html = await response.text();
    console.log(`📄 HTML 长度: ${html.length} 字节\n`);

    // 检查是否包含关键词
    const keywords = ['真题', '申论', '湖南', '试卷', '答案', '解析'];
    console.log('🔍 检查关键词：\n');

    keywords.forEach(keyword => {
      const count = (html.match(new RegExp(keyword, 'g')) || []).length;
      console.log(`   "${keyword}": ${count} 次`);
    });

    // 保存 HTML 以便分析
    await fs.writeFile('/tmp/aipta_page.html', html);
    console.log('\n💾 HTML 已保存到 /tmp/aipta_page.html\n');

    // 提取链接
    console.log('🔗 提取链接：\n');
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const links = [];
    let match;
    let count = 0;

    while ((match = linkRegex.exec(html)) !== null && count < 20) {
      const href = match[1];
      const text = match[2].trim();

      if (text && text.length > 5 && text.length < 100) {
        links.push({ href, text });
        count++;
      }
    }

    links.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.text}`);
      console.log(`      ${link.href}\n`);
    });

    console.log(`\n✅ 测试完成！共找到 ${links.length} 个链接\n`);

  } catch (error) {
    console.error('\n❌ 错误：', error.message);
    console.error('\n详细错误：', error.stack);
  }
}

testAiptaAccess().catch(console.error);

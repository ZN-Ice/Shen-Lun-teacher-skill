# 爬虫功能说明

本文档说明如何使用申论老师的爬虫功能从爱真题等网站下载真题和解析。

## 功能概述

申论老师内置了网页爬虫工具，可以从以下网站自动下载真题和解析：

- **爱真题网** (https://www.aipta.com) - 主要数据源
  - 湖南省考申论真题
  - 支持扩展到其他地区

## 使用方法

### 通过对话命令

用户可以直接通过对话触发下载：

```
用户: 更新真题
系统: 🔄 正在从爱真题网站下载真题...
     预计下载：20道题
     这可能需要几分钟，请稍候...
```

指定下载数量：

```
用户: 下载50道真题
用户: 更新100道
```

### 编程方式

```javascript
import { ResourceModule } from './src/modules/resource.js';

const resourceModule = new ResourceModule(config);

// 从爱真题下载
await resourceModule.updateResources({
  source: 'aipta',
  limit: 50,
});

// 从自定义URL下载
await resourceModule.updateResources({
  source: 'https://example.com/questions',
  limit: 100,
});
```

## 技术实现

### 架构

```
Scraper (爬虫工具)
    ↓
解析网页 (JSDOM)
    ↓
提取数据
    ├─ 题目内容
    ├─ 作答要求
    └─ 参考答案
    ↓
标准化转换
    ├─ 真题格式
    └─ 答案格式
    ↓
保存到文件
```

### 核心组件

#### 1. Scraper 类

位置：`src/utils/scraper.js`

主要方法：
- `fetchPage(url)` - 获取网页内容
- `scrapeAipta(url)` - 解析爱真题网站
- `getQuestionDetail(url)` - 获取真题详情
- `downloadQuestions(baseUrl, limit)` - 批量下载

#### 2. ResourceModule 集成

位置：`src/modules/resource.js`

新增方法：
- `downloadFromWeb(url, limit)` - 从网络下载
- `downloadFromAipta(limit)` - 从爱真题下载
- `updateResources(options)` - 更新资源库
- `saveQuestions()` - 保存真题
- `saveAnswers()` - 保存答案

#### 3. InteractionModule 命令

位置：`src/modules/interaction.js`

新增命令：
- `update` / `下载` / `更新` - 触发下载
- 支持指定数量：`下载50道`

## 数据处理

### 数据提取流程

1. **获取真题列表**
   - 从爱真题首页解析真题链接
   - 提取标题、年份、地区等信息

2. **获取真题详情**
   - 访问每个真题详情页
   - 提取题目内容和作答要求

3. **获取参考答案**
   - 尝试访问答案页面（/answer, /jx）
   - 提取答案内容

4. **数据标准化**
   - 转换为标准格式
   - 估算难度和分数
   - 提取标签和要点

5. **去重合并**
   - 检查ID冲突
   - 保留新数据

### 字段映射

| 原始字段 | 标准字段 | 说明 |
|---------|---------|------|
| title | title | 真题标题 |
| year | year | 年份（从标题提取） |
| region | region | 地区（从标题提取） |
| level | level | 级别（国考/省考） |
| question_content | question | 题目内容 |
| requirements | requirements | 作答要求 |
| - | score | 自动估算 |
| - | difficulty | 根据内容判断 |
| - | tags | 提取关键词 |
| - | source | 数据源标识 |

## 配置选项

### 爬虫配置

在 `src/utils/scraper.js` 中：

```javascript
const scraper = new Scraper({
  baseUrl: 'https://www.aipta.com',
  timeout: 30000,        // 请求超时（毫秒）
  retryDelay: 2000,     // 重试延迟（毫秒）
  userAgent: '...',      // User-Agent 字符串
});
```

### 下载配置

在调用时指定：

```javascript
await resourceModule.updateResources({
  source: 'aipta',      // 数据源
  limit: 50,            // 下载限制
});
```

## 限制和注意事项

### 使用限制

1. **请求频率**
   - 默认每次请求间隔 1 秒
   - 避免被网站封禁

2. **下载数量**
   - 默认一次最多 50 道
   - 可根据需求调整

3. **网络环境**
   - 需要稳定的网络连接
   - 可能需要代理（如网站在境外）

### 数据质量

1. **格式差异**
   - 不同网站格式不同
   - 可能需要调整解析规则

2. **答案完整性**
   - 部分题目可能没有参考答案
   - 需要人工审核

3. **准确性**
   - 自动提取可能存在错误
   - 建议人工校验

## 扩展新数据源

要添加新的数据源，需要：

### 1. 实现解析方法

在 `Scraper` 类中添加：

```javascript
async scrapeNewSite(url) {
  const html = await this.fetchPage(url);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 根据网站结构提取数据
  const questions = this.parseNewSiteQuestions(document);
  return questions;
}
```

### 2. 添加配置

在 `ResourceModule` 中添加：

```javascript
async downloadFromNewSite(limit = 50) {
  return this.downloadFromWeb(
    'https://newsite.com/questions',
    limit
  );
}
```

### 3. 注册命令

在 `InteractionModule` 中添加命令处理。

## 调试

### 启用调试日志

设置环境变量：

```bash
LOG_LEVEL=debug npm start
```

查看爬虫日志：

```
[2024-03-01 20:00:00] [DEBUG] Fetching page: https://www.aipta.com/...
[2024-03-01 20:00:01] [DEBUG] Scraped 5 questions from https://...
```

### 测试爬虫

```javascript
import { Scraper } from './src/utils/scraper.js';

const scraper = new Scraper();
const questions = await scraper.downloadQuestions('https://...', 5);
console.log(questions);
```

## 常见问题

### Q1: 下载失败怎么办？

检查：
- 网络连接是否正常
- 目标网站是否可访问
- 是否被反爬虫机制拦截

### Q2: 数据不准确怎么办？

可以：
- 手动编辑 JSON 文件修正
- 调整解析规则
- 添加后处理逻辑

### Q3: 如何定时更新？

可以使用 cron 任务：

```bash
# 每天凌晨 2 点更新
0 2 * * * cd /path/to/project && npm run update
```

## 合规说明

使用爬虫功能时请注意：

1. **遵守网站 Robots.txt**
2. **控制请求频率，避免对服务器造成压力**
3. **数据仅供学习交流，尊重版权**
4. **不要用于商业用途**

## 后续优化

计划中的改进：

- [ ] 支持更多数据源
- [ ] 增量更新（仅下载新题目）
- [ ] 断点续传
- [ ] 并发下载（提高速度）
- [ ] 数据质量评分
- [ ] 人工审核接口

---

**文档版本**: 1.0
**最后更新**: 2026-03-01
**作者**: 哈吉米

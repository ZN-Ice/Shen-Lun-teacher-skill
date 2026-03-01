# 申论老师 JS 工具 - 产品设计文档

## 1. 产品定位

申论老师是一个基于 JavaScript 的智能教学工具，通过 OpenClaw 接入，为用户提供申论考试的真题练习和答题指导服务。

### 目标用户
- 备考公务员、事业单位等需要参加申论考试的用户
- 需要系统练习申论写作和思维能力的学习者

### 核心价值
- **真题资源**：提供历年申论真题和参考答案
- **智能引导**：通过对话引导用户培养答题思路
- **个性化优化**：针对用户答案提供优化建议
- **随时随地**：通过 OpenClaw 多渠道接入，便捷学习

---

## 2. 核心功能

### 2.1 真题管理
- **真题下载**：从指定源下载申论真题（支持多来源）
- **答案获取**：自动获取或下载参考答案
- **分类存储**：按年份、地区、难度等维度分类存储
- **缓存机制**：本地缓存已下载内容，避免重复请求

### 2.2 对话交互
- **题目推送**：主动推送适合用户水平的真题
- **答题引导**：分步骤引导用户分析题目、构思答案
- **思路拓展**：提供多种答题思路和角度
- **答案点评**：对用户答案进行点评和分析

### 2.3 智能指导
- **答题框架**：提供标准的申论答题框架
- **素材积累**：推荐相关素材和案例
- **常见误区**：提醒用户常见的答题误区
- **优化建议**：针对用户答案提供具体优化方向

### 2.4 学习记录
- **进度跟踪**：记录用户练习进度
- **历史回顾**：支持查看历史答题记录
- **能力评估**：基于练习情况评估用户能力

---

## 3. 技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      OpenClaw Platform                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ OpenClaw Agent Protocol
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  申论老师 Skill (JS)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Interaction │  │   Guide     │  │   Resource  │        │
│  │   Module    │  │   Module    │  │   Module    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                │                │               │
│  ┌──────▼────────────────▼────────────────▼───────┐      │
│  │              Core Logic Layer                    │      │
│  │  - Message Parsing                              │      │
│  │  - State Management                             │      │
│  │  - Learning Progress Tracking                   │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              External Resources                              │
│  - 真题数据源（可配置多个）                                   │
│  - 参考答案源（官方/第三方）                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 技术栈
- **运行时**：Node.js (18+)
- **语言**：JavaScript (ES2022+)
- **依赖管理**：npm
- **测试**：Jest
- **文档**：JSDoc + Markdown

### 3.3 目录结构

```
申论老师/
├── src/
│   ├── index.js              # 主入口，OpenClaw 接入点
│   ├── core/                 # 核心逻辑
│   │   ├── message-handler.js
│   │   ├── state-manager.js
│   │   └── progress-tracker.js
│   ├── modules/              # 功能模块
│   │   ├── interaction.js    # 交互模块
│   │   ├── guide.js          # 引导模块
│   │   └── resource.js       # 资源模块
│   ├── data/                 # 数据层
│   │   ├── questions.json    # 真题存储
│   │   ├── answers.json      # 参考答案存储
│   │   └── user-progress.json # 用户进度
│   ├── utils/                # 工具函数
│   │   ├── http-client.js
│   │   ├── cache.js
│   │   └── logger.js
│   └── config/               # 配置
│       └── default.js        # 默认配置
├── tests/                    # 测试
│   ├── unit/
│   └── integration/
├── docs/                     # 文档
│   ├── product-design.md
│   ├── api.md
│   └── deployment.md
├── .github/
│   └── workflows/
│       ├── ci.yml            # 持续集成
│       └── deploy.yml        # 部署流水线
├── package.json
├── README.md
└── LICENSE
```

---

## 4. API 设计

### 4.1 OpenClaw 接入接口

```javascript
// 主入口函数
async function handleMessage(context) {
  // context 结构:
  // {
  //   message: string,          // 用户消息
  //   userId: string,           // 用户ID
  //   sessionId: string,        // 会话ID
  //   platform: string,        // 平台 (feishu/telegram/discord等)
  //   metadata: object         // 其他元数据
  // }

  // 返回:
  // {
  //   reply: string,           // 回复内容
  //   actions: array,          // 后续动作（如更新状态）
  //   attachments: array       // 附件（图片、文件等）
  // }
}
```

### 4.2 核心模块接口

#### Resource Module（资源模块）
```javascript
class ResourceModule {
  // 获取真题列表
  async getQuestions(filters)

  // 下载真题
  async downloadQuestion(questionId)

  // 获取参考答案
  async getReferenceAnswer(questionId)

  // 更新资源库
  async updateResources()
}
```

#### Guide Module（引导模块）
```javascript
class GuideModule {
  // 开始答题引导
  async startGuidance(questionId, userId)

  // 分析用户答案
  async analyzeAnswer(questionId, userAnswer)

  // 提供优化建议
  async provideSuggestions(questionId, userAnswer)

  // 拓展答题思路
  async expandPerspectives(questionId)
}
```

#### Interaction Module（交互模块）
```javascript
class InteractionModule {
  // 处理用户消息
  async handleMessage(message, context)

  // 生成回复
  async generateReply(message, context)

  // 保存对话历史
  async saveConversation(userId, message, reply)
}
```

---

## 5. 用户交互流程

### 5.1 首次使用流程

```
用户: "你好，我想练习申论"
系统: "欢迎来到申论老师！我是你的申论学习助手。\n\n
       我可以帮你：\n
       1. 推送真题练习\n
       2. 引导你分析题目\n
       3. 点评你的答案\n
       4. 提供优化建议\n\n
       你想从哪里开始？"
```

### 5.2 真题练习流程

```
用户: "给我一道真题"
系统: "好的，我为你推荐一道真题：\n\n
       [2023年国考副省级申论第一题]\n
       [题目内容...]\n\n
       请先阅读题目，然后告诉我你的答题思路。"
```

### 5.3 答题引导流程

```
用户: "我的思路是..."
系统: "很好！你的思路有几个亮点：\n\n
       ✓ 抓住了材料核心\n
       ✓ 观点明确\n\n
       不过还有几个地方可以优化：\n
       1. ...（具体建议）\n
       2. ...（具体建议）\n\n
       要不要我提供一些答题框架参考？"
```

### 5.4 答案优化流程

```
用户: "这是我的完整答案..."
系统: "我分析了你的答案，整体结构完整，但在以下几个方面可以提升：\n\n
       📊 得分预估：70-75分\n\n
       优点：\n
       - ...\n
       - ...\n\n
       待改进：\n
       - ...\n
       - ...\n\n
       参考答案要点：\n
       - ...\n
       - ...\n\n
       要不要我针对某一点详细展开？"
```

---

## 6. 部署方案

### 6.1 部署目标
- **简易部署**：通过 GitHub Actions 自动化部署
- **版本管理**：使用语义化版本
- **配置灵活**：支持环境变量配置
- **监控日志**：记录关键操作日志

### 6.2 部署流程

```
┌─────────────┐
│  Push Code  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ GitHub Actions CI   │
│ - Run Tests         │
│ - Lint Code         │
│ - Build Package     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ GitHub Actions CD   │
│ - Version Bump      │
│ - Release Tag       │
│ - Deploy to Target  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  OpenClaw Integration│
│ - Reload Skill       │
│ - Update Config     │
└─────────────────────┘
```

### 6.3 环境变量配置

```bash
# 资源源配置
RESOURCE_API_URL=https://api.example.com
RESOURCE_API_KEY=xxx

# 缓存配置
CACHE_ENABLED=true
CACHE_TTL=3600

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/shenlun-teacher.log

# OpenClaw 配置
OPENCLAW_ENDPOINT=ws://localhost:8080
```

### 6.4 版本发布
- 每次合并到 main 分支自动创建新版本
- 使用语义化版本（Semantic Versioning）
- 自动生成 Release Notes

---

## 7. 功能优先级

### Phase 1 - MVP（最小可行产品）
- [x] 产品设计文档
- [ ] 基础项目结构搭建
- [ ] OpenClaw 接入接口实现
- [ ] 简单的真题存储和读取
- [ ] 基础对话交互
- [ ] GitHub Actions CI/CD 配置

### Phase 2 - 核心功能
- [ ] 真题下载功能
- [ ] 参考答案获取
- [ ] 答题引导逻辑
- [ ] 答案分析和点评
- [ ] 用户进度跟踪

### Phase 3 - 增强功能
- [ ] 多资源源支持
- [ ] 智能推荐算法
- [ ] 学习数据分析
- [ ] 图文交互支持
- [ ] 移动端优化

---

## 8. 风险与挑战

### 8.1 技术风险
- **资源获取**：部分真题来源可能不稳定或需要付费
  - 缓解方案：多源备份 + 本地存储
- **智能分析**：答案分析准确性依赖训练数据
  - 缓解方案：人工校验规则 + 持续优化

### 8.2 用户体验
- **对话自然度**：需要确保 AI 回复自然流畅
  - 缓解方案：模板化 + 上下文感知
- **个性化**：不同水平用户需求不同
  - 缓解方案：用户画像 + 自适应难度

### 8.3 合规风险
- **版权问题**：真题和参考答案可能涉及版权
  - 缓解方案：使用公开资源 + 注明来源

---

## 9. 成功指标

- **技术指标**
  - 代码覆盖率 > 80%
  - API 响应时间 < 1s
  - 系统可用性 > 99%

- **业务指标**
  - 日活用户数
  - 用户平均练习时长
  - 用户满意度评分
  - 答题准确率提升

---

## 10. 后续规划

- **短期（1-3个月）**
  - 完成 MVP 开发
  - 接入 OpenClaw
  - 收集用户反馈

- **中期（3-6个月）**
  - 完善核心功能
  - 优化用户体验
  - 扩充题库资源

- **长期（6-12个月）**
  - 智能化程度提升
  - 多平台支持
  - 商业化探索

---

**文档版本**: 1.0
**最后更新**: 2026-03-01
**作者**: 哈吉米

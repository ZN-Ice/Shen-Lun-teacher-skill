# 申论老师 - OpenClaw 智能申论教学工具

> 🎓 一个基于 JavaScript 的智能申论教学工具，通过 OpenClaw 接入，为用户提供申论考试的真题练习和答题指导服务。

## ✨ 特性

- 📚 **丰富的真题资源**：提供历年申论真题和参考答案
- 💡 **智能答题引导**：分步骤引导用户分析题目、构思答案
- ✍️ **答案智能点评**：对用户答案进行多维度分析和评分
- 🔄 **多角度思路拓展**：提供不同的答题思路和角度
- 📊 **学习进度跟踪**：记录用户练习进度，帮助持续改进

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/shenlun-teacher.git
cd shenlun-teacher

# 安装依赖
npm install
```

### 配置

创建 `.env` 文件：

```bash
# 资源配置
RESOURCE_API_URL=https://api.example.com
RESOURCE_API_KEY=your-api-key

# 缓存配置
CACHE_ENABLED=true
CACHE_TTL=3600

# 日志配置
LOG_LEVEL=info
LOG_FILE=/var/log/shenlun-teacher.log

# OpenClaw 配置
OPENCLAW_ENDPOINT=ws://localhost:8080
```

### 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📖 使用说明

### 接入 OpenClaw

申论老师作为 OpenClaw Skill，可以通过以下方式接入：

```javascript
import { handleMessage, initialize, healthCheck } from 'shenlun-teacher';

// 初始化
await initialize();

// 处理消息
const result = await handleMessage({
  message: '给我一道真题',
  userId: 'user123',
  sessionId: 'session456',
  platform: 'feishu',
  metadata: {}
});

// 健康检查
const health = await healthCheck();
```

### 用户对话示例

#### 1. 获取真题

```
用户: 给我一道真题
系统: 很好！我们来看这道真题：

     【2023年国考副省级第一题】

     📋 题目要求：
     根据"给定资料1"，请谈谈C市是如何推动人才生态建设的。

     ⚠️ 注意：准确、全面、有条理。不超过200字。

     让我们分步骤来分析这道题。

     第一步：仔细阅读题目，找出关键词和作答要求。
     你觉得这道题的关键词是什么？作答时要注意什么？
```

#### 2. 提交思路

```
用户: 这道题的关键词是"人才生态建设"、"推动"，作答要求是要概括C市的具体做法，注意不超过200字
系统: 很好！你的分析有这些亮点：

     ✓ 你识别到了以下关键词：人才生态建设、推动

     不过，还有几点可以改进：

     • 建议重新审题，找出题目中的关键词
     • 注意字数限制：不超过200字

     现在可以开始构思你的答案框架了。需要我提供一些答题模板吗？
```

#### 3. 提交答案

```
用户: 我的答案是：C市通过优化政策体系、搭建服务平台、完善评价机制、营造良好环境等方式，推动人才生态建设。一是出台人才引进和培养政策，加大政策支持力度；二是搭建一站式服务平台，提供全方位服务保障；三是建立多元化评价机制，激发人才创新活力；四是营造尊重人才的社会氛围，提升城市对人才的吸引力。
系统: 我分析了你的答案，整体来看：

     📊 **得分预估：18/20分**

     ✅ **优点：**
     - 答案结构清晰，分段合理
     - 要点覆盖全面，内容充实

     ⚠️ **待改进：**
     - 建议用词更精炼，避免口语化表达

     💡 **优化建议：**
     - 建议多练习真题，熟悉不同题型的答题要点
     - 注意控制字数，既要充分又要精炼

     📝 **参考答案要点：**
     - 优化人才政策体系，出台人才引进和培养政策
     - 搭建人才服务平台，提供全方位服务
     - 完善人才评价机制，建立多元化评价体系
     - 营造良好人才环境，提升城市吸引力

     需要我展示完整参考答案吗？
```

#### 4. 查看参考答案

```
用户: 需要看完整参考答案
系统: **参考答案**

     得分：20分

     **要点：**
     - 优化人才政策体系，出台人才引进和培养政策
     - 搭建人才服务平台，提供全方位服务
     - 完善人才评价机制，建立多元化评价体系
     - 营造良好人才环境，提升城市吸引力

     **完整答案：**
     C市通过优化政策体系、搭建服务平台、完善评价机制、营造良好环境等方式，推动人才生态建设。一是出台人才引进和培养政策，加大政策支持力度；二是搭建一站式服务平台，提供全方位服务保障；三是建立多元化评价机制，激发人才创新活力；四是营造尊重人才的社会氛围，提升城市对人才的吸引力。

     来源：官方参考答案
```

### 命令列表

| 命令 | 说明 |
|------|------|
| `帮助` 或 `help` | 显示帮助信息 |
| `真题` 或 `list` | 列出所有真题 |
| `给我一道真题` | 随机推荐一道真题 |
| `来第N题` | 获取指定题目 |
| `拓展思路` | 展示多种答题角度 |
| `参考答案` | 查看参考答案要点 |
| `状态` | 查看当前进度 |
| `重置` | 重置当前练习 |

## 🏗️ 项目结构

```
shenlun-teacher/
├── src/
│   ├── index.js              # 主入口
│   ├── config/               # 配置文件
│   ├── core/                 # 核心逻辑
│   ├── modules/              # 功能模块
│   │   ├── interaction.js    # 交互模块
│   │   ├── guide.js          # 引导模块
│   │   └── resource.js       # 资源模块
│   ├── data/                 # 数据文件
│   │   ├── questions.json    # 真题存储
│   │   └── answers.json      # 参考答案存储
│   └── utils/                # 工具函数
├── tests/                    # 测试
├── docs/                     # 文档
│   └── product-design.md    # 产品设计文档
└── .github/
    └── workflows/
        ├── ci.yml            # 持续集成
        └── deploy.yml        # 部署流水线
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 🔧 开发

### 添加真题

编辑 `src/data/questions.json`：

```json
{
  "id": "q004",
  "year": "2023",
  "region": "国考",
  "level": "地市级",
  "title": "第二题",
  "question": "题目内容...",
  "requirements": "作答要求...",
  "score": 25,
  "difficulty": "medium",
  "tags": ["标签1", "标签2"]
}
```

### 添加参考答案

编辑 `src/data/answers.json`：

```json
{
  "id": "a004",
  "questionId": "q004",
  "score": "25",
  "keyPoints": ["要点1", "要点2"],
  "fullAnswer": "完整答案...",
  "source": "官方参考答案"
}
```

## 📦 部署

项目使用 GitHub Actions 自动化部署：

- **CI 流水线**：每次 push 或 PR 自动运行测试
- **CD 流水线**：合并到 main 分支时自动发布新版本

手动发布：

```bash
# 安装 standard-version
npm install -g standard-version

# 增加版本号
standard-version

# 推送
git push --follow-tags
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

哈吉米

## 🙏 致谢

- OpenClaw - 开源 AI 助手平台
- 所有为申论教育做出贡献的人们

---

**注意**：本项目仅供学习交流使用，真题和参考答案版权归原作者所有。

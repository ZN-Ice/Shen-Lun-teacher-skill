# 申论老师 - OpenClaw 智能申论教学工具

> 🎓 一个基于 JavaScript 的智能申论教学工具，通过 OpenClaw 接入，为用户提供申论考试的真题练习和答题指导服务。

## ✨ 特性

- 📚 **丰富的真题资源**：提供历年申论真题和参考答案
- 🌐 **自动爬取真题**：从爱真题等网站自动下载最新真题和解析
- 💡 **智能答题引导**：分步骤引导用户分析题目、构思答案
- ✍️ **答案智能点评**：对用户答案进行多维度分析和评分
- 🔄 **多角度思路拓展**：提供不同的答题思路和角度
- 📊 **学习进度跟踪**：记录用户练习进度，帮助持续改进
- 🖥️ **命令行工具**：支持 CLI 命令，方便爬取和推荐真题

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/ZN-Ice/Shen-Lun-teacher-skill.git
cd Shen-Lun-teacher-skill

# 安装依赖
npm install
```

### 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 🛠️ 命令行工具

申论老师提供了强大的命令行工具，支持真题爬取、推荐、查询等功能。

### 安装 CLI

```bash
# 本地使用（推荐）
npm run cli [命令] [选项]

# 或全局安装
npm install -g .
shenlun-teacher [命令] [选项]
```

### 命令列表

#### 1. 爬取真题（scrape）

从爱真题网站爬取真题：

```bash
# 从爱真题爬取湖南申论真题（默认10道）
npm run cli scrape

# 爬取指定数量的真题
npm run cli scrape -l 20

# 从指定URL爬取
npm run cli scrape https://www.aipta.com/zt/sk/hn/sl/
```

**选项**：
- `-l, --limit <number>`: 爬取数量限制（默认：10）

#### 2. 推荐真题（recommend）

推荐一道真题：

```bash
# 随机推荐一道真题
npm run cli recommend

# 随机推荐（完整版，含材料和答案）
npm run cli recommend -m -a

# 按地区筛选推荐
npm run cli recommend --region "湖南省考"

# 按年份筛选推荐
npm run cli recommend --year "2025年"

# 按难度筛选推荐
npm run cli recommend --difficulty "hard"
```

**选项**：
- `-R, --random`: 随机推荐
- `--region <region>`: 按地区筛选
- `--year <year>`: 按年份筛选
- `--difficulty <difficulty>`: 按难度筛选（easy|medium|hard）
- `-m, --materials`: 显示给定资料
- `-a, --answer`: 显示参考答案

#### 3. 列出真题（list）

列出所有真题：

```bash
# 列出所有真题
npm run cli list

# 按地区筛选
npm run cli list --region "湖南省考"

# 按年份筛选
npm run cli list --year "2025年"

# 按难度筛选
npm run cli list --difficulty "hard"
```

#### 4. 查看状态（status）

查看真题库状态：

```bash
npm run cli status
```

**输出示例**：
```
📊 申论老师状态

════════════════════════════════
【真题库统计】
════════════════════════════════

📚 总题数: 7 道

📍 按地区:
   湖南省考: 3 道
   国考: 4 道

📅 按年份:
   2025年: 3 道
   2023年: 2 道
   2022年: 1 道

⭐ 按难度:
   ⭐ easy: 2 道
   ⭐⭐ medium: 2 道
   ⭐⭐⭐ hard: 3 道
```

## 📖 使用说明

### OpenClaw 接入

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
});

// 健康检查
const health = await healthCheck();
```

### 用户对话示例

**获取真题**:
```
用户: 给我一道真题
系统: 很好！我们来看这道真题：
     【2025年 湖南省考 省级 第二题】

     📋 题目要求：
     给定资料2中提到了"新质生产力"这一概念...

     ⚠️ 注意：分析深入，对策可行。不超过400字。
```

**提交答案**:
```
用户: 我的答案是...
系统: 我分析了你的答案，整体来看：

     📊 得分预估：18/20分

     ✅ 优点：
     - 答案结构清晰，分段合理

     ⚠️ 待改进：
     - 需要更精炼，避免口语化表达

     💡 优化建议：
     - 建议多练习真题，熟悉不同题型的答题要点
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `帮助` | 显示帮助信息 |
| `真题` | 列出所有真题 |
| `给我一道真题` | 随机推荐真题 |
| `来道湖南省的题` | 按地区推荐真题 |
| `拓展思路` | 展示多种答题角度 |
| `参考答案` | 查看参考答案要点 |
| `状态` | 查看当前进度 |
| `重置` | 重置当前练习 |
| `更新真题` | 从爱真题网站下载真题 |

## 🏗️ 项目结构

```
Shen-Lun-teacher-skill/
├── src/
│   ├── index.js              # 主入口
│   ├── config/               # 配置文件
│   ├── modules/              # 功能模块
│   │   ├── interaction.js    # 交互模块
│   │   ├── guide.js          # 引导模块
│   │   └── resource.js       # 资源模块（含爬虫功能）
│   ├── data/                 # 数据文件
│   │   ├── questions.json    # 真题存储
│   │   └── answers.json      # 参考答案存储
│   └── utils/                # 工具函数
│       ├── cache.js
│       ├── http-client.js
│       ├── logger.js
│       └── scraper.js         # 网页爬虫工具
├── tests/                    # 测试
├── docs/                     # 文档
│   ├── product-design.md    # 产品设计文档
│   ├── deployment.md       # 部署说明文档
│   └── scraper.md          # 爬虫功能文档
├── .github/workflows/        # CI/CD
├── cli.js                    # 命令行工具
├── package.json
├── README.md
└── LICENSE
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

## 📦 部署

项目使用 GitHub Actions 自动化部署：

- **CI**: 每次提交自动运行测试
- **CD**: 合并到 main 分支时自动发布新版本

详细部署说明请查看 [docs/deployment.md](docs/deployment.md)

## 📄 文档

- [产品设计文档](docs/product-design.md)
- [部署说明](docs/deployment.md)
- [爬虫功能文档](docs/scraper.md)
- [API 文档](docs/api.md) (待完善)

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 👨‍💻 作者

哈吉米

---

**注意**：本项目仅供学习交流使用，真题和参考答案版权归原作者所有。

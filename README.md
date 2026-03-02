# 申论老师 - OpenClaw 智能申论教学工具

> 🎓 一个基于 JavaScript 的智能申论教学工具，通过 OpenClaw 接入，为用户提供申论考试的真题练习和答题指导服务。

## ✨ 特性

- 📚 **丰富的真题资源**：提供历年申论真题和参考答案
- 🌐 **自动爬取真题**：从爱真题等网站自动下载最新真题和解析
- 🔗 **材料智能关联**：题目与给定资料正确关联，推送时同时显示
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

### 快速体验

```bash
# 1. 推送一道真题（含材料）
node send-question.js

# 2. 推送一道第一题（含材料）
node send-first-question.js

# 3. 检查材料和题目关联情况
node check-materials.js

# 4. 爬取新的真题（含材料）
node scrape-materials.js
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

### 实用工具脚本

#### 1. 爬取真题（含材料）- scrape-materials.js

改进的爬虫脚本，能够正确提取申论试卷的给定资料和问题，并建立正确关联：

```bash
node scrape-materials.js
```

**功能特点**：
- 自动提取给定资料（材料1、材料2、材料3...）
- 智能解析试卷中的所有题目
- 分析题目引用的材料，建立正确关联
- 支持题目引用多个材料的情况

#### 2. 推送题目（含材料）- send-question.js

随机推送一道真题，同时显示题目和对应的给定资料：

```bash
node send-question.js
```

**输出示例**：
```
📋 题目推送

══════════════════════════════════════════════════════════════════════
【2024年 湖南省考 省市卷 第三题】
══════════════════════════════════════════════════════════════════════

📋 【题目要求】
...

📖 【给定资料】
📌 给定资料3
...
```

#### 3. 推送第一题 - send-first-question.js

专门推送第一题的脚本：

```bash
node send-first-question.js
```

#### 4. 检查材料关联 - check-materials.js

检查题目和材料的关联情况，验证数据完整性：

```bash
node check-materials.js
```

**输出示例**：
```
═'.repeat(70));
【题目材料关联检查】
═'.repeat(70));

📚 总题数: 5 道

──────────────────────────────────────────────────────────────────────
【2024年 湖南省考 省市卷 第一题】
✅ 包含材料: 1 个
   - 材料1: ...

【统计结果】
✅ 包含材料的题目: 5 道
❌ 不包含材料的题目: 0 道
```
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
     【2024年 湖南省考 省市卷 第三题】

     📋 题目要求：
     市妇联刘主席代表N市在省首届儿童友好城市建设研讨会上做主题发言，
     请根据给定资料3，为刘主席拟写一份发言稿。

     ⚠️ 注意：紧扣资料，内容全面；要点突出，条理清晰；
            结构完整，语言生动；不超过600字。

     📖 给定资料：
     📌 给定资料3

     这顶凉帽是我在去年暑假跟师傅学着做的。他教我们编织的时候，
     还给我们讲凉帽民俗和客家历史...

     (完整材料内容...)
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

**材料关联效果**：

使用 `send-question.js` 推送题目时，系统会：
1. 显示题目要求
2. 显示题目关联的所有给定资料（带编号标识）
3. 提供答题提示

示例：
```
📋 题目推送

══════════════════════════════════════════════════════════════════════
【2024年 湖南省考 省市卷 第三题】
══════════════════════════════════════════════════════════════════════

📋 【题目要求】
...

──────────────────────────────────────────────────────────────────────
📖 【给定资料】
────────────────────────────────────────────────────────────

📌 给定资料3

这顶凉帽是我在去年暑假跟师傅学着做的...

──────────────────────────────────────────────────────────────────────

📊 分值：30分  |  难度：⭐⭐
🏷️  标签：儿童友好、发言稿、湖南
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
├── scrape-materials.js       # 改进的爬虫脚本（含材料）
├── send-question.js          # 推送题目脚本（含材料）
├── send-first-question.js    # 推送第一题脚本
├── check-materials.js        # 材料关联检查脚本
├── MODIFICATIONS.md          # 修改说明文档
├── package.json
├── README.md
└── LICENSE
```

### 数据结构说明

#### 题目对象结构
```json
{
  "id": "q_hn_2024_sszj_3",
  "year": "2024年",
  "region": "湖南省考",
  "level": "省市卷",
  "title": "第三题",
  "question": "市妇联刘主席代表N市在省首届儿童友好城市建设研讨会上做主题发言...",
  "requirements": "紧扣资料，内容全面；要点突出，条理清晰...",
  "score": 30,
  "difficulty": "medium",
  "tags": ["儿童友好", "发言稿", "湖南"],
  "source": "爱真题",
  "url": "https://www.aipta.com/article/9596.html",
  "materials": {
    "3": "给定资料3的完整内容..."
  }
}
```

**materials 字段说明**：
- **类型**：对象（Object）
- **键**：材料编号（字符串，如 "1", "2", "3"）
- **值**：该材料的完整内容
- **关系**：一个题目可以关联一个或多个材料

### 材料和问题关联机制

1. **爬取阶段**：
   - 从网页提取申论试卷的给定资料（材料1、材料2、材料3...）
   - 提取试卷中的所有题目（第一题、第二题、第三题...）
   - 智能分析题目引用的材料（例如"根据给定资料3"）

2. **存储阶段**：
   - 为每个题目创建独立记录
   - 将题目引用的材料关联到该题目的 materials 字段
   - 如果题目未明确引用材料，则关联所有材料

3. **推送阶段**：
   - 显示题目要求
   - 显示题目关联的所有给定资料
   - 为每个材料添加编号标识（📌 给定资料3）

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
- [修改说明文档](MODIFICATIONS.md) - 材料关联改进和新增功能说明
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

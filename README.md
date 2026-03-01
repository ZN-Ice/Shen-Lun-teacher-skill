# 申论老师 - OpenClaw 智能申论教学工具

> 🎓 一个基于 JavaScript 的智能申论教学工具，通过 OpenClaw 接入，为用户提供申论考试的真题练习和答题指导服务。

## ✨ 特性

- 📚 **丰富的真题资源**：提供历年申论真题和参考答案
- 🌐 **自动爬取真题**：从爱真题等网站自动下载最新真题和解析
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

### 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
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

**获取真题：**
```
用户: 给我一道真题
系统: 很好！我们来看这道真题：
     【2023年国考副省级第一题】
     📋 题目要求：...
```

**提交答案：**
```
用户: 我的答案是：C市通过优化政策体系...
系统: 我分析了你的答案，整体来看：
     📊 得分预估：18/20分
     ✅ 优点：...
     ⚠️ 待改进：...
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `帮助` | 显示帮助信息 |
| `真题` | 列出所有真题 |
| `给我一道真题` | 随机推荐真题 |
| `拓展思路` | 展示多种答题角度 |
| `参考答案` | 查看参考答案要点 |
| `状态` | 查看当前进度 |
| `重置` | 重置当前练习 |
| `更新真题` | 从爱真题网站下载更多真题 |
| `下载20道` | 指定下载数量下载真题 |

## 🏗️ 项目结构

```
shenlun-teacher/
├── src/
│   ├── index.js              # 主入口
│   ├── config/               # 配置文件
│   ├── modules/              # 功能模块
│   │   ├── interaction.js    # 交互模块
│   │   ├── guide.js          # 引导模块
│   │   └── resource.js       # 资源模块
│   └── utils/                # 工具函数
├── tests/                    # 测试
├── docs/                     # 文档
└── .github/workflows/        # CI/CD
```

## 🧪 测试

```bash
npm test                    # 运行测试
npm run test:coverage       # 生成覆盖率报告
```

## 📦 部署

项目使用 GitHub Actions 自动化部署：

- **CI**: 每次提交自动运行测试
- **CD**: 合并到 main 分支时自动发布新版本

详细部署说明请查看 [docs/deployment.md](docs/deployment.md)

## 📄 文档

- [产品设计文档](docs/product-design.md)
- [部署说明](docs/deployment.md)
- [API 文档](docs/api.md) (待完善)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) (待添加)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 👨‍💻 作者

哈吉米

---

**注意**：本项目仅供学习交流使用，真题和参考答案版权归原作者所有。

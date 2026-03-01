# 部署说明

本文档说明如何部署申论老师到 OpenClaw 平台。

## 部署方式

### 方式一：通过 GitHub Actions 自动部署

项目配置了 GitHub Actions CD 流水线，每次合并到 `main` 分支时会自动：

1. 运行测试
2. 增加版本号
3. 创建 GitHub Release
4. 通知 OpenClaw

**前提条件：**
- GitHub 仓库已配置 secrets（如果需要）
- OpenClaw 平台已配置 Webhook

### 方式二：手动部署

#### 1. 构建项目

```bash
# 克隆仓库
git clone https://github.com/yourusername/shenlun-teacher.git
cd shenlun-teacher

# 安装依赖
npm install

# 测试
npm test

# 打包
npm pack
```

#### 2. 上传到 OpenClaw

将生成的 `.tgz` 包上传到 OpenClaw 平台：

- 方法 A：通过 OpenClaw Web UI 上传
- 方法 B：通过 OpenClaw CLI 上传

```bash
# 使用 OpenClaw CLI（假设已安装）
openclaw skill install shenlun-teacher-1.0.0.tgz
```

#### 3. 配置环境变量

在 OpenClaw 平台配置以下环境变量：

```bash
RESOURCE_API_URL=https://api.example.com
RESOURCE_API_KEY=your-api-key
CACHE_ENABLED=true
CACHE_TTL=3600
LOG_LEVEL=info
```

#### 4. 启动 Skill

```bash
# 通过 OpenClaw CLI
openclaw skill start shenlun-teacher

# 或者通过 Web UI
# 在 Skill 管理页面点击"启动"
```

## OpenClaw 接入配置

### Skill 配置文件

创建 `skill.yaml` 或 `skill.json`：

```yaml
name: shenlun-teacher
version: 1.0.0
description: 申论老师 - 智能申论教学工具
author: 哈吉米

entrypoint: src/index.js

permissions:
  - read_messages
  - send_messages

env:
  RESOURCE_API_URL: ${RESOURCE_API_URL}
  RESOURCE_API_KEY: ${RESOURCE_API_KEY}
  CACHE_ENABLED: true
  CACHE_TTL: 3600
  LOG_LEVEL: info

resources:
  memory: 512M
  cpu: 1
```

### 接入点

申论老师提供以下接入点：

| 函数 | 说明 |
|------|------|
| `handleMessage(context)` | 处理用户消息 |
| `initialize()` | 初始化 Skill |
| `healthCheck()` | 健康检查 |

## 验证部署

### 1. 健康检查

```bash
# 通过 OpenClaw CLI
openclaw skill health shenlun-teacher

# 预期输出
{
  "healthy": true,
  "version": "1.0.0",
  "status": "running",
  "resources": {
    "initialized": true,
    "questionsCount": 3,
    "answersCount": 3,
    "status": "ok"
  }
}
```

### 2. 测试对话

```bash
# 发送测试消息
openclaw skill test shenlun-teacher "帮助"

# 预期输出
我是申论老师，你的智能申论学习助手！🎓

我可以帮你：

📚 真题练习
- 说"给我一道真题"或"来道题"

💡 答题引导
- 跟随步骤分析题目，理清答题思路

✍️ 答案点评
- 提交你的答案，我会给出分析和建议

...
```

## 日志查看

### 通过 OpenClaw CLI

```bash
# 查看实时日志
openclaw skill logs shenlun-teacher --follow

# 查看最近 100 行
openclaw skill logs shenlun-teacher --tail 100
```

### 日志文件

如果配置了 `LOG_FILE`，可以直接查看文件：

```bash
tail -f /var/log/shenlun-teacher.log
```

## 升级

### 自动升级

通过 GitHub Actions，合并新代码到 `main` 分支即可自动升级。

### 手动升级

```bash
# 停止旧版本
openclaw skill stop shenlun-teacher

# 安装新版本
openclaw skill install shenlun-teacher-x.x.x.tgz

# 启动新版本
openclaw skill start shenlun-teacher
```

## 回滚

```bash
# 停止当前版本
openclaw skill stop shenlun-teacher

# 安装旧版本
openclaw skill install shenlun-teacher-1.0.0.tgz

# 启动旧版本
openclaw skill start shenlun-teacher
```

## 监控

### 关键指标

- **响应时间**: < 1s
- **可用性**: > 99%
- **错误率**: < 1%

### 监控命令

```bash
# 查看状态
openclaw skill status shenlun-teacher

# 查看性能指标
openclaw skill metrics shenlun-teacher
```

## 故障排查

### 常见问题

#### 1. Skill 无法启动

**检查：**
- Node.js 版本是否 >= 18
- 依赖是否正确安装
- 环境变量是否配置

**解决：**
```bash
# 检查 Node.js 版本
node --version

# 重新安装依赖
npm install

# 检查环境变量
openclaw skill env shenlun-teacher
```

#### 2. 资源加载失败

**检查：**
- `questions.json` 和 `answers.json` 是否存在
- 文件格式是否正确

**解决：**
```bash
# 查看日志
openclaw skill logs shenlun-teacher | grep ERROR

# 重新初始化数据
# Skill 会自动创建默认数据
```

#### 3. 消息处理超时

**检查：**
- 响应时间是否超过限制
- 是否有外部 API 调用超时

**解决：**
- 检查 `http-client.js` 的超时配置
- 增加缓存命中
- 优化查询逻辑

## 安全建议

1. **环境变量管理**
   - 不要在代码中硬编码敏感信息
   - 使用 OpenClaw 的 secrets 管理 API keys

2. **日志安全**
   - 避免在日志中记录敏感信息
   - 设置适当的日志级别

3. **权限控制**
   - 只授予必要的权限
   - 定期审查权限配置

## 性能优化

1. **启用缓存**
   - 确保 `CACHE_ENABLED=true`
   - 合理设置 `CACHE_TTL`

2. **数据库优化**
   - 如果使用数据库，添加适当索引
   - 考虑使用连接池

3. **资源压缩**
   - 压缩静态资源
   - 启用 gzip

## 备份与恢复

### 备份数据

```bash
# 备份真题数据
cp src/data/questions.json backup/questions.json.$(date +%Y%m%d)

# 备份用户进度
cp src/data/user-progress.json backup/user-progress.json.$(date +%Y%m%d)
```

### 恢复数据

```bash
# 恢复真题数据
cp backup/questions.json.20260301 src/data/questions.json

# 重启 Skill
openclaw skill restart shenlun-teacher
```

## 支持

如遇到问题，请：

1. 查看日志文件
2. 检查 [常见问题](#常见问题)
3. 提交 GitHub Issue
4. 联系技术支持

---

**文档版本**: 1.0
**最后更新**: 2026-03-01

# 申论老师 - 创建 GitHub 仓库说明

由于需要 GitHub Personal Access Token 来创建仓库，请选择以下方式之一：

## 方式一：通过 Web UI 创建（推荐）

1. 访问 https://github.com/new
2. 仓库名称：shenlun-teacher
3. 描述：申论老师 - OpenClaw 智能申论教学工具
4. 选择 Public
5. 不要初始化 README（我们已经有代码了）
6. 点击Create repository

然后运行：

```bash
cd /home/admin/.openclaw/workspace/feishubot-project-manager
git remote add origin https://github.com/YOUR_USERNAME/shenlun-teacher.git
git branch -M main
git push -u origin main
```

## 方式二：通过 GitHub CLI

如果已安装 gh CLI：

```bash
gh repo create shenlun-teacher --public --source=. --remote=origin --push
```

## 方式三：通过 API 创建

设置 GitHub Token 后运行：

```bash
export GITHUB_TOKEN=your_token_here
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"shenlun-teacher","description":"申论老师 - OpenClaw 智能申论教学工具","private":false}'
```

创建成功后，推送代码：

```bash
git remote add origin https://github.com/YOUR_USERNAME/shenlun-teacher.git
git branch -M main
git push -u origin main
```


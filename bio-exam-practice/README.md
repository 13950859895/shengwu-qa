# 🧬 生物合格考刷题小程序

面向上海高中生物合格考的纯前端刷题工具，覆盖必修一（分子与细胞）和必修二（遗传与进化）高频单选题，支持分类刷题、错题回顾、数据统计。

## 功能特性

- **三种刷题模式**：必修一专项 / 必修二专项 / 必修一+必修二混合刷题
- **即时反馈**：作答后立即显示对错、正确答案和知识点解析
- **错题回顾**：自动收集错题，支持单独重做错题、清空错题本
- **数据统计**：展示答题总数、正确率，按模式独立统计
- **持久化存储**：基于 localStorage，刷新页面数据不丢失
- **响应式设计**：适配电脑、平板、手机多端，护眼配色
- **键盘快捷键**：← → 切换题目，1234 / ABCD 选择答案

## 项目结构

```
bio-exam-practice/
├── index.html                    # 主页面（含三个屏幕视图）
├── css/
│   └── style.css                 # 样式表（响应式 + 主题变量）
├── js/
│   ├── questions-bixiu1.js       # 必修一题库（30道）
│   ├── questions-bixiu2.js       # 必修二题库（30道）
│   ├── storage.js                # localStorage 存储管理
│   └── app.js                    # 主应用逻辑
└── README.md                     # 本文件
```

## 本地运行

直接用浏览器打开 `index.html` 即可，无需安装任何依赖。

```bash
# 方式一：双击打开
explorer index.html

# 方式二：用任意 HTTP 服务器（推荐，避免跨域限制）
npx serve .
# 或
python -m http.server 8080
```

## 部署到 GitHub Pages

### 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)，点击右上角 `+` → `New repository`
2. 仓库名填写 `bio-exam-practice`（或任意名称）
3. 选择 **Public**（公开仓库可免费使用 Pages）
4. 不勾选任何初始化选项，点击 **Create repository**

### 第二步：推送代码到仓库

```bash
# 进入项目目录
cd bio-exam-practice

# 初始化 Git
git init
git add .
git commit -m "初始化生物合格考刷题小程序"

# 关联远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/bio-exam-practice.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 第三步：开启 GitHub Pages

1. 在仓库页面点击 **Settings** → 左侧 **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，目录选择 `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟，页面显示访问地址：
   `https://YOUR_USERNAME.github.io/bio-exam-practice/`

### 第四步：验证部署

浏览器打开 `https://YOUR_USERNAME.github.io/bio-exam-practice/`，检查功能是否正常。

### 后续更新

```bash
# 修改代码后
git add .
git commit -m "描述你的改动"
git push
# GitHub Pages 会自动重新部署（约1-2分钟生效）
```

## 如何新增题目

编辑 `js/questions-bixiu1.js` 或 `js/questions-bixiu2.js`，按以下格式在数组中添加对象：

```javascript
{
  id: 'b1_031',                    // 唯一ID；必修一用b1_前缀，必修二用b2_前缀
  question: '题目内容（仅文字）',
  options: [
    'A. 选项一',
    'B. 选项二',
    'C. 选项三',
    'D. 选项四'
  ],
  answer: 0,                       // 正确答案索引：0=A, 1=B, 2=C, 3=D
  explanation: '该知识点的简要解析'
}
```

修改后刷新页面即可生效，无需重新部署。

## 数据存储说明

所有数据存储在浏览器 localStorage 中：

| Key | 说明 |
|-----|------|
| `bio_exam_wrong_bixiu1` | 必修一错题ID列表 |
| `bio_exam_wrong_bixiu2` | 必修二错题ID列表 |
| `bio_exam_wrong_mixed` | 混合模式错题ID列表 |
| `bio_exam_stats_bixiu1` | 必修一答题统计 |
| `bio_exam_stats_bixiu2` | 必修二答题统计 |
| `bio_exam_stats_mixed` | 混合模式答题统计 |
| `bio_exam_progress_*` | 各模式当前进度 |

清除浏览器数据会导致记录丢失，建议定期截图保存学习数据。

## 技术栈

- HTML5
- CSS3（CSS变量 + Flexbox + Grid + 媒体查询）
- JavaScript（ES5，兼容性好，无需Babel）
- 零依赖，仅一个 `index.html` + 4个js/css文件

## 许可

MIT License — 仅供个人学习使用，题目内容请以教材为准。

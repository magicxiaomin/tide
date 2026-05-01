# 鲷会 (TideTai) — 开发交付包

## 这是什么?

这是「鲷会」海钓决策小程序的完整开发文档包,可以直接交给 Codex / Claude / 其他 AI 编程助手作为项目上下文。

## 阅读顺序(从上到下)

| 文档 | 内容 | 何时读 |
|------|------|--------|
| [PROJECT_SPEC.md](./PROJECT_SPEC.md) | 项目总览 + 核心哲学 | **每次开发前必读** |
| [SCREENS.md](./SCREENS.md) | 9 个屏幕的功能规格 | 写某个屏幕前查阅 |
| [DATA_MODEL.md](./DATA_MODEL.md) | 数据库 schema 和数据流 | 设计后端时 |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | 后端接口清单 | 写前后端联调时 |
| [TECH_STACK.md](./TECH_STACK.md) | 技术栈 + 目录结构 | 项目初始化时 |
| [WEEK_BY_WEEK.md](./WEEK_BY_WEEK.md) | 9 周开发路线图 | 每周开始前看本周计划 |

## 如何用 Codex / AI 助手开发

### 第一步:把这个文件夹放进项目根目录

```
your-project/
├── docs/                ← 把这个文件夹放在这里
│   ├── README.md
│   ├── PROJECT_SPEC.md
│   └── ...
├── miniapp/             ← 小程序代码
└── cloud-functions/     ← 后端代码
```

### 第二步:给 AI 助手贴这段提示词(System Prompt)

```
你是「鲷会 (TideTai)」微信小程序的开发助手。

铁律(违反任何一条都不可接受):
1. 永远不要建议添加"评分""推荐""判断"类功能
2. 永远不要把用户上传的照片传到后端
3. 永远不要建议加用户社交功能(评论、关注、聊天)
4. 永远不要让一个屏幕需要滚动才能看到核心信息
5. 永远不要建议引入大型 UI 框架,保持轻量

每次写代码前,先读 docs/PROJECT_SPEC.md 的"核心哲学",
确认这次改动是否符合。

数据模型参考 docs/DATA_MODEL.md
接口契约参考 docs/API_CONTRACTS.md
屏幕规格参考 docs/SCREENS.md
技术约束参考 docs/TECH_STACK.md
当前进度参考 docs/WEEK_BY_WEEK.md
```

### 第三步:逐周让 AI 实现

```
你:"按 docs/WEEK_BY_WEEK.md 的 Week 1 任务,
    帮我实现 Splash 启动屏。注意遵守 docs/SCREENS.md 中 Screen 01 的规格。"

AI:[生成代码]

你:测试 → 跑通 → 进入下一个任务
```

---

## 核心哲学(再说一次,非常重要)

> **判断是用户的,信息是产品的承诺。**

钓鱼人不需要 App 替他判断。
钓鱼人需要 App 把判断材料给他。

这一句话,会帮你在未来 9 周里拒绝掉 80% 的"功能膨胀"诱惑。

---

## 出问题怎么办?

如果开发途中遇到方向上的犹豫(比如"这个功能要不要加"),
**回到 PROJECT_SPEC.md 的"核心哲学"部分**,
而不是凭直觉决定。

直觉会膨胀,文档不会。

---

🎣 **祝你启航。**

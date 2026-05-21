# Ask My Body｜问身

> 一个人就是一座庙。
> 问身，就是回到庙里，问问自己的身体到底想说什么。

**Ask My Body 问身** 是一个替你守夜的问身 Agent。
你睡前问身，它替你守夜：综合身体数据 + 时辰节律，在凌晨自主完成分析、动作配适、晨练准备。早晨你醒来时，已经有一份「今晨问身报告」在等你。

---

## 核心理念

它不告诉你身体怎么样，它**让你的身体说话**。

> 我问我自己的身体。
> AI 只是帮我把问题问得更清楚，把答案记录下来。

这个项目验证一件事：
**如果我们把身体当成可以对话的对象，人能不能更早感知自己的状态，并用更温和的方式照顾自己？**

---

## 系统架构

```
iPhone (Apple Watch HRV/RHR)
        │
        ▼ iOS 快捷指令 (问身-睡前 / 问身-起床)
        │
┌───────────────────────────────────────┐
│  Vercel (Next.js 14 + Vercel KV)      │
│  /sleep   睡前问身 (textarea + 时辰)   │
│  /morning 晨间报告 (Agent 2 输出)       │
│  /journal 身体日志 (长期记录)            │
└───────────────────────────────────────┘
        │
        ├── 子时 23:00 Cron → Agent 1 守夜分析师 (Sonnet 4.6)
        ├── 寅时 03:00 Cron → Agent 1 (第二轮)
        └── 卯时 起床触发  → Agent 2 晨间引导师 (Opus 4.7)
```

**时辰即系统**：当前时辰决定 Agent 的语气、推荐的古法动作、UI 的氛围。
**双 Agent 透明**：守夜分析师专注观察，晨间引导师专注综合，分工明确。
**Agent 在你睡觉时也工作**：cron 自动触发，git auto-commit 留下夜班痕迹。

---

## Demo

🌐 **Demo**: [https://ask-my-body.vercel.app](https://ask-my-body.vercel.app) ✅ 已上线
📋 **海报**: [assets/poster.png](./assets/poster.png)（U9 生成后）
🎬 **备份 demo 视频**: [assets/backup-demo.mp4](./assets/backup-demo.mp4)（U10 生成后）

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS · Noto Serif SC
- **LLM**: Claude Opus 4.7 + Sonnet 4.6（via 302.ai）
- **Storage**: Vercel KV (Redis)
- **Cron**: Vercel Cron Jobs
- **Health Data**: iOS Shortcuts + Apple Watch HRV/RHR
- **Hosting**: Vercel

---

## Dev Quickstart

```bash
# 安装依赖
npm install

# 配置环境变量（复制 .env.example 到 .env.local，填值）
cp .env.example .env.local

# 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

**环境变量** 详见 [.env.example](./.env.example)：
- `ANTHROPIC_API_KEY` + `ANTHROPIC_BASE_URL` — LLM 调用
- `KV_REST_API_*` — Vercel KV 存储
- `CRON_SECRET` — cron 路由鉴权
- `SHORTCUT_SECRET` — iOS Shortcut 鉴权

---

## 项目结构

```
ask-my-body/
├── app/                # Next.js App Router
│   ├── sleep/         # 睡前问身页
│   ├── morning/       # 晨间报告页
│   ├── journal/       # 身体日志页
│   └── api/           # API 路由 + Cron
├── components/        # UI 组件 (Shichen, BodyInput, ...)
├── lib/               # 工具函数 + Claude SDK + KV wrapper
│   └── agents/        # Agent 1 守夜分析师 + Agent 2 晨间引导师
├── prompts/           # Agent system prompts (Markdown)
├── docs/              # 文档 + 计划
│   └── plans/         # 24h 黑客松实施计划
└── assets/            # 海报、夜班录屏证据、demo 视频
```

---

## 评审维度对齐

| 维度 | 体现 |
|---|---|
| **是否有真实场景** | 失眠 / 起夜 / 疲劳 — 验证过的真实痛点 |
| **系统设计是否清楚** | 双 Agent + 三时辰 cron + KV 共享上下文，链路图一目了然 |
| **是否健康** | 项目本身关于健康恢复 + Agent 替开发者夜班工作 → 健康开发节奏 |
| **是否提交完整** | 能跑的网站 + 海报 + 公开 GitHub repo + 备份 demo 视频 |

**目标奖项叠加**:
- 🩺 LAIFE Recovery Agent Challenge
- ⚙️ 最佳 Agent 执行效率奖
- 🛌 最健康开发者奖
- 全场奖

---

## 产品边界

Ask My Body **不是医疗产品**，不诊断疾病，不声称治疗失眠，也不直接判断五脏六腑是否有问题。

它会把传统时辰养生作为**文化灵感与自我观察框架**，把现代睡眠恢复作为**低风险建议来源**。所有建议都是温和、可选择、非医疗性质的。

健康数据原则：**自愿提交、最小采集、匿名复用、不做医疗判断**。

---

## 24h 实施计划

完整执行计划见 [docs/plans/2026-05-21-001-feat-24h-hackathon-implementation-plan.md](./docs/plans/2026-05-21-001-feat-24h-hackathon-implementation-plan.md)。

---

## License

MIT

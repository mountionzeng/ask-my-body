---
title: "feat: Ask My Body 问身 — 24h 黑客松小时级实施计划"
type: feat
status: active
date: 2026-05-21
origin: README.md
---

# Ask My Body 问身 — 24h 黑客松小时级实施计划

## Summary

24 小时内独自交付 Ask My Body 问身：一个用三时辰节律调度的双 Agent 健康伴侣（守夜分析师 Sonnet + 晨间引导师 Opus），用户睡前通过 iOS 快捷指令同步 Apple Watch 数据 + 文字问身，Agent 在子时 / 寅时自主分析并在用户睡眠期间留下可观测的 git commit 与 Vercel cron 日志，用户起床后获得当日"问身报告 + 8 分钟古法养神流程"。技术栈固定为 Next.js 14 + Vercel + Vercel KV + Anthropic Claude API + Apple Shortcuts。

合体打法 = 打法 A（夜班 Agent）+ 打法 C（时辰）+ 打法 E 简版（双 Agent）。押注奖项组合：⚙️Agent 执行效率 ¥1,000 + 🩺LAIFE Recovery Agent ¥1,000 + 🛌健康开发者 ¥1,000 + 全场铜以上。

---

## Problem Frame

非技术研究员独自参赛、24-48 小时短跑，必须交付 (1) 能跑的网站 (2) 公开 GitHub repo (3) 项目海报。评审维度：是否有真实场景、系统设计是否清楚、是否健康、是否提交完整。

当前 README.md 已锁定产品方向（问身叙事 + 古法养神动作库），但 (i) MVP 6 页对独自非技术 24h 来说太散，(ii) Agent 链路看起来像单次 LLM 调用，"系统设计清楚"得分弱，(iii) 未命中"在用户睡觉时干活"这一 ⚙️ 奖核心要求，(iv) 未接入 Apple Watch 数据，🩺LAIFE 奖证据不足。本计划解决这 4 个失分点，并在 24h 内交付。

---

## Requirements

- **R1.** T+24h 之前网站三页可访问：`/sleep`（睡前问身）、`/morning`（晨间报告）、`/journal`（身体日志）
- **R2.** 部署双 Agent 系统：守夜分析师（Claude Sonnet）+ 晨间引导师（Claude Opus），两者通过 Vercel KV 共享上下文
- **R3.** 实现三时辰调度：Vercel Cron 在子时（CST 23:00）和寅时（CST 03:00）自动触发，卯时（CST 05:00-07:00）由用户起床触发
- **R4.** 接入 Apple Watch 数据：iOS 快捷指令读取 HRV + RHR + 睡眠分期 → POST 至 `/api/sleep-input` 与 `/api/wake-up`
- **R5.** 在用户睡眠的至少 4 小时内 Agent 自主完成 ≥2 次工作并产出 git commit + Vercel cron log + 屏幕录像三重证据
- **R6.** 公开 GitHub repo（含 README、架构图、本地运行说明）+ 1 张 ≥1080p 海报 + 5 分钟可朗读的 pitch 稿 + 2 分钟备份 demo 视频
- **R7.** 视觉风格：极简水墨 + 留白，顶栏始终显示当前时辰，UI 文字随时辰变换语气
- **R8.** 任何错误降级路径都不能让 demo 完全失败（详见 Risk Analysis 与 Demo 防御预案）

---

## Scope Boundaries

- **不做** HealthKit OAuth 集成 — 改走 iOS 快捷指令 + Webhook（避开苹果审批 + 24h 不可能完成的 OAuth 流程）
- **不做** 用户登录 / 多用户隔离 — 单用户演示，用环境变量锁定 owner
- **不做** 历史日志查询 / 趋势分析 — Journal 页只展示最近 ≤7 条
- **不做** 移动端原生应用 — 网站做 mobile-responsive 即可
- **不做** 八段锦动作视频自建库 — 链接到 YouTube 现有公开视频
- **不做** 真实医疗免责声明的法务审核 — 用 README 边界声明覆盖
- **不做** 健康数据加密存储 — 单用户演示，KV 直存 plaintext（demo 后立即清空）

### Deferred to Follow-Up Work

- 真 HealthKit OAuth 与多用户：黑客松后下个迭代
- 长期身体日志趋势可视化：黑客松后
- 八段锦动作内嵌视频与中英 rationale 双语：黑客松后

---

## Key Technical Decisions

- **Next.js 14 App Router + Vercel 部署**：Claude Code 默认熟练、一键部署、Vercel Cron 原生支持。理由：减少非技术作者搭基础设施时间。
- **Vercel KV (Upstash Redis)**：键值对足够 demo 用，无 schema 负担，免费层够用。理由：避免 schema migration 占用宝贵时间。
- **Anthropic Claude API（Sonnet 4.6 + Opus 4.7）**：Sonnet 跑高频快响应的 Agent 1，Opus 跑深度综合的 Agent 2。理由：成本 + 速度权衡。
- **iOS 快捷指令而非 HealthKit OAuth**：1 小时可配完，无审批，demo 当场可让评委安装。理由：把"穿戴数据"从技术风险变成"病毒安装"加分项。
- **Vercel Cron 2 个 job（子时 + 寅时）+ 卯时由起床触发**：免费层 2 cron 名额刚好够。理由：在免费层完成"夜班"叙事。
- **时辰为产品的一等公民**：UI 顶栏始终显示当前时辰，Agent 行为按时辰分支。理由：把"系统设计清楚"打到顶配，做评分维度的视觉锤。
- **CRON_SECRET 验签**：所有 cron API 路由验 `Authorization: Bearer ${CRON_SECRET}`。理由：防止公网随意触发 + 评委看到 README 时不质疑安全。
- **Demo 时间加速 dev 模式**：现场不可能等真实 4 小时，加一个 query param `?fastforward=1` 跳过 cron 等待。理由：现场可控演示。

---

## Output Structure

```
ask-my-body/
├── app/
│   ├── page.tsx                    # landing → redirect /sleep
│   ├── sleep/page.tsx              # 睡前问身
│   ├── morning/page.tsx            # 晨间报告
│   ├── journal/page.tsx            # 身体日志
│   ├── layout.tsx                  # 全局含 Shichen 组件
│   └── api/
│       ├── sleep-input/route.ts    # POST: 接收睡前输入
│       ├── wake-up/route.ts        # POST/GET: 晨起触发 Agent 2
│       ├── cron-zishi/route.ts     # 子时 cron (Agent 1, pass 1)
│       └── cron-yinshi/route.ts    # 寅时 cron (Agent 1, pass 2)
├── components/
│   ├── Shichen.tsx                 # 时辰显示组件
│   ├── BodyInput.tsx               # 睡前问身输入表单
│   └── MorningReport.tsx           # 晨间报告渲染
├── lib/
│   ├── shichen.ts                  # 时辰计算 + 时辰元数据
│   ├── kv.ts                       # Vercel KV wrapper
│   ├── claude.ts                   # Anthropic SDK wrapper
│   └── agents/
│       ├── night-watcher.ts        # Agent 1: 守夜分析师 (Sonnet)
│       └── morning-guide.ts        # Agent 2: 晨间引导师 (Opus)
├── prompts/
│   ├── night-watcher.md            # Agent 1 system prompt
│   └── morning-guide.md            # Agent 2 system prompt
├── scripts/
│   └── auto-commit.sh              # cron 触发后自动 commit 证据
├── docs/
│   ├── plans/                      # 本文件所在地
│   ├── shortcuts-setup.md          # Apple Shortcuts 配置
│   └── pitch-script.md             # 5 分钟 pitch 稿
├── assets/
│   ├── poster.png                  # ≥1080p 海报
│   ├── night-shift-evidence/       # 夜班录屏截图 + git log 截图
│   └── backup-demo.mp4             # 2 min 备份 demo
├── vercel.json                     # cron + 环境变量配置
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                      # 不入库
├── .env.example                    # 入库，列名不列值
├── .gitignore
└── README.md                       # 公开 repo 第一印象
```

---

## High-Level Technical Design

> 以下图示为方向性架构，给评审 + 实施者一眼看清产品的执行链路；不是实现规范。Agent 实现细节看各单元的 Approach。

```mermaid
flowchart TD
    iPhone[iPhone + Apple Watch]
    Shortcut1[问身-睡前 Shortcut<br/>读取 HRV/RHR]
    Shortcut2[问身-起床 Shortcut<br/>读取 Sleep Analysis]
    
    iPhone --> Shortcut1
    iPhone --> Shortcut2
    
    Shortcut1 -->|POST 睡前数据| SleepAPI[/api/sleep-input]
    Shortcut2 -->|POST 起床数据| WakeAPI[/api/wake-up]
    
    SleepAPI -->|write sleep:date| KV[(Vercel KV)]
    
    Cron1{Vercel Cron<br/>子时 23:00 CST}
    Cron2{Vercel Cron<br/>寅时 03:00 CST}
    
    Cron1 -->|trigger| Agent1[Agent 1 守夜分析师<br/>Claude Sonnet 4.6]
    Cron2 -->|trigger| Agent1
    
    Agent1 -->|read sleep:date| KV
    Agent1 -->|write night-analysis:date:zishi/yinshi| KV
    Agent1 -->|git commit| GitLog[git log 凌晨时间戳]
    
    WakeAPI -->|trigger| Agent2[Agent 2 晨间引导师<br/>Claude Opus 4.7]
    Agent2 -->|read all| KV
    Agent2 -->|write morning:date| KV
    
    Morning[/morning page]
    Morning -->|read morning:date| KV
    
    style Agent1 fill:#e8f4d4
    style Agent2 fill:#f4d4d4
    style KV fill:#d4e4f4
    style GitLog fill:#f4e4d4
```

**时辰映射表**：

| 时辰 | UTC 时间 | CST 时间 | 谁触发 | 主要行为 |
|---|---|---|---|---|
| 子时 | 15:00 | 23:00 | Vercel Cron | Agent 1 收信，初步分析当晚身体信号 |
| 寅时 | 19:00 | 03:00 | Vercel Cron | Agent 1 第二轮，检索适合晨练的古法动作 |
| 卯时 | 21:00-23:00 | 05:00-07:00 | 用户起床 Shortcut | Agent 2 综合一夜分析生成晨间报告 |

---

## Implementation Units

### U1. Pre-flight：账号、密钥、域名

**Time block:** T+0h ~ T+1h（1 小时，关键路径）

**Goal:** 把所有需要外部审批 / 注册 / 充值的事一次性做完，避免后面卡住。

**Requirements:** R1, R2, R4

**Dependencies:** 无

**Files:**
- Create: `.env.local`（不入库）
- Create: `.env.example`（入库，记录变量名）

**Approach:**
- 注册 / 登录：Vercel（用 GitHub 账号 SSO 最快）、Anthropic Console、Apple Developer 账号（如已有跳过）
- Anthropic API Key：充至少 ¥150 起步（Opus 4.7 比 Sonnet 贵 5x，dev 阶段会反复跑）
- Vercel CLI：`npm i -g vercel`，`vercel login`
- 决定 domain：要么自己买 `.com`，要么用 `<project>.vercel.app`（推荐后者，省 30 min）
- 生成 `CRON_SECRET`：`openssl rand -hex 32`，存入 .env.local
- 在 `.env.example` 列变量：`ANTHROPIC_API_KEY`、`KV_REST_API_URL`、`KV_REST_API_TOKEN`、`KV_REST_API_READ_ONLY_TOKEN`、`CRON_SECRET`、`OWNER_USER_ID`

**Patterns to follow:** 无（这一步全是账号操作）

**Test scenarios:**
- Verification only: `vercel whoami` 返回用户名；Anthropic Console 看到 ≥$20 credit；`.env.local` 包含全部 6 个变量

**Verification:**
- 所有外部账号已开通且有余额 / 配额
- `.env.local` 完整，`.env.example` 已起草

---

### U2. 项目初始化 + Git + 首次 Vercel 部署

**Time block:** T+1h ~ T+2h（1 小时）

**Goal:** 一个能在 Vercel 上访问的 "hello 问身" 网站，git 历史从 0 开始干净。

**Requirements:** R1

**Dependencies:** U1

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `.gitignore`（含 `.env.local`, `.vercel`, `node_modules`）
- Create: `README.md`（公开第一印象，先放一段产品定位 + 在建中）
- Create: `vercel.json`（占位，cron 后续填）

**Approach:**

Claude Code 提示词（复制粘贴）：
```
Create a Next.js 14 App Router project named ask-my-body at the current directory, with TypeScript, Tailwind CSS, and shadcn/ui (button, card, textarea, badge components installed). 

Design system:
- bg-stone-50 / dark mode bg-stone-950
- font: Noto Serif SC for headings, Inter for body
- accent: stone-800
- aesthetic: ink-wash minimalism, generous whitespace

The root page should be a simple landing showing "Ask My Body 问身" in centered Noto Serif SC, a 1-line tagline 一个人就是一座庙, and a primary button linking to /sleep.

Add a .gitignore that excludes .env.local, .vercel, node_modules, .next, *.log, .DS_Store.
```

然后手动执行（不要让 Claude Code 干）：
- `git init && git add . && git commit -m "init: Ask My Body 问身 skeleton"`
- GitHub 网页建 public repo `ask-my-body`
- `git remote add origin git@github.com:<user>/ask-my-body.git && git push -u origin main`
- `vercel link` → `vercel --prod`
- 在 Vercel dashboard 加环境变量（从 .env.local 复制 6 个）
- 创建 Vercel KV：dashboard → Storage → Create → KV → connect 至 project

**Patterns to follow:** Next.js 14 App Router 官方约定

**Test scenarios:**
- Happy path: `https://ask-my-body.vercel.app` 加载显示 landing 页面，点击 button 跳转 `/sleep`（404 也行，下个 unit 实现）
- Edge case: 在手机 Safari 打开应正常显示中文字体（兜底字体 fallback）

**Verification:**
- Vercel 部署 URL 可访问且渲染中文正常
- GitHub repo 公开，README 显示
- Vercel dashboard 显示 KV 已连接，6 个环境变量全部存在

---

### U3. 前端 3 页骨架 + 时辰组件

**Time block:** T+2h ~ T+5h（3 小时，最大块前端工作）

**Goal:** 三页可访问，时辰组件全局显示并按当前时间显示对应汉字 + 含义。

**Requirements:** R1, R7

**Dependencies:** U2

**Files:**
- Create: `lib/shichen.ts`（时辰计算 + 元数据）
- Create: `components/Shichen.tsx`（时辰显示，常驻顶栏）
- Create: `components/BodyInput.tsx`（睡前问身表单组件）
- Create: `components/MorningReport.tsx`（晨间报告渲染，先用 mock 数据）
- Create: `components/JournalList.tsx`（日志列表，先用 mock）
- Create: `app/sleep/page.tsx`
- Create: `app/morning/page.tsx`
- Create: `app/journal/page.tsx`
- Modify: `app/layout.tsx`（挂载 Shichen 组件）

**Approach:**

时辰映射（在 `lib/shichen.ts`）：
- 子时 23:00-01:00, 丑 01:00-03:00, 寅 03:00-05:00, 卯 05:00-07:00, 辰 07:00-09:00, 巳 09:00-11:00, 午 11:00-13:00, 未 13:00-15:00, 申 15:00-17:00, 酉 17:00-19:00, 戌 19:00-21:00, 亥 21:00-23:00
- 每个时辰带 `tone` 字段：`introspective | restorative | active | clearing | grounding`
- 每个时辰带 `whisper` 字段：1 行文案在 UI 顶部

Claude Code 提示词：
```
Implement the three pages and time-of-day system for Ask My Body:

1. lib/shichen.ts — exports getCurrentShichen() returning { name: '子', label: '子时', range: '23:00-01:00', tone: 'introspective', whisper: '...' }. Include all 12 time blocks.

2. components/Shichen.tsx — server-rendered top bar, slim, displays "现在 子时 · 一个人就是一座庙" with subtle stone-300 underline. Updates on page navigation, not real-time (acceptable for hackathon).

3. app/sleep/page.tsx — single-column form: textarea for 身体感受 (placeholder cycling between '今晚脑子停不下来 / 肩颈紧 / 23:40 还睡不着'), select for 想改善什么 (入睡/恢复/专注/情绪/久坐/焦虑), a tall primary button labeled 开始守夜. Below the button, an info box says 也可以从 iPhone 打开「问身-睡前」快捷指令 同步 Apple Watch 数据.

4. app/morning/page.tsx — renders MorningReport with mock data for now (will be replaced in U6).

5. app/journal/page.tsx — renders JournalList with mock data (3 mock entries).

6. app/layout.tsx — wrap children in a container with Shichen component at the top.

Style: stone-50 bg, Noto Serif SC headings, generous py-12 px-4 spacing, no shadows, just hairline borders.
```

**Patterns to follow:**
- Next.js 14 server components by default
- shadcn/ui Card / Button / Textarea / Select 组件
- Tailwind 类名直接写在 JSX 中

**Test scenarios:**
- Happy path: 三页都能访问，时辰组件按当前时间正确显示（午时午时显示午）
- Edge case: 23:00-23:59 范围内，时辰组件正确显示「子时」而非「亥时」（边界正确）
- Happy path: /sleep 表单可填写，提交按钮点击触发 console.log（先不真提交，U4 接入）
- Mobile: iPhone Safari 上 /sleep 表单全屏可见，textarea 足够大

**Verification:**
- 三页公网可访问且渲染正常
- 顶栏时辰正确
- /sleep 表单可正常填写

---

### U4. 数据层（Vercel KV）+ API 路由骨架

**Time block:** T+5h ~ T+7h（2 小时）

**Goal:** 睡前输入能写入 KV，起床能从 KV 读回。所有 cron 路由验签。

**Requirements:** R2, R4, R8

**Dependencies:** U2, U3

**Files:**
- Create: `lib/kv.ts`（封装 KV read/write，key 命名规范）
- Create: `lib/auth.ts`（CRON_SECRET 验签 helper）
- Create: `app/api/sleep-input/route.ts`（POST）
- Create: `app/api/wake-up/route.ts`（POST + GET）
- Modify: `package.json`（add `@vercel/kv`, `@anthropic-ai/sdk`, `zod`）

**Approach:**

KV key 规范（写入 `lib/kv.ts` 顶部注释）：
- `sleep:{YYYY-MM-DD}` → { textInput, hrv?, rhr?, submittedAt }
- `night-analysis:{YYYY-MM-DD}:zishi` → Agent 1 子时输出
- `night-analysis:{YYYY-MM-DD}:yinshi` → Agent 1 寅时输出
- `morning:{YYYY-MM-DD}` → Agent 2 晨间报告
- `journal:{YYYY-MM-DD}` → 短日志条目（用户 + Agent 2 共建）

API 路由签名（不写代码细节，只描述合约）：
- `POST /api/sleep-input`：接收 `{ textInput: string, hrv?: number, rhr?: number, shortcutSecret?: string }`，校验后写入 KV，返回 `{ ok, date, shichen }`
- `GET /api/wake-up`：读取今日 KV，返回 `{ sleep, nightAnalysis, morning }`（用于 /morning 页面渲染）
- `POST /api/wake-up`：触发 Agent 2，写入 morning:{date}，返回报告（U6 实现）
- `/api/cron-zishi` 和 `/api/cron-yinshi`：U5 实现，但本单元先建空 route 返回 200

CRON_SECRET 验签：
- Vercel Cron 自动带 `Authorization: Bearer ${CRON_SECRET}` header
- `lib/auth.ts` 导出 `verifyCronSecret(req): boolean`
- 任何 cron 路由首行调用此函数，失败返回 401

Apple Shortcut 验签：
- iOS Shortcut 用 `shortcutSecret` body 字段（与 CRON_SECRET 不同的 env var `SHORTCUT_SECRET`）
- `/api/sleep-input` 和 `/api/wake-up` 校验 shortcutSecret

**Patterns to follow:** Next.js 14 Route Handler 约定，`zod` 校验 body schema

**Test scenarios:**
- Happy path: `curl -X POST localhost:3000/api/sleep-input -d '{"textInput":"test","shortcutSecret":"..."}'` 返回 200 且 KV 中可见 sleep:{今天} key
- Error path: 不带 shortcutSecret 应返回 401
- Error path: textInput 为空字符串应返回 400
- Happy path: `curl localhost:3000/api/wake-up` 返回 200 + 包含今日 sleep 数据
- Edge case: 凌晨 1:00 提交 sleep-input 应正确写入「昨日」date key（避免跨夜 bug）

**Verification:**
- 全部 API 路由 200/4xx 行为符合预期
- Vercel KV dashboard 可见写入的 key

---

### U5. Agent 1: 守夜分析师 + 子时/寅时 Cron

**Time block:** T+7h ~ T+10h（3 小时，技术核心）

**Goal:** Vercel Cron 在子时和寅时自动触发，调用 Claude Sonnet 完成两次身体信号分析，结果写入 KV。这是 ⚙️Agent 效率奖的核心证据来源。

**Requirements:** R2, R3, R5

**Dependencies:** U4

**Files:**
- Create: `lib/claude.ts`（Anthropic SDK wrapper，封装重试 + 日志）
- Create: `lib/agents/night-watcher.ts`（Agent 1 实现）
- Create: `prompts/night-watcher.md`（Agent 1 system prompt，独立文件方便迭代）
- Modify: `app/api/cron-zishi/route.ts`
- Modify: `app/api/cron-yinshi/route.ts`
- Modify: `vercel.json`（加 cron schedule）
- Create: `scripts/auto-commit.sh`（cron 触发后自动 commit，留 git 证据）

**Approach:**

Agent 1 system prompt 结构（写在 `prompts/night-watcher.md`）：
- 角色：守夜分析师，扮演中医视角 + 现代睡眠科学 hybrid
- 知识：六腑十二经 + Matthew Walker《Why We Sleep》核心论点
- 风格：低能量、慢节奏，输出短句
- 工具调用约束：必须输出 JSON `{ bodySignal, recommendedShichenAction, internalNoteForAgent2 }`
- 边界：绝不诊断疾病，绝不下任何"你有 X 病"判断

Agent 1 在两次 cron 中的不同行为：
- **子时**：input = 当晚 sleep 输入；output = bodySignal 初步解释 + internalNote
- **寅时**：input = 当晚 sleep + 子时 analysis；output = 早起推荐的古法动作（八段锦 / 金刚功 / 站桩 / 拍打 / 导引 / 呼吸 任选 1-3 个）+ 给 Agent 2 的 note

`vercel.json` cron schedule：
```json
{
  "crons": [
    { "path": "/api/cron-zishi", "schedule": "0 15 * * *" },
    { "path": "/api/cron-yinshi", "schedule": "0 19 * * *" }
  ]
}
```
（注：Vercel Cron 用 UTC；CST 23:00 = UTC 15:00 = 子时；CST 03:00 = UTC 19:00 = 寅时）

auto-commit 脚本逻辑：
- 在每个 cron 路由结尾，写一个 marker file `night-shift-log/{date}-{shichen}.json`（包含时间戳 + 简短 summary）
- 触发 GitHub API commit（用 PAT），commit message = `[night-shift] {shichen} analysis at {iso-timestamp}`
- 失败不阻塞主流程

Claude Code 提示词：
```
Implement Agent 1 (守夜分析师) for Ask My Body:

1. lib/claude.ts — wraps @anthropic-ai/sdk with: createMessage(model, systemPrompt, userMessage, maxTokens), automatic retry on 429/500 (3 retries with exponential backoff), structured logging to console.

2. lib/agents/night-watcher.ts — exports runNightWatcher(shichen: 'zishi' | 'yinshi', date: string) which:
   - reads sleep:{date} and (for yinshi) night-analysis:{date}:zishi from KV
   - reads prompts/night-watcher.md as system prompt
   - calls Claude Sonnet 4.6 with model 'claude-sonnet-4-6'
   - parses JSON response, validates with zod
   - writes night-analysis:{date}:{shichen} to KV
   - triggers auto-commit (best-effort, ignore failures)
   - returns analysis object

3. app/api/cron-zishi/route.ts — GET handler that calls verifyCronSecret(req), then runNightWatcher('zishi', today())

4. app/api/cron-yinshi/route.ts — same shape, with 'yinshi'

5. scripts/auto-commit.sh — bash script that takes a date and shichen arg, writes night-shift-log/{date}-{shichen}.json, and uses gh CLI or curl + PAT to commit and push to the project's GitHub repo.

The system prompt prompts/night-watcher.md should be 200-400 words of carefully crafted Chinese prose defining the role, knowledge, voice, output JSON schema, and safety boundaries.
```

**Execution note:** 推荐用 Claude Code 先写 prompts/night-watcher.md，把 system prompt 反复迭代 3-5 次（用 Claude Code 模拟运行），prompt 质量直接决定 demo 现场观感。

**Patterns to follow:**
- Anthropic SDK 官方约定（messages.create）
- Next.js Route Handler `GET` export

**Test scenarios:**
- Happy path: 手动 `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron-zishi` 触发，KV 中出现 night-analysis:{today}:zishi，内容为 valid JSON 含 bodySignal 字段
- Happy path: 子时跑完后跑寅时，寅时能正确读到子时输出并产出 recommendedShichenAction
- Error path: 不带 Authorization header 返回 401
- Error path: KV 中没有 sleep:{today} 时 cron 应优雅返回（写一个"今日无输入"占位 analysis，而不是 500）
- Error path: Claude API 返回非 JSON 时应有 fallback（再试 1 次，仍失败则写入降级 analysis）
- Integration: 真正等到子时 cron 自动触发，Vercel Function logs 显示触发记录 + KV 写入

**Verification:**
- Vercel dashboard → Crons 显示两个 job 已注册
- 手动触发两次后 KV 中可见两个 night-analysis key
- GitHub repo 收到 [night-shift] commit

---

### U6. Agent 2: 晨间引导师 + /api/wake-up 完成

**Time block:** T+10h ~ T+11h（1 小时，相对快）

**Goal:** 用户起床触发后，Agent 2 综合所有当晚分析生成晨间报告，写入 KV，/morning 页渲染。

**Requirements:** R2, R4

**Dependencies:** U5

**Files:**
- Create: `lib/agents/morning-guide.ts`
- Create: `prompts/morning-guide.md`
- Modify: `app/api/wake-up/route.ts`（接 Agent 2）
- Modify: `app/morning/page.tsx`（从 mock 切到真数据）
- Modify: `components/MorningReport.tsx`（适配真实 schema）

**Approach:**

Agent 2 system prompt 结构：
- 角色：晨间引导师，行动设计师 + 身体感受翻译员视角
- 输入：sleep:{date} + night-analysis:{date}:zishi + night-analysis:{date}:yinshi
- 输出 JSON：`{ question, bodySignalSummary, morningRoutine: [{ action, duration, why }], reminder, journalEntry }`
- 风格：温柔但不矫情，避免"打卡感"

Agent 2 跑 Opus 而非 Sonnet：因为它做综合 + 文学性输出，Opus 在 Chinese prose 上明显更好。

`/api/wake-up` 行为：
- POST：触发 Agent 2，返回 morning report；写入 morning:{date} + journal:{date}
- GET：只读 morning:{date}，给 /morning 页面用

/morning 页面 server component：从 KV 读 morning:{today}，渲染。如果今天没有，显示"今天还没问身。先去 /sleep 吧。"

**Patterns to follow:** 与 Agent 1 一致

**Test scenarios:**
- Happy path: 完整流程跑通后 POST /api/wake-up 产出有意义的 morning report
- Error path: 缺少 night-analysis 时 fallback 到 "晨间引导师只能用睡前输入，输出降级报告" 而非 500
- Edge case: morning routine 数组应为 1-3 个 action（prompt 中约束）
- Integration: /morning 页面读取并正确渲染所有字段

**Verification:**
- 完整链路 sleep → cron-zishi → cron-yinshi → wake-up → /morning 全部跑通
- /morning 页面在手机上读起来"像是早晨写给你的信"，不是 chatbot 输出

---

### U7. Apple Shortcuts 配置 + 端到端联调

**Time block:** T+11h ~ T+12h（1 小时）

**Goal:** 两个 iOS 快捷指令配完，从 iPhone 点 Shortcut 能完整跑通至 Vercel + Claude，真实 Apple Watch 数据走完一遍。

**Requirements:** R4, R5

**Dependencies:** U6

**Files:**
- Create: `docs/shortcuts-setup.md`（含截图 + 步骤）
- 不修改代码

**Approach:**

「问身-睡前」Shortcut 步骤：
1. Get Health Samples: Heart Rate Variability, Last 1 hour, average
2. Get Health Samples: Resting Heart Rate, Today, latest
3. Ask for Input: textinput for 身体感受
4. Get Contents of URL: POST `https://<domain>/api/sleep-input` with JSON body `{ textInput, hrv, rhr, shortcutSecret }`
5. Show Notification: "守夜开始"

「问身-起床」Shortcut 步骤：
1. Get Health Samples: Sleep Analysis, Last 12 hours
2. Get Contents of URL: POST `https://<domain>/api/wake-up` with body `{ sleepData, shortcutSecret }`
3. Wait for response
4. Open URL: `https://<domain>/morning`

把两个 Shortcut 通过 iCloud Share 链接保存（demo 时可让评委直接安装）。

**Execution note:** 如果 iOS Shortcut 抓 HRV 时返回空（Apple Watch 数据没同步），切到降级模式：
- 让 Shortcut 直接打开 web `/sleep` URL，让用户手动输入文字
- 这是 U8 之前的最后一道防线，必须在 U7 末尾测通

**Patterns to follow:** Apple Shortcuts 官方"Get Health Samples"流程

**Test scenarios:**
- Happy path: 真机 iPhone 点 问身-睡前 → 弹输入 → POST 成功 → Vercel logs 显示数据带 hrv 值
- Edge case: Apple Watch 未同步 / HRV 数据缺失 → Shortcut 不挂掉，hrv 字段为 null
- Error path: shortcutSecret 配错 → Vercel 返回 401，Shortcut 显示错误通知（而非默默吞掉）
- Integration: 完整 24h 时段模拟 — 23:00 跑睡前 → 手动触发 cron-zishi → 03:00 手动触发 cron-yinshi → 早上跑起床 Shortcut → /morning 看到真实数据

**Verification:**
- 两个 Shortcut 在 iPhone 上可点击触发
- Vercel logs 显示来自 Shortcut 的请求带 Apple Watch HRV 数据
- /morning 在 iPhone Safari 上渲染正确

---

### U8. ★ 夜班执行 + 可观测性证据采集 ★

**Time block:** T+12h ~ T+16h（4 小时，用户睡眠）

**Goal:** 用户真睡 4 小时，Agent 在睡眠期间真触发 ≥2 次，留下屏幕录像 + git log + Vercel cron log 三重证据。**这是 ⚙️Agent 效率奖 + 🛌健康开发者奖 + 系统设计清楚 的核心物料。**

**Requirements:** R5, R8

**Dependencies:** U7

**Files:**
- Create: `assets/night-shift-evidence/` 目录（凌晨录屏截图存放）
- 不写新代码

**Approach:**

睡前准备（T+12h，约 22:30-23:00 钟点）：
- 一台电脑屏幕始终打开 Vercel logs tail + GitHub repo commits 页 + 终端 `git log --oneline -20 -w` 持续刷新
- 用 OBS 或 QuickTime 屏幕录制，覆盖这三个窗口
- 自己戴 Apple Watch 上床
- 23:00 之前点 问身-睡前 Shortcut（让数据先到 KV）
- 设闹钟 ≥ 4 小时后（推荐 03:30 或 04:00 起床）

睡眠期间（用户不参与）：
- 23:00 子时 cron 自动触发 → Agent 1 跑分析 → KV 写入 → git auto-commit
- 03:00 寅时 cron 自动触发 → Agent 1 第二轮 → KV 写入 → git auto-commit
- 屏幕录像默默捕获两次触发的瞬间（terminal 出现 commit、Vercel logs 出现 invocation、KV dashboard key 数量变化）

起床（T+16h，约 04:00 钟点）：
- 点 问身-起床 Shortcut → Agent 2 跑 → /morning 自动打开
- 停止录屏
- 把录屏剪成 30 秒精华片段（凌晨 02:55-03:05 cron 触发时刻 + git commit 时刻），保存为 `assets/night-shift-evidence/yinshi-cron-fire.mp4`

**Execution note:**
- **不要** 在睡前还在改代码 — U7 验证通过后立刻冻结
- **不要** 把闹钟设在卯时 cron 之前（避免自己关掉录屏后 cron 才跑）
- 备份方案：如果一觉睡过头 / 录屏中断 / cron 没跑，T+16h 起床后可补救 — 用 dev fastforward 模式重新跑一遍，加录屏标注"模拟 24h 自主"

**Patterns to follow:** 无

**Test scenarios:**
- Verification only: 起床后 git log 显示 ≥2 个时间戳在 23:00-04:00 之间的 commit
- Verification only: Vercel Functions tab 显示 ≥2 次 cron invocation
- Verification only: KV 中 night-analysis:{date}:zishi 和 night-analysis:{date}:yinshi 都存在

**Verification:**
- 屏幕录像文件长度 ≥ 4h，包含 ≥2 处可见的 cron 触发时刻
- git log 含凌晨 commit
- /morning 显示完整融合三段分析的报告

---

### U9. 起床后整理 + 海报 + GitHub README 打磨

**Time block:** T+16h ~ T+19h（3 小时）

**Goal:** 把夜班产出整理成 demo 可用素材，做出 ≥1080p 海报，公开 repo 的 README 看起来像一个真产品。

**Requirements:** R6

**Dependencies:** U8

**Files:**
- Create: `assets/poster.png`（用 Figma / Canva / v0.dev 设计）
- Create: `assets/night-shift-evidence/cron-fire.png`（凌晨录屏截图，叠加时间戳标注）
- Create: `assets/night-shift-evidence/git-log.png`
- Create: `assets/architecture-diagram.png`（前面那张 mermaid 渲染成 PNG）
- Modify: `README.md`（完整版）

**Approach:**

海报内容（一张图）：
- 标题：Ask My Body 问身
- 副标题：替你守夜的问身 Agent
- 中央：用一句话 + 一张简化 Agent 链路图说清产品
- 底部三件套：Demo URL 二维码、GitHub URL、技术栈 logos
- 视觉：水墨风 + 一座庙的 silhouette + 留白
- 尺寸：1080×1920 或 1280×720（看赛事要求）

README 必含部分：
- 一句话定位
- Demo URL + Demo 视频（YouTube/B 站 链接）
- 屏幕截图 3 张：/sleep, /morning, journal
- Mermaid 架构图（GitHub 原生支持）
- 「为什么这个项目存在」段落（精神内核）
- 本地运行 4 步指南
- 致谢 / 版权 / 免责声明

**Patterns to follow:** GitHub awesome-readme 项目

**Test scenarios:**
- Verification only: 海报 PNG ≥ 1080p，在打印机 A3 尺寸下文字仍清晰可读
- Verification only: README 在 GitHub 网页上渲染，所有图片不挂、mermaid 渲染正确
- Verification only: Demo URL 在隐身窗口可访问

**Verification:**
- README 通过 GitHub 渲染检查
- 海报 ≥1080p
- 三张证据图片放在 night-shift-evidence/

---

### U10. Pitch 稿 + Demo 演练 + 备份视频

**Time block:** T+19h ~ T+22h（3 小时）

**Goal:** 5 分钟稿子背到能流畅讲，备份视频可独立讲完故事，演练 ≥3 次。

**Requirements:** R6

**Dependencies:** U9

**Files:**
- Create: `docs/pitch-script.md`（完整稿子 + 切屏指令）
- Create: `assets/backup-demo.mp4`（2 分钟）

**Approach:**

Pitch 稿结构（已在上轮对话中给出，5 段 850 字）：
- 0:00-0:30 Hook（庙的隐喻 + 247 访谈引用）
- 0:30-1:30 Problem（数据 ≠ 理解）
- 1:30-3:30 Demo（夜班全流程演示）
- 3:30-4:30 System Design（双 Agent + 时辰调度图）
- 4:30-5:00 Closing（情绪锚点）

切屏 cue：
- 1:30 切到 /sleep 页面
- 1:50 切到 iPhone Shortcut 演示
- 2:10 切到夜班录屏（30 秒精华版）
- 2:50 切到 git log 时间戳屏
- 3:10 切到 /morning 页面
- 3:30 切到架构图

备份视频：
- 用 OBS 录一个 2 分钟版本，包含完整 demo flow
- 上传 B 站（公开但不一定推荐到首页）
- README 放链接

演练规则：
- 第 1 遍：开屏录像，自己看回放找硬伤
- 第 2 遍：找一个不懂技术的朋友视频通话，让对方"装评委"
- 第 3 遍：掐表，必须 4:50-5:00 之间结束

**Patterns to follow:** Y Combinator demo day 风格（短、具体、有故事）

**Test scenarios:**
- Verification only: 稿子打印成纸，能不看屏幕讲下来
- Verification only: 备份视频 ≤ 2:00，story arc 完整
- Verification only: 网络断了仍能用备份视频讲完

**Verification:**
- 演练 ≥3 次，最后一次 4:50-5:00 完成
- 备份视频 ≤ 2 分钟

---

### U11. 缓冲 + 提交三件套 + 最终验证

**Time block:** T+22h ~ T+24h（2 小时）

**Goal:** 修最后的 bug，提交三件套，做一次端到端最后验证。

**Requirements:** R1, R6

**Dependencies:** U10

**Files:**
- Update: `README.md`（最终版含 Demo 视频 + 海报缩略图）
- Final commit + tag v1.0
- Submit form 填写

**Approach:**

T+22h ~ T+23h（缓冲修 bug）：
- 优先级排序：能跑 > 看起来美 > 完美。任何会让 demo 挂的 bug 都修；其他记 issue 留 follow-up
- 把所有 KV 测试数据清掉，留一份"干净的演示数据"种好

T+23h ~ T+24h（提交）：
- 给 repo 加 tag：`git tag v1.0 && git push --tags`
- 最终 Demo URL 检查（隐身窗口 + 朋友手机 + 评委可能用的设备类型）
- 黑客松提交表填写
- 自愿提交健康数据（如果选择参 🛌 健康开发者奖）

**Patterns to follow:** 无

**Test scenarios:**
- Verification only: 端到端 fresh run 从陌生环境（隐身窗口 + 没登录）能跑通 sleep → wake-up
- Verification only: GitHub repo 上的链接全部可点
- Verification only: 海报文件大小 ≤ 5MB（提交表通常限制）

**Verification:**
- 三件套（Demo URL + GitHub repo + 海报）全部提交且可访问
- 一个完全不知情的人在 2 分钟内能从 GitHub 跳到 Demo

---

## 24h 总览时间表

| 时段 (T+) | 时长 | 单元 | 关键产出 | 阻塞下游? |
|---|---|---|---|---|
| 0h-1h | 1h | U1 | 账号、密钥、env | 是 |
| 1h-2h | 1h | U2 | Vercel 部署 + GitHub repo | 是 |
| 2h-5h | 3h | U3 | 3 页前端 + 时辰 | 是 |
| 5h-7h | 2h | U4 | KV + API 骨架 | 是 |
| 7h-10h | 3h | U5 | Agent 1 + cron | 是（最关键） |
| 10h-11h | 1h | U6 | Agent 2 + /morning | 是 |
| 11h-12h | 1h | U7 | Apple Shortcuts + 端到端 | 是 |
| 12h-16h | 4h | U8 | ★ 睡眠 + 夜班自跑 ★ | 否（用户睡） |
| 16h-19h | 3h | U9 | 海报 + README + 证据 | 否 |
| 19h-22h | 3h | U10 | Pitch 稿 + 演练 + 备份视频 | 否 |
| 22h-24h | 2h | U11 | 缓冲 + 提交 | 否 |

**关键路径**：U1 → U2 → U3 → U4 → U5 → U6 → U7 → U8。U5 是技术风险最高的单元（Vercel Cron + Claude API + KV 三个新东西第一次合体），保护好这 3 小时不被 U3 / U4 挤压。

---

## System-Wide Impact

- **Interaction graph:** iPhone Shortcut → Vercel Edge → Next.js Route Handler → Vercel KV / Anthropic API → KV → Front-end. 任何一环 500 都会让链路断；每一环都需要有 fallback。
- **Error propagation:** Claude API 失败应降级为"今晚 Agent 静默观察，不输出建议"，而非 500。Apple Watch HRV 缺失应优雅处理为 null。
- **State lifecycle risks:** KV 的 sleep:{date} key 在跨夜（00:00 切换）时容易写到错误的 date，需要在 sleep-input handler 中根据时辰决定归属哪一天（23:00 后到 06:00 之前都算"昨天的睡眠"）。
- **API surface parity:** /api/wake-up 既支持 POST（触发 Agent 2）也支持 GET（读取已生成的报告），两者签名要清晰区分。
- **Integration coverage:** 真正的端到端测试只能在 U7 跑通；mock 测试不够，因为 Vercel Cron 行为只有真部署能验。
- **Unchanged invariants:** /sleep 的 textInput 必填这一点贯穿全产品，是 Agent 1 / 2 的前置假设。即使 Apple Watch 数据缺失，textInput 也必须存在。

---

## Risks & Dependencies

| 风险 | 影响 | 缓解 |
|---|---|---|
| Vercel Cron 免费层只有 2 个 job | 卯时无法 cron | 卯时由用户起床 Shortcut 触发，规避 |
| Apple Shortcut HRV 抓不到（设备未同步 / 权限缺） | LAIFE 奖证据弱 | 降级用 RHR 或纯 textInput，并在 demo 用预录视频展示成功路径 |
| Claude API 凌晨高峰超时 | Agent 不跑或跑慢 | lib/claude.ts 内置重试 3 次 + 降级到 Haiku |
| 用户睡过头 / 闹钟没响 | T+16h 后所有工作被压缩 | 设 2 个不同设备的闹钟；T+12h 进入前先把闹钟测一次 |
| Vercel 部署失败 / DNS 问题 | Demo 不可访问 | 备份 demo 视频；Demo URL 准备两个域名 |
| 黑客松现场网络差 | Live demo 翻车 | 整段 demo 在备份视频里完整呈现，live 只展示"按 Shortcut → 等待 → 显示报告"3 个交互 |
| 海报设计花时间过多 | 挤掉 Pitch 演练时间 | T+19h 之前必须海报锁定，否则用 v0.dev 模板兜底 |
| 凌晨 Agent 真跑出"难看"的输出（中文不通顺） | Demo 演示尴尬 | U5 中 prompt 反复迭代 + 准备 1 份"种子睡前输入"保证 Agent 输出可控 |

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Apple Shortcut HRV 抓不到 | 高 | 中 | 降级路径已设计；demo 走预录视频 |
| Vercel Cron 没按时触发 | 中 | 高 | T+11h 端到端测试中提前手动触发一次验证，确认 schedule 正确 |
| Claude API 月度配额耗尽 | 低 | 极高 | U1 充值 ≥¥150；监控 dashboard |
| 用户在 U5 卡住超时 3h | 中 | 高 | U5 11h 截止前进度<70% 时砍 Agent 2 到 Sonnet（与 Agent 1 共用模型），保住流程 |
| Pitch 稿读不流畅 | 中 | 高 | T+22h 之前必须独立朗读 ≥5 遍 |
| 海报设计平庸 | 中 | 中 | 准备 2-3 个 v0.dev 模板做底，不从 0 开始 |
| Demo 现场设备问题（评委 iPhone 装不上 Shortcut） | 低 | 中 | 备份方案：把 Shortcut 装在自己手机上演给评委看；不依赖现场分发 |

---

## Demo 防御预案

按"失败深度"分级，每级都有兜底：

**L1: 一切正常** → 走完整 live demo，按 pitch 稿 5 分钟节奏
**L2: Wifi 慢但可用** → 跳过 Apple Shortcut 演示（耗时），改用桌面 fastforward 模式
**L3: Wifi 断 / Vercel 慢** → 全程播 backup-demo.mp4，用 pitch 稿口播覆盖
**L4: 笔记本死机 / 投影坏** → 用手机播放视频 + 口播
**L5: 全部失败** → 凭海报 + 一张架构图徒手讲，保证情绪锚点和"庙"的隐喻不丢

每个级别都演练过一次。

---

## Open Questions

### Resolved During Planning

- Plan 文件位置：`/Users/yuandai/Desktop/Ask My Body 问身/docs/plans/2026-05-21-001-feat-24h-hackathon-implementation-plan.md`（与项目同 repo）
- 时间基准：T+Xh 相对时间，用户起跑时映射到实际钟点
- 海报和 README 用什么工具：Figma / Canva / v0.dev 三选一，U9 时根据当时手感决定
- 卯时不上 cron 而靠 Shortcut 触发：决定，省一个 cron 名额

### Deferred to Implementation

- Agent 1 / Agent 2 的 system prompt 具体措辞 → U5 / U6 实现时迭代 3-5 次
- 时辰每个对应的 whisper 文案 → U3 实现时由 Claude Code 生成初版，用户微调
- 海报的具体排版 → U9 实现时决定
- Pitch 稿临场调整 → U10 演练时根据语速调
- Apple Watch HRV 字段在 Shortcut 中的具体取法（Last 1 hour average vs Latest）→ U7 真机测试时决定

---

## Documentation / Operational Notes

- README 必须包含"非医疗免责声明"段落（README.md 已有，保留）
- Vercel 部署后立即配 Production environment variables，不要漏 SHORTCUT_SECRET
- KV 在 demo 后建议手动清空（避免 demo 数据被陌生人看到，虽然是公开 demo）
- GitHub repo 提交前 `git log --all` 检查没有 .env.local 误入
- 自愿提交健康数据时，截图打码个人识别信息

---

## Sources & References

- **Origin document:** [README.md](../../README.md)（项目说明 + 黑客松奖项列表）
- **Strategy decision history:** 本对话上轮的「合体方案」决定（打法 A + C + E 简版）
- **Prize structure:** 黑客松规则（全场奖 ¥3,000/¥2,000/¥1,000 + 4 个 ¥1,000 专项奖可叠加）
- **External references:**
  - Next.js 14 App Router docs
  - Vercel Cron docs (https://vercel.com/docs/cron-jobs)
  - Anthropic SDK docs
  - Apple Shortcuts user guide (Get Health Samples action)

# iOS Shortcuts 配置指南

用两个 Shortcuts 把 Apple Watch 数据推给 Ask My Body。

---

## 快捷指令 1：晨起问身（早上用）

**功能**：醒来后，把昨晚的 HRV、静息心率、睡眠时长推给 Agent 2，并打开晨间报告页。

### 步骤

1. 打开「快捷指令」App → 新建
2. 依次添加以下动作：

```
[获取健康样本]
  类型: 心率变异性 (HRV)
  聚合: 最近 1 个样本
  → 存为变量 "我的HRV"

[获取健康样本]
  类型: 静息心率
  聚合: 最近 1 个样本
  → 存为变量 "我的RHR"

[获取健康样本]
  类型: 睡眠分析
  聚合: 最近 1 个样本（类型: InBed 或 Asleep）
  → 存为变量 "睡眠时长"（取 duration 字段，单位秒 ÷ 3600 = 小时）

[获取 URL 的内容]
  URL: https://ask-my-body.vercel.app/api/wake-up
  方法: POST
  请求头:
    Content-Type: application/json
    x-shortcut-secret: ce1bb36fa45077d87ab06f7b75f44af2e89b9e5d0ebbbc43a5c702c478ce490d
  请求正文 (JSON):
    {
      "hrv": [我的HRV的毫秒值],
      "rhr": [我的RHR的bpm值],
      "sleep_hours": [睡眠时长小时数]
    }

[在 Safari 中打开 URL]
  URL: https://ask-my-body.vercel.app/morning
```

3. 命名为 **「晨起问身」**，设置图标为 🌅
4. 加到主屏幕 Widget 或锁屏

### 简化版（如果 Health 数据不好获取）

只发空的 POST，让 App 用存储的数据：

```
[获取 URL 的内容]
  URL: https://ask-my-body.vercel.app/api/wake-up
  方法: POST
  请求头:
    x-shortcut-secret: ce1bb36fa45077d87ab06f7b75f44af2e89b9e5d0ebbbc43a5c702c478ce490d
  正文: {}

[在 Safari 中打开 URL]
  URL: https://ask-my-body.vercel.app/morning
```

---

## 快捷指令 2：睡前记录（晚上可选）

**功能**：睡前写几句，守夜分析师今晚读。

### 步骤

1. 新建快捷指令
2. 添加以下动作：

```
[询问输入]
  问题: "今晚身体感觉如何？"
  输入类型: 文本
  → 存为变量 "睡前笔记"

[获取健康样本]  (可选)
  类型: 心率变异性
  → 存为变量 "睡前HRV"

[获取 URL 的内容]
  URL: https://ask-my-body.vercel.app/api/sleep-input
  方法: POST
  请求头:
    Content-Type: application/json
    x-shortcut-secret: ce1bb36fa45077d87ab06f7b75f44af2e89b9e5d0ebbbc43a5c702c478ce490d
  请求正文 (JSON):
    {
      "notes": "[睡前笔记]",
      "hrv": [睡前HRV]
    }

[显示通知]
  标题: "已记录 🌙"
  正文: "守夜分析师今晚 23:00 和 03:00 会读的"
```

3. 命名为 **「睡前记录」**，设置图标为 🌙

---

## SHORTCUT_SECRET

所有请求都要带这个 header：

```
x-shortcut-secret: ce1bb36fa45077d87ab06f7b75f44af2e89b9e5d0ebbbc43a5c702c478ce490d
```

---

## 注意事项

- 第一次运行 Health 类操作，iOS 会弹授权，点「允许」
- HRV 值单位：毫秒（ms），Apple Watch 通常 20-80ms
- 静息心率单位：bpm，通常 50-75
- 睡眠时长：计算 duration / 3600 得到小时数（7.5 = 7.5 小时）

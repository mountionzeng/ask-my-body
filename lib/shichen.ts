/**
 * 时辰系统 — 中医十二时辰与现代小时对应
 * 每个时辰跨 2 小时，决定 Agent 语气、推荐动作和 UI 氛围
 */

export type ShichenName =
  | "子时" | "丑时" | "寅时" | "卯时"
  | "辰时" | "巳时" | "午时" | "未时"
  | "申时" | "酉时" | "戌时" | "亥时";

export type DayPhase = "deep-night" | "pre-dawn" | "morning" | "day" | "afternoon" | "evening";

export interface Shichen {
  name: ShichenName;
  hours: [number, number]; // [start, end) CST
  meridian: string;        // 对应经络
  element: string;         // 五行
  organ: string;           // 主脏
  quality: string;         // 这个时辰的养生要义（一句话）
  morningAdvice?: string;  // 晨起问身时给的提示
  phase: DayPhase;
  emoji: string;
}

export const SHICHEN_LIST: Shichen[] = [
  {
    name: "子时",
    hours: [23, 1],
    meridian: "足少阳胆经",
    element: "水",
    organ: "胆",
    quality: "深睡养阳，胆气升发之时",
    phase: "deep-night",
    emoji: "🌑",
  },
  {
    name: "丑时",
    hours: [1, 3],
    meridian: "足厥阴肝经",
    element: "木",
    organ: "肝",
    quality: "肝藏血，此时熟睡则肝自修复",
    phase: "deep-night",
    emoji: "🌒",
  },
  {
    name: "寅时",
    hours: [3, 5],
    meridian: "手太阴肺经",
    element: "金",
    organ: "肺",
    quality: "肺主气，寅时气血流注于肺",
    phase: "pre-dawn",
    emoji: "🌓",
  },
  {
    name: "卯时",
    hours: [5, 7],
    meridian: "手阳明大肠经",
    element: "金",
    organ: "大肠",
    quality: "大肠蠕动，晨起排便为上",
    morningAdvice: "卯时醒来，身体正在排毒。喝一杯温水，让肠道先工作。",
    phase: "morning",
    emoji: "🌅",
  },
  {
    name: "辰时",
    hours: [7, 9],
    meridian: "足阳明胃经",
    element: "土",
    organ: "胃",
    quality: "胃气最旺，此时进食吸收最好",
    morningAdvice: "辰时胃气足，好好吃早饭。不要空腹喝咖啡。",
    phase: "morning",
    emoji: "🌄",
  },
  {
    name: "巳时",
    hours: [9, 11],
    meridian: "足太阴脾经",
    element: "土",
    organ: "脾",
    quality: "脾气运化，精神饱满适合工作",
    phase: "day",
    emoji: "☀️",
  },
  {
    name: "午时",
    hours: [11, 13],
    meridian: "手少阴心经",
    element: "火",
    organ: "心",
    quality: "心气最旺，小憩养心神",
    phase: "day",
    emoji: "🌞",
  },
  {
    name: "未时",
    hours: [13, 15],
    meridian: "手太阳小肠经",
    element: "火",
    organ: "小肠",
    quality: "小肠分清浊，午饭后散步助消化",
    phase: "afternoon",
    emoji: "🌤",
  },
  {
    name: "申时",
    hours: [15, 17],
    meridian: "足太阳膀胱经",
    element: "水",
    organ: "膀胱",
    quality: "膀胱经主表，此时运动最佳",
    phase: "afternoon",
    emoji: "🌻",
  },
  {
    name: "酉时",
    hours: [17, 19],
    meridian: "足少阴肾经",
    element: "水",
    organ: "肾",
    quality: "肾气收敛，不宜剧烈运动",
    phase: "evening",
    emoji: "🌆",
  },
  {
    name: "戌时",
    hours: [19, 21],
    meridian: "手厥阴心包经",
    element: "火",
    organ: "心包",
    quality: "心包护心，此时放松、散步、轻谈",
    phase: "evening",
    emoji: "🌇",
  },
  {
    name: "亥时",
    hours: [21, 23],
    meridian: "手少阳三焦经",
    element: "火",
    organ: "三焦",
    quality: "三焦通百脉，准备入睡最佳时间",
    phase: "evening",
    emoji: "🌙",
  },
];

/**
 * 根据小时 (0-23, CST) 返回当前时辰
 */
export function getShichen(hourCST?: number): Shichen {
  const h = hourCST ?? new Date().getHours();
  return (
    SHICHEN_LIST.find(({ hours: [start, end] }) => {
      if (start < end) return h >= start && h < end;
      // 跨午夜 (子时: 23-1)
      return h >= start || h < end;
    }) ?? SHICHEN_LIST[0]
  );
}

/** 返回 CST 格式的今日日期字符串 "YYYY-MM-DD" */
export function todayCST(): string {
  const now = new Date();
  // Vercel runs UTC; shift +8
  const cst = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return cst.toISOString().slice(0, 10);
}

/** 返回 CST 当前小时 (0-23) */
export function hourCST(): number {
  const now = new Date();
  const cst = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return cst.getUTCHours();
}

/** 昨天的日期 "YYYY-MM-DD" (CST) */
export function yesterdayCST(): string {
  const now = new Date();
  const cst = new Date(now.getTime() + 8 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  return cst.toISOString().slice(0, 10);
}

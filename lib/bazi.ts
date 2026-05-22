/**
 * 天干地支 & 节气计算工具
 * 用于「问春风」每日运势推算
 */

// 天干
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

// 五行对应
const TIAN_GAN_WUXING: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const DI_ZHI_WUXING: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

// 五行颜色对应
export const WUXING_COLORS: Record<string, { colors: string[]; meaning: string }> = {
  金: { colors: ["白色", "银色", "金色"], meaning: "金主义，收敛肃杀" },
  木: { colors: ["绿色", "青色", "翠色"], meaning: "木主仁，生发向上" },
  水: { colors: ["黑色", "深蓝", "藏青"], meaning: "水主智，润下藏纳" },
  火: { colors: ["红色", "紫色", "橙色"], meaning: "火主礼，炎上光明" },
  土: { colors: ["黄色", "棕色", "米色"], meaning: "土主信，厚德载物" },
};

// 五行生克
export const WUXING_SHENG: Record<string, string> = {
  金: "水", 水: "木", 木: "火", 火: "土", 土: "金",
};
export const WUXING_KE: Record<string, string> = {
  金: "木", 木: "土", 土: "水", 水: "火", 火: "金",
};

// 24 节气（按公历近似日期）
interface JieQi {
  name: string;
  month: number;
  day: number; // 近似起始日
  element: string;
  advice: string;
  classic: string; // 古籍引用
}

const JIE_QI_LIST: JieQi[] = [
  { name: "小寒", month: 1, day: 5, element: "水", advice: "寒气渐盛，宜藏不宜露", classic: "《月令七十二候集解》：小寒，十二月节。月初寒尚小，故云小寒。" },
  { name: "大寒", month: 1, day: 20, element: "水", advice: "一年最冷，温补固本", classic: "《授时通考》：大寒为中者，上形于小寒，故谓之大。" },
  { name: "立春", month: 2, day: 4, element: "木", advice: "春气始生，宜舒展条达", classic: "《黄帝内经·素问·四气调神大论》：春三月，此谓发陈，天地俱生，万物以荣。" },
  { name: "雨水", month: 2, day: 19, element: "木", advice: "冰雪消融，养脾祛湿", classic: "《月令七十二候集解》：正月中，天一生水。春始属木，然生木者必水也。" },
  { name: "惊蛰", month: 3, day: 6, element: "木", advice: "春雷始鸣，万物复苏", classic: "《月令七十二候集解》：万物出乎震，震为雷，故曰惊蛰。" },
  { name: "春分", month: 3, day: 21, element: "木", advice: "阴阳平衡，百病不生", classic: "《春秋繁露》：春分者，阴阳相半也，故昼夜均而寒暑平。" },
  { name: "清明", month: 4, day: 5, element: "木", advice: "天清地明，宜踏青疏肝", classic: "《岁时百问》：万物生长此时，皆清洁而明净，故谓之清明。" },
  { name: "谷雨", month: 4, day: 20, element: "土", advice: "雨生百谷，湿气渐重宜健脾", classic: "《通纬·孝经援神契》：清明后十五日，斗指辰，为谷雨，雨水生百谷。" },
  { name: "立夏", month: 5, day: 6, element: "火", advice: "夏气渐升，养心安神", classic: "《黄帝内经·素问·四气调神大论》：夏三月，此谓蕃秀，天地气交，万物华实。" },
  { name: "小满", month: 5, day: 21, element: "火", advice: "物至于此小得盈满，清热祛湿", classic: "《月令七十二候集解》：四月中，小满者，物至于此小得盈满。" },
  { name: "芒种", month: 6, day: 6, element: "火", advice: "有芒之种，忙而不乱", classic: "《月令七十二候集解》：五月节，谓有芒之种谷可稼种矣。" },
  { name: "夏至", month: 6, day: 21, element: "火", advice: "阳极阴生，静心养阳", classic: "《恪遵宪度》：日北至，日长之至，日影短至，故曰夏至。" },
  { name: "小暑", month: 7, day: 7, element: "火", advice: "暑气渐盛，养心防暑", classic: "《月令七十二候集解》：暑，热也。就热之中分为大小，月初为小，月中为大。" },
  { name: "大暑", month: 7, day: 23, element: "土", advice: "一年最热，避暑养阴", classic: "《月令七十二候集解》：六月中，解见小暑。" },
  { name: "立秋", month: 8, day: 7, element: "金", advice: "秋气始收，润肺防燥", classic: "《黄帝内经·素问·四气调神大论》：秋三月，此谓容平，天气以急，地气以明。" },
  { name: "处暑", month: 8, day: 23, element: "金", advice: "暑气将退，滋阴润燥", classic: "《月令七十二候集解》：处，止也，暑气至此而止矣。" },
  { name: "白露", month: 9, day: 8, element: "金", advice: "露凝为白，防寒保暖", classic: "《月令七十二候集解》：水土湿气凝而为露，秋属金，金色白，白者露之色。" },
  { name: "秋分", month: 9, day: 23, element: "金", advice: "阴阳各半，平和为要", classic: "《春秋繁露》：秋分者，阴阳相半也，故昼夜均而寒暑平。" },
  { name: "寒露", month: 10, day: 8, element: "水", advice: "露气寒凉，添衣御寒", classic: "《月令七十二候集解》：九月节，露气寒冷，将凝结也。" },
  { name: "霜降", month: 10, day: 23, element: "土", advice: "霜始降，宜进补", classic: "《二十四节气解》：气肃而霜降，阴始凝也。" },
  { name: "立冬", month: 11, day: 7, element: "水", advice: "冬气始至，藏精养肾", classic: "《黄帝内经·素问·四气调神大论》：冬三月，此谓闭藏，水冰地坼，无扰乎阳。" },
  { name: "小雪", month: 11, day: 22, element: "水", advice: "天已积阴，寒未深而雪未大", classic: "《月令七十二候集解》：十月中，雨下而为寒气所薄，故凝而为雪。" },
  { name: "大雪", month: 12, day: 7, element: "水", advice: "大雪纷飞，滋补御寒", classic: "《月令七十二候集解》：大雪，十一月节。大者，盛也。至此而雪盛矣。" },
  { name: "冬至", month: 12, day: 22, element: "水", advice: "阴极阳生，一阳初动", classic: "《恪遵宪度》：阴极之至，阳气始生，日南至，日短之至。" },
];

/**
 * 根据日期计算当日天干地支（日柱）
 * 使用蔡勒公式的变体
 */
export function getDayGanZhi(date: Date): { gan: string; zhi: string; wuxingGan: string; wuxingZhi: string } {
  // 以 1900年1月1日 为甲子日基准
  const base = new Date(1900, 0, 1);
  const diff = Math.floor((date.getTime() - base.getTime()) / (24 * 60 * 60 * 1000));
  // 1900-01-01 是甲子日 (index 0)
  const idx = ((diff % 60) + 60) % 60;
  const ganIdx = idx % 10;
  const zhiIdx = idx % 12;
  const gan = TIAN_GAN[ganIdx];
  const zhi = DI_ZHI[zhiIdx];
  return {
    gan,
    zhi,
    wuxingGan: TIAN_GAN_WUXING[gan],
    wuxingZhi: DI_ZHI_WUXING[zhi],
  };
}

/**
 * 根据日期计算当月天干地支（月柱近似）
 */
export function getMonthGanZhi(date: Date): { gan: string; zhi: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // 月支固定：寅月(1月)...丑月(12月)
  // 实际从立春算起，这里用近似
  const zhiIdx = (month + 1) % 12;
  // 年干决定月干起始
  const yearGanIdx = ((year - 4) % 10 + 10) % 10;
  const monthGanBase = (yearGanIdx % 5) * 2;
  const ganIdx = (monthGanBase + month - 1) % 10;
  return { gan: TIAN_GAN[ganIdx], zhi: DI_ZHI[zhiIdx] };
}

/**
 * 根据日期获取当前节气
 */
export function getCurrentJieQi(date: Date): JieQi {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 找到当前或最近过去的节气
  let current = JIE_QI_LIST[JIE_QI_LIST.length - 1]; // 默认冬至
  for (let i = JIE_QI_LIST.length - 1; i >= 0; i--) {
    const jq = JIE_QI_LIST[i];
    if (month > jq.month || (month === jq.month && day >= jq.day)) {
      current = jq;
      break;
    }
  }
  return current;
}

/**
 * 解析用户输入的八字文本
 * 支持格式："甲子年 丙寅月 壬午日 辛亥时" 或 "甲子 丙寅 壬午 辛亥"
 */
export function parseBaZi(input: string): {
  valid: boolean;
  pillars: { gan: string; zhi: string }[];
  dayMaster: string | null;
  dayMasterWuxing: string | null;
} {
  // 移除 年/月/日/时 字样和多余空格
  const cleaned = input.replace(/[年月日时\s,，、·]+/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  const pillars: { gan: string; zhi: string }[] = [];
  for (const part of parts) {
    if (part.length >= 2) {
      const g = part[0];
      const z = part[1];
      if (TIAN_GAN.includes(g as typeof TIAN_GAN[number]) && DI_ZHI.includes(z as typeof DI_ZHI[number])) {
        pillars.push({ gan: g, zhi: z });
      }
    }
  }

  const dayMaster = pillars.length >= 3 ? pillars[2].gan : null;
  const dayMasterWuxing = dayMaster ? TIAN_GAN_WUXING[dayMaster] : null;

  return {
    valid: pillars.length >= 2, // 至少有年柱和月柱就可以分析
    pillars,
    dayMaster,
    dayMasterWuxing,
  };
}

/**
 * 八卦方位吉凶（基于日柱五行）
 */
export function getDirectionAdvice(dayWuxing: string): { lucky: string[]; avoid: string[]; detail: string } {
  // 生我者为吉方，克我者为凶方
  const sheng: Record<string, string> = { 金: "土", 木: "水", 水: "金", 火: "木", 土: "火" };
  const ke: Record<string, string> = { 金: "火", 木: "金", 水: "土", 火: "水", 土: "木" };
  const wuxingDirection: Record<string, string[]> = {
    金: ["西", "西北"],
    木: ["东", "东南"],
    水: ["北"],
    火: ["南"],
    土: ["中", "东北", "西南"],
  };

  const luckyElement = sheng[dayWuxing];
  const avoidElement = ke[dayWuxing];

  return {
    lucky: wuxingDirection[luckyElement] ?? [],
    avoid: wuxingDirection[avoidElement] ?? [],
    detail: `日主属${dayWuxing}，${luckyElement}生${dayWuxing}为吉方（${(wuxingDirection[luckyElement] ?? []).join("、")}），${avoidElement}克${dayWuxing}为凶方（${(wuxingDirection[avoidElement] ?? []).join("、")}）`,
  };
}

/**
 * 综合今日信息（供 AI agent 使用）
 */
export function getTodayContext(dateStr: string): {
  dayGanZhi: ReturnType<typeof getDayGanZhi>;
  monthGanZhi: ReturnType<typeof getMonthGanZhi>;
  jieQi: JieQi;
  dateStr: string;
} {
  const date = new Date(dateStr + "T00:00:00+08:00");
  return {
    dayGanZhi: getDayGanZhi(date),
    monthGanZhi: getMonthGanZhi(date),
    jieQi: getCurrentJieQi(date),
    dateStr,
  };
}

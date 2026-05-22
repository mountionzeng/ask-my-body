"use client";

import { useState, useEffect, useRef } from "react";
import { BambooDecoration, WashBlob } from "@/components/decorations";

const BAZI_KEY = "spring-wind:bazi";
const CITY_KEY = "spring-wind:city";

type Step = "input" | "generating" | "done";

interface SpringWindReport {
  date: string;
  content: string;
  model: string;
  generated_at: string;
  bazi: string;
  city: string;
}

export default function ChunFengPage() {
  const [step, setStep] = useState<Step>("input");
  const [bazi, setBazi] = useState("");
  const [city, setCity] = useState("");
  const [report, setReport] = useState<SpringWindReport | null>(null);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Restore saved inputs
  useEffect(() => {
    try {
      const savedBazi = localStorage.getItem(BAZI_KEY);
      const savedCity = localStorage.getItem(CITY_KEY);
      if (savedBazi) setBazi(savedBazi);
      if (savedCity) setCity(savedCity);
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit() {
    if (!bazi.trim()) {
      setError("请输入你的八字");
      return;
    }
    if (!city.trim()) {
      setError("请输入你的城市");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem(BAZI_KEY, bazi);
      localStorage.setItem(CITY_KEY, city);
    } catch { /* ignore */ }

    setError("");
    setStep("generating");

    try {
      const res = await fetch("/api/spring-wind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bazi, city, force: true }),
      });
      const text = await res.text();
      let json: { report?: SpringWindReport; error?: string };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(res.status === 504 ? "生成超时，请稍后重试" : "服务暂时不可用，请稍后重试");
      }
      if (!res.ok) throw new Error(json.error ?? "生成失败");
      setReport(json.report!);
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("input");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        setBazi(text.trim().slice(0, 500));
      }
    };
    reader.readAsText(file);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    setImagePreview(URL.createObjectURL(file));
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/parse-bazi", { method: "POST", body: formData });
      const text = await res.text();
      let json: { ok?: boolean; data?: { bazi: string; extra_info?: string }; error?: string };
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("识别服务暂时不可用，请手动输入");
      }
      if (!res.ok || !json.data?.bazi) throw new Error(json.error ?? "未能识别八字信息");
      setBazi(json.data.bazi);
    } catch (err) {
      setError(String(err));
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: "#faf8f3" }}>
      {/* Decorations */}
      <BambooDecoration className="right-[-20px] top-16 h-48 w-24 opacity-40" />
      <WashBlob color="green" className="bottom-[-30px] left-[-40px] right-[-40px] h-44" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 5% 20%, rgba(168,196,160,0.25), transparent 40%), radial-gradient(ellipse at 95% 80%, rgba(200,188,160,0.20), transparent 40%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[420px] px-6 pb-24 pt-12">
        {/* Header */}
        <p className="font-display text-[11px] tracking-super" style={{ color: "#8a8078" }}>
          ASK THE SPRING BREEZE
        </p>
        <h1 className="mt-3.5 font-kai text-[44px] font-light leading-[1.1] tracking-widest" style={{ color: "#2a3528" }}>
          问 春 风
        </h1>
        <p className="mt-3.5 font-kai text-[14px] font-light leading-relaxed" style={{ color: "#5a6a50" }}>
          春风知我意，万事皆可期。
        </p>

        {/* Season badge */}
        <div className="mt-5 flex items-center gap-2 text-[11px] tracking-super" style={{ color: "#6e8a66" }}>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "radial-gradient(circle at 30% 30%, #a8c4a0, #6e8a66)" }}
          />
          <SpringJieQi />
        </div>

        <div className="my-6 h-px" style={{
          background: "linear-gradient(to right, transparent, rgba(110,138,102,0.25) 20%, rgba(110,138,102,0.25) 80%, transparent)",
        }}>
          <div className="mx-auto -mt-[3px] h-[5px] w-[5px] rounded-full" style={{ background: "rgba(110,138,102,0.4)" }} />
        </div>

        {/* Input */}
        {step === "input" && (
          <section className="space-y-5">
            {/* BaZi input */}
            <div>
              <div className="mb-3 flex items-center text-[12px] font-medium tracking-super" style={{ color: "#3a4a32" }}>
                <span className="mr-2 inline-block h-3 w-[3px]" style={{ background: "linear-gradient(180deg, #a8c4a0, #6e8a66)" }} />
                八 字
                <span className="ml-auto font-display text-[11px] tracking-wider" style={{ color: "#8a9880" }}>i.</span>
              </div>
              <textarea
                value={bazi}
                onChange={(e) => setBazi(e.target.value)}
                placeholder="甲子年 丙寅月 壬午日 辛亥时"
                rows={2}
                className="w-full resize-none rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed outline-none placeholder:opacity-50"
                style={{
                  borderColor: "rgba(110,138,102,0.35)",
                  background: "rgba(250,248,243,0.6)",
                  color: "#2a3528",
                }}
              />
              <div className="mt-2 flex items-center gap-3">
                <label className="cursor-pointer text-[11px] tracking-wider hover:opacity-80" style={{ color: "#6e8a66" }}>
                  <span className="border-b border-dotted pb-px" style={{ borderColor: "rgba(110,138,102,0.5)" }}>
                    上传文档
                  </span>
                  <input
                    type="file"
                    accept=".txt,.text"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <span style={{ color: "#c0b8a8" }}>·</span>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="cursor-pointer text-[11px] tracking-wider hover:opacity-80"
                  style={{ color: "#6e8a66" }}
                >
                  <span className="border-b border-dotted pb-px" style={{ borderColor: "rgba(110,138,102,0.5)" }}>
                    拍照/截图识别
                  </span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Image parsing state */}
              {parsing && (
                <div className="flex items-center gap-2 rounded-[3px] border px-3 py-2" style={{ borderColor: "rgba(110,138,102,0.3)", background: "rgba(168,196,160,0.1)" }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#6e8a66" }} />
                  <span className="text-[11px]" style={{ color: "#5a6a50" }}>正在识别八字信息...</span>
                </div>
              )}

              {/* Image preview */}
              {imagePreview && !parsing && (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="八字图片" className="h-14 w-auto rounded border object-cover" style={{ borderColor: "rgba(110,138,102,0.3)" }} />
                  <span className="text-[11px]" style={{ color: "#6e8a66" }}>已从图片识别八字</span>
                </div>
              )}
            </div>

            {/* City input */}
            <div>
              <div className="mb-3 flex items-center text-[12px] font-medium tracking-super" style={{ color: "#3a4a32" }}>
                <span className="mr-2 inline-block h-3 w-[3px]" style={{ background: "linear-gradient(180deg, #a8c4a0, #6e8a66)" }} />
                城 市
                <span className="ml-auto font-display text-[11px] tracking-wider" style={{ color: "#8a9880" }}>ii.</span>
              </div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="例如：上海、北京、广州"
                className="w-full rounded-[3px] border px-3.5 py-3 text-[13px] leading-relaxed outline-none placeholder:opacity-50"
                style={{
                  borderColor: "rgba(110,138,102,0.35)",
                  background: "rgba(250,248,243,0.6)",
                  color: "#2a3528",
                }}
              />
            </div>

            {error && <p className="text-center text-[13px] text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full rounded-[3px] border py-4 text-[14px] tracking-super transition hover:shadow-sm"
              style={{
                borderColor: "rgba(110,138,102,0.55)",
                background: "linear-gradient(180deg, rgba(168,196,160,0.3), rgba(140,176,130,0.2))",
                color: "#2a3528",
                textIndent: "0.5em",
              }}
            >
              问 春 风
            </button>

            {/* Back to home */}
            <p className="text-center">
              <a
                href="/"
                className="text-[11px] tracking-wider hover:opacity-80"
                style={{ color: "#8a9880" }}
              >
                返回求诸己
              </a>
            </p>
          </section>
        )}

        {/* Generating */}
        {step === "generating" && (
          <section className="space-y-4 py-10 text-center">
            <div className="flex justify-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" style={{ background: "#a8c4a0" }} />
              <span className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" style={{ background: "#a8c4a0" }} />
              <span className="h-2 w-2 animate-bounce rounded-full" style={{ background: "#a8c4a0" }} />
            </div>
            <p className="text-[13px]" style={{ color: "#5a6a50" }}>春风正在为你推演今日运势...</p>
            <p className="text-[11px]" style={{ color: "#8a9880" }}>约需 15-30 秒</p>
          </section>
        )}

        {/* Done */}
        {step === "done" && report && (
          <article className="space-y-5">
            <div
              className="spring-wind-report space-y-3 text-[13px] leading-relaxed"
              style={{ color: "#3a4a32" }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }}
            />
            <div className="flex items-center justify-between border-t pt-4 text-[11px]" style={{ borderColor: "rgba(110,138,102,0.2)", color: "#8a9880" }}>
              <span>
                {report.model} ·{" "}
                {new Date(report.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                onClick={() => { setStep("input"); }}
                className="tracking-wider hover:opacity-80"
              >
                再问春风
              </button>
            </div>
          </article>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] leading-loose tracking-widest" style={{ color: "#8a9880" }}>
          基于传统文化典籍 <span className="mx-1" style={{ color: "#aaa89e" }}>·</span> 仅供参考<br />
          不构成任何决策依据
        </div>
      </div>
    </div>
  );
}

function SpringJieQi() {
  const [text, setText] = useState("加载中...");
  useEffect(() => {
    // Simple client-side jieqi calculation
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const jieqiMap: [number, number, string][] = [
      [1, 5, "小寒"], [1, 20, "大寒"], [2, 4, "立春"], [2, 19, "雨水"],
      [3, 6, "惊蛰"], [3, 21, "春分"], [4, 5, "清明"], [4, 20, "谷雨"],
      [5, 6, "立夏"], [5, 21, "小满"], [6, 6, "芒种"], [6, 21, "夏至"],
      [7, 7, "小暑"], [7, 23, "大暑"], [8, 7, "立秋"], [8, 23, "处暑"],
      [9, 8, "白露"], [9, 23, "秋分"], [10, 8, "寒露"], [10, 23, "霜降"],
      [11, 7, "立冬"], [11, 22, "小雪"], [12, 7, "大雪"], [12, 22, "冬至"],
    ];
    let current = "冬至";
    for (let i = jieqiMap.length - 1; i >= 0; i--) {
      const [m, d, name] = jieqiMap[i];
      if (month > m || (month === m && day >= d)) {
        current = name;
        break;
      }
    }
    setText(current);
  }, []);
  return <span>{text}</span>;
}

function markdownToHtml(md: string): string {
  md = md.replace(/^```(?:json|markdown)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  return md
    .replace(/^---$/gm, '<hr style="height:1px;margin:20px 0;background:linear-gradient(to right,transparent,rgba(110,138,102,0.25) 30%,rgba(110,138,102,0.25) 70%,transparent)" />')
    .replace(/^## (.+)$/gm, "<h2 style='font-size:15px;font-weight:500;margin-top:24px;margin-bottom:8px;letter-spacing:0.1em;color:#2a3528'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 style='font-size:13px;font-weight:500;margin-top:16px;margin-bottom:4px;letter-spacing:0.1em;color:#3a4a32'>$1</h3>")
    .replace(/^> (.+)$/gm, "<blockquote style='border-left:2px solid rgba(110,138,102,0.5);padding-left:16px;font-style:italic;margin:8px 0;color:#5a6a50'>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li style='margin-left:16px;list-style-type:disc;color:#4a5a42'>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong style='color:#2a3528'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p style='margin-bottom:12px;color:#4a5a42'>")
    .replace(/\n/g, "<br />");
}

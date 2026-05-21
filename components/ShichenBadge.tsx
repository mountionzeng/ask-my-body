"use client";

import { useEffect, useState } from "react";

interface ShichenInfo {
  name: string;
  organ: string;
  quality: string;
  emoji: string;
  morningAdvice?: string;
}

// Client-side time — avoids SSR mismatch
export default function ShichenBadge() {
  const [info, setInfo] = useState<ShichenInfo | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    import("@/lib/shichen").then(({ getShichen }) => {
      const s = getShichen(h);
      setInfo({
        name: s.name,
        organ: s.organ,
        quality: s.quality,
        emoji: s.emoji,
        morningAdvice: s.morningAdvice,
      });
    });
  }, []);

  if (!info) return null;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-2xl">{info.emoji}</span>
      <span className="font-serif text-xs text-ink-600">
        {info.name} · {info.organ}
      </span>
      <p className="max-w-xs font-serif text-xs text-ink-400">{info.quality}</p>
      {info.morningAdvice && (
        <p className="mt-1 max-w-xs font-serif text-xs italic text-ink-600">
          {info.morningAdvice}
        </p>
      )}
    </div>
  );
}

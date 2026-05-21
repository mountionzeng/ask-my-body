/** Shared decorative SVG elements for Chinese watercolor aesthetic */

export function BambooDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute opacity-60 ${className}`}>
      <svg viewBox="0 0 110 160" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path d="M 35 5 Q 38 60 30 155" stroke="#8aa482" strokeWidth="1.2" fill="none" opacity="0.65"/>
        <path d="M 60 0 Q 65 70 58 158" stroke="#a8c4a0" strokeWidth="1.5" fill="none" opacity="0.55"/>
        <line x1="32" y1="40" x2="42" y2="38" stroke="#6e8a66" strokeWidth="0.6" opacity="0.6"/>
        <line x1="31" y1="80" x2="41" y2="78" stroke="#6e8a66" strokeWidth="0.6" opacity="0.6"/>
        <line x1="60" y1="55" x2="71" y2="53" stroke="#6e8a66" strokeWidth="0.6" opacity="0.6"/>
        <line x1="59" y1="100" x2="70" y2="98" stroke="#6e8a66" strokeWidth="0.6" opacity="0.6"/>
        <g fill="#a8c4a0" opacity="0.72">
          <ellipse cx="50" cy="22" rx="22" ry="3" transform="rotate(-28 50 22)"/>
          <ellipse cx="22" cy="32" rx="18" ry="2.6" transform="rotate(38 22 32)"/>
          <ellipse cx="78" cy="45" rx="20" ry="3" transform="rotate(-22 78 45)"/>
          <ellipse cx="20" cy="68" rx="16" ry="2.4" transform="rotate(42 20 68)"/>
          <ellipse cx="80" cy="82" rx="22" ry="3" transform="rotate(-32 80 82)"/>
          <ellipse cx="48" cy="118" rx="18" ry="2.6" transform="rotate(35 48 118)"/>
        </g>
        <g fill="#8aa482" opacity="0.5">
          <ellipse cx="70" cy="20" rx="14" ry="2" transform="rotate(-50 70 20)"/>
          <ellipse cx="35" cy="92" rx="13" ry="2" transform="rotate(-58 35 92)"/>
          <ellipse cx="72" cy="130" rx="15" ry="2.2" transform="rotate(-28 72 130)"/>
        </g>
      </svg>
    </div>
  );
}

export function PlumBlossomDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute opacity-85 ${className}`}>
      <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path d="M 145 -5 Q 120 25 90 35 Q 60 50 35 80 Q 20 110 25 145"
              stroke="#3a2f2a" strokeWidth="1.4" fill="none" opacity="0.7" strokeLinecap="round"/>
        <path d="M 90 35 Q 105 55 130 70" stroke="#3a2f2a" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round"/>
        <path d="M 60 60 Q 50 80 55 110" stroke="#3a2f2a" strokeWidth="0.9" fill="none" opacity="0.55" strokeLinecap="round"/>
        <path d="M 35 80 Q 25 75 18 80" stroke="#3a2f2a" strokeWidth="0.7" fill="none" opacity="0.5"/>
        <g>
          <g transform="translate(135 18)">
            <circle cx="0" cy="-5" r="4.5" fill="#f5dde0" opacity="0.9"/>
            <circle cx="4.7" cy="-1.5" r="4.5" fill="#f0c4c8" opacity="0.9"/>
            <circle cx="2.9" cy="4" r="4.5" fill="#e8a0a8" opacity="0.9"/>
            <circle cx="-2.9" cy="4" r="4.5" fill="#f0c4c8" opacity="0.9"/>
            <circle cx="-4.7" cy="-1.5" r="4.5" fill="#f5dde0" opacity="0.9"/>
            <circle cx="0" cy="0" r="1.4" fill="#b85060"/>
          </g>
          <g transform="translate(95 48)">
            <circle cx="0" cy="-4" r="4" fill="#f5dde0" opacity="0.9"/>
            <circle cx="3.8" cy="-1.2" r="4" fill="#f0c4c8" opacity="0.9"/>
            <circle cx="2.3" cy="3.2" r="4" fill="#e8a0a8" opacity="0.9"/>
            <circle cx="-2.3" cy="3.2" r="4" fill="#f0c4c8" opacity="0.9"/>
            <circle cx="-3.8" cy="-1.2" r="4" fill="#f5dde0" opacity="0.9"/>
            <circle cx="0" cy="0" r="1.2" fill="#b85060"/>
          </g>
          <g transform="translate(50 78)">
            <circle cx="0" cy="-4" r="4" fill="#f5dde0" opacity="0.85"/>
            <circle cx="3.8" cy="-1.2" r="4" fill="#f0c4c8" opacity="0.85"/>
            <circle cx="2.3" cy="3.2" r="4" fill="#e8a0a8" opacity="0.85"/>
            <circle cx="-2.3" cy="3.2" r="4" fill="#f0c4c8" opacity="0.85"/>
            <circle cx="-3.8" cy="-1.2" r="4" fill="#f5dde0" opacity="0.85"/>
            <circle cx="0" cy="0" r="1.2" fill="#b85060"/>
          </g>
          <g transform="translate(28 130)">
            <circle cx="0" cy="-3.5" r="3.5" fill="#f0c4c8" opacity="0.85"/>
            <circle cx="3.3" cy="-1" r="3.5" fill="#e8a0a8" opacity="0.85"/>
            <circle cx="2" cy="2.8" r="3.5" fill="#f5dde0" opacity="0.85"/>
            <circle cx="-2" cy="2.8" r="3.5" fill="#f0c4c8" opacity="0.85"/>
            <circle cx="-3.3" cy="-1" r="3.5" fill="#e8a0a8" opacity="0.85"/>
            <circle cx="0" cy="0" r="1" fill="#b85060"/>
          </g>
          <circle cx="125" cy="65" r="2" fill="#e8a0a8" opacity="0.7"/>
          <circle cx="70" cy="100" r="1.6" fill="#f0c4c8" opacity="0.6"/>
        </g>
      </svg>
    </div>
  );
}

export function InkCloudDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute opacity-70 ${className}`}>
      <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <radialGradient id="cloud1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2a2520" stopOpacity="0.25"/>
            <stop offset="60%" stopColor="#6a6058" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#6a6058" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="55" rx="80" ry="35" fill="url(#cloud1)"/>
        <ellipse cx="140" cy="80" rx="50" ry="22" fill="url(#cloud1)" opacity="0.6"/>
        <ellipse cx="50" cy="90" rx="40" ry="18" fill="url(#cloud1)" opacity="0.45"/>
      </svg>
    </div>
  );
}

export function NightBranchDecoration({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute opacity-45 ${className}`}>
      <svg viewBox="0 0 130 120" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path d="M -5 10 Q 30 25 60 35 Q 90 50 125 60"
              stroke="#3a2f2a" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round"/>
        <path d="M 60 35 Q 70 55 65 90" stroke="#3a2f2a" strokeWidth="0.9" fill="none" opacity="0.55" strokeLinecap="round"/>
        <g transform="translate(35 22)">
          <circle cx="0" cy="-3.5" r="3.5" fill="#e8a0a8" opacity="0.8"/>
          <circle cx="3.3" cy="-1" r="3.5" fill="#c87080" opacity="0.85"/>
          <circle cx="2" cy="2.8" r="3.5" fill="#a85068" opacity="0.85"/>
          <circle cx="-2" cy="2.8" r="3.5" fill="#c87080" opacity="0.85"/>
          <circle cx="-3.3" cy="-1" r="3.5" fill="#e8a0a8" opacity="0.8"/>
          <circle cx="0" cy="0" r="1" fill="#6b1f30"/>
        </g>
        <g transform="translate(85 48)">
          <circle cx="0" cy="-3" r="3" fill="#c87080" opacity="0.85"/>
          <circle cx="2.9" cy="-0.9" r="3" fill="#a85068" opacity="0.85"/>
          <circle cx="1.8" cy="2.4" r="3" fill="#e8a0a8" opacity="0.8"/>
          <circle cx="-1.8" cy="2.4" r="3" fill="#c87080" opacity="0.85"/>
          <circle cx="-2.9" cy="-0.9" r="3" fill="#a85068" opacity="0.85"/>
          <circle cx="0" cy="0" r="0.9" fill="#6b1f30"/>
        </g>
        <circle cx="68" cy="78" r="1.6" fill="#a85068" opacity="0.7"/>
      </svg>
    </div>
  );
}

export function WashBlob({ color, className = "" }: { color: "pink" | "green" | "deep-pink"; className?: string }) {
  const gradients = {
    pink: "radial-gradient(circle at 40% 60%, rgba(232,160,168,0.35) 0%, rgba(245,221,224,0.18) 35%, transparent 65%)",
    green: "radial-gradient(circle at 40% 60%, rgba(168,196,160,0.35), transparent 65%)",
    "deep-pink": "radial-gradient(circle at 60% 50%, rgba(180,80,96,0.20), transparent 60%)",
  };
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-sm ${className}`}
      style={{ background: gradients[color] }}
    />
  );
}

export function SealStamp({ char = "己", className = "" }: { char?: string; className?: string }) {
  return (
    <div
      className={`flex h-7 w-7 items-center justify-center border font-serif text-[10px] ${className}`}
      style={{
        borderColor: "rgba(180,60,60,0.55)",
        color: "rgba(180,60,60,0.7)",
        background: "rgba(180,60,60,0.03)",
        transform: "rotate(-2deg)",
      }}
    >
      {char}
    </div>
  );
}

export function BottomNav({ active }: { active: "morning" | "sleep" | "journal" | "home" }) {
  const links = [
    { href: "/morning", label: "晨起报告", key: "morning" as const },
    { href: "/sleep", label: "睡前记录", key: "sleep" as const },
    { href: "/journal", label: "身体日志", key: "journal" as const },
    { href: "/", label: "首页", key: "home" as const },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-between border-t px-8 py-4 text-[11px] tracking-widest backdrop-blur-sm"
      style={{
        borderColor: "rgba(213,207,200,0.5)",
        background: "rgba(250,248,243,0.7)",
        color: "#8a8078",
      }}
    >
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          className={`py-1 ${
            active === l.key
              ? "border-b border-ink-800 text-ink-800"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

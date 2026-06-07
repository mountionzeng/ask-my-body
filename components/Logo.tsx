/** Ask My Body 求诸己 — 水墨双竹 logo
 *  前景两竿主竹清晰挺立，背景竹林按景深渐进晕染，自下而上绿晕。
 *  与 components/decorations.tsx 同一套竹绿配色（见 tailwind.config.ts）。
 */

export function Logo({
  size = 40,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ask My Body 求诸己 双竹"
      className={className}
    >
      <defs>
        <path id="ambLf" d="M0 0 Q 13 -4 27 0 Q 13 4 0 0 Z" />
        <linearGradient id="ambWash" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6f9a5e" stopOpacity=".44" />
          <stop offset=".32" stopColor="#8fb87c" stopOpacity=".24" />
          <stop offset=".64" stopColor="#b4d2a4" stopOpacity=".08" />
          <stop offset="1" stopColor="#b4d2a4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ambGround" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#6f9a5e" stopOpacity=".36" />
          <stop offset="60%" stopColor="#7fa06e" stopOpacity=".13" />
          <stop offset="100%" stopColor="#7fa06e" stopOpacity="0" />
        </radialGradient>
        <filter id="ambVeryFar" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="4.2" />
        </filter>
        <filter id="ambFar" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="ambMid" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="ambNear" x="-40%" y="-20%" width="180%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* 自下而上的绿晕 */}
      <rect x="0" y="0" width="100" height="100" fill="url(#ambWash)" />
      <ellipse cx="50" cy="99" rx="58" ry="26" fill="url(#ambGround)" />

      {/* 第一层：极远（晕染最重） */}
      <g filter="url(#ambVeryFar)" stroke="#c8dac0" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".28">
        <path d="M5 105 C 4 70 6 40 7 14" />
        <path d="M12 103 C 11 68 12 38 14 11" />
        <path d="M22 105 C 21 72 22 42 24 13" />
        <path d="M33 104 C 32 70 33 40 35 12" />
        <path d="M48 105 C 47 72 48 42 49 15" />
        <path d="M55 104 C 56 70 55 40 54 12" />
        <path d="M70 105 C 71 72 70 42 69 14" />
        <path d="M84 104 C 85 70 83 40 82 12" />
        <path d="M95 103 C 96 68 94 38 93 11" />
      </g>

      {/* 第二层：远 */}
      <g filter="url(#ambFar)" opacity=".42">
        <g stroke="#aecaa2" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M9 104 C 8 70 9 40 10 12" />
          <path d="M17 105 C 16 72 17 42 19 15" />
          <path d="M27 104 C 26 70 27 40 29 14" />
          <path d="M39 105 C 38 72 39 42 41 13" />
          <path d="M46 104 C 45 70 46 40 47 12" />
          <path d="M61 105 C 62 72 61 42 60 14" />
          <path d="M73 104 C 74 70 72 40 71 13" />
          <path d="M81 105 C 82 72 80 42 79 16" />
          <path d="M90 104 C 91 70 89 40 88 13" />
        </g>
        <g fill="#9cbb90">
          <use href="#ambLf" transform="translate(10 12) rotate(-110) scale(.6)" />
          <use href="#ambLf" transform="translate(29 14) rotate(-66) scale(.58)" />
          <use href="#ambLf" transform="translate(47 12) rotate(-118) scale(.55)" />
          <use href="#ambLf" transform="translate(71 13) rotate(-70) scale(.6)" />
          <use href="#ambLf" transform="translate(88 13) rotate(-120) scale(.55)" />
        </g>
      </g>

      {/* 第三层：中 */}
      <g filter="url(#ambMid)" opacity=".58">
        <g stroke="#82a078" strokeWidth="2.3" strokeLinecap="round" fill="none">
          <path d="M15 104 C 14 72 15 44 17 18" />
          <path d="M25 105 C 24 72 25 44 27 16" />
          <path d="M36 104 C 35 70 35 42 37 15" />
          <path d="M64 105 C 65 72 64 44 63 17" />
          <path d="M75 104 C 76 72 74 44 73 18" />
          <path d="M86 105 C 87 73 85 45 84 20" />
        </g>
        <g fill="#6e8a66">
          <use href="#ambLf" transform="translate(17 18) rotate(-60) scale(.78)" />
          <use href="#ambLf" transform="translate(27 16) rotate(-115) scale(.8)" />
          <use href="#ambLf" transform="translate(37 15) rotate(-120) scale(.78)" />
          <use href="#ambLf" transform="translate(63 17) rotate(-112) scale(.8)" />
          <use href="#ambLf" transform="translate(73 18) rotate(-66) scale(.76)" />
          <use href="#ambLf" transform="translate(84 20) rotate(-128) scale(.7)" />
          <use href="#ambLf" transform="translate(27 16) rotate(-150) scale(.6)" />
          <use href="#ambLf" transform="translate(63 17) rotate(-68) scale(.68)" />
        </g>
      </g>

      {/* 第四层：近 */}
      <g filter="url(#ambNear)" opacity=".85">
        <g stroke="#46603a" strokeWidth="2.7" strokeLinecap="round" fill="none">
          <path d="M28 105 C 27 70 28 40 30 13" />
          <path d="M70 105 C 71 70 70 40 68 12" />
        </g>
        <g fill="#3a4a32">
          <use href="#ambLf" transform="translate(30 13) rotate(-115) scale(.9)" />
          <use href="#ambLf" transform="translate(30 13) rotate(-150) scale(.62)" />
          <use href="#ambLf" transform="translate(68 12) rotate(-66) scale(.9)" />
          <use href="#ambLf" transform="translate(68 12) rotate(-102) scale(.72)" />
          <use href="#ambLf" transform="translate(30 13) rotate(-70) scale(.6)" />
          <use href="#ambLf" transform="translate(68 12) rotate(-150) scale(.55)" />
        </g>
      </g>

      {/* 第五层：主竹两竿（清晰、粗壮） */}
      <path d="M44 106 C 43 72 44 42 45.5 18" stroke="#2f3f28" strokeWidth="3.9" strokeLinecap="round" fill="none" />
      <path d="M53 106 C 52 70 51 38 52 13" stroke="#1f2b14" strokeWidth="4.6" strokeLinecap="round" fill="none" />
      <g stroke="#eef4e6" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".94">
        <path d="M41.4 71 Q 44.4 69 47.4 70.9" />
        <path d="M41.8 46 Q 44.8 44 47.6 45.9" />
        <path d="M42.4 25 Q 45.2 23.2 47.8 24.8" />
        <path d="M48.6 68 Q 52 65.6 55.4 67.8" />
        <path d="M48 44 Q 51.4 41.8 54.6 43.8" />
        <path d="M48.6 22 Q 51.8 20 54.8 21.8" />
      </g>
      <use href="#ambLf" transform="translate(52 13) rotate(-66) scale(1.15)" fill="#1f2b14" />
      <use href="#ambLf" transform="translate(52 13) rotate(-32) scale(.98)" fill="#3a4a32" />
      <use href="#ambLf" transform="translate(52 13) rotate(-100) scale(1.05)" fill="#243018" />
      <use href="#ambLf" transform="translate(52 13) rotate(-128) scale(.7)" fill="#2f3f28" />
      <use href="#ambLf" transform="translate(45.5 18) rotate(-120) scale(1.08)" fill="#2f3f28" />
      <use href="#ambLf" transform="translate(45.5 18) rotate(-150) scale(.78)" fill="#4a5e3e" />
      <use href="#ambLf" transform="translate(45.5 18) rotate(-95) scale(.7)" fill="#3a4a32" />
      <use href="#ambLf" transform="translate(55 40) rotate(24) scale(.72)" fill="#2f3f28" opacity=".9" />
      <use href="#ambLf" transform="translate(44.5 46) rotate(150) scale(.62)" fill="#3a4a32" opacity=".85" />
      <use href="#ambLf" transform="translate(52.5 22) rotate(-150) scale(.5)" fill="#3a4a32" opacity=".8" />

      {/* 朱印「己」 */}
      <g transform="translate(83 79) rotate(-3)">
        <rect x="-8" y="-8" width="16" height="16" rx="2" fill="rgba(180,60,60,.07)" stroke="rgba(180,60,60,.62)" strokeWidth="1.15" />
        <text x="0" y="4.5" textAnchor="middle" fontSize="11" fill="rgba(180,60,60,.78)" fontFamily="serif">己</text>
      </g>
    </svg>
  );
}

export default Logo;

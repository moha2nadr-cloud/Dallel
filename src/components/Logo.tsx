/* ─────────────────────────────────────────────────
   Daleel Logo — Navy Mirage edition
   Uses the brand دليل word-mark with the glass
   accent leaf/slash through the ي letter.
───────────────────────────────────────────────── */
import iconSrc from "@/assets/icon.png";

export function Logo({ className }: { className?: string }) {
  return <img src={iconSrc} alt="دليل" className={className} style={{ filter: "brightness(0) invert(1)" }} />;
}

/** Inline SVG wordmark for large display contexts */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="دليل"
    >
      <defs>
        <linearGradient id="nm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4d8ea" />
          <stop offset="100%" stopColor="#6b92ba" />
        </linearGradient>
        <linearGradient id="nm-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#96b8d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4a70a0" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* Word دليل rendered as text — browser uses font */}
      <text
        x="110" y="50"
        textAnchor="middle"
        fontFamily="Tajawal, sans-serif"
        fontWeight="900"
        fontSize="54"
        fill="url(#nm-grad)"
      >
        دليل
      </text>
      {/* Two dots below ي */}
      <circle cx="98" cy="63" r="3.5" fill="#6b92ba" opacity="0.85" />
      <circle cx="111" cy="63" r="3.5" fill="#6b92ba" opacity="0.85" />
    </svg>
  );
}

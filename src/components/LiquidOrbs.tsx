/**
 * LiquidOrbs — soft pastel blobs for white-background pages.
 * They give the glass blur something to refract over.
 */
export function LiquidOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
      <div className="animate-blob absolute" style={{ top: "-8%", left: "-6%", width: "52vw", height: "52vw", maxWidth: 420, maxHeight: 420, borderRadius: "50%", background: "radial-gradient(circle at 40% 38%, rgba(196,185,173,0.18) 0%, rgba(181,168,152,0.10) 40%, transparent 70%)", filter: "blur(48px)" }} />
      <div className="animate-blob absolute" style={{ top: "-5%", right: "-8%", width: "44vw", height: "44vw", maxWidth: 360, maxHeight: 360, borderRadius: "50%", background: "radial-gradient(circle at 55% 45%, rgba(214,205,196,0.14) 0%, rgba(196,185,173,0.08) 45%, transparent 68%)", filter: "blur(52px)", animationDelay: "4s" }} />
      <div className="animate-float-gentle absolute" style={{ top: "35%", right: "-10%", width: "36vw", height: "36vw", maxWidth: 300, maxHeight: 300, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(160,146,130,0.12) 0%, transparent 65%)", filter: "blur(56px)", animationDuration: "7s" }} />
      <div className="animate-float-gentle absolute" style={{ bottom: "-5%", left: "-4%", width: "46vw", height: "46vw", maxWidth: 380, maxHeight: 380, borderRadius: "50%", background: "radial-gradient(circle at 45% 55%, rgba(181,168,152,0.14) 0%, rgba(160,146,130,0.08) 45%, transparent 68%)", filter: "blur(60px)", animationDuration: "9s", animationDelay: "2s" }} />
      <div className="animate-blob absolute" style={{ bottom: "12%", right: "6%", width: "28vw", height: "28vw", maxWidth: 220, maxHeight: 220, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(214,205,196,0.12) 0%, transparent 68%)", filter: "blur(44px)", animationDelay: "7s", animationDuration: "15s" }} />
    </div>
  );
}

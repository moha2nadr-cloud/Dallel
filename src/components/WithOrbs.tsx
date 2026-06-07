/**
 * WithOrbs — wraps a page in the liquid orbs background + proper z layering.
 * Use instead of or in addition to the global body::before orbs for pages
 * that need extra depth (login, splash, onboarding).
 */
import { LiquidOrbs } from "./LiquidOrbs";

export function WithOrbs({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"relative min-h-screen overflow-hidden " + className}
      style={{ background: "linear-gradient(160deg, #141E30 0%, #0d1724 100%)" }}
    >
      <LiquidOrbs />
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * LiquidOrbs — floating background orbs that make glass blur visible.
 * Place inside any fixed/relative container. They drift slowly.
 */
export function LiquidOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
      {/* Top-left — bright ice blue */}
      <div
        className="animate-orb-drift absolute"
        style={{
          top: "-8%",
          left: "-5%",
          width: "55vw",
          height: "55vw",
          maxWidth: 480,
          maxHeight: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 38%, rgba(110, 175, 238, 0.70) 0%, rgba(60, 130, 210, 0.40) 38%, transparent 70%)",
          filter: "blur(52px)",
        }}
      />

      {/* Top-right — lighter near-white ice */}
      <div
        className="animate-orb-drift-r absolute"
        style={{
          top: "-4%",
          right: "-8%",
          width: "45vw",
          height: "45vw",
          maxWidth: 400,
          maxHeight: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 55% 45%, rgba(200, 230, 255, 0.55) 0%, rgba(140, 195, 245, 0.30) 40%, transparent 68%)",
          filter: "blur(48px)",
        }}
      />

      {/* Middle-right — medium blue */}
      <div
        className="animate-float-slow absolute"
        style={{
          top: "38%",
          right: "-10%",
          width: "38vw",
          height: "38vw",
          maxWidth: 320,
          maxHeight: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(65, 120, 200, 0.45) 0%, rgba(35, 85, 165, 0.22) 45%, transparent 68%)",
          filter: "blur(56px)",
          animationDuration: "11s",
        }}
      />

      {/* Bottom-left — soft ice */}
      <div
        className="animate-float-mid absolute"
        style={{
          bottom: "-6%",
          left: "-5%",
          width: "48vw",
          height: "48vw",
          maxWidth: 420,
          maxHeight: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 45% 55%, rgba(130, 185, 240, 0.50) 0%, rgba(80, 150, 220, 0.26) 42%, transparent 68%)",
          filter: "blur(60px)",
          animationDuration: "9s",
        }}
      />

      {/* Bottom-right — bright highlight spot */}
      <div
        className="animate-orb-drift absolute"
        style={{
          bottom: "10%",
          right: "5%",
          width: "28vw",
          height: "28vw",
          maxWidth: 240,
          maxHeight: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(190, 225, 255, 0.45) 0%, rgba(110, 170, 230, 0.22) 50%, transparent 70%)",
          filter: "blur(44px)",
          animationDuration: "16s",
          animationDelay: "4s",
        }}
      />

      {/* Center subtle glow */}
      <div
        className="absolute"
        style={{
          top: "40%",
          left: "30%",
          width: "40vw",
          height: "30vw",
          maxWidth: 320,
          maxHeight: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(100, 160, 225, 0.20) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}

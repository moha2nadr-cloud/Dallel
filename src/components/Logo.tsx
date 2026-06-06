import iconSrc from "@/assets/icon.png";

export function Logo({ className }: { className?: string }) {
  return <img src={iconSrc} alt="دليل" className={className} />;
}
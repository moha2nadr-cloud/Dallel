import logoAsset from "@/assets/daleel-logo.png.asset.json";

export function Logo({ className }: { className?: string }) {
  return <img src={logoAsset.url} alt="دليل" className={className} />;
}
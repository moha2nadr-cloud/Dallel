import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setProfile, getProfile, getUserId, setOnboarded } from "@/lib/storage";
import { ChevronRight, X, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { syncProfile } from "@/lib/api/sync.functions";
import { LiquidOrbs } from "@/components/LiquidOrbs";
import logoSrc from "@/assets/logo-daleel.png";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "أكمل ملفك — دليل" }] }),
  component: Onboarding,
});

const STEPS = [
  { key: "name", title: "أخبرنا عنك",   sub: "ما اسمك الذي تحب أن نناديك به؟", label: "الاسم",   placeholder: "أدخل اسمك..." },
  { key: "age",  title: "كم عمرك؟",     sub: "نستخدم هذا لتخصيص المحتوى لك.",  label: "العمر",   placeholder: "" },
  { key: "spec", title: "ما تخصصك؟",    sub: "اكتب تخصصك بأي طريقة تناسبك.",   label: "التخصص", placeholder: "مثال: هندسة برمجيات" },
  { key: "uni",  title: "في أي جامعة؟", sub: "اكتب اسم جامعتك.",                label: "الجامعة", placeholder: "اكتب اسم الجامعة" },
];

function Onboarding() {
  const navigate = useNavigate();
  const existing = typeof window !== "undefined" ? getProfile() : null;
  const [step, setStep]  = useState(0);
  const [name, setName]  = useState(existing?.name ?? "");
  const [age,  setAge]   = useState<number>(existing?.age ?? 20);
  const [spec, setSpec]  = useState(existing?.specialization ?? "");
  const [uni,  setUni]   = useState(existing?.university ?? "");
  const doSyncProfile = useServerFn(syncProfile);
  const total = 4;

  const canNext = [
    name.trim().length >= 2,
    age >= 14 && age <= 80,
    spec.trim().length >= 2,
    uni.trim().length  >= 2,
  ][step];

  const onNext = async () => {
    if (step < total - 1) return setStep(step + 1);
    const ex = getProfile();
    const profile = { ...ex, name: name.trim(), age, specialization: spec.trim(), university: uni.trim() };
    setProfile(profile);
    setOnboarded(true);
    const userId = getUserId();
    if (userId) doSyncProfile({ data: { userId, ...profile } }).catch(() => {});
    navigate({ to: "/home" });
  };

  const onBack = () => step === 0 ? navigate({ to: "/login" }) : setStep(step - 1);
  const curVal = [name, String(age), spec, uni][step];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <LiquidOrbs />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button type="button" onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition-lg"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.32)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", backdropFilter: "blur(16px)" }}
          aria-label="رجوع">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => (
            <div key={idx} className="rounded-full transition-all duration-500"
              style={{
                width: idx === step ? 22 : 6, height: 6,
                background: idx <= step ? "linear-gradient(90deg,#B5A898,#8B7D6F)" : "#E8E8ED",
                boxShadow: idx === step ? "0 0 8px rgba(181,168,152,0.50)" : "none",
              }}
            />
          ))}
        </div>

        <button type="button" onClick={() => navigate({ to: "/login" })}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition-lg"
          style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(200,195,185,0.32)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", backdropFilter: "blur(16px)" }}
          aria-label="إغلاق">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mx-5 overflow-hidden rounded-full" style={{ height: 3, background: "#F4F4F6" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${((step + 1) / total) * 100}%`, background: "linear-gradient(90deg,#B5A898,#8B7D6F)", boxShadow: "0 0 8px rgba(181,168,152,0.55)" }}
        />
      </div>

      {/* Logo small */}
      <div className="relative z-10 flex justify-center pt-6">
        <img src={logoSrc} alt="دليل" style={{ height: 36, width: "auto", objectFit: "contain", opacity: 0.55 }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-5 pt-8" key={step}>
        <div className="animate-reveal-up">
          <span className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-[#8B7D6F]"
            style={{ background: "rgba(181,168,152,0.12)", border: "1px solid rgba(181,168,152,0.25)" }}>
            {step + 1} من {total}
          </span>
          <h1 className="text-[28px] font-extrabold mb-2 text-gray-900">{STEPS[step].title}</h1>
          <p className="text-[13px] text-gray-500">{STEPS[step].sub}</p>

          <div className="mt-8">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {STEPS[step].label}
            </label>

            {step === 1 ? (
              <input type="number" min={14} max={80} value={age}
                onChange={(e) => setAge(parseInt(e.target.value || "0", 10))}
                className="w-full rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-900 lg-input"
              />
            ) : (
              <input value={curVal}
                onChange={(e) => { if (step === 0) setName(e.target.value); else if (step === 2) setSpec(e.target.value); else setUni(e.target.value); }}
                placeholder={STEPS[step].placeholder}
                className="w-full rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-900 placeholder:text-gray-300 lg-input"
              />
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-5 pb-14 pt-4">
        <button type="button" onClick={onNext} disabled={!canNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-extrabold text-white transition-lg active:scale-[0.97] disabled:opacity-35"
          style={{
            background: canNext ? "linear-gradient(135deg,#B5A898,#8B7D6F)" : "#E8E8ED",
            color: canNext ? "#fff" : "#A3A3B4",
            boxShadow: canNext ? "0 8px 24px rgba(181,168,152,0.40)" : "none",
            border: "1px solid rgba(255,255,255,0.20)",
          }}>
          {step === total - 1 ? <><Check className="h-5 w-5" /> ابدأ الآن</> : "التالي"}
        </button>
      </div>
    </div>
  );
}

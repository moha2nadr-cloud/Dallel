import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setProfile, getProfile, getUserId, setOnboarded } from "@/lib/storage";
import { ChevronRight, X, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { syncProfile } from "@/lib/api/sync.functions";
import { LiquidOrbs } from "@/components/LiquidOrbs";

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
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? "");
  const [age,  setAge]  = useState<number>(existing?.age ?? 20);
  const [spec, setSpec] = useState(existing?.specialization ?? "");
  const [uni,  setUni]  = useState(existing?.university ?? "");
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

  /* Shared input style */
  const inputSx: React.CSSProperties = {
    width: "100%",
    background: "rgba(200,228,255,0.08)",
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
    padding: "0.9rem 1rem",
    fontSize: 15,
    fontWeight: 600,
    color: "rgba(215,235,252,0.95)",
    outline: "none",
    fontFamily: "Tajawal, sans-serif",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
  };

  return (
    <div
      className="flex min-h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0e1828 0%, #09121e 100%)" }}
    >
      <LiquidOrbs />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4">
        <button
          type="button" onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition-glass"
          style={{
            background: "rgba(200,228,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            backdropFilter: "blur(16px)",
          }}
          aria-label="رجوع"
        >
          <ChevronRight className="h-5 w-5 text-[#96b8d6]" />
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, idx) => (
            <div key={idx} className="rounded-full transition-all duration-500"
              style={{
                width: idx === step ? 22 : 6, height: 6,
                background: idx <= step
                  ? "linear-gradient(90deg, #6b92ba, #4a70a0)"
                  : "rgba(200,228,255,0.15)",
                boxShadow: idx === step ? "0 0 8px rgba(107,146,186,0.55)" : "none",
              }}
            />
          ))}
        </div>

        <button
          type="button" onClick={() => navigate({ to: "/login" })}
          className="flex h-9 w-9 items-center justify-center rounded-2xl transition-glass"
          style={{
            background: "rgba(200,228,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(16px)",
          }}
          aria-label="إغلاق"
        >
          <X className="h-4 w-4 text-[#6b92ba]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mx-5 overflow-hidden rounded-full" style={{ height: 3, background: "rgba(200,228,255,0.10)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${((step + 1) / total) * 100}%`,
            background: "linear-gradient(90deg, #6b92ba, #4a70a0)",
            boxShadow: "0 0 10px rgba(107,146,186,0.65)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-5 pt-10" key={step}>
        <div className="animate-reveal-up">
          <span
            className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-[#96b8d6]"
            style={{
              background: "rgba(200,228,255,0.10)",
              border: "1px solid rgba(255,255,255,0.20)",
              backdropFilter: "blur(12px)",
            }}
          >
            {step + 1} من {total}
          </span>

          <h1
            className="text-[28px] font-extrabold mb-2"
            style={{
              background: "linear-gradient(135deg, #e8f2fb 0%, #96b8d6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            {STEPS[step].title}
          </h1>
          <p className="text-[13px] text-[#6b92ba]">{STEPS[step].sub}</p>

          <div className="mt-8">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#4a70a0]">
              {STEPS[step].label}
            </label>

            {step === 1 ? (
              <input
                type="number" min={14} max={80} value={age}
                onChange={(e) => setAge(parseInt(e.target.value || "0", 10))}
                style={inputSx}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(107,146,186,0.65)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(107,146,186,0.14), inset 0 1px 0 rgba(255,255,255,0.14)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.22)";
                  e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.10)";
                }}
              />
            ) : (
              <input
                value={curVal}
                onChange={(e) => {
                  if (step === 0) setName(e.target.value);
                  else if (step === 2) setSpec(e.target.value);
                  else if (step === 3) setUni(e.target.value);
                }}
                placeholder={STEPS[step].placeholder}
                style={inputSx}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(107,146,186,0.65)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(107,146,186,0.14), inset 0 1px 0 rgba(255,255,255,0.14)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.22)";
                  e.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.10)";
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-5 pb-14 pt-4">
        <button
          type="button" onClick={onNext} disabled={!canNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-extrabold text-white transition-all duration-200 active:scale-[0.97]"
          style={{
            background: canNext
              ? "linear-gradient(135deg, #35577D 0%, #4a70a0 100%)"
              : "rgba(200,228,255,0.08)",
            border: canNext ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.10)",
            boxShadow: canNext ? "0 8px 28px rgba(53,87,125,0.50), inset 0 1px 0 rgba(255,255,255,0.18)" : "none",
            color: canNext ? "#fff" : "#3a5578",
          }}
        >
          {step === total - 1
            ? <><Check className="h-5 w-5" /> ابدأ الآن</>
            : "التالي"
          }
        </button>
      </div>
    </div>
  );
}

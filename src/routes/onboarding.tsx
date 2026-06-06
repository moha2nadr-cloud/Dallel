import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setProfile, getProfile } from "@/lib/storage";
import { ChevronRight, X } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "أكمل ملفك — دليل" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const existing = typeof window !== "undefined" ? getProfile() : null;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(existing?.name ?? "");
  const [age, setAge] = useState<number>(existing?.age ?? 20);
  const [spec, setSpec] = useState(existing?.specialization ?? "");
  const [uni, setUni] = useState(existing?.university ?? "");

  const total = 4;
  const progress = ((step + 1) / total) * 100;

  const canNext = [
    name.trim().length >= 2,
    age >= 14 && age <= 80,
    spec.trim().length >= 2,
    uni.trim().length >= 2,
  ][step];

  const onNext = () => {
    if (step < total - 1) return setStep(step + 1);
    setProfile({
      name: name.trim(),
      age,
      specialization: spec.trim(),
      university: uni.trim(),
    });
    navigate({ to: "/home" });
  };
  const onBack = () => (step === 0 ? navigate({ to: "/login" }) : setStep(step - 1));

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pt-12 pb-8">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="rounded-full p-2 text-foreground/80 hover:text-foreground" aria-label="رجوع">
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="text-[11px] text-muted-foreground">{step + 1} / {total}</span>
        <button type="button" onClick={() => navigate({ to: "/login" })} className="rounded-full p-2 text-foreground/60 hover:text-foreground" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-10 flex-1">
        {step === 0 && (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">أخبرنا عنك قليلاً</h1>
            <p className="mt-2 text-sm text-muted-foreground">ما اسمك الذي تحب أن نناديك به؟</p>
            <label className="mt-8 block text-[12px] text-foreground/80">الاسم</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك..."
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">كم عمرك؟</h1>
            <p className="mt-2 text-sm text-muted-foreground">نستخدم هذا لتخصيص المحتوى لك.</p>
            <label className="mt-8 block text-[12px] text-foreground/80">العمر</label>
            <input
              type="number"
              min={14}
              max={80}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value || "0", 10))}
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground focus:border-primary/50 focus:outline-none"
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">ما تخصصك؟</h1>
            <p className="mt-2 text-sm text-muted-foreground">اكتب تخصصك بأي طريقة تناسبك.</p>
            <label className="mt-8 block text-[12px] text-foreground/80">التخصص</label>
            <input
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="مثال: هندسة برمجيات"
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-extrabold text-foreground">في أي جامعة تدرس؟</h1>
            <p className="mt-2 text-sm text-muted-foreground">اكتب اسم جامعتك.</p>
            <label className="mt-8 block text-[12px] text-foreground/80">الجامعة</label>
            <input
              value={uni}
              onChange={(e) => setUni(e.target.value)}
              placeholder="اكتب اسم الجامعة"
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="mt-6 w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition disabled:opacity-40 active:scale-[0.98]"
      >
        {step === total - 1 ? "ابدأ الآن" : "التالي"}
      </button>
    </div>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { WithBottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { clearProfile, getProfile, clearChatHistory } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Globe, Moon, Bell, Shield, Info, LogOut, Trash2, User, Pencil, Lock } from "lucide-react";
import { useLang, setLang, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — دليل" }] }),
  component: Settings,
});

const NOTIF_KEY = "daleel:notif";

function Settings() {
  const navigate = useNavigate();
  const [lang, t] = useLang();
  const [theme, setTheme] = useTheme();
  const [profile, setP] = useState<ReturnType<typeof getProfile>>(null);
  const [notif, setNotif] = useState<boolean>(() =>
    typeof window === "undefined" ? true : localStorage.getItem(NOTIF_KEY) !== "0",
  );
  useEffect(() => setP(getProfile()), []);

  const toggleNotif = () => {
    const next = !notif;
    setNotif(next);
    localStorage.setItem(NOTIF_KEY, next ? "1" : "0");
  };

  const onLogout = () => {
    if (confirm(t.confirm_logout)) {
      clearProfile();
      clearChatHistory();
      navigate({ to: "/login" });
    }
  };

  const onDelete = () => {
    if (confirm(t.confirm_delete)) {
      localStorage.clear();
      sessionStorage.clear();
      navigate({ to: "/login" });
    }
  };

  const cycleTheme = () => {
    const order: Array<typeof theme> = ["dark", "light", "auto"];
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  };

  const themeLabel = theme === "light" ? t.light : theme === "dark" ? t.dark : t.auto;
  const langLabel = lang === "ar" ? t.arabic : t.english;

  return (
    <WithBottomBar>
      <Header />
      <header className="px-5 pt-5">
        <h1 className="text-xl font-extrabold text-foreground">{t.settings}</h1>
      </header>

      <section className="mx-5 mt-5 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-1 ring-primary/30">
            {profile?.picture ? (
              <img src={profile.picture} alt="" className="h-full w-full object-cover" />
            ) : profile?.name ? (
              <span className="text-2xl font-extrabold text-primary">{profile.name[0]}</span>
            ) : (
              <User className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground">{profile?.name ?? t.guest}</p>
            {profile && (
              <p className="line-clamp-1 mt-0.5 text-[12px] text-muted-foreground">
                {profile.specialization} · {profile.university}
              </p>
            )}
          </div>
        </div>
        <Link
          to="/onboarding"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-[12px] font-semibold text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t.edit_profile}
        </Link>
      </section>

      <Group>
        <Row
          icon={Globe}
          label={t.language}
          value={langLabel}
          onClick={() => setLang(lang === "ar" ? "en" : "ar" as Lang)}
        />
        <Row icon={Moon} label={t.theme} value={themeLabel} onClick={cycleTheme} />
        <Row icon={Bell} label={t.notifications} value={notif ? t.enabled : t.disabled} onClick={toggleNotif} />
      </Group>

      <Group>
        <Row icon={Shield} label={t.privacy} />
        <Row icon={Lock} label={t.admin_panel} onClick={() => navigate({ to: "/admin" })} />
        <Row icon={Trash2} label={t.delete_account} danger onClick={onDelete} />
      </Group>

      <Group>
        <Row icon={Info} label={t.about} value={t.version} />
      </Group>

      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-sm font-bold text-destructive transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          {t.logout}
        </button>
      </div>

      <p className="mt-8 text-center text-[10px] tracking-[0.3em] text-muted-foreground/60">
        {t.powered_by}
      </p>
    </WithBottomBar>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-5 mt-4 overflow-hidden rounded-3xl border border-border bg-card">
      <ul className="divide-y divide-border">{children}</ul>
    </div>
  );
}

function Row({
  icon: Icon, label, value, danger, onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 p-4 text-right transition hover:bg-muted/40">
        <span className={"flex h-9 w-9 items-center justify-center rounded-2xl " + (danger ? "bg-destructive/15" : "bg-primary/10 ring-1 ring-primary/20")}>
          <Icon className={"h-4 w-4 " + (danger ? "text-destructive" : "text-primary")} />
        </span>
        <span className={"flex-1 text-start text-[14px] font-semibold " + (danger ? "text-destructive" : "text-foreground")}>{label}</span>
        {value && <span className="text-[12px] text-muted-foreground">{value}</span>}
      </button>
    </li>
  );
}
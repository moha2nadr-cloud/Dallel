import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getProfile } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "دليل" }] }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: getProfile() ? "/home" : "/login" });
  }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#B5A898] border-t-transparent" />
    </div>
  );
}

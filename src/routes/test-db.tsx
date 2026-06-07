import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { initCmsDb, loadCmsDb } from "../lib/db.server";

const testServerFn = createServerFn({ method: "POST" }).handler(async () => {
  await initCmsDb();
  const data = await loadCmsDb();
  return {
    connected: true,
    hasData: data != null && Object.keys(data).length > 0,
    keys: data ? Object.keys(data) : [],
    slideCount: Array.isArray(data?.slides) ? data.slides.length : 0,
    postCount: Array.isArray(data?.posts) ? data.posts.length : 0,
    firstSlide: Array.isArray(data?.slides) && data.slides.length > 0 ? data.slides[0] : null,
  };
});

export const Route = createFileRoute("/test-db")({
  component: TestDb,
});

function TestDb() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testServerFn().then(setResult).catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="min-h-screen bg-white p-8" dir="ltr" style={{ fontFamily: "monospace" }}>
      <h1 className="text-2xl font-bold mb-4">DB Connection Test</h1>
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      {result && (
        <pre className="bg-gray-100 p-4 rounded-lg text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {!result && !error && <p>Testing...</p>}
    </div>
  );
}

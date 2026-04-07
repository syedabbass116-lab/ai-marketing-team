import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./components/views/Dashboard";
import Home from "./components/views/Home";
import ContentLibrary from "./components/views/ContentLibrary";
import Scheduler from "./components/views/Scheduler";
import Analytics from "./components/views/Analytics";
import BrandSettings from "./components/views/BrandSettings";
import Billing from "./components/views/Billing";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.toString().replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const sanitizePostText = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/\*\*/g, "").replace(/__/g, "").trim();
};

const getRequestedCount = (value: string): number => {
  const lower = value.toLowerCase();
  const patterns = [
    /\bgive\s+(me\s+)?(\d{1,2})\s+(posts?|tweets?|threads?|ideas?)\b/,
    /\b(\d{1,2})\s+(posts?|tweets?|threads?|ideas?)\b/,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const numStr = match[2] ?? match[1];
      const n = parseInt(numStr, 10);
      if (!Number.isNaN(n)) {
        return Math.max(1, Math.min(n, 10));
      }
    }
  }

  return 1;
};

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [library, setLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftTopic, setDraftTopic] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🚀 GENERATE CONTENT (FIXED)
  const generateContent = async (topic: string, platform: string = "all") => {
    if (!topic.trim()) return;

    const count = getRequestedCount(topic);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/generate?topic=${encodeURIComponent(
          topic,
        )}&platform=${encodeURIComponent(platform)}&count=${count}`,
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const rawText = await res.text();
      console.log("RAW RESPONSE:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Invalid JSON from backend");
      }

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      setContent({
        linkedin: sanitizePostText(data.linkedin),
        twitter: sanitizePostText(data.twitter),
        instagram: sanitizePostText(data.instagram),
        facebook: sanitizePostText(data.facebook),
        tiktok: sanitizePostText(data.tiktok),
        youtube: sanitizePostText(data.youtube),
      });
      setError(null);
    } catch (err: any) {
      console.error("❌ ERROR:", err);

      const msg = err.message || "Error generating content";
      setContent(null);
      setError(msg);
    }

    setLoading(false);
  };

  // 💾 SAVE
  const saveContent = (platform: string, text: string) => {
    setLibrary((prev) => [...prev, { platform, text }]);
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Home
            onStartGenerate={() => setActiveView("generate")}
            onOpenLibrary={() => setActiveView("library")}
            onOpenAnalytics={() => setActiveView("analytics")}
          />
        );
      case "generate":
        return (
          <Dashboard
            content={content}
            loading={loading}
            error={error}
            topic={draftTopic}
            onTopicChange={setDraftTopic}
            platform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
            onGenerate={generateContent}
            onSave={saveContent}
          />
        );
      case "library":
        return <ContentLibrary library={library} />;
      case "scheduler":
        return <Scheduler />;
      case "analytics":
        return <Analytics />;
      case "brand":
        return <BrandSettings />;
      case "billing":
        return <Billing />;
      default:
        return (
          <Home
            onStartGenerate={() => setActiveView("generate")}
            onOpenLibrary={() => setActiveView("library")}
            onOpenAnalytics={() => setActiveView("analytics")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <TopBar sidebarOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-8 animate-fadeIn">{renderView()}</div>
      </main>
    </div>
  );
}

export default App;

import { useCallback, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard, {
  type CarouselSlide,
  type ChatLine,
} from "./components/views/Dashboard";
import Home from "./components/views/Home";
import ContentLibrary from "./components/views/ContentLibrary";
import Scheduler from "./components/views/Scheduler";
import Analytics from "./components/views/Analytics";
import BrandSettings from "./components/views/BrandSettings";
import Billing from "./components/views/Billing";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const sanitizePostText = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/\*\*/g, "").replace(/__/g, "").trim();
};

const emptyContentRecord = () => ({
  linkedin: "",
  twitter: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
});

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [library, setLibrary] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genChatMessages, setGenChatMessages] = useState<ChatLine[]>([]);
  const [genChatStep, setGenChatStep] = useState("start");
  const [genChatInput, setGenChatInput] = useState("");

  const saveContent = (platform: string, text: string) => {
    setLibrary((prev) => [...prev, { platform, text }]);
  };

  const applySessionDrafts = useCallback((data: Record<string, unknown>) => {
    const raw = data.drafts;
    if (!raw || typeof raw !== "object") return;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "string") cleaned[k] = sanitizePostText(v);
    }
    setContent((prev) => ({
      ...emptyContentRecord(),
      ...(prev || {}),
      ...cleaned,
    }));
  }, []);

  const parseApiError = (
    res: Response,
    data: Record<string, unknown> | null,
  ): string => {
    let detail = `${res.status} ${res.statusText}`;
    if (data && typeof data === "object" && "detail" in data) {
      const d = (data as { detail: unknown }).detail;
      if (Array.isArray(d)) {
        detail = d
          .map((item) =>
            typeof item === "object" && item && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : String(item),
          )
          .join(" ");
      } else {
        detail = String(d);
      }
    }
    return detail;
  };

  const runChatCommand = useCallback(
    async (
      message: string,
      platform?: string,
      clientDrafts?: Record<string, string> | null,
    ) => {
      if (!API_BASE_URL) {
        throw new Error(
          "Backend URL is not configured. Set VITE_API_URL in your environment (e.g. frontend/.env).",
        );
      }
      const body: Record<string, unknown> = { message };
      if (platform) body.platform = platform;
      if (clientDrafts) body.client_drafts = clientDrafts;
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!res.ok) {
        throw new Error(parseApiError(res, data));
      }
      if (!data) {
        throw new Error("Invalid response from server");
      }
      applySessionDrafts(data);
      return data;
    },
    [applySessionDrafts],
  );

  const runGenerateImage = useCallback(
    async (prompt: string, options?: { rawPrompt?: boolean }) => {
      if (!API_BASE_URL) {
        throw new Error(
          "Backend URL is not configured. Set VITE_API_URL in your environment (e.g. frontend/.env).",
        );
      }
      const body: Record<string, unknown> = {
        prompt,
        style_suffix: options?.rawPrompt ? "" : null,
      };
      const res = await fetch(`${API_BASE_URL}/generate-image`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!res.ok) {
        throw new Error(parseApiError(res, data));
      }
      if (!data || typeof data.image_url !== "string") {
        throw new Error("Invalid response from image API");
      }
      return data as { image_url: string; prompt_used?: string };
    },
    [],
  );

  const runGenerateCarousel = useCallback(
    async (idea: string, slides: number) => {
      if (!API_BASE_URL) {
        throw new Error(
          "Backend URL is not configured. Set VITE_API_URL in your environment (e.g. frontend/.env).",
        );
      }
      const res = await fetch(`${API_BASE_URL}/generate-carousel`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, slides }),
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!res.ok) {
        throw new Error(parseApiError(res, data));
      }
      const raw = data?.carousel;
      if (!Array.isArray(raw)) {
        throw new Error("Invalid carousel response");
      }
      const carousel: CarouselSlide[] = raw.map((row) => {
        const o = row as Record<string, unknown>;
        return {
          title: String(o.title ?? ""),
          content: String(o.content ?? ""),
          image_url: String(o.image_url ?? ""),
        };
      });
      if (carousel.length === 0 || carousel.some((s) => !s.image_url)) {
        throw new Error("Invalid carousel slide payload");
      }
      return { carousel };
    },
    [],
  );

  const runPostAction = useCallback(
    async (
      action: "approve" | "regenerate" | "edit",
      editContent?: string,
    ) => {
      if (!API_BASE_URL) {
        throw new Error(
          "Backend URL is not configured. Set VITE_API_URL in your environment (e.g. frontend/.env).",
        );
      }
      const body: { action: string; content?: string } = { action };
      if (action === "edit" && editContent !== undefined) {
        body.content = editContent;
      }
      const res = await fetch(`${API_BASE_URL}/action`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!res.ok) {
        throw new Error(parseApiError(res, data));
      }
      if (!data) {
        throw new Error("Invalid response from server");
      }
      applySessionDrafts(data);
      return data;
    },
    [applySessionDrafts],
  );

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
            onSave={saveContent}
            onChatCommand={runChatCommand}
            onPostAction={runPostAction}
            onGenerateImage={runGenerateImage}
            onGenerateCarousel={runGenerateCarousel}
            chatMessages={genChatMessages}
            setChatMessages={setGenChatMessages}
            chatStep={genChatStep}
            setChatStep={setGenChatStep}
            chatInput={genChatInput}
            setChatInput={setGenChatInput}
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

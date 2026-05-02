import { useCallback, useState } from "react";
import { useUser, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./components/views/Dashboard";
import Home from "./components/views/Home";
import ContentLibrary from "./components/views/ContentLibrary";
import BrandSettings from "./components/views/BrandSettings";
import Billing from "./components/views/Billing";
import Landing from "./components/views/Landing";
import AuthGate from "./components/AuthGate";
import { useUsageLimit } from "./hooks/useUsageLimit";

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

function AppContent() {
  const { usage, trialDaysLeft, loading, hasTrialExpired, incrementUsage } = useUsageLimit();
  const [activeView, setActiveView] = useState("dashboard");
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [library, setLibrary] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genChatStep, setGenChatStep] = useState("start");
  const [genChatInput, setGenChatInput] = useState("");

  const saveContent = (platform: string, text: string) => {
    const newItem = {
      id: Date.now().toString(),
      platform,
      text,
      timestamp: new Date().toISOString(),
    };
    setLibrary((prev) => [newItem, ...prev]);
    incrementUsage();
  };

  const deleteContent = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
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
      platform: string = "linkedin",
      clientDrafts?: Record<string, string> | null,
    ) => {
      if (!API_BASE_URL) {
        throw new Error(
          "Backend URL is not configured. Set VITE_API_URL in your environment (e.g. frontend/.env).",
        );
      }
      const body: Record<string, unknown> = { message, platform };
      if (clientDrafts) body.client_drafts = clientDrafts;

      const user = (window as any).Clerk?.user;
      if (user) {
        body.user_name = user.firstName || user.username || "there";
      }

      const brandSettingsStr = localStorage.getItem("brandSettings");
      if (brandSettingsStr) {
        try {
          body.brand_settings = JSON.parse(brandSettingsStr);
        } catch (e) {}
      }

      const res = await fetch(`${API_BASE_URL}/chat-command`, {
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

      if (data.action === "generate_post" && typeof data.content === "string") {
        const sanitized = sanitizePostText(data.content);
        setContent((prev) => ({
          ...emptyContentRecord(),
          ...(prev || {}),
          [platform]: sanitized,
        }));
        incrementUsage();
      }

      return data;
    },
    [incrementUsage],
  );

  const runPostAction = useCallback(
    async (action: "approve" | "edit", editContent?: string) => {
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
    [applySessionDrafts, incrementUsage],
  );

  const renderView = () => {
    if (hasTrialExpired && activeView !== "billing") {
      return <Billing library={library} usage={usage} trialDaysLeft={trialDaysLeft} hasTrialExpired={hasTrialExpired} />;
    }
    switch (activeView) {
      case "dashboard":
        return (
          <Home
            onStartGenerate={() => setActiveView("generate")}
            onOpenLibrary={() => setActiveView("library")}
          />
        );
      case "generate":
        return (
          <Dashboard
            content={content}
            onSave={saveContent}
            onChatCommand={runChatCommand}
            onPostAction={runPostAction}
            chatStep={genChatStep}
            setChatStep={setGenChatStep}
            chatInput={genChatInput}
            setChatInput={setGenChatInput}
          />
        );
      case "library":
        return <ContentLibrary library={library} onDelete={deleteContent} />;
      case "brand":
        return <BrandSettings />;
      case "billing":
        return <Billing library={library} usage={usage} trialDaysLeft={trialDaysLeft} hasTrialExpired={hasTrialExpired} />;
      default:
        return (
          <Home
            onStartGenerate={() => setActiveView("generate")}
            onOpenLibrary={() => setActiveView("library")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white bg-dot-grid">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <TopBar sidebarOpen={sidebarOpen} />

      <main
        className={`pt-14 transition-all duration-200 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}
      >
        <div className="p-4 md:p-8 animate-fadeIn">{renderView()}</div>
      </main>
    </div>
  );
}

function App() {
  const { user, isLoaded } = useUser();

  // Handle Clerk SSO OAuth callback
  if (window.location.pathname === "/sso-callback") {
    return <AuthenticateWithRedirectCallback />;
  }

  // Show landing page if user is not logged in
  if (isLoaded && !user) {
    return <Landing />;
  }

  // Show app if user is logged in
  if (isLoaded && user) {
    return <AppContent />;
  }

  // Show loading state
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default App;

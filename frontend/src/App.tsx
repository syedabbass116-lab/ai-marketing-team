import { useCallback, useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./components/views/Dashboard";
import Home from "./components/views/Home";
import ContentLibrary from "./components/views/ContentLibrary";
import BrandSettings from "./components/views/BrandSettings";
import Billing from "./components/views/Billing";
import Landing from "./components/views/Landing";
import Profile from "./components/views/Profile";
import AuthPage from "./components/views/AuthPage";
import ContactUs from "./components/views/ContactUs";
import PrivacyPolicy from "./components/views/PrivacyPolicy";
import TermsOfService from "./components/views/TermsOfService";
import AboutUs from "./components/views/AboutUs";
import FAQ from "./components/views/FAQ";
import { useUsageLimit } from "./hooks/useUsageLimit";
import { useLibrary } from "./hooks/useLibrary";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const sanitizePostText = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/\*\*/g, "").replace(/__/g, "").trim();
};

const emptyContentRecord = () => ({
  linkedin: "",
  twitter: "",
  threads: "",
});

function AppContent() {
  const { usage, trialDaysLeft, loading: usageLoading, hasTrialExpired, incrementUsage } = useUsageLimit();
  const { library, saveToLibrary, deleteFromLibrary } = useLibrary();
  const [activeView, setActiveView] = useState("dashboard");
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const { user } = useAuth();
  const [brandSettings, setBrandSettings] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [genChatStep, setGenChatStep] = useState("start");
  const [genChatInput, setGenChatInput] = useState("");

  useEffect(() => {
    async function loadBrandSettings() {
      if (!user) {
        setBrandSettings(null);
        localStorage.removeItem("brandSettings");
        return;
      }
      
      try {
        const { supabase } = await import("./lib/supabase");
        const { data, error } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const settings = {
            brandName: data.brand_name,
            brandDescription: data.brand_description,
            brandVoice: data.brand_voice,
            tone: data.tone,
            targetAudience: data.target_audience,
            writingStyleLinkedin: data.writing_style_linkedin,
            writingStyleTwitter: data.writing_style_twitter,
            keyTopics: data.key_topics
          };
          setBrandSettings(settings);
          localStorage.setItem("brandSettings", JSON.stringify(settings));
        }
      } catch (err) {
        console.error("Error loading brand settings in App:", err);
      }
    }

    loadBrandSettings();
  }, [user]);

  const saveContent = async (platform: string, text: string) => {
    try {
      await saveToLibrary(platform, text);
      incrementUsage();
    } catch (err) {
      console.error("Failed to save content", err);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await deleteFromLibrary(id);
    } catch (err) {
      console.error("Failed to delete content", err);
    }
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

      if (user) {
        body.user_name = user.user_metadata?.full_name || user.email?.split('@')[0] || "there";
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
    [incrementUsage, user],
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
    [applySessionDrafts],
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
            usage={usage}
          />
        );
      case "library":
        return <ContentLibrary library={library} onDelete={deleteContent} />;
      case "brand":
        return <BrandSettings />;
      case "billing":
        return <Billing library={library} usage={usage} trialDaysLeft={trialDaysLeft} hasTrialExpired={hasTrialExpired} />;
      case "profile":
        return <Profile />;
      case "contact":
        return <ContactUs />;
      case "privacy":
        return <PrivacyPolicy />;
      case "terms":
        return <TermsOfService />;
      case "about":
        return <AboutUs />;
      case "faq":
        return <FAQ />;
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
        className={`pt-14 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "ml-0"}`}
      >
        <div className="p-4 sm:p-6 md:p-8 animate-fadeIn max-w-7xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Landing/Auth if user is not logged in
  if (!user) {
    return showAuth ? (
      <AuthPage onBack={() => setShowAuth(false)} />
    ) : (
      <Landing onSignIn={() => setShowAuth(true)} />
    );
  }

  // Show app if user is logged in
  return <AppContent />;
}

export default App;

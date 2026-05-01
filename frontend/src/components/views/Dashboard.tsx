import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Copy, Save } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Textarea from "../ui/Textarea";

type ContentType = {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
};

export type DraftPlatform = keyof ContentType;

export type ChatLine = { role: "user" | "assistant"; text: string };

const PLATFORM_TABS: { id: DraftPlatform; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
];

type DashboardProps = {
  content: ContentType | null;
  onSave: (platform: string, text: string) => void;
  onChatCommand: (
    message: string,
    platform?: string,
    clientDrafts?: Record<string, string> | null,
  ) => Promise<Record<string, unknown>>;
  onPostAction: (
    action: "approve" | "regenerate" | "edit",
    editContent?: string,
  ) => Promise<Record<string, unknown>>;

  chatMessages: ChatLine[];
  setChatMessages: Dispatch<SetStateAction<ChatLine[]>>;
  chatStep: string;
  setChatStep: Dispatch<SetStateAction<string>>;
  chatInput: string;
  setChatInput: Dispatch<SetStateAction<string>>;
};

function buildClientDraftsPayload(
  content: ContentType | null,
  activePlatform: DraftPlatform,
  editablePost: string,
): Record<string, string> {
  const out: Record<string, string> = {
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  };
  if (content) {
    (Object.keys(out) as DraftPlatform[]).forEach((k) => {
      const v = content[k];
      if (typeof v === "string") out[k] = v;
    });
  }
  const overlay =
    editablePost !== ""
      ? editablePost
      : typeof content?.[activePlatform] === "string"
        ? content[activePlatform]!
        : "";
  out[activePlatform] = overlay;
  return out;
}

export default function Dashboard({
  content,
  onSave,
  onChatCommand,
  onPostAction,
  chatStep,
  setChatStep,
  chatInput: chatText,
  setChatInput: setChatText,
}: DashboardProps) {
  const [chatBusy, setChatBusy] = useState(false);
  const [chatErr, setChatErr] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] =
    useState<DraftPlatform>("linkedin");

  const [editablePost, setEditablePost] = useState("");
  const [autoSaveBusy, setAutoSaveBusy] = useState(false);
  const lastSyncedPostRef = useRef("");

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        const drafts = buildClientDraftsPayload(
          content,
          activePlatform,
          editablePost,
        );
        const data = await onChatCommand("", "linkedin", drafts);
        if (!mounted) return;
        if (typeof data.step === "string") setChatStep(data.step);
        // The assistant greeting is ignored in the UI; generated drafts appear in the post editor.
      } catch (e) {
        if (mounted) {
          setChatErr(
            e instanceof Error
              ? e.message
              : "Could not reach the chat API. Is the backend running at VITE_API_URL?",
          );
        }
      }
    };
    void boot();
    return () => {
      mounted = false;
    };
    // Boot once per mount; avoids wiping chat when returning to this view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChatCommand]);

  useEffect(() => {
    const text = content?.[activePlatform];
    if (typeof text === "string") {
      setEditablePost(text);
      lastSyncedPostRef.current = text;
    } else {
      setEditablePost("");
      lastSyncedPostRef.current = "";
    }
  }, [content, activePlatform]);

  useEffect(() => {
    if (chatStep !== "approval") return;
    const next = editablePost.trim();
    if (!next || next === lastSyncedPostRef.current.trim()) return;

    const timer = window.setTimeout(async () => {
      setAutoSaveBusy(true);
      try {
        const data = await onPostAction("edit", next);
        if (typeof data.step === "string") setChatStep(data.step);
        if (typeof data.content === "string") {
          lastSyncedPostRef.current = data.content;
        } else {
          lastSyncedPostRef.current = next;
        }
      } catch {
        setChatErr("Could not save edits");
      } finally {
        setAutoSaveBusy(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [editablePost, chatStep, onPostAction, setChatStep]);

  const hydrateDraftFromResponse = (data: Record<string, unknown>) => {
    const contentValue =
      typeof data.content === "string" && data.content.trim()
        ? data.content.trim()
        : "";
    const draftsValue =
      data.drafts && typeof data.drafts === "object"
        ? (data.drafts as Record<string, unknown>)[activePlatform]
        : undefined;
    const draftFromDrafts =
      typeof draftsValue === "string" && draftsValue.trim()
        ? draftsValue.trim()
        : "";

    const nextDraft = contentValue || draftFromDrafts;
    if (nextDraft) {
      setEditablePost(nextDraft);
      lastSyncedPostRef.current = nextDraft;
    }
  };

  const handleNlChat = async () => {
    if (!chatText.trim()) return;
    const outgoing = chatText.trim();
    setChatText("");
    setChatBusy(true);
    setChatErr(null);
    try {
      const drafts = buildClientDraftsPayload(
        content,
        activePlatform,
        editablePost,
      );
      const data = await onChatCommand(outgoing, activePlatform, drafts);
      if (typeof data.step === "string") setChatStep(data.step);
      hydrateDraftFromResponse(data);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Message failed");
    } finally {
      setChatBusy(false);
    }
  };

  const handleApprove = async () => {
    setChatBusy(true);
    setChatErr(null);
    try {
      const data = await onPostAction("approve");
      if (typeof data.step === "string") setChatStep(data.step);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setChatBusy(false);
    }
  };

  const handleRegenerate = async () => {
    setChatBusy(true);
    setChatErr(null);
    try {
      const data = await onPostAction("regenerate");
      hydrateDraftFromResponse(data);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Regenerate failed");
    } finally {
      setChatBusy(false);
    }
  };

  const handleStartOver = async () => {
    setChatBusy(true);
    setChatErr(null);
    try {
      const data = await onChatCommand("start over", "linkedin", null);
      setActivePlatform("linkedin");
      setEditablePost("");
      lastSyncedPostRef.current = "";
      setChatText("");
      if (typeof data.step === "string") setChatStep(data.step);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setChatBusy(false);
    }
  };

  const placeholder =
    chatStep === "awaiting_schedule"
      ? "e.g. next Monday at 10am"
      : "Ask a question, brainstorm, or say what you want to post…";

  const selectPlatform = async (p: DraftPlatform) => {
    if (p === activePlatform || chatBusy) return;
    setChatErr(null);
    setChatBusy(true);
    try {
      const drafts = buildClientDraftsPayload(
        content,
        activePlatform,
        editablePost,
      );
      await onChatCommand("", p, drafts);
      setActivePlatform(p);
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Could not switch platform");
    } finally {
      setChatBusy(false);
    }
  };

  const activeTabLabel =
    PLATFORM_TABS.find((t) => t.id === activePlatform)?.label ?? "Post";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Ghostwrites</h1>
        <p className="text-gray-400 text-sm">
          Choose a platform, chat to draft, then edit the post below and approve
          to schedule.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => void selectPlatform(tab.id)}
            disabled={chatBusy}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
              activePlatform === tab.id
                ? "bg-white border-white text-black"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">
            What do you want to post?
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Enter your idea below and the generated draft will appear in the
            post editor.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !chatBusy) handleNlChat();
              }}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-black text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-white/30"
              disabled={chatBusy}
            />
            <Button
              variant="secondary"
              onClick={handleNlChat}
              disabled={chatBusy || !chatText.trim()}
            >
              {chatBusy ? "…" : "Generate"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleStartOver}
              disabled={chatBusy}
            >
              Reset
            </Button>
          </div>
          {chatErr && <p className="text-sm text-red-400 mt-2">{chatErr}</p>}
        </Card>

        {/* Generated Post — below chat */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-2">
            Generated post
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            {activeTabLabel} draft — edit here, regenerate, or approve when
            ready.
          </p>
          <Textarea
            rows={12}
            value={editablePost}
            onChange={(e) => setEditablePost(e.target.value)}
            placeholder="Your draft will appear here after you share an idea in chat."
            className="min-h-[200px]"
          />
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <Button
              variant="secondary"
              onClick={handleApprove}
              disabled={chatBusy || !editablePost.trim()}
            >
              Approve ✅
            </Button>
            <Button
              variant="ghost"
              onClick={handleRegenerate}
              disabled={chatBusy || chatStep !== "approval"}
            >
              Regenerate 🔄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Copy className="w-4 h-4" />}
              onClick={() =>
                editablePost && navigator.clipboard.writeText(editablePost)
              }
              disabled={!editablePost}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Save className="w-4 h-4" />}
              onClick={() =>
                editablePost && onSave(activePlatform, editablePost)
              }
              disabled={!editablePost}
            >
              Save
            </Button>
            {autoSaveBusy && (
              <span className="text-xs text-gray-500">Saving edits…</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

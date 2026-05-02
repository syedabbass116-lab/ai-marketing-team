import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Copy, Save } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Textarea from "../ui/Textarea";
import PlatformPreview from "./PlatformPreview";

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
    action: "approve" | "edit",
    editContent?: string,
  ) => Promise<Record<string, unknown>>;

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const lastSyncedPostRef = useRef("");
  const saveSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (chatStep !== "approval" && content?.[activePlatform]?.trim()) {
      setChatStep("approval");
    }
  }, [chatStep, content, activePlatform, setChatStep]);

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

  // Cleanup save success timeout on unmount
  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }
    };
  }, []);

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
      if (data.action === "generate_post") {
        hydrateDraftFromResponse(data);
        setChatStep("approval");
      } else if (data.action === "schedule_post") {
        if (typeof data.content === "string") {
          hydrateDraftFromResponse(data);
          setChatStep("approval");
        }
      } else if (data.action === "clarify") {
        setChatErr(
          typeof data.message === "string"
            ? data.message
            : "Please clarify your request.",
        );
      }
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Message failed");
    } finally {
      setChatBusy(false);
    }
  };



  const handleStartOver = async () => {
    setChatBusy(true);
    setChatErr(null);
    try {
      setActivePlatform("linkedin");
      setEditablePost("");
      lastSyncedPostRef.current = "";
      setChatText("");
      setChatStep("start");
    } catch (e) {
      setChatErr(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setChatBusy(false);
    }
  };

  const activeTabLabel =
    PLATFORM_TABS.find((t) => t.id === activePlatform)?.label ?? "Post";

  const placeholder = `Tell me what you want to post on ${activeTabLabel}. I’ll draft it in the selected format.`;

  const selectPlatform = (p: DraftPlatform) => {
    if (p === activePlatform || chatBusy) return;
    setChatErr(null);
    setActivePlatform(p);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Ghostwrites</h1>
        <p className="text-gray-400 text-sm">
          Choose a platform, enter your idea, and the generated draft will
          appear below.
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Generated post
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {activeTabLabel} draft — see live preview while you edit.
              </p>
            </div>
            {editablePost.trim() && (
              <Button
                size="sm"
                onClick={() => {
                  if (editablePost) {
                    onSave(activePlatform, editablePost);
                    setSaveSuccess(true);
                    if (saveSuccessTimeoutRef.current) {
                      clearTimeout(saveSuccessTimeoutRef.current);
                    }
                    saveSuccessTimeoutRef.current = setTimeout(() => {
                      setSaveSuccess(false);
                    }, 2000);
                  }
                }}
                className={saveSuccess ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white text-black hover:bg-gray-200"}
              >
                {saveSuccess ? "✓ Saved" : "Save Post"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase">Edit Content</label>
              <Textarea
                rows={20}
                value={editablePost}
                onChange={(e) => setEditablePost(e.target.value)}
                placeholder="Your draft will appear here after you share an idea in chat."
                className="min-h-[500px] text-sm"
              />
            </div>

            {/* Platform Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase">Live Preview</label>
              <div className="flex items-center justify-center min-h-[500px] bg-white/5 rounded-lg border border-white/10 overflow-auto">
                {editablePost.trim() ? (
                  <div className="p-4 max-w-full">
                    <PlatformPreview platform={activePlatform} content={editablePost} />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 items-center">
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
            {autoSaveBusy && (
              <span className="text-xs text-gray-500">Saving edits…</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

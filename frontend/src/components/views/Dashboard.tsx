import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Copy, Image as ImageIcon, Save } from "lucide-react";
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

export type CarouselSlide = {
  title: string;
  content: string;
  image_url: string;
};

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
  onGenerateImage: (
    prompt: string,
    options?: { rawPrompt?: boolean },
  ) => Promise<{ image_url: string; prompt_used?: string }>;
  onGenerateCarousel: (
    idea: string,
    slides: number,
  ) => Promise<{ carousel: CarouselSlide[] }>;
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
  onGenerateImage,
  onGenerateCarousel,
  chatMessages,
  setChatMessages,
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageRawOnly, setImageRawOnly] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageErr, setImageErr] = useState<string | null>(null);

  const [carouselIdea, setCarouselIdea] = useState("");
  const [carouselSlideCount, setCarouselSlideCount] = useState(5);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [carouselBusy, setCarouselBusy] = useState(false);
  const [carouselErr, setCarouselErr] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
        setChatMessages((prev) => {
          if (prev.length > 0) return prev;
          if (typeof data.message === "string") {
            return [{ role: "assistant", text: data.message }];
          }
          return prev;
        });
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
  }, [editablePost, chatStep, onPostAction]);

  const appendAssistant = (text: string) => {
    setChatMessages((prev) => [...prev, { role: "assistant", text }]);
  };

  const handleNlChat = async () => {
    if (!chatText.trim()) return;
    const outgoing = chatText.trim();
    setChatText("");
    setChatBusy(true);
    setChatErr(null);
    setChatMessages((prev) => [...prev, { role: "user", text: outgoing }]);
    try {
      const drafts = buildClientDraftsPayload(
        content,
        activePlatform,
        editablePost,
      );
      const data = await onChatCommand(outgoing, activePlatform, drafts);
      if (typeof data.step === "string") setChatStep(data.step);
      if (typeof data.message === "string") {
        appendAssistant(data.message);
      }
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
      if (typeof data.message === "string") {
        appendAssistant(data.message);
      }
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
      await onPostAction("regenerate");
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
      if (typeof data.message === "string") {
        setChatMessages([{ role: "assistant", text: data.message }]);
      }
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageBusy(true);
    setImageErr(null);
    try {
      const { image_url } = await onGenerateImage(imagePrompt.trim(), {
        rawPrompt: imageRawOnly,
      });
      setImageUrl(image_url);
    } catch (e) {
      setImageErr(e instanceof Error ? e.message : "Image generation failed");
    } finally {
      setImageBusy(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselIdea.trim()) return;
    setCarouselBusy(true);
    setCarouselErr(null);
    try {
      const n = Math.min(10, Math.max(1, Math.floor(carouselSlideCount)));
      const { carousel } = await onGenerateCarousel(carouselIdea.trim(), n);
      setCarouselSlides(carousel);
    } catch (e) {
      setCarouselErr(
        e instanceof Error ? e.message : "Carousel generation failed",
      );
    } finally {
      setCarouselBusy(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-white mb-1">
          AI Social Media Manager
        </h1>
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
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-gray-900/60 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Chat — full width on top */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">Chat</h2>
          <div className="max-h-[min(260px,32vh)] overflow-y-auto space-y-3 mb-2 pr-1">
            {chatMessages.map((line, i) => (
              <div
                key={`${line.role}-${i}`}
                className={
                  line.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    line.role === "user"
                      ? "max-w-[90%] rounded-lg px-3 py-2 text-sm bg-indigo-900/50 text-gray-100 whitespace-pre-wrap"
                      : "max-w-[90%] rounded-lg px-3 py-2 text-sm bg-gray-800/80 border border-gray-700 text-gray-200 whitespace-pre-wrap"
                  }
                >
                  {line.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !chatBusy) handleNlChat();
              }}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/80 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={chatBusy}
            />
            <Button
              variant="secondary"
              onClick={handleNlChat}
              disabled={chatBusy || !chatText.trim()}
            >
              {chatBusy ? "…" : "Send"}
            </Button>
            <Button variant="ghost" onClick={handleStartOver} disabled={chatBusy}>
              Start over
            </Button>
          </div>
          {chatErr && (
            <p className="text-sm text-red-400 mt-2">{chatErr}</p>
          )}
        </Card>

        {/* Generated Post — below chat */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-2">
            Generated post
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            {activeTabLabel} draft — edit here, regenerate, or approve when ready.
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
              onClick={() => editablePost && navigator.clipboard.writeText(editablePost)}
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

        <Card>
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" aria-hidden />
            Generate image
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Uses Pixazo on the server. Set{" "}
            <code className="text-gray-400">PIXAZO_API_KEY</code> in{" "}
            <code className="text-gray-400">backend/.env</code>.
          </p>
          <Textarea
            rows={3}
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="e.g. modern minimal illustration of a startup team, pastel colors"
            className="min-h-[80px] mb-2"
          />
          <label className="flex items-center gap-2 text-xs text-gray-400 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={imageRawOnly}
              onChange={(e) => setImageRawOnly(e.target.checked)}
              className="rounded border-gray-600 bg-gray-900"
            />
            Raw prompt only (skip aesthetic style suffix)
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="secondary"
              onClick={() => void handleGenerateImage()}
              disabled={imageBusy || !imagePrompt.trim()}
            >
              {imageBusy ? "Generating…" : "Generate image"}
            </Button>
            {imageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(imageUrl, "_blank", "noopener,noreferrer")}
              >
                Open full size
              </Button>
            )}
          </div>
          {imageErr && (
            <p className="text-sm text-red-400 mt-2">{imageErr}</p>
          )}
          {imageUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-700 bg-gray-900/50">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full max-h-[min(420px,50vh)] object-contain"
              />
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-white mb-2">
            Carousel (images per slide)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            One image per slide via Pixazo; can take a minute for several slides.
          </p>
          <input
            type="text"
            value={carouselIdea}
            onChange={(e) => setCarouselIdea(e.target.value)}
            placeholder="Main idea or theme"
            className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/80 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          />
          <div className="flex flex-wrap gap-3 items-center mb-3">
            <label className="text-xs text-gray-400 flex items-center gap-2">
              Slides (1–10)
              <input
                type="number"
                min={1}
                max={10}
                value={carouselSlideCount}
                onChange={(e) =>
                  setCarouselSlideCount(Number(e.target.value) || 1)
                }
                className="w-16 px-2 py-1 rounded border border-gray-700 bg-gray-900 text-gray-100 text-sm"
              />
            </label>
            <Button
              variant="secondary"
              onClick={() => void handleGenerateCarousel()}
              disabled={carouselBusy || !carouselIdea.trim()}
            >
              {carouselBusy ? "Generating…" : "Generate carousel"}
            </Button>
          </div>
          {carouselErr && (
            <p className="text-sm text-red-400 mb-2">{carouselErr}</p>
          )}
          {carouselSlides.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {carouselSlides.map((slide, idx) => (
                <div
                  key={`${slide.title}-${idx}`}
                  className="rounded-lg border border-gray-700 overflow-hidden bg-gray-900/40"
                >
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium text-white">
                      {slide.title}
                    </p>
                    <p className="text-xs text-gray-400">{slide.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

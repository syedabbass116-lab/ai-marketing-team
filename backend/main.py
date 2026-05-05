import os
print("RUNNING MAIN BACKEND FILE")
import json
import re
import importlib
from datetime import datetime
import requests
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import razorpay
import hmac
import hashlib
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Supabase initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase_db: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Subscription Plans
PLANS = {
    "Free": {"posts_limit": 10, "voices_limit": 1, "price_paise": 0},
    "Starter": {"posts_limit": 30, "voices_limit": 1, "price_paise": 1900},
    "Pro": {"posts_limit": 100, "voices_limit": 3, "price_paise": 4900},
    "Elite": {"posts_limit": 300, "voices_limit": 5, "price_paise": 9900},
}


from agents.repurpose_agent import repurpose
from agents.content_agent import (
    linkedin_post,
    twitter_thread,
    threads_post
)
from services.llm import generate_text, complete_chat
from services.pixazo import generate_image_url

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ghostwrites.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Razorpay initialization
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    print("WARNING: Razorpay LIVE keys are missing from environment variables!")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


@app.get("/test-cors")
def test_cors():
    return {"message": "CORS working"}


# Last generated post text (for "schedule this" commands). In-memory only.
last_generated_post: str | None = None
ALLOWED_PLATFORMS = frozenset(
    {"linkedin", "twitter", "threads"}
)

conversation_state = {
    "step": "start",  # start | idea | approval | awaiting_schedule | done
    "content": "",
    "idea": "",
    "chat_history": [],  # list[{"role":"user"|"assistant","content": str}]
    "platform": "linkedin",
    "drafts": {},  # platform -> last saved draft text
}


def _normalize_platform(raw: str | None) -> str | None:
    if not raw or not isinstance(raw, str):
        return None
    p = raw.strip().lower()
    return p if p in ALLOWED_PLATFORMS else None


def _platform_label(p: str) -> str:
    return {
        "linkedin": "LinkedIn",
        "twitter": "Twitter / X",
        "threads": "Threads",
    }.get(p, p)


def _build_chat_system(platform: str) -> str:
    label = _platform_label(platform)
    format_hint = {
        "linkedin": """STRICT FORMAT:
[Hook - 1 bold line that stops the scroll]
[Blank line]
[Problem - 2-3 lines about the pain your audience feels]
[Blank line]
[Story or insight - what changed / what you discovered]
[Blank line]
[Value - 3-5 short lines or a mini list]
- Point 1
- Point 2
- Point 3
[Blank line]
[Conclusion - 1 punchy line]
[Blank line]
[CTA - one clear ask]
[Blank line]
#Hashtag1 #Hashtag2 #Hashtag3""",
        "twitter": """STRICT FORMAT (Thread):
1/ [Big hook tweet — make them want to read more]
2/ [Problem]
3/ [Agitate the problem]
4/ [Your solution / story]
5/ [Proof or result]
6/ [Actionable tip]
7/ [CTA — link, follow, retweet]""",
        "threads": "Threads post: conversational, personal tone, strong hook, line breaks, question at end.",
    }.get(platform, "social post")

    return f"""You are a friendly, capable social media marketing assistant.

The user is focused on **{label}** ({platform}).

CRITICAL RULE 1: NEVER put the actual social media post text inside the "reply" field.
- "reply" is ONLY for conversational messages.
- The actual post content MUST go into "post_draft" or "post_drafts".

CRITICAL RULE 2: You MUST follow these formats for EVERY generation:

FOR LINKEDIN:
[Hook]
[Blank Line]
[Problem]
[Blank Line]
[Story/Insight]
[Blank Line]
[Value List]
[Blank Line]
[Conclusion]
[Blank Line]
[CTA]
[Blank Line]
#Hashtags

FOR TWITTER:
Use a numbered thread (1/ to 7/) following the Hook -> Problem -> Agitate -> Solution -> Proof -> Tip -> CTA structure.

SINGLE PLATFORM: put the full post in "post_draft" as plain text. Match: {format_hint}
MULTI-PLATFORM: If they ask for multiple platforms, use "post_drafts" (JSON object with platform keys).

Respond ONLY with valid JSON."""


def _trim_chat_history(history: list, max_messages: int = 24) -> list:
    if len(history) <= max_messages:
        return history
    return history[-max_messages:]


def _parse_assistant_json(raw: str) -> dict | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return None
        try:
            return json.loads(m.group(0))
        except Exception:
            return None


def _merged_drafts_for_client() -> dict:
    out = dict(conversation_state.get("drafts") or {})
    p = conversation_state.get("platform") or "linkedin"
    c = (conversation_state.get("content") or "").strip()
    if c:
        out[p] = conversation_state["content"]
    return out


def _apply_client_drafts(raw: dict[str, str] | None) -> None:
    """Merge latest post drafts from the client before platform switch or chat."""
    if not raw:
        return
    drafts = conversation_state.setdefault("drafts", {})
    for k, v in raw.items():
        pk = _normalize_platform(str(k))
        if pk and isinstance(v, str):
            drafts[pk] = v
    cur_p = conversation_state.get("platform") or "linkedin"
    conversation_state["content"] = (drafts.get(cur_p) or "").strip()


def _switch_platform(new_platform: str) -> None:
    drafts = conversation_state.setdefault("drafts", {})
    old = conversation_state.get("platform") or "linkedin"
    if old != new_platform and (conversation_state.get("content") or "").strip():
        drafts[old] = conversation_state["content"]
    conversation_state["platform"] = new_platform
    conversation_state["content"] = (drafts.get(new_platform) or "").strip()


def _marketing_chat_reply() -> tuple[str, str | None, dict[str, str] | None]:
    """Returns (reply, single_draft or None, multi_drafts or None)."""
    history = _trim_chat_history(conversation_state.get("chat_history") or [])
    platform = conversation_state.get("platform") or "linkedin"
    system = _build_chat_system(platform)
    if (
        conversation_state.get("step") == "approval"
        and (conversation_state.get("content") or "").strip()
    ):
        system = (
            system
            + "\n\nCurrent draft the user may want revised:\n"
            + conversation_state["content"].strip()
        )

    brand = conversation_state.get("brand_settings")
    if brand:
        system += (
            f"\n\n--- BRAND SETTINGS ---\n"
            f"Brand Name: {brand.get('brandName', '')}\n"
            f"Voice: {brand.get('brandVoice', '')}\n"
            f"Tone: {brand.get('tone', '')}\n"
            f"Target Audience: {brand.get('targetAudience', '')}\n"
            f"Writing Style/Examples: {brand.get('writingStyle', '')}\n"
            f"Key Topics: {brand.get('keyTopics', '')}\n"
            "Adopt this brand voice, tone, and style for all content generated.\n"
            "----------------------"
        )

    messages = [{"role": "system", "content": system}] + history
    raw = complete_chat(messages)
    if not raw:
        return ("Something went wrong. Try again.", None, None)
    if raw.startswith("API Error"):
        return (raw, None, None)
    data = _parse_assistant_json(raw)
    if not data:
        return (raw.strip(), None, None)
    reply = data.get("reply")
    if not isinstance(reply, str):
        reply = raw.strip()
    reply_out = reply.strip() if isinstance(reply, str) else str(reply)

    multi_raw = data.get("post_drafts")
    if isinstance(multi_raw, dict) and multi_raw:
        cleaned: dict[str, str] = {}
        for k, v in multi_raw.items():
            pk = _normalize_platform(str(k))
            if pk and isinstance(v, str) and v.strip():
                cleaned[pk] = v.strip()
        if cleaned:
            return (reply_out, None, cleaned)

    draft = data.get("post_draft")
    if not isinstance(draft, str) or not draft.strip():
        draft = data.get("linkedin_draft")

    # PERMANENT FIX: If no draft was found, but the reply looks like a formatted post
    # (starts with numbers like 1/ or has hook-like structure), move it to draft.
    if (not draft or not draft.strip()) and reply_out:
        # Check for Twitter thread style (1/) or LinkedIn structure (lots of newlines/hooks)
        if re.match(r"^1/", reply_out) or reply_out.count("\n\n") > 2:
            draft = reply_out
            reply_out = "I've drafted that for you! You can see it in the panel below."

    if isinstance(draft, str) and draft.strip():
        return (reply_out, draft.strip(), None)
    return (reply_out, None, None)


def send_to_zapier(data: dict) -> None:
    """POST scheduling payload to Zapier Catch hook."""
    webhook_url = os.getenv("ZAPIER_WEBHOOK_URL")
    if not webhook_url:
        raise HTTPException(
            status_code=500,
            detail="ZAPIER_WEBHOOK_URL is not configured",
        )
    response = requests.post(webhook_url, json=data, timeout=15)
    response.raise_for_status()


print("PORT ENV:", os.getenv("PORT"))


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/")
def health_trailing_slash():
    return {"status": "ok"}


# Order models

class OrderRequest(BaseModel):
    amount: int
    currency: str = "INR"
    user_id: str
    workspace_id: str

class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    workspace_id: str
    plan_name: str

class GenerateRequest(BaseModel):
    user_id: str
    workspace_id: str
    voice_id: str = None
    topic: str
    platform: str = "all"
    count: int = 1

class WorkspaceCreate(BaseModel):
    name: str
    owner_id: str

class UserInvite(BaseModel):
    workspace_id: str
    email: str
    role: str = "member"



class RepurposeRequest(BaseModel):
    content: str


class SchedulePostRequest(BaseModel):
    content: str
    instruction: str
    platform: str = "linkedin"


class ChatCommandRequest(BaseModel):
    message: str
    platform: str | None = "linkedin"
    client_drafts: dict[str, str] | None = None
    brand_settings: dict | None = None
    user_name: str | None = "there"
    voice_id: str | None = None
    workspace_id: str | None = None


class ChatRequest(BaseModel):
    message: str = ""
    platform: str | None = None
    client_drafts: dict[str, str] | None = None
    brand_settings: dict | None = None
    user_name: str | None = None


class ActionRequest(BaseModel):
    action: str  # approve | regenerate | edit
    content: str | None = None


class GenerateImageRequest(BaseModel):
    prompt: str
    # None → default aesthetic suffix; "" → use prompt only
    style_suffix: str | None = None


class CarouselRequest(BaseModel):
    idea: str
    slides: int = Field(default=5, ge=1, le=10)


GREET_MESSAGE = "Hii Abbas, What do you want to post today?"


def _reset_conversation_state() -> None:
    conversation_state["step"] = "start"
    conversation_state["content"] = ""
    conversation_state["idea"] = ""
    conversation_state["platform"] = "linkedin"
    conversation_state["drafts"].clear()
    # Clear in place so callers holding a reference to chat_history stay valid.
    conversation_state["chat_history"].clear()


def _with_session_meta(payload: dict) -> dict:
    return {
        **payload,
        "platform": conversation_state.get("platform", "linkedin"),
        "drafts": _merged_drafts_for_client(),
    }


def _store_active_draft(text: str) -> None:
    t = (text or "").strip()
    conversation_state["content"] = t
    if t:
        conversation_state.setdefault("drafts", {})[
            conversation_state.get("platform") or "linkedin"
        ] = t


def _store_multi_drafts(multi: dict[str, str]) -> None:
    """Merge several platform drafts from the model; refresh active content."""
    global last_generated_post
    drafts = conversation_state.setdefault("drafts", {})
    for k, v in multi.items():
        pk = _normalize_platform(str(k))
        if pk and isinstance(v, str) and v.strip():
            drafts[pk] = v.strip()
    cur = conversation_state.get("platform") or "linkedin"
    if (drafts.get(cur) or "").strip():
        conversation_state["content"] = drafts[cur].strip()
    else:
        for plat in (
            "linkedin",
            "twitter",
            "instagram",
            "facebook",
            "tiktok",
            "youtube",
        ):
            if (drafts.get(plat) or "").strip():
                conversation_state["content"] = drafts[plat].strip()
                break
    last_generated_post = (conversation_state.get("content") or "").strip()


def _generate_linkedin_post(idea: str) -> str:
    prompt = (
        f"Write a high-quality LinkedIn post about: {idea}\n"
        "Make it engaging, concise, and human."
    )
    return generate_text(prompt).strip()


def _generate_for_platform(idea: str, platform: str) -> str:
    p = _normalize_platform(platform) or "linkedin"
    if p == "linkedin":
        return linkedin_post(idea).strip()
    if p == "twitter":
        return twitter_thread(idea).strip()
    if p == "instagram":
        return instagram_caption(idea).strip()
    if p == "youtube":
        return youtube_script(idea).strip()
    if p == "facebook":
        return generate_text(
            f"Write an engaging Facebook post about: {idea}\n"
            "Warm, conversational tone. Output only the post text."
        ).strip()
    if p == "tiktok":
        return generate_text(
            f"Write a TikTok caption or short voiceover script about: {idea}\n"
            "Punchy lines, strong hook; optional hashtags at the end."
        ).strip()
    return linkedin_post(idea).strip()


def _has_time_hint(text: str) -> bool:
    lowered = text.lower()
    if re.search(r"\b\d{1,2}(:\d{2})?\s*([ap]m)\b", lowered):
        return True
    if re.search(r"\b\d{1,2}:\d{2}\b", lowered):
        return True
    return any(token in lowered for token in ("noon", "midnight", "morning", "evening"))


def _extract_schedule_datetime(instruction: str) -> tuple[str | None, str | None]:
    dateparser_search = importlib.import_module("dateparser.search")
    search_dates = dateparser_search.search_dates
    settings = {
        "PREFER_DATES_FROM": "future",
        "RETURN_AS_TIMEZONE_AWARE": False,
    }
    hits = search_dates(instruction, settings=settings, languages=["en"])
    if not hits:
        return None, None

    picked_dt = hits[0][1]
    date_str = picked_dt.strftime("%Y-%m-%d")

    if not _has_time_hint(instruction):
        return date_str, None

    return date_str, picked_dt.strftime("%H:%M")


def _normalize_time(raw_time: str | None) -> str:
    if not raw_time:
        return "10:00"

    cleaned = raw_time.strip().lower()

    # Supports: "10:00", "9:30", "10 AM", "6pm", "09:15 pm"
    time_match = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$", cleaned)
    if not time_match:
        return "10:00"

    hours = int(time_match.group(1))
    minutes = int(time_match.group(2) or "0")
    meridiem = time_match.group(3)

    if meridiem == "pm" and hours != 12:
        hours += 12
    if meridiem == "am" and hours == 12:
        hours = 0

    if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
        return "10:00"

    return f"{hours:02d}:{minutes:02d}"


def _extract_schedule_data(instruction: str) -> dict:
    prompt = f"""You must respond with ONLY a single JSON object. No markdown, no explanation.

Today's date (UTC) is: {today_utc}

Platform: {platform}

User message: {json.dumps(msg)}

Generate content for the requested platform using the exact format rules below.

If the content contains line breaks, encode them as \n inside the JSON string value. Do not include raw unescaped newlines inside JSON strings.

LinkedIn format:
- First line is a strong hook line that stops the scroll.

- Blank line.

- Problem section with 2-3 lines about the audience pain.

- Blank line.

- Story or insight section describing what changed or what you discovered.

- Blank line.

- Value section with 3-5 short lines or a mini list:
  - Point 1
  - Point 2
  - Point 3

- Blank line.

- Conclusion line that is punchy.

- Blank line.

- CTA line with one clear ask.

- Blank line.

- Hashtags line with 3 hashtags.

Twitter format:
1/ [Big hook tweet � make them want to read more]

2/ [Problem]

3/ [Agitate the problem]

4/ [Your solution / story]

5/ [Proof or result]

6/ [Actionable tip]

7/ [CTA � link, follow, retweet]

For Instagram, Facebook, TikTok, or YouTube output a platform-appropriate post with a strong hook, problem, story, value, CTA, and hashtags.

Return exactly one of:

1) New post content:
{{"action":"generate_post","content":"<full generated post text>"}}

2) Schedule a post:
{{"action":"schedule_post","content":"<post text>","date":"YYYY-MM-DD","time":"HH:MM","platform":"{platform}"}}

If the user says "schedule this" / "schedule it", set "content" to empty string ""; the server will use the last generated post.

Resolve relative dates (tomorrow, next Monday, April 15, etc.) to YYYY-MM-DD using today {today_utc}.

If the user clearly wants to schedule but date or time cannot be determined, return:
{{"action":"clarify","message":"<one short question>"}}

JSON only.""".strip()

    raw = generate_text(prompt)

    # LLM may return extra text; parse the first JSON object.
    try:
        return json.loads(raw)
    except Exception:
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not json_match:
            raise ValueError("Could not parse schedule JSON from AI output")
        return json.loads(json_match.group(0))


def _sanitize_json_string(raw: str) -> str:
    out: list[str] = []
    in_string = False
    escape = False

    for ch in raw:
        if ch == '"' and not escape:
            in_string = not in_string
            out.append(ch)
            continue

        if in_string and ch in "\n\r\t":
            if ch == "\n":
                out.append("\\n")
            elif ch == "\r":
                out.append("\\r")
            else:
                out.append("\\t")
            escape = False
            continue

        out.append(ch)
        escape = (ch == "\\" and not escape)

    return "".join(out)


def _escape_invalid_json_escapes(raw: str) -> str:
    out: list[str] = []
    in_string = False
    escape = False
    i = 0

    while i < len(raw):
        ch = raw[i]
        if ch == '"' and not escape:
            in_string = not in_string
            out.append(ch)
            i += 1
            continue

        if in_string and ch == '\\' and not escape:
            nxt = raw[i + 1] if i + 1 < len(raw) else ''
            if nxt not in '"\\/bfnrtu':
                out.append('\\\\')
                i += 1
                continue
            out.append(ch)
            escape = True
            i += 1
            continue

        out.append(ch)
        escape = (ch == '\\' and not escape)
        i += 1

    return "".join(out)


def _parse_llm_json(raw: str) -> dict:
    try:
        return json.loads(raw)
    except Exception:
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not json_match:
            raise ValueError("Could not parse JSON from AI output")
        json_text = json_match.group(0)
        try:
            return json.loads(json_text)
        except Exception:
            sanitized = _sanitize_json_string(json_text)
            try:
                return json.loads(sanitized)
            except Exception:
                sanitized = _escape_invalid_json_escapes(sanitized)
                return json.loads(sanitized)


def _carousel_slide_texts(idea: str, n: int) -> list[dict[str, str]]:
    return [
        {
            "title": f"{idea} — point {i}",
            "content": f"Insight {i} about {idea}.",
        }
        for i in range(1, n + 1)
    ]


@app.post("/action")
def post_action(payload: ActionRequest):
    """Approve, regenerate, or edit draft — separate from chat conversation."""
    global last_generated_post

    act = (payload.action or "").strip().lower()
    if act not in {"approve", "regenerate", "edit"}:
        raise HTTPException(
            status_code=400, detail="action must be approve, regenerate, or edit")

    step = conversation_state["step"]

    if act == "approve":
        if step != "approval":
            raise HTTPException(
                status_code=400,
                detail="Approve your draft in the panel first (no draft to approve).",
            )
        if not conversation_state.get("content", "").strip():
            raise HTTPException(
                status_code=400, detail="No post content to approve.")
        conversation_state["step"] = "awaiting_schedule"
        return _with_session_meta(
            {
                "step": "awaiting_schedule",
                "action": "approve",
                "content": conversation_state["content"],
                "message": "When should I schedule this? (date & time)",
            },
        )

    if act == "regenerate":
        if step != "approval":
            raise HTTPException(
                status_code=400,
                detail="Regenerate is only available while you have a draft.",
            )
        source_idea = conversation_state.get("idea", "").strip()
        if not source_idea:
            raise HTTPException(
                status_code=400, detail="No idea stored — start over and share your topic again.")
        plat = conversation_state.get("platform") or "linkedin"
        regenerated = _generate_for_platform(source_idea, plat)
        if not regenerated:
            raise HTTPException(
                status_code=500, detail="Failed to regenerate post")
        _store_active_draft(regenerated)
        last_generated_post = regenerated
        return _with_session_meta(
            {
                "step": "approval",
                "action": "regenerate",
                "content": regenerated,
            }
        )

    # edit
    if step != "approval":
        raise HTTPException(
            status_code=400,
            detail="Edits only apply while reviewing a draft.",
        )
    text = (payload.content or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    _store_active_draft(text)
    last_generated_post = text
    return _with_session_meta(
        {
            "step": "approval",
            "action": "edit",
            "content": text,
        }
    )


@app.post("/chat")
def chat(payload: ChatRequest):
    """Real-time style chat via Groq; drafts and scheduling stay integrated."""
    global last_generated_post

    message = (payload.message or "").strip()
    lowered = message.lower()
    current_step = conversation_state["step"]
    hist: list = conversation_state.setdefault("chat_history", [])
    plat_in = _normalize_platform(
        payload.platform) if payload.platform else None

    if payload.brand_settings:
        conversation_state["brand_settings"] = payload.brand_settings

    if lowered not in {"start over", "reset", "restart"} and current_step != "start":
        _apply_client_drafts(payload.client_drafts)

    if lowered in {"start over", "reset", "restart"}:
        user_name = payload.user_name or "there"
        dynamic_greet = f"Hii {user_name}, What do you want to post today?"
        _reset_conversation_state()
        conversation_state["step"] = "idea"
        hist.append({"role": "assistant", "content": dynamic_greet})
        if plat_in:
            _switch_platform(plat_in)
        return _with_session_meta(
            {
                "step": "idea",
                "action": "greet",
                "message": dynamic_greet,
                "content": "",
            }
        )

    if current_step == "start":
        user_name = payload.user_name or "there"
        dynamic_greet = f"Hii {user_name}, What do you want to post today?"
        conversation_state["step"] = "idea"
        hist.clear()
        hist.append({"role": "assistant", "content": dynamic_greet})
        if plat_in:
            _switch_platform(plat_in)
        return _with_session_meta(
            {
                "step": "idea",
                "action": "greet",
                "message": dynamic_greet,
                "content": "",
            }
        )

    if plat_in and plat_in != (conversation_state.get("platform") or "linkedin"):
        _switch_platform(plat_in)

    if not message:
        if not hist:
            hist.append({"role": "assistant", "content": GREET_MESSAGE})
        return _with_session_meta(
            {
                "step": conversation_state["step"],
                "action": "greet",
                "message": hist[-1]["content"] if hist else GREET_MESSAGE,
                "content": conversation_state.get("content", ""),
            }
        )

    if current_step == "awaiting_schedule":
        date_str, time_str = _extract_schedule_datetime(message)
        if not date_str or not time_str:
            clarify = (
                "Please include both a date and a time (for example: April 15 at 10:00 AM)."
            )
            hist.append({"role": "user", "content": message})
            hist.append({"role": "assistant", "content": clarify})
            return _with_session_meta(
                {
                    "step": "awaiting_schedule",
                    "action": "clarify",
                    "content": conversation_state.get("content", ""),
                    "message": clarify,
                }
            )

        norm_time = _normalize_time(time_str)
        sched_platform = conversation_state.get("platform") or "linkedin"
        zap_payload = {
            "content": conversation_state.get("content", "").strip(),
            "date": date_str,
            "time": norm_time,
            "platform": sched_platform,
        }
        if not zap_payload["content"]:
            err = "No post content found. Say 'start over' and we'll create a new draft."
            hist.append({"role": "user", "content": message})
            hist.append({"role": "assistant", "content": err})
            return _with_session_meta(
                {
                    "step": "idea",
                    "action": "error",
                    "message": err,
                    "content": "",
                }
            )
        try:
            send_to_zapier(zap_payload)
        except HTTPException:
            raise
        except requests.RequestException as exc:
            raise HTTPException(
                status_code=502, detail=f"Webhook error: {str(exc)}")

        confirm = f"✅ Post scheduled for {date_str} at {norm_time}"
        hist.append({"role": "user", "content": message})
        hist.append({"role": "assistant", "content": confirm})
        conversation_state["step"] = "done"
        return _with_session_meta(
            {
                "step": "done",
                "action": "schedule_post",
                "content": zap_payload["content"],
                "date": date_str,
                "time": norm_time,
                "platform": sched_platform,
                "message": confirm,
            }
        )

    if current_step == "done":
        hist.append({"role": "user", "content": message})
        reply, draft, multi = _marketing_chat_reply()
        if multi:
            conversation_state["idea"] = message
            _store_multi_drafts(multi)
            conversation_state["step"] = "approval"
            hist.append({"role": "assistant", "content": reply})
            return _with_session_meta(
                {
                    "step": "approval",
                    "action": "generate_post",
                    "content": conversation_state.get("content", ""),
                    "message": reply,
                    "multi_platform": True,
                }
            )
        if draft:
            conversation_state["idea"] = message
            _store_active_draft(draft)
            conversation_state["step"] = "approval"
            last_generated_post = draft
            hist.append({"role": "assistant", "content": reply})
            return _with_session_meta(
                {
                    "step": "approval",
                    "action": "generate_post",
                    "content": draft,
                    "message": reply,
                }
            )
        hist.append({"role": "assistant", "content": reply})
        return _with_session_meta(
            {
                "step": "done",
                "action": "chat",
                "content": conversation_state.get("content", ""),
                "message": reply,
            }
        )

    # idea | approval — free-form Groq chat + optional draft(s)
    prior_step = conversation_state["step"]
    hist.append({"role": "user", "content": message})
    reply, draft, multi = _marketing_chat_reply()
    if multi:
        if prior_step == "idea":
            conversation_state["idea"] = message
        _store_multi_drafts(multi)
        conversation_state["step"] = "approval"
        hist.append({"role": "assistant", "content": reply})
        return _with_session_meta(
            {
                "step": "approval",
                "action": "generate_post",
                "content": conversation_state.get("content", ""),
                "message": reply,
                "multi_platform": True,
            }
        )
    if draft:
        if prior_step == "idea":
            conversation_state["idea"] = message
        _store_active_draft(draft)
        conversation_state["step"] = "approval"
        last_generated_post = draft
        hist.append({"role": "assistant", "content": reply})
        return _with_session_meta(
            {
                "step": "approval",
                "action": "generate_post",
                "content": draft,
                "message": reply,
            }
        )

    hist.append({"role": "assistant", "content": reply})
    return _with_session_meta(
        {
            "step": conversation_state["step"],
            "action": "chat",
            "message": reply,
            "content": conversation_state.get("content", ""),
        }
    )


@app.post("/chat-command")
def chat_command(payload: ChatCommandRequest):
    """Natural language: generate content or schedule via structured AI JSON + Zapier."""
    global last_generated_post

    msg = payload.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="message is required")

    if re.search(r"schedule\s+this", msg.lower()) and not last_generated_post:
        raise HTTPException(
            status_code=400,
            detail="No generated post yet. Generate content first, then say 'schedule this'.",
        )

    today_utc = datetime.utcnow().strftime("%Y-%m-%d")
    platform = (payload.platform or "linkedin").lower().strip()
    if platform not in {"linkedin", "twitter", "threads"}:
        platform = "linkedin"

    if payload.brand_settings:
        conversation_state["brand_settings"] = payload.brand_settings

    # Logic: If voice_id is provided, fetch full details from DB
    brand_settings = payload.brand_settings or {}
    
    if payload.voice_id:
        try:
            print(f"Backend: Fetching voice details for ID {payload.voice_id}")
            voice_res = supabase_db.table("brand_settings").select("*").eq("id", payload.voice_id).single().execute()
            if voice_res.data:
                db_voice = voice_res.data
                brand_settings = {
                    "brandName": db_voice.get("brand_name"),
                    "brandDescription": db_voice.get("brand_description"),
                    "brandVoice": db_voice.get("brand_voice"),
                    "tone": db_voice.get("tone"),
                    "targetAudience": db_voice.get("target_audience"),
                    "writingStyleLinkedin": db_voice.get("writing_style_linkedin"),
                    "writingStyleTwitter": db_voice.get("writing_style_twitter"),
                    "writingStyleThreads": db_voice.get("writing_style_threads"),
                    "keyTopics": db_voice.get("key_topics")
                }
        except Exception as e:
            print(f"Backend: Error fetching voice ID {payload.voice_id}: {e}")

    if not brand_settings and conversation_state.get("brand_settings"):
         brand_settings = conversation_state.get("brand_settings")

    brand_prompt = ""

    if isinstance(brand_settings, dict) and brand_settings:
        lines = ["--- BRAND SETTINGS ---"]
        if brand_settings.get("brandName"):
            lines.append(f"Brand Name: {brand_settings['brandName']}")
        if brand_settings.get("brandDescription"):
            lines.append(
                f"Brand Description: {brand_settings['brandDescription']}")
        if brand_settings.get("brandVoice"):
            lines.append(f"Voice: {brand_settings['brandVoice']}")
        if brand_settings.get("tone"):
            lines.append(f"Tone: {brand_settings['tone']}")
        if brand_settings.get("targetAudience"):
            lines.append(
                f"Target Audience: {brand_settings['targetAudience']}")
        if brand_settings.get("writingStyleLinkedin"):
            lines.append("LinkedIn Writing Style / Examples:")
            lines.append(brand_settings["writingStyleLinkedin"])
        if brand_settings.get("writingStyleTwitter"):
            lines.append("Twitter Writing Style / Examples:")
            lines.append(brand_settings["writingStyleTwitter"])
        if brand_settings.get("writingStyle") and not brand_settings.get("writingStyleLinkedin") and not brand_settings.get("writingStyleTwitter"):
            lines.append("Writing Style / Examples:")
            lines.append(brand_settings["writingStyle"])
        if brand_settings.get("keyTopics"):
            lines.append(f"Key Topics: {brand_settings['keyTopics']}")
        lines.append(
            "Use these brand settings to write every post in the user's exact brand voice, tone, and style.")
        lines.append(
            "If examples are provided, mimic the style, phrasing, and structure.")
        brand_prompt = "\n".join(lines) + "\n\n"

    requested_posts = 1
    post_count_match = re.search(
        r"\b([1-9][0-9]*)\s*(?:posts?|post|pieces?|ideas?)\b", msg.lower())
    if post_count_match:
        requested_posts = min(10, int(post_count_match.group(1)))

    prompt = f"""system_prompt = \"\"\"
You are a LinkedIn content writer.
IMPORTANT:
- Respond ONLY with valid JSON
- No markdown, no backticks, no code blocks
- No backslashes in your response
- No newlines inside JSON string values, use \\n instead
\"\"\"

You must respond with ONLY a single JSON object. No markdown, no explanation.

Today's date (UTC) is: {today_utc}

Platform: {platform}

User message: {json.dumps(msg)}

{brand_prompt}Generate content for the requested platform using the exact format rules below.

If the user requests {requested_posts} post{'s' if requested_posts != 1 else ''}, return exactly {requested_posts} post{'s' if requested_posts != 1 else ''} in the content string.
Separate multiple posts with two blank lines, and encode all line breaks as \\n.

If the content contains line breaks, encode them as \\n inside the JSON string value. Do not include raw unescaped newlines inside JSON strings.

LinkedIn format:
- First line is a strong hook line that stops the scroll.

- Blank line.

- Problem section with 2-3 lines about the audience pain.

- Blank line.

- Story or insight section describing what changed or what you discovered.

- Blank line.

- Value section with 3-5 short lines or a mini list:
  - Point 1
  - Point 2
  - Point 3

- Blank line.

- Conclusion line that is punchy.

- Blank line.

- CTA line with one clear ask.

- Blank line.

- Hashtags line with 3 hashtags.

Twitter format:
1 / [Big hook tweet — make them want to read more]

2 / [Problem]

3 / [Agitate the problem]

4 / [Your solution / story]

5 / [Proof or result]

6 / [Actionable tip]

7 / [CTA — link, follow, retweet]

Threads format:
- Conversational, slightly more personal than LinkedIn.
- Strong opening hook.
- Use line breaks for readability.
- Ends with a question or CTA to spark conversation.
- No more than 2-3 hashtags.

Return exactly one of:

1) New post content:
{{"action": "generate_post", "content": "<full generated post text>"}}

2) Schedule a post:
{{"action": "schedule_post", "content": "<post text>",
    "date": "YYYY-MM-DD", "time": "HH:MM", "platform": "{platform}"}}

If the user says "schedule this" / "schedule it", set "content" to empty string ""; the server will use the last generated post.

Resolve relative dates (tomorrow, next Monday, April 15, etc.) to YYYY-MM-DD using today {today_utc}.

If the user clearly wants to schedule but date or time cannot be determined, return:
{{"action": "clarify", "message": "<one short question>"}}

JSON only.""".strip()

    raw = generate_text(prompt)
    try:
        data = _parse_llm_json(raw)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not parse AI response as JSON: {str(exc)}",
        )

    action = data.get("action")
    if action == "clarify":
        return {
            "action": "clarify",
            "message": data.get("message", "Please clarify date and time."),
        }

    if action == "generate_post":
        content = data.get("content")
        if not isinstance(content, str) or not content.strip():
            raise HTTPException(
                status_code=500, detail="Generated content was empty")
        last_generated_post = content.strip()
        return {"action": "generate_post", "content": last_generated_post}

    if action == "schedule_post":
        content = data.get("content")
        if isinstance(content, str) and not content.strip():
            if re.search(r"schedule\s+this|schedule\s+it", msg.lower()):
                content = last_generated_post
        if not content or not str(content).strip():
            raise HTTPException(
                status_code=400,
                detail="No post content to schedule.",
            )
        content = str(content).strip()

        date_str = data.get("date")
        time_str = data.get("time")
        platform = (data.get("platform") or "linkedin")
        if isinstance(platform, str):
            platform = platform.lower().strip()
        else:
            platform = "linkedin"

        if not date_str or not time_str:
            return {
                "action": "clarify",
                "message": "Please specify both a date and a time for scheduling.",
            }

        if not isinstance(date_str, str) or not isinstance(time_str, str):
            return {
                "action": "clarify",
                "message": "Please specify date and time clearly (e.g. April 15 at 10:00 AM).",
            }

        try:
            datetime.strptime(date_str.strip(), "%Y-%m-%d")
        except Exception:
            return {
                "action": "clarify",
                "message": "Please specify the date clearly (e.g. 2026-04-15).",
            }

        norm_time = _normalize_time(time_str.strip())

        zap_payload = {
            "content": content,
            "date": date_str.strip(),
            "time": norm_time,
            "platform": platform,
        }
        try:
            send_to_zapier(zap_payload)
        except HTTPException:
            raise
        except requests.RequestException as exc:
            raise HTTPException(
                status_code=502, detail=f"Webhook error: {str(exc)}")

        return {
            "action": "schedule_post",
            "confirmation": f"Post scheduled for {date_str} at {norm_time}",
            "content": content,
            "date": date_str.strip(),
            "time": norm_time,
            "platform": platform,
        }

    raise HTTPException(
        status_code=400, detail=f"Unknown or missing action: {action!r}")


@app.post("/repurpose")
def repurpose_content(payload: RepurposeRequest):
    try:
        result = repurpose(payload.content)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}


database = []


@app.post("/save")
def save_content(content: str):
    database.append(content)
    return {"message": "Saved"}


@app.get("/content")
def get_content():
    return {"data": database}


@app.post("/schedule-post")
def schedule_post(payload: SchedulePostRequest):
    try:
        webhook_url = os.getenv("ZAPIER_WEBHOOK_URL")
        if not webhook_url:
            raise HTTPException(
                status_code=500,
                detail="ZAPIER_WEBHOOK_URL is not configured",
            )

        parsed = _extract_schedule_data(payload.instruction)
        dates = parsed.get("dates") if isinstance(parsed, dict) else None
        parsed_time = parsed.get("time") if isinstance(parsed, dict) else None

        if not isinstance(dates, list) or len(dates) == 0:
            raise HTTPException(
                status_code=400,
                detail="Could not extract any schedule dates from instruction",
            )

        normalized_time = _normalize_time(parsed_time)
        scheduled_items = []

        for date_value in dates:
            if not isinstance(date_value, str):
                continue
            try:
                # Validate date format from AI.
                datetime.strptime(date_value, "%Y-%m-%d")
            except Exception:
                continue

            iso_time = f"{date_value}T{normalized_time}:00Z"
            zap_payload = {
                "content": payload.content,
                "platform": payload.platform,
                "scheduled_time": iso_time,
            }
            response = requests.post(webhook_url, json=zap_payload, timeout=15)
            response.raise_for_status()
            scheduled_items.append(iso_time)

        if not scheduled_items:
            raise HTTPException(
                status_code=400,
                detail="No valid dates found after parsing instruction",
            )

        return {
            "message": "Post scheduled successfully",
            "scheduled_times": scheduled_items,
            "parsed": {"dates": dates, "time": normalized_time},
        }
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502, detail=f"Webhook error: {str(exc)}")
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Scheduling failed: {str(exc)}")


@app.post("/generate-image")
def generate_image(req: GenerateImageRequest):
    prompt = (req.prompt or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="prompt is required")
    if req.style_suffix is None:
        suffix = ", minimal illustration, modern, aesthetic"
    else:
        suffix = req.style_suffix
    full_prompt = prompt + suffix
    try:
        image_url = generate_image_url(full_prompt)
        return {"image_url": image_url, "prompt_used": full_prompt}
    except HTTPException:
        raise
    except ValueError as exc:
        if "PIXAZO_API_KEY" in str(exc):
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        raise HTTPException(
            status_code=502,
            detail=f"Image generation failed: {exc}",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Image generation failed: {exc}",
        ) from exc


@app.post("/generate-carousel")
def generate_carousel(req: CarouselRequest):
    idea = (req.idea or "").strip()
    if not idea:
        raise HTTPException(status_code=400, detail="idea is required")
    slides_meta = _carousel_slide_texts(idea, req.slides)
    carousel: list[dict[str, str]] = []
    try:
        for slide in slides_meta:
            image_prompt = (
                f"{slide['title']}, minimal illustration, modern, aesthetic"
            )
            image_url = generate_image_url(image_prompt)
            carousel.append(
                {
                    "title": slide["title"],
                    "content": slide["content"],
                    "image_url": image_url,
                }
            )
        return {"carousel": carousel}
    except HTTPException:
        raise
    except ValueError as exc:
        if "PIXAZO_API_KEY" in str(exc):
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        raise HTTPException(
            status_code=502,
            detail=f"Carousel generation failed: {exc}",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Carousel generation failed: {exc}",
        ) from exc


@app.post("/generate")
def generate(req: GenerateRequest):
    global last_generated_post
    if not supabase_db:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        # 1. Fetch Workspace and Verify Usage
        ws_res = supabase_db.table("workspaces").select("*").eq("id", req.workspace_id).single().execute()
        if not ws_res.data:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        usage_res = supabase_db.table("user_usage").select("*").eq("workspace_id", req.workspace_id).single().execute()
        usage = usage_res.data or {}
        posts_generated = usage.get("posts_generated", 0)
        posts_limit = usage.get("posts_limit", 10)

        if posts_generated >= posts_limit:
            raise HTTPException(status_code=403, detail="Workspace usage limit reached.")

        # 2. Fetch Selected Brand Voice
        voice_id = req.voice_id
        if voice_id:
            voice_res = supabase_db.table("brand_settings").select("*").eq("id", voice_id).single().execute()
        else:
            voice_res = supabase_db.table("brand_settings").select("*").eq("workspace_id", req.workspace_id).eq("is_active", True).execute()
            if not voice_res.data:
                voice_res = supabase_db.table("brand_settings").select("*").eq("workspace_id", req.workspace_id).limit(1).execute()
        
        brand_voice = voice_res.data if isinstance(voice_res.data, dict) else (voice_res.data[0] if voice_res.data else {})
        
        brand_name = brand_voice.get("brand_name", "Default")
        tone = brand_voice.get("tone", "Professional")
        audience = brand_voice.get("target_audience", "General")
        style = brand_voice.get("brand_voice", "Clear and concise")

        # 3. World-Class Ghostwriter Prompt
        base_prompt = f"""You are a world-class ghostwriter for SaaS users.
Write content in EXACT brand voice below:

Brand Name: {brand_name}
Tone: {tone}
Target Audience: {audience}
Writing Style: {style}

STRICT RULES:
- Do NOT break character
- Keep tone consistent
- Make content feel human, not AI
- Follow platform format strictly

PLATFORMS:
LinkedIn: Hook → Problem → Insight → Value → CTA
Twitter: 1/ Hook, 2/ Problem, 3/ Agitate, 4/ Solution, 5/ Proof, 6/ Tip, 7/ CTA
Threads: Conversational, engaging, short lines, end with question
"""

        # 4. Generate Content
        count = max(1, min(req.count, 10))
        prompt_suffix = f"\nUSER REQUEST: Write content about: {req.topic}\nPlatform: {req.platform}\nOUTPUT: Return ONLY the post text."
        
        if req.platform == "all":
            result = {
                "linkedin": generate_text(base_prompt + "\nFormat: LinkedIn post" + prompt_suffix),
                "twitter": generate_text(base_prompt + "\nFormat: Twitter thread" + prompt_suffix),
                "threads": generate_text(base_prompt + "\nFormat: Threads post" + prompt_suffix),
            }
        else:
            result = {req.platform: generate_text(base_prompt + f"\nFormat: {req.platform} content" + prompt_suffix)}

        # 5. Increment Workspace Usage
        supabase_db.table("user_usage").update({
            "posts_generated": posts_generated + 1
        }).eq("workspace_id", req.workspace_id).execute()

        for key in ("linkedin", "twitter", "threads"):
            val = result.get(key)
            if isinstance(val, str) and val.strip():
                last_generated_post = val.strip()
                break

        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    except HTTPException:
        raise
    except Exception as e:
        return {
            "error": str(e)
        }

@app.post("/api/create-order")
def create_order(data: OrderRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay client not configured")
    
    if data.amount < 100:
        raise HTTPException(status_code=400, detail="Amount must be at least 100 paise")
    
    try:
        order = client.order.create({
            "amount": data.amount,
            "currency": data.currency,
            "receipt": f"receipt_{os.urandom(4).hex()}",
            "payment_capture": 1
        })

        print(f"Razorpay Order Created: {order}")
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        print(f"Razorpay Order Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify-payment")
def verify_payment(data: VerifyRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay secret not configured")
        
    if not all([data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    
# Workspace Management
@app.post("/workspaces/create")
def create_workspace(req: WorkspaceCreate):
    try:
        # Create workspace
        ws_res = supabase_db.table("workspaces").insert({
            "name": req.name,
            "owner_id": req.owner_id
        }).execute()
        workspace = ws_res.data[0]
        
        # Add owner as member
        supabase_db.table("workspace_members").insert({
            "workspace_id": workspace["id"],
            "user_id": req.owner_id,
            "role": "owner"
        }).execute()
        
        # Initialize usage
        supabase_db.table("user_usage").insert({
            "workspace_id": workspace["id"],
            "clerk_user_id": req.owner_id, # Link for legacy support
            "plan_name": "Free",
            "posts_limit": 10
        }).execute()
        
        return workspace
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workspaces/list/{user_id}")
def list_workspaces(user_id: str):
    try:
        members_res = supabase_db.table("workspace_members").select("workspace_id, role").eq("user_id", user_id).execute()
        ws_ids = [m["workspace_id"] for m in members_res.data]
        
        if not ws_ids:
            return []
            
        workspaces_res = supabase_db.table("workspaces").select("*").in_("id", ws_ids).execute()
        return workspaces_res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workspaces/invite")
def invite_user(req: UserInvite):
    try:
        # Check if user already in workspace
        # In a real app, you'd send an email invite. Here we add directly for simplicity.
        res = supabase_db.table("workspace_members").insert({
            "workspace_id": req.workspace_id,
            "user_id": req.email, # Using email as placeholder for ID until they join
            "role": req.role
        }).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




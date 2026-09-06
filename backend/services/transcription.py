import os
import io
import logging
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TRANSCRIPTION_PROVIDER = os.getenv("TRANSCRIPTION_PROVIDER", "groq") # 'groq' | 'openai' | 'fallback'


DEFAULT_WHISPER_PROMPT = (
    "Voice memo by a founder discussing technology, AI, startups, business strategies, "
    "marketing, software engineering, product architecture, lessons learned, and industry insights. "
    "Punctuate accurately with proper capitalization and correct technical terms."
)


def clean_and_correct_transcript(
    raw_text: str,
    context_hint: Optional[str] = None
) -> str:
    """
    Phonetic & Clarity Reconstruction Step:
    Restores unclear pronunciations, mumbling, slurred syllables, stuttering, and garbled
    technical terms into crystal clear, coherent English while strictly preserving 100%
    of the speaker's true meaning, facts, and intent.
    """
    if not raw_text or len(raw_text.strip()) < 5:
        return raw_text

    system_prompt = (
        "You are an expert audio transcription restoration and phonetic clarity engine.\n"
        "The user was speaking into a voice recorder, possibly with unclear pronunciation, "
        "mumbling, fast speech, background noise, or a strong accent.\n\n"
        "YOUR TASK:\n"
        "Take the raw, potentially garbled transcript and output the clean, clarified version.\n\n"
        "STRICT RESTORATION RULES:\n"
        "1. Phonetic Correction: Fix mumbled words, phonetic mishearings, or slurred technical terms "
        "(e.g., 'clawed' -> 'Claude', 'eye in uk' -> 'AI in UK', 'lang chain' -> 'LangChain', "
        "'in fastructure' -> 'infrastructure', 'chat gpt' -> 'ChatGPT', 'you tube' -> 'YouTube').\n"
        "2. Disfluency Cleaning: Remove stutters, false starts, and excessive filler sounds ('um', 'uh', 'like', 'you know') "
        "that obscure the core message.\n"
        "3. Clear Structure: Fix run-on sentences with proper punctuation, periods, commas, and paragraph breaks.\n"
        "4. ZERO INVENTIONS: Do NOT add new facts, claims, statistics, or opinions not spoken by the user. "
        "Preserve the founder's authentic voice, points, and intent exactly.\n"
        "5. Output ONLY the cleaned transcript text. No preamble, no quotes, no explanations."
    )

    try:
        from services.llm import complete_chat
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    f"Raw Audio Transcript:\n{raw_text}\n\n"
                    f"{f'Context Hint: {context_hint}' if context_hint else ''}"
                )
            }
        ]
        cleaned = complete_chat(messages, temperature=0.1)
        cleaned_str = cleaned.strip().strip('"').strip("'")
        if cleaned_str and len(cleaned_str) > 5 and not cleaned_str.startswith("API Error:"):
            logger.info(
                f"[Transcript Clarity Engine] Successfully polished unclear speech "
                f"({len(raw_text)} chars -> {len(cleaned_str)} chars)"
            )
            return cleaned_str
    except Exception as e:
        logger.warning(f"[Transcript Clarity Engine] Clarity cleanup failed: {e}. Using raw text.")

    return raw_text


def _normalize_media_file(filename: str, mime_type: str) -> tuple[str, str]:
    """
    Ensure correct filename extension and MIME type for audio and video media files.
    Groq and OpenAI Whisper accept: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    mime_map = {
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".mp3": "audio/mpeg",
        ".mpeg": "video/mpeg",
        ".mpga": "audio/mpeg",
        ".m4a": "audio/m4a",
        ".wav": "audio/wav",
        ".webm": "audio/webm",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".aac": "audio/aac",
        ".mkv": "video/x-matroska"
    }

    normalized_mime = mime_map.get(ext, mime_type or "audio/webm")
    # If the filename has no extension or generic extension, default to .webm or .mp4
    if not ext:
        if "video" in normalized_mime or "mp4" in normalized_mime:
            filename = f"{filename}.mp4"
        else:
            filename = f"{filename}.webm"

    return filename, normalized_mime


def transcribe_audio(
    file_bytes: bytes,
    filename: str = "audio.webm",
    mime_type: str = "audio/webm",
    provider: Optional[str] = None,
    language: Optional[str] = None,
    prompt: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provider-agnostic speech-to-text service abstraction with clarity prompting.
    Accepts both audio (mp3, wav, m4a, webm, ogg, flac) and video (mp4, mov, mpeg).
    Returns:
        {
            "text": str,
            "duration": float,
            "segments": list,
            "provider": str
        }
    """
    clean_filename, clean_mime = _normalize_media_file(filename, mime_type)
    prov = (provider or TRANSCRIPTION_PROVIDER).lower()
    prompt_to_use = prompt or DEFAULT_WHISPER_PROMPT

    if prov == "groq" and GROQ_API_KEY:
        try:
            return _transcribe_groq(file_bytes, clean_filename, clean_mime, language, prompt=prompt_to_use)
        except Exception as e:
            logger.error(f"Groq Whisper transcription failed: {e}. Trying fallback.")

    if prov == "openai" and OPENAI_API_KEY:
        try:
            return _transcribe_openai(file_bytes, clean_filename, clean_mime, language, prompt=prompt_to_use)
        except Exception as e:
            logger.error(f"OpenAI Whisper transcription failed: {e}. Trying fallback.")

    # Fallback / mock transcription if no keys or API error
    return _transcribe_fallback(clean_filename)


def _transcribe_groq(
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    language: Optional[str] = None,
    prompt: Optional[str] = None
) -> Dict[str, Any]:
    """Transcribe audio/video using Groq Whisper Turbo with context prompting."""
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    files = {
        "file": (filename, file_bytes, mime_type)
    }
    data: Dict[str, Any] = {
        "model": "whisper-large-v3-turbo",
        "response_format": "verbose_json"
    }
    if language:
        data["language"] = language
    if prompt:
        data["prompt"] = prompt

    response = requests.post(url, headers=headers, files=files, data=data, timeout=120)
    
    if response.status_code != 200:
        logger.warning(f"Groq verbose_json returned status {response.status_code}: {response.text}. Retrying with json format.")
        data["response_format"] = "json"
        response = requests.post(url, headers=headers, files=files, data=data, timeout=120)
        if response.status_code != 200:
            raise RuntimeError(f"Groq Whisper error {response.status_code}: {response.text}")
        
        res_json = response.json()
        return {
            "text": res_json.get("text", "").strip(),
            "duration": 0.0,
            "segments": [],
            "provider": "groq-whisper-turbo"
        }

    res_json = response.json()
    result_text = res_json.get("text", "").strip()
    logger.info(
        f"[Groq Whisper] Transcription complete — {len(result_text)} chars. "
        f"Preview: {result_text[:120]!r}"
    )
    return {
        "text": result_text,
        "duration": float(res_json.get("duration", 0.0)),
        "segments": res_json.get("segments", []),
        "provider": "groq-whisper-turbo"
    }


def _transcribe_openai(
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    language: Optional[str] = None,
    prompt: Optional[str] = None
) -> Dict[str, Any]:
    """Transcribe audio using OpenAI Whisper with context prompting."""
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    files = {
        "file": (filename, file_bytes, mime_type)
    }
    data: Dict[str, Any] = {
        "model": "whisper-1",
        "response_format": "verbose_json"
    }
    if language:
        data["language"] = language
    if prompt:
        data["prompt"] = prompt

    response = requests.post(url, headers=headers, files=files, data=data, timeout=120)
    if response.status_code != 200:
        raise RuntimeError(f"OpenAI Whisper error {response.status_code}: {response.text}")

    res_json = response.json()
    return {
        "text": res_json.get("text", "").strip(),
        "duration": float(res_json.get("duration", 0.0)),
        "segments": res_json.get("segments", []),
        "provider": "openai-whisper"
    }


def _transcribe_fallback(filename: str) -> Dict[str, Any]:
    """
    Called when ALL transcription providers fail.
    Returns EMPTY transcript — never fake/demo content.
    The pipeline will detect the empty text and block post generation.
    """
    logger.error(
        f"[Transcription] ALL providers failed for '{filename}'. "
        "Returning empty transcript — post generation will be blocked. "
        "Check GROQ_API_KEY and network connectivity."
    )
    return {
        "text": "",
        "duration": 0.0,
        "segments": [],
        "provider": "failed"
    }

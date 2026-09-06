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


def transcribe_audio(
    file_bytes: bytes,
    filename: str = "audio.webm",
    mime_type: str = "audio/webm",
    provider: Optional[str] = None,
    language: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provider-agnostic speech-to-text service abstraction.
    Returns:
        {
            "text": str,
            "duration": float,
            "segments": list,
            "provider": str
        }
    """
    prov = (provider or TRANSCRIPTION_PROVIDER).lower()

    if prov == "groq" and GROQ_API_KEY:
        try:
            return _transcribe_groq(file_bytes, filename, mime_type, language)
        except Exception as e:
            logger.error(f"Groq Whisper transcription failed: {e}. Trying fallback.")

    if prov == "openai" and OPENAI_API_KEY:
        try:
            return _transcribe_openai(file_bytes, filename, mime_type, language)
        except Exception as e:
            logger.error(f"OpenAI Whisper transcription failed: {e}. Trying fallback.")

    # Fallback / mock transcription if no keys or API error
    return _transcribe_fallback(filename)


def _transcribe_groq(
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    language: Optional[str] = None
) -> Dict[str, Any]:
    """Transcribe audio using Groq Whisper Turbo."""
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
    return {
        "text": res_json.get("text", "").strip(),
        "duration": float(res_json.get("duration", 0.0)),
        "segments": res_json.get("segments", []),
        "provider": "groq-whisper-turbo"
    }


def _transcribe_openai(
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    language: Optional[str] = None
) -> Dict[str, Any]:
    """Transcribe audio using OpenAI Whisper."""
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    files = {
        "file": (filename, file_bytes, mime_type)
    }
    data = {
        "model": "whisper-1",
        "response_format": "verbose_json"
    }
    if language:
        data["language"] = language

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
    """Clean fallback transcription when API is unavailable or input is synthetic."""
    logger.warning("Using fallback simulated transcription.")
    sample_text = (
        "In our sales call yesterday, we realized most clients don't actually have a lead generation problem. "
        "They have a massive follow-up problem. They're spending thousands on outbound and inbound ads, "
        "getting 40 inquiries a week, and then dropping the ball because nobody touches base again after day three. "
        "When we instituted a simple 5-touchpoint follow-up cadence, their conversion rate went up 4x in two weeks. "
        "If you want to grow revenue without increasing ad spend, stop buying more leads and fix your follow-up retention."
    )
    return {
        "text": sample_text,
        "duration": 45.0,
        "segments": [
            {"id": 0, "start": 0.0, "end": 15.0, "text": "In our sales call yesterday, we realized most clients don't have a lead problem."},
            {"id": 1, "start": 15.0, "end": 30.0, "text": "They have a massive follow-up problem. Dropping the ball after day three."},
            {"id": 2, "start": 30.0, "end": 45.0, "text": "When we instituted a 5-touchpoint follow-up, conversion went up 4x."}
        ],
        "provider": "fallback-demo"
    }

import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def generate_text(prompt):
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=data)

    # 🔍 DEBUG PRINT (VERY IMPORTANT)
    print("STATUS:", response.status_code)
    try:
        print("RESPONSE:", response.text)
    except UnicodeEncodeError:
        # Fallback for Windows consoles that do not support utf-8 output natively
        try:
            import sys
            encoding = sys.stdout.encoding or 'utf-8'
            print("RESPONSE:", response.text.encode(encoding, errors='replace').decode(encoding))
        except Exception:
            print("RESPONSE: [Unicode response could not be printed]")

    # ❌ If API failed
    if response.status_code != 200:
        return f"API Error: {response.text}"

    res_json = response.json()

    # ❌ If no choices
    if "choices" not in res_json:
        return f"Unexpected API response: {res_json}"

    return res_json["choices"][0]["message"]["content"]


FALLBACK_MODELS = [
    "groq/compound-mini",
    "qwen/qwen3.8-27b",
    "groq/compound",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b"
]


def complete_chat(
    messages: list[dict],
    *,
    model: str = GROQ_MODEL,
    temperature: float = 0.7,
) -> str:
    """Multi-turn chat completion with automatic model fallback on rate limits."""
    if not GROQ_API_KEY:
        return ""

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    candidate_models = [model] + [m for m in FALLBACK_MODELS if m != model]

    for cand_model in candidate_models:
        data = {
            "model": cand_model,
            "messages": messages,
            "temperature": temperature,
        }
        try:
            response = requests.post(url, headers=headers, json=data, timeout=60)
            if response.status_code == 200:
                res_json = response.json()
                if "choices" in res_json and len(res_json["choices"]) > 0:
                    return res_json["choices"][0]["message"]["content"]
            
            # If rate limited (429) or model error, try next candidate model
            if response.status_code in (429, 503, 500, 400):
                continue
        except Exception:
            continue

    return f"API Error: All model candidates failed"

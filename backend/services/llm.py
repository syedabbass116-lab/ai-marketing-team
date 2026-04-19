import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def generate_text(prompt):
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=data)

    # 🔍 DEBUG PRINT (VERY IMPORTANT)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text)

    # ❌ If API failed
    if response.status_code != 200:
        return f"API Error: {response.text}"

    res_json = response.json()

    # ❌ If no choices
    if "choices" not in res_json:
        return f"Unexpected API response: {res_json}"

    return res_json["choices"][0]["message"]["content"]


def complete_chat(
    messages: list[dict],
    *,
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.7,
) -> str:
    """Multi-turn chat completion (same Groq endpoint as generate_text)."""
    if not GROQ_API_KEY:
        return ""

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    response = requests.post(url, headers=headers, json=data, timeout=60)
    if response.status_code != 200:
        return f"API Error: {response.text}"
    res_json = response.json()
    if "choices" not in res_json:
        return f"Unexpected API response: {res_json}"
    return res_json["choices"][0]["message"]["content"]

from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agents.repurpose_agent import repurpose
from agents.content_agent import (
    linkedin_post,
    twitter_thread,
    instagram_caption,
    youtube_script
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepurposeRequest(BaseModel):
    content: str


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


@app.get("/")
def home():
    return {"message": "Running 🚀"}


@app.get("/generate")
def generate(topic: str, platform: str = "all", count: int = 1):
    try:
        count = max(1, min(count, 10))

        def generate_variants(fn):
            if count == 1:
                return fn(topic)
            return "\n\n---\n\n".join(fn(topic) for _ in range(count))

        if platform == "all":
            return {
                "linkedin": linkedin_post(topic, posts=count),
                "twitter": twitter_thread(topic, tweets=count),
                "instagram": generate_variants(instagram_caption),
                "youtube": generate_variants(youtube_script),
            }

        if platform == "linkedin":
            return {"linkedin": linkedin_post(topic, posts=count)}

        if platform == "twitter":
            return {"twitter": twitter_thread(topic, tweets=count)}

        simple_generators = {
            "instagram": instagram_caption,
            "youtube": youtube_script,
        }

        if platform not in simple_generators:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported platform: {platform}. "
                    f"Supported: all, linkedin, twitter, instagram, youtube"
                ),
            )

        return {platform: generate_variants(simple_generators[platform])}
    except HTTPException:
        raise
    except Exception as e:
        return {
            "error": str(e)
        }

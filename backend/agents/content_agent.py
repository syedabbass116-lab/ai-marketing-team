from services.llm import generate_text

# The llm module in this repo exports generate_text and complete_chat.
# Older code referenced generate_social_media_post; removed in favor of generate_text.


def _generate_social_post(topic: str, platform: str, tone: str, goal: str) -> str:
    prompt = f"""You are an expert social media copywriter who has studied viral content across LinkedIn, Twitter/X, and Threads. Write a high-quality post on the topic: {topic}
Platform: {platform}
Tone: {tone}
Goal: {goal}
Follow these rules:

Hook first — The opening line must stop the scroll. Use a bold claim, surprising stat, or counterintuitive idea. Never start with "I".
Short sentences. One idea per line. Use white space generously.
Tell a story or make a point — Use a personal experience, analogy, or specific example. Avoid generic advice.
Build tension or curiosity in the middle to keep readers going.
End with a clear CTA — a question, a challenge, or a direct ask (follow, repost, comment).
No fluff, no filler. Every sentence must earn its place.
For LinkedIn: Keep it under 1,300 characters for the "preview" cutoff. Use line breaks after every 1–2 sentences.
For Twitter/X: Stay under 280 characters OR write a punchy thread (number each tweet, end the last one with a summary + CTA).
For Threads: Conversational tone, feels like a thought shared with friends, can be slightly longer and raw.

Also provide: 3 alternative hook options I can swap in.
"""
    return generate_text(prompt).strip()


def linkedin_post(topic: str, tone: str = "Professional", goal: str = "Build authority", posts: int = 1) -> str:
    """Generate high-quality LinkedIn posts with expert copywriting techniques."""
    posts = max(1, min(posts, 10))

    if posts == 1:
        return _generate_social_post(
            topic=topic,
            platform="LinkedIn",
            tone=tone,
            goal=goal
        )
    else:
        prompt = (
            f"Write {posts} distinct high-quality LinkedIn posts about {topic}. "
            f"For each post, follow expert copywriting rules: compelling hook, short sentences, "
            f"storytelling, tension building, and clear CTA. Tone: {tone}. Goal: {goal}. "
            f"Label them clearly as Post 1:, Post 2:, ..., up to Post {posts}:"
        )
        return generate_text(prompt)


def twitter_thread(topic: str, tone: str = "Conversational", goal: str = "Drive engagement", tweets: int = 1) -> str:
    """Generate high-quality Twitter threads with expert copywriting techniques."""
    tweets = max(1, min(tweets, 10))

    if tweets == 1:
        return _generate_social_post(
            topic=topic,
            platform="Twitter",
            tone=tone,
            goal=goal
        )
    else:
        prompt = (
            f"Write a viral Twitter thread about {topic} with exactly {tweets} tweets. "
            f"Each tweet must have a compelling hook, be under 280 characters, and build toward a strong CTA. "
            f"Tone: {tone}. Goal: {goal}. "
            f"Label them Tweet 1:, Tweet 2:, ..., up to Tweet {tweets}:"
        )
        return generate_text(prompt)


def threads_post(topic: str, tone: str = "Conversational", goal: str = "Drive engagement") -> str:
    """Generate high-quality Threads posts with expert copywriting techniques."""
    return _generate_social_post(
        topic=topic,
        platform="Threads",
        tone=tone,
        goal=goal
    )

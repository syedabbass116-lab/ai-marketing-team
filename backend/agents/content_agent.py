from services.llm import generate_text


def linkedin_post(topic: str, posts: int = 1) -> str:
    posts = max(1, min(posts, 10))
    if posts == 1:
        prompt = f"Write a high-converting LinkedIn post about {topic}"
    else:
        prompt = (
            f"Write {posts} distinct high-converting LinkedIn posts about {topic}. "
            f"Label them clearly as Post 1:, Post 2:, ..., up to Post {posts}:"
        )
    return generate_text(prompt)


def twitter_thread(topic: str, tweets: int = 1) -> str:
    tweets = max(1, min(tweets, 10))
    if tweets == 1:
        prompt = (
            f"Write a single high-engagement tweet about {topic}. "
            f"Return only the tweet text."
        )
    else:
        prompt = (
            f"Write a viral Twitter thread about {topic} with exactly {tweets} tweets. "
            f"Label them Tweet 1:, Tweet 2:, ..., up to Tweet {tweets}:"
        )
    return generate_text(prompt)


def threads_post(topic: str) -> str:
    prompt = f"Write an engaging Threads post about {topic}. It should be conversational, punchy, and spark conversation."
    return generate_text(prompt)

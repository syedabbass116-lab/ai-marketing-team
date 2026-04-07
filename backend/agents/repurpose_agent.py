from services.llm import generate_text


def repurpose(content):
    prompt = f"""
    Repurpose the following content into:
    - LinkedIn post
    - Twitter thread
    - Instagram caption
    - YouTube script

    Content:
    {content}
    """
    return generate_text(prompt)

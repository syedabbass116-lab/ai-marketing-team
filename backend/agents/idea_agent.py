from services.llm import generate_text


def generate_ideas(topic):
    prompt = f"""
    Generate 5 viral content ideas for: {topic}
    Focus on hooks and engagement.
    """
    return generate_text(prompt)

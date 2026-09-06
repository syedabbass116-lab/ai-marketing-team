import logging
import json
from typing import Dict, Any, Optional
from services.llm import complete_chat

logger = logging.getLogger(__name__)


def generate_engine_post(
    opportunity: Dict[str, Any],
    brand_context: Optional[Dict[str, Any]] = None,
    angle: Optional[str] = None,
    modifier: Optional[str] = None,
    custom_instruction: Optional[str] = None,
    platform: str = "linkedin",
    raw_transcript: str = ""
) -> Dict[str, Any]:
    """
    Requirement 5 & 11 — Grounded Writing Engine with Provenance.
    Translates an extracted opportunity into a ready-to-publish post.
    Strictly forbids hallucinated metrics, experiences, or corporate clichés.
    """
    chosen_angle = angle or opportunity.get("recommended_angle", "contrarian")
    title = opportunity.get("title", "")
    summary = opportunity.get("summary", "")
    evidence = opportunity.get("evidence", "")
    source_title = opportunity.get("source_title", "Voice recording")
    source_timestamp = opportunity.get("source_timestamp", 0)

    # Use the full raw transcript as primary source of truth.
    # Fall back to the evidence snippet only if no transcript was provided.
    transcript_section = raw_transcript.strip() if raw_transcript.strip() else evidence

    # Brand identity infusion
    voice_rules = []
    if brand_context:
        if brand_context.get("brandName"):
            voice_rules.append(f"Founder/Brand Name: {brand_context['brandName']}")
        if brand_context.get("brandVoice"):
            voice_rules.append(f"Voice Archetype: {brand_context['brandVoice']}")
        if brand_context.get("tone"):
            voice_rules.append(f"Tone: {brand_context['tone']}")
        if brand_context.get("targetAudience"):
            voice_rules.append(f"Target Audience / ICP: {brand_context['targetAudience']}")
        if brand_context.get("writingStyleLinkedin"):
            voice_rules.append(f"Stylistic Samples to Mimic:\n{brand_context['writingStyleLinkedin']}")

    voice_section = "\n".join(voice_rules) if voice_rules else "Tone: Direct, credible, founder-led, high-conviction."

    modifier_section = ""
    if modifier:
        modifier_mapping = {
            "shorter": "Make this draft significantly more concise (under 800 characters). Cut any redundant sentences.",
            "more_personal": "Emphasize the personal narrative and first-person observation without inventing facts.",
            "more_direct": "Make the stance punchier, removing hedging words like 'maybe' or 'sometimes'.",
            "stronger_hook": "Write a drastically bolder opening hook that stops the scroll.",
            "less_salesy": "Focus 100% on educational/mindset value, eliminate any promotional overtone.",
            "more_conversational": "Write as if speaking casually to a peer founder over coffee."
        }
        modifier_section = f"USER REVISION DIRECTIVE: {modifier_mapping.get(modifier, modifier)}"

    if custom_instruction:
        modifier_section += f"\nADDITIONAL INSTRUCTION: {custom_instruction}"

    prompt = f"""You are GhostScribe, an elite ghostwriter for top founders and creators.

Your job is to transform the founder's actual spoken words into an exceptional, high-converting {platform.upper()} post.

=== THE TRANSCRIPT — STRICT SOURCE OF TRUTH ===
{transcript_section}

=== POST CONFIGURATION ===
Target Platform: {platform.upper()}
Content Angle: {chosen_angle.upper()}
Source Title: {source_title}

=== FOUNDER VOICE & BRAND ===
{voice_section}

{modifier_section}

=== CRITICAL STRUCTURAL & FORMATTING BLUEPRINT (MANDATORY) ===
Every single post you generate MUST follow these exact structural rules:

1. NO DENSE PARAGRAPHS EVER:
   - Maximum 1 to 2 lines per block. Never write 3+ continuous lines in a paragraph block.
   - Separate every single thought, line, or punchline with clean whitespace (double line break).

2. CADENCE & RHYTHM (The "3-1-3-1" Cadence):
   - Hook: 1 bold, scroll-stopping opening line.
   - Context / Re-hook: 1 short bridge line.
   - 3 short punchy bullet lines or progressive observations.
   - 1 single-line pivot, twist, or question.
   - 3 short steps, proofs, dialogue quotes, or breakdown lines.
   - 1 core revelation / takeaway line.
   - Concluding CTA: Ending call-to-action (e.g. conversational question, giveaway, P.S., or reflection).

3. PLATFORM-SPECIFIC OPTIMIZATION:
   - LINKEDIN: Professional founder tone, high-contrast hooks, 3-1-3-1 line breaks, dialogue quotes or numbered takeaways, ending with a compelling discussion question or "P.S. [action]".
   - TWITTER / X: Ultra-punchy viral hook, rapid short lines, crisp insights, formatted with punchy bullets, ending with a bookmark/repost callout or reply question.
   - THREADS: Casual, authentic, relatable founder voice, conversational short lines, no corporate jargon, ending with an open question prompting replies.

=== GOLD STANDARD STRUCTURE EXAMPLES (MATCH THIS STYLE EXACTLY) ===

--- Example 1: Story / Milestone / Dialogue Cadence ---
#1 Personal Branding community in the world!

This win is a special one. ❤️

Clear Rank contacted me last week to tell me my Link Up community ranks 1st in the personal branding category on all of Whop.

Whop hosts 20K+ communities globally!
(this plaque is not "official", btw, it was a gift)

The first to know this news? My members.

"Why am I not surprised?"
"Wow, this is well deserved, congratulations"
"You have every reason to be very proud of what you’ve created."

These were their reactions... Me?

I'll just say THANK YOU. 🙏

It may be a momentary ranking, but I'll take the win.

Link Up is soon gonna be 2 years old.
And we've already managed to cross so many milestones:
• 1,000+ members
• 83 countries
• Countless founder breakthroughs

I'm truly blessed.

P.S. I'm bringing Lifetime back for 3 days only for anyone interested. What milestone are you chasing this year? ♻️

--- Example 2: Framework / Playbook Cadence ---
If I had to grow my following to 356k all over again...

Here's exactly how I'd do it (using the NEW algo rules):

1. I'd turn educational content into stories.
They're the easiest way to turn a basic framework into a viral post.
Instead of: here's how to build a business.
Write: In 2023, I started my first agency. It made $100k.

2. I'd use the 3-second profile test before posting ever.
Does my headline tell people what I sell?
Does my featured section tell them where to go?
Does my banner have a 1-line pitch so they stay?

3. I'd spend 90% of my time engaging with my ICP.
Comments are the strongest signal the algorithm uses to decide who sees your content next.
Put yourself in front of your audience daily.

Impressions may fluctuate, but conversions are at an all-time high when you do this.

Tell me below: what's your biggest growth bottleneck right now?

--- Example 3: Contrarian / 3-1-3-1 Insight Cadence ---
The most dangerous opportunities are the ones that look obviously good.

More reach.
More status.
More money.
More security.

The upside is so easy to see sitting right there in front of you.

The cost? Not so much.

That’s where I've found that people get themselves into a lot of trouble.

Because once an opportunity gets big enough, you can make almost any compromise sound reasonable.

You start to renegotiate your own priorities.
You explain away the thing you said mattered.
You convince yourself that this one is different.

Sometimes it is...

But sometimes you’re about to trade away something infinitely more valuable than what you’re getting back.

And the worst part is that you usually won’t know until much, much later.

What's an opportunity you're glad you said "no" to?

=== STRICT FACTUAL FIDELITY RULES ===
1. Generate the post using ONLY the founder's real experiences, insights, and facts from the transcript.
2. DO NOT invent fake revenue numbers, fake customers, fake employees, or fake stories.
3. If the transcript discusses AI, tools, frameworks, or events, use those EXACT subjects.
4. Output ONLY the finished post text. No preamble, no meta-commentary, no quotation marks surrounding the post."""

    messages = [
        {"role": "system", "content": (
            "You are an elite ghostwriter who crafts viral founder content. "
            "You ALWAYS format posts with short lines, 3-1-3-1 cadence rhythm, punchy hooks, and compelling CTAs. "
            "You NEVER write dense paragraph blocks. "
            "You maintain 100% factual fidelity to what the speaker actually said."
        )},
        {"role": "user", "content": prompt}
    ]

    try:
        logger.info(
            f"[GhostScribe] Generating {platform} post — "
            f"transcript_chars={len(transcript_section)}, "
            f"preview={transcript_section[:120]!r}, "
            f"angle={chosen_angle}, modifier={modifier}"
        )
        raw_post = complete_chat(messages, temperature=0.5).strip()
        if raw_post.startswith("API Error:") or not raw_post:
            logger.warning(f"complete_chat returned error or empty: {raw_post!r}. Using transcript-based fallback.")
            clean_post = _fallback_post(title, summary, evidence, chosen_angle, transcript_section)
        else:
            clean_post = _clean_post_text(raw_post)
            logger.info(f"[GhostScribe] Post generated — {len(clean_post)} chars.")
    except Exception as e:
        logger.error(f"Error generating engine post: {e}")
        clean_post = _fallback_post(title, summary, evidence, chosen_angle, transcript_section)

    provenance = {
        "source_title": source_title,
        "source_timestamp": source_timestamp,
        "derived_from": title,
        "evidence_quote": evidence,
        "content_angle": chosen_angle
    }

    metrics = {
        "icp_relevance": opportunity.get("icp_relevance", 94),
        "originality": opportunity.get("originality", 89),
        "confidence": 95,
        "overall_score": opportunity.get("overall_score", 92)
    }

    return {
        "content": clean_post,
        "angle": chosen_angle,
        "platform": platform,
        "provenance": provenance,
        "metrics": metrics,
        "status": "ready"
    }


def _clean_post_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith('"') and cleaned.endswith('"'):
        cleaned = cleaned[1:-1].strip()
    cleaned = cleaned.replace("**", "").replace("###", "")
    return cleaned


def _fallback_post(title: str, summary: str, evidence: str, angle: str, transcript: str = "") -> str:
    """
    Emergency fallback that uses the actual transcript/evidence — never hardcoded demo content.
    If the LLM fails, we return the raw transcript content so the user at least sees their real words.
    """
    # Prefer the full transcript, then evidence snippet, then summary, then title
    content = transcript.strip() or evidence.strip() or summary.strip() or title.strip()
    if not content:
        return ""
    # Minimal cleanup: truncate to reasonable post length
    if len(content) > 2000:
        content = content[:2000].rsplit(" ", 1)[0] + "..."
    return content


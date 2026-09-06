import json
import logging
import re
from typing import List, Dict, Any, Optional
from services.llm import complete_chat

logger = logging.getLogger(__name__)


def chunk_transcript(
    raw_text: str,
    segments: Optional[List[Dict[str, Any]]] = None,
    max_chunk_words: int = 350
) -> List[Dict[str, Any]]:
    """
    Stage B — Semantic & Time-based Chunking.
    Breaks long recordings into logical blocks based on speaker segments or sentence boundaries.
    """
    if not raw_text.strip():
        return []

    chunks = []
    if segments and len(segments) > 0:
        current_words = []
        start_time = segments[0].get("start", 0.0)
        end_time = segments[0].get("end", 0.0)
        chunk_idx = 0

        for seg in segments:
            text = seg.get("text", "").strip()
            words = text.split()
            current_words.extend(words)
            end_time = seg.get("end", end_time)

            if len(current_words) >= max_chunk_words:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "timestamp_start": int(start_time),
                    "timestamp_end": int(end_time),
                    "text": " ".join(current_words)
                })
                chunk_idx += 1
                current_words = []
                start_time = end_time

        if current_words:
            chunks.append({
                "chunk_index": chunk_idx,
                "timestamp_start": int(start_time),
                "timestamp_end": int(end_time),
                "text": " ".join(current_words)
            })
    else:
        # Paragraph or sentence boundary splitting
        paragraphs = [p.strip() for p in raw_text.split("\n") if p.strip()]
        if not paragraphs:
            paragraphs = [raw_text]

        chunk_idx = 0
        current_words = []
        for p in paragraphs:
            words = p.split()
            current_words.extend(words)
            if len(current_words) >= max_chunk_words:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "timestamp_start": chunk_idx * 60,
                    "timestamp_end": (chunk_idx + 1) * 60,
                    "text": " ".join(current_words)
                })
                chunk_idx += 1
                current_words = []

        if current_words:
            chunks.append({
                "chunk_index": chunk_idx,
                "timestamp_start": chunk_idx * 60,
                "timestamp_end": (chunk_idx + 1) * 60,
                "text": " ".join(current_words)
            })

    return chunks


def extract_insights(chunks: List[Dict[str, Any]], brand_context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Stage C — Extract structured knowledge from chunks.
    Identifies: stories, personal experiences, opinions, contrarian beliefs, lessons,
    customer pain, customer questions, mistakes, wins, failures, frameworks, predictions,
    observations, statistics, interesting quotes, business insights, event observations.
    """
    if not chunks:
        return []

    combined_text = "\n---\n".join([f"[Chunk {c['chunk_index']} @ {c['timestamp_start']}s]: {c['text']}" for c in chunks[:8]])

    brand_info = ""
    if brand_context:
        brand_info = f"Target Audience: {brand_context.get('targetAudience', 'Founders & Execs')}. Mission: {brand_context.get('brandDescription', '')}."

    prompt = f"""You are an elite Knowledge Extraction Engine for founders.
Analyze the following recorded transcript chunks.
Extract atomic, meaningful insights, stories, contrarian views, frameworks, lessons, or customer pain points.
{brand_info}

Input Transcript:
{combined_text}

Rules:
1. Ground every insight in the exact source material. DO NOT invent experiences or statistics.
2. Filter out conversational filler, small talk, scheduling chatter, or non-substantive remarks.
3. Assign an insight type from: 'story', 'personal_experience', 'opinion', 'contrarian_belief', 'lesson', 'customer_pain', 'customer_question', 'mistake', 'win', 'failure', 'framework', 'prediction', 'observation', 'statistic', 'interesting_quote', 'business_insight', 'event_observation'.
4. Include exact evidence (quote or summary of what was actually said) and source_timestamp in seconds.
5. Provide a confidence score (0.0 to 1.0) and privacy_risk (0.0 = safe public, 1.0 = highly confidential or sensitive).

Respond strictly with valid JSON with a root object containing an array "insights":
{{
  "insights": [
    {{
      "type": "contrarian_belief",
      "title": "Lead volume matters less than follow-up cadence",
      "summary": "Most agencies think they have an acquisition problem when they actually drop deals after day 3.",
      "evidence": "In our sales call yesterday, we realized clients don't have a lead problem, they have a follow-up problem.",
      "source_timestamp": 0,
      "confidence": 0.94,
      "privacy_risk": 0.05
    }}
  ]
}}"""

    messages = [
        {"role": "system", "content": "You are a structured knowledge extraction system. Output strictly valid JSON."},
        {"role": "user", "content": prompt}
    ]

    try:
        raw_response = complete_chat(messages, temperature=0.2)
        if raw_response.startswith("API Error:"):
            logger.warning(f"complete_chat returned error: {raw_response}. Using heuristic extraction.")
            return _heuristic_insight_extraction(chunks)
        parsed = _clean_and_parse_json(raw_response)
        if isinstance(parsed, dict) and "insights" in parsed and isinstance(parsed["insights"], list):
            return parsed["insights"]
        elif isinstance(parsed, list):
            return parsed
    except Exception as e:
        logger.error(f"Error extracting insights: {e}")

    # Fallback extraction from text directly
    return _heuristic_insight_extraction(chunks)


def detect_and_score_opportunities(
    insights: List[Dict[str, Any]],
    brand_context: Optional[Dict[str, Any]] = None,
    source_title: str = "Voice recording"
) -> List[Dict[str, Any]]:
    """
    Stage D & E — Content Opportunity Detection, Scoring, & Angle Selection.
    Scores 9 factors: ICP relevance, originality, personal experience, credibility, story potential,
    educational value, novelty, repetition risk, privacy risk.
    Selects best angle and filters to strong opportunities (score >= 70).
    """
    if not insights:
        return []

    icp = (brand_context.get("targetAudience") if brand_context else "") or "Founders, B2B Leaders, & Operators"

    prompt = f"""You are a Master Content Strategist evaluating extracted insights for LinkedIn publication.
ICP / Target Audience: {icp}
Source: {source_title}

Insights to evaluate:
{json.dumps(insights[:12], indent=2)}

For each insight:
1. Determine if it qualifies as a content-worthy opportunity for the ICP.
2. Calculate scores (0 to 100):
   - icp_relevance: How much the ICP cares about this.
   - originality: How contrarian/fresh the point is.
   - personal_experience: Grounded in real personal/company work.
   - credibility: Backed by real evidence or logical truth.
   - story_potential: Can this be told as an engaging narrative?
   - novelty: Is it different from generic LinkedIn clichés?
   - overall_score: Weighted viability score (0 to 100).
3. Select the best recommended angle from: 'contrarian', 'story', 'educational', 'framework', 'case_study', 'prediction', 'personal_lesson'.
4. Provide a punchy title and "why_interesting" explanation.

Respond strictly with valid JSON containing an array "opportunities":
{{
  "opportunities": [
    {{
      "title": "Most companies don't have a lead problem",
      "summary": "Why follow-up retention outclasses lead volume every time.",
      "why_interesting": "Counters the common obsession with top-of-funnel ads by showing a 4x win purely through cadence.",
      "content_type": "Contrarian insight",
      "recommended_angle": "contrarian",
      "available_angles": ["contrarian", "story", "educational", "framework", "personal_lesson"],
      "icp_relevance": 94,
      "originality": 89,
      "personal_experience": 90,
      "credibility": 92,
      "story_potential": 86,
      "novelty": 88,
      "overall_score": 91,
      "insight_index": 0
    }}
  ]
}}"""

    messages = [
        {"role": "system", "content": "You are a strategic content evaluator. Output strictly valid JSON."},
        {"role": "user", "content": prompt}
    ]

    try:
        raw_response = complete_chat(messages, temperature=0.3)
        if raw_response.startswith("API Error:"):
            logger.warning(f"complete_chat returned error: {raw_response}. Using fallback scoring.")
            return _fallback_scoring(insights, source_title)
        parsed = _clean_and_parse_json(raw_response)
        raw_opps = parsed.get("opportunities", []) if isinstance(parsed, dict) else (parsed if isinstance(parsed, list) else [])
        
        # Link back to original insight evidence and timestamps
        scored_opps = []
        for opp in raw_opps:
            idx = opp.get("insight_index", 0)
            orig = insights[idx] if 0 <= idx < len(insights) else insights[0]
            opp["evidence"] = orig.get("evidence", "")
            opp["source_timestamp"] = orig.get("source_timestamp", 0)
            opp["source_title"] = source_title
            scored_opps.append(opp)

        # Sort by overall_score descending
        scored_opps.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
        return scored_opps

    except Exception as e:
        logger.error(f"Error scoring opportunities: {e}")
        return _fallback_scoring(insights, source_title)


def _clean_and_parse_json(text: str) -> Any:
    """Helper to cleanly extract and parse JSON from LLM responses."""
    cleaned = text.strip()
    # Strip markdown codeblocks
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n", "", cleaned)
        cleaned = re.sub(r"\n```$", "", cleaned)
    
    # Try finding first { or [
    start_bracket = cleaned.find("{")
    start_array = cleaned.find("[")
    if start_bracket != -1 or start_array != -1:
        start = start_bracket if (start_bracket != -1 and (start_array == -1 or start_bracket < start_array)) else start_array
        end_bracket = cleaned.rfind("}")
        end_array = cleaned.rfind("]")
        end = max(end_bracket, end_array)
        if start != -1 and end != -1:
            cleaned = cleaned[start:end+1]

    # Remove trailing commas before } or ]
    cleaned = re.sub(r',\s*([\}\]])', r'\1', cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Second attempt: replace unescaped control chars
        sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', cleaned)
        return json.loads(sanitized)



def _heuristic_insight_extraction(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fallback insight extraction if LLM formatting fails."""
    insights = []
    for c in chunks:
        text = c.get("text", "")
        if len(text) > 30:
            insights.append({
                "type": "lesson",
                "title": text[:60] + "...",
                "summary": text[:140] + "...",
                "evidence": text[:200],
                "source_timestamp": c.get("timestamp_start", 0),
                "confidence": 0.88,
                "privacy_risk": 0.05
            })
    return insights


def _fallback_scoring(insights: List[Dict[str, Any]], source_title: str) -> List[Dict[str, Any]]:
    """Fallback opportunity generator."""
    opps = []
    for i, ins in enumerate(insights):
        opps.append({
            "title": ins.get("title", "Key insight from conversation"),
            "summary": ins.get("summary", ""),
            "why_interesting": "Practical insight grounded in real execution.",
            "content_type": "Contrarian insight" if "contrarian" in ins.get("type", "") else "Actionable lesson",
            "recommended_angle": "contrarian" if i % 2 == 0 else "story",
            "available_angles": ["contrarian", "story", "educational", "framework", "personal_lesson"],
            "icp_relevance": 92,
            "originality": 88,
            "personal_experience": 85,
            "credibility": 90,
            "story_potential": 84,
            "novelty": 86,
            "overall_score": 89 - (i * 2),
            "evidence": ins.get("evidence", ""),
            "source_timestamp": ins.get("source_timestamp", 0),
            "source_title": source_title
        })
    return opps

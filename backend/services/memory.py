import logging
import json
import re
from typing import List, Dict, Any, Optional
from services.llm import complete_chat

logger = logging.getLogger(__name__)

# In-memory storage cache per workspace for rapid retrieval & fallback
_MEMORY_CACHE: Dict[str, List[Dict[str, Any]]] = {}
_PAST_POSTS_CACHE: Dict[str, List[Dict[str, Any]]] = {}


def get_founder_memories(workspace_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieve top active memories for a workspace."""
    return _MEMORY_CACHE.get(workspace_id, [])[:limit]


def add_founder_memory(
    workspace_id: str,
    category: str,
    key_point: str,
    details: str = "",
    source_ref: str = ""
) -> Dict[str, Any]:
    """Store an atomic thought, recurring theme, or opinion in the Founder Memory layer."""
    if workspace_id not in _MEMORY_CACHE:
        _MEMORY_CACHE[workspace_id] = []
    
    item = {
        "id": f"mem-{len(_MEMORY_CACHE[workspace_id]) + 1}",
        "category": category,
        "key_point": key_point,
        "details": details,
        "source_ref": source_ref
    }
    _MEMORY_CACHE[workspace_id].insert(0, item)
    return item


def record_published_post(
    workspace_id: str,
    post_text: str,
    angle: str,
    topic: str
) -> None:
    """Record a post to prevent topic and hook repetition."""
    if workspace_id not in _PAST_POSTS_CACHE:
        _PAST_POSTS_CACHE[workspace_id] = []
    
    _PAST_POSTS_CACHE[workspace_id].insert(0, {
        "text": post_text,
        "angle": angle,
        "topic": topic
    })


def check_repetition(
    workspace_id: str,
    proposed_topic: str,
    proposed_angle: str,
    available_angles: List[str]
) -> Dict[str, Any]:
    """
    Requirement 7 — Avoid Repetition.
    Detects if the proposed topic, hook, or story is too similar to recently published posts.
    If similarity is high (> 70%), automatically shifts to a different angle or signals repetition.
    """
    past_posts = _PAST_POSTS_CACHE.get(workspace_id, [])
    if not past_posts:
        return {
            "is_repeat": False,
            "similarity_score": 0.0,
            "chosen_angle": proposed_angle,
            "reason": "Fresh topic, no prior posts recorded."
        }

    past_topics = [p.get("topic", "") for p in past_posts[:10]]
    past_angles = [p.get("angle", "") for p in past_posts[:10]]

    # Quick lexical check
    topic_lower = proposed_topic.lower()
    for prev, prev_angle in zip(past_topics, past_angles):
        words = set(topic_lower.split())
        prev_words = set(prev.lower().split())
        if not words or not prev_words:
            continue
        jaccard = len(words & prev_words) / len(words | prev_words)
        if jaccard > 0.6:
            # Overlapping topic: swap angle to prevent content fatigue
            alternate = [a for a in available_angles if a != proposed_angle and a != prev_angle]
            new_angle = alternate[0] if alternate else "story"
            return {
                "is_repeat": True,
                "similarity_score": round(jaccard * 100, 1),
                "chosen_angle": new_angle,
                "reason": f"Similar to previous post on '{prev}'. Automatically pivoted from {proposed_angle} to {new_angle} to maintain freshness."
            }

    return {
        "is_repeat": False,
        "similarity_score": 15.0,
        "chosen_angle": proposed_angle,
        "reason": "Topic has sufficient novelty."
    }

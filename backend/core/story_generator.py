import os
import re
import json
from groq import Groq
from sqlalchemy.orm import Session

from core.prompts import STORY_PROMPT
from models.story import Story, StoryNode
from core.models import StoryLLMResponse, StoryNodeLLM


def _extract_json(text: str) -> str:
    """Strip reasoning-model preamble and return the JSON block."""
    stripped = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    if stripped:
        return stripped
    idx = text.find("{")
    return text[idx:] if idx != -1 else text


class StoryGenerator:

    @classmethod
    def generate_story(cls, db: Session, session_id: str, theme: str = "fantasy") -> Story:
        client = Groq(api_key=os.environ["GROQ_API_KEY"])

        from langchain_core.output_parsers import PydanticOutputParser
        story_parser = PydanticOutputParser(pydantic_object=StoryLLMResponse)
        format_instructions = story_parser.get_format_instructions()

        response = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[
                {"role": "system", "content": STORY_PROMPT.replace("{format_instructions}", format_instructions)},
                {"role": "user", "content": f"Create the story with this theme: {theme}"}
            ],
            temperature=0.9,
        )

        raw_text = response.choices[0].message.content
        json_text = _extract_json(raw_text)
        story_structure = story_parser.parse(json_text)

        story_db = Story(title=story_structure.title, session_id=session_id)
        db.add(story_db)
        db.flush()

        root_node_data = story_structure.rootNode
        if isinstance(root_node_data, dict):
            root_node_data = StoryNodeLLM.model_validate(root_node_data)

        cls._process_story_node(db, story_db.id, root_node_data, is_root=True)
        db.commit()
        return story_db

    @classmethod
    def _process_story_node(cls, db: Session, story_id: int, node_data: StoryNodeLLM, is_root: bool = False) -> StoryNode:
        content = node_data.content if hasattr(node_data, "content") else node_data["content"]
        is_ending = node_data.isEnding if hasattr(node_data, "isEnding") else node_data["isEnding"]
        is_winning = node_data.isWinningEnding if hasattr(node_data, "isWinningEnding") else node_data["isWinningEnding"]

        node = StoryNode(
            story_id=story_id,
            content=content,
            is_root=is_root,
            is_ending=is_ending,
            is_winning_ending=is_winning,
            options=[]
        )
        db.add(node)
        db.flush()

        if not node.is_ending and hasattr(node_data, "options") and node_data.options:
            options_list = []
            for option_data in node_data.options:
                next_node = option_data.nextNode
                if isinstance(next_node, dict):
                    next_node = StoryNodeLLM.model_validate(next_node)
                child_node = cls._process_story_node(db, story_id, next_node, False)
                options_list.append({"text": option_data.text, "node_id": child_node.id})
            node.options = options_list

        db.flush()
        return node

"""
schemas/story.py
----------------
Pydantic schemas for story-related request/response payloads.

These classes define the shape of JSON data that flows in and out of the
API — separate from the SQLAlchemy ORM models in `models/story.py`.

Convention:
  - *Base    → shared fields reused by create / update / response schemas
  - *Response → what the API returns to the client (may include DB-generated
                fields like `id`)

All schemas must inherit from `BaseModel`.
"""

from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel


class StoryOptionsSchema(BaseModel):
    """
    Represents a single choice available to the player at a story node.

    Fields
    ------
    text : str
        Display text shown to the player for this choice
        (e.g. "Enter the dark forest").
    node_id : int | None
        ID of the StoryNode the player navigates to if they select this
        option.  None while the story is still being generated (not yet
        linked to a node).
    """

    text: str
    node_id: Optional[int] = None


class StoryNodeBase(BaseModel):
    """
    Core fields shared across all StoryNode schemas.

    Fields
    ------
    content : str
        Narrative text of the scene displayed to the player.
    is_ending : bool
        Whether this node is a terminal leaf with no further choices.
    is_winning_ending : bool
        Whether this ending represents a successful player outcome.
        Only meaningful when `is_ending=True`.
    """

    content: str
    is_ending: bool = False
    is_winning_ending: bool = False


class CompleteStoryNodeResponse(StoryNodeBase):
    """
    Full representation of a StoryNode returned by the API.

    Extends `StoryNodeBase` with the database-assigned `id` and the list
    of branching `options` available from this node.

    Fields
    ------
    id : int
        Database primary key of the StoryNode.
    options : list[StoryOptionsSchema]
        Choices available to the player.  Empty list for ending nodes.
    """

    id: int
    options: List[StoryOptionsSchema] = []

    class Config:
        # Allow constructing this schema directly from a SQLAlchemy ORM
        # model instance (reads attributes instead of expecting a dict).
        from_attributes = True

class StoryBase(BaseModel):
    """
    Core fields shared across all Story schemas.

    Fields
    ------
    title : str
        Title of the story.
    description : str
        Short description of the story.
    """

    title: str
    session_id: Optional[str] = None

    class Config:
        from_attributes = True
    
class CreateStoryRequest(BaseModel):
    """
    Request payload for creating a new story.

    Fields
    ------
    theme : str
        The theme or genre of the story.
    """

    theme: str

class CompleteStoryResponse(StoryBase):
    """
    Full representation of a Story returned by the API.
    """

    id: int
    created_at: datetime 
    root_node: CompleteStoryNodeResponse
    all_nodes: Dict[int, CompleteStoryNodeResponse]

    class Config:
        from_attributes = True

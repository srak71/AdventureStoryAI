from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class StoryJobBase(BaseModel):
    theme: str

class StoryJobResponse(BaseModel):
    """
    Represents a story generation job in the system.
    """
    job_id: int
    status: str
    created_at: datetime
    story_id: Optional[int] = None  # The ID of the generated story, if completed
    completed_at: Optional[datetime] = None  # The timestamp when the job was completed
    error_message: Optional[str] = None  # Error message if the job failed
    
    class Config:
        from_attributes = True

class StoryJobCreate(StoryJobBase):
    """
    Request payload for creating a new story generation job.
    """
    pass
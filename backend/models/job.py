"""
models/job.py
-------------
ORM model for background story-generation jobs.

A `StoryJob` record is created when a user requests a new story and is
updated as the async generation pipeline progresses.  Once complete, it
holds a reference to the generated `Story` via `story_id`.

Table: story_jobs
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from db.database import Base


class StoryJob(Base):
    """
    Represents a single story-generation job.

    Columns
    -------
    id : int
        Auto-incrementing primary key.
    job_id : str
        Externally visible unique identifier for the job (e.g. a UUID).
        Used by clients to poll job status.
    session_id : str
        Identifies the user/browser session that created the job.
        Allows a user to list their own jobs without authentication.
    theme : str
        The story theme or prompt supplied by the user (e.g. "pirate adventure").
    status : str
        Current state of the job.  Expected values:
          "pending"    – queued, not yet started
          "running"    – generation in progress
          "completed"  – story created successfully
          "failed"     – generation failed; see `error` for details
    story_id : str | None
        ID of the generated Story record once the job completes.
        NULL while the job is still pending or running.
    error : str | None
        Human-readable error message if status is "failed", otherwise NULL.
    created_at : datetime
        Timestamp (UTC) when the job was created; set automatically by the DB.
    completed_at : datetime | None
        Timestamp (UTC) when the job finished (success or failure).
        NULL until the job reaches a terminal state.
    """

    __tablename__ = "story_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    session_id = Column(String, index=True)
    theme = Column(String)
    status = Column(String)
    story_id = Column(String, nullable=True)
    error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
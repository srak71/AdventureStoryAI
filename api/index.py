"""
api/index.py
------------
Vercel Python serverless entry point.
Adds the backend directory to sys.path so the FastAPI app and all its
modules can be imported, then re-exports `app` for the Vercel ASGI runtime.
"""

import sys
import os

# Make the backend package importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app  # noqa: F401  (Vercel picks up `app` as the ASGI handler)

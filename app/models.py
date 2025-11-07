"""Database models for the BookApp.

This module defines the SQLAlchemy models used by the application. Currently
there is a single model, `Book`, which represents a book record persisted to
the configured database.
"""

from app import db


class Book(db.Model):
    """Represents a book stored in the database.

    Attributes:
        id (int): Primary key.
        title (str): Book title (required, max length 120).
        author (str): Book author (required, max length 80).
    """
    id = db.Column(db.Integer, primary_key=True)
    # Title of the book; required and limited to 120 characters.
    title = db.Column(db.String(120), nullable=False)
    # Author of the book; required and limited to 80 characters.
    author = db.Column(db.String(80), nullable=False)

    def to_dict(self):
        """Return a dictionary representation of the Book suitable for JSON responses.

        Returns:
            dict: A mapping with keys "id", "title", and "author".
        """
        return {"id": self.id, "title": self.title, "author": self.author}

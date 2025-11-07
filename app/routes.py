from flask import Blueprint, request, jsonify, render_template
from app import db
from app.models import Book

main = Blueprint('main', __name__)


@main.route("/", methods=["GET"])
def index():
    """Serve the single-page UI for interacting with the books API."""
    return render_template('index.html')

@main.route("/books", methods=["GET"])
def get_books():
    books = Book.query.all()
    return jsonify([b.to_dict() for b in books])

@main.route("/books", methods=["POST"])
def add_book():
    data = request.json
    book = Book(title=data["title"], author=data["author"])
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201

@main.route("/books/<int:id>", methods=["PUT"])
def update_book(id):
    book = Book.query.get_or_404(id)
    data = request.json
    book.title = data.get("title", book.title)
    book.author = data.get("author", book.author)
    db.session.commit()
    return jsonify(book.to_dict())

@main.route("/books/<int:id>", methods=["DELETE"])
def delete_book(id):
    book = Book.query.get_or_404(id)
    db.session.delete(book)
    db.session.commit()
    return '', 204

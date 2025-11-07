// Minimal JS to interact with the Book REST API and control tabs

const booksEl = document.getElementById("books");
const addForm = document.getElementById("addForm");
const tabs = document.querySelectorAll(".tab");

function showTab(name) {
  const listPage = document.getElementById("tab-list");
  const addPage = document.getElementById("tab-add");

  if (name === "list") {
    listPage.classList.add("page--active");
    listPage.setAttribute("aria-hidden", "false");
    addPage.classList.remove("page--active");
    addPage.setAttribute("aria-hidden", "true");
    // refresh books when viewing the list
    fetchBooks();
  } else {
    addPage.classList.add("page--active");
    addPage.setAttribute("aria-hidden", "false");
    listPage.classList.remove("page--active");
    listPage.setAttribute("aria-hidden", "true");
    // focus the title field
    const t = document.getElementById("title");
    if (t) t.focus();
  }

  // update tab aria/active
  tabs.forEach((tab) => {
    const tname = tab.getAttribute("data-tab");
    if (tname === name) {
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
    } else {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
    }
  });
}

// attach tab handlers
tabs.forEach((tab) =>
  tab.addEventListener("click", () => showTab(tab.getAttribute("data-tab")))
);

async function fetchBooks() {
  const res = await fetch("/books");
  const data = await res.json();
  renderBooks(data);
}

function renderBooks(list) {
  if (!list || list.length === 0) {
    booksEl.innerHTML = '<div class="empty">No books yet.</div>';
    return;
  }

  booksEl.innerHTML = "";
  list.forEach((book) => {
    const el = document.createElement("div");
    el.className = "book";
    el.dataset.id = book.id;

    el.innerHTML = `
      <div class="meta">
        <b class="title">${escapeHtml(book.title)}</b>
        <small class="author">${escapeHtml(book.author)}</small>
      </div>
      <div class="controls">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

    // attach handlers
    el.querySelector(".delete").addEventListener("click", () =>
      deleteBook(book.id)
    );
    el.querySelector(".edit").addEventListener("click", () =>
      enterEditMode(el, book)
    );

    booksEl.appendChild(el);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  if (!title || !author) return;

  const res = await fetch("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  });
  if (res.ok) {
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    // after adding, show list
    showTab("list");
  } else {
    alert("Failed to add book");
  }
});

async function deleteBook(id) {
  if (!confirm("Delete this book?")) return;
  const res = await fetch(`/books/${id}`, { method: "DELETE" });
  if (res.status === 204) fetchBooks();
  else alert("Failed to delete");
}

function enterEditMode(el, book) {
  if (el.classList.contains("editing")) return;
  el.classList.add("editing");
  const meta = el.querySelector(".meta");
  meta.innerHTML = `
    <input class="edit-title" value="${escapeHtml(book.title)}" />
    <input class="edit-author" value="${escapeHtml(book.author)}" />
  `;
  const controls = el.querySelector(".controls");
  controls.innerHTML = `
    <button class="save">Save</button>
    <button class="cancel">Cancel</button>
  `;
  controls
    .querySelector(".save")
    .addEventListener("click", () => saveEdit(el, book.id));
  controls.querySelector(".cancel").addEventListener("click", () => {
    el.classList.remove("editing");
    fetchBooks();
  });
}

async function saveEdit(el, id) {
  const title = el.querySelector(".edit-title").value.trim();
  const author = el.querySelector(".edit-author").value.trim();
  if (!title || !author) {
    alert("Both title and author are required");
    return;
  }
  const res = await fetch(`/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  });
  if (res.ok) fetchBooks();
  else alert("Failed to save");
}

// initial load: show list tab
showTab("list");

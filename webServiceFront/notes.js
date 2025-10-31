const API_BASE = 'http://localhost:3000';
const NOTES_BASE = `${API_BASE}/soleil/notes`;

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

let notes = [];
let editingNoteId = null;

const headersAuthOnly = { Authorization: token };
const headersJsonAuth = { 'Content-Type': 'application/json', Authorization: token };

const logoutBtn = document.getElementById('logoutBtn');
const noteForm = document.getElementById('noteForm');
const noteTitleEl = document.getElementById('noteTitle');
const noteContentEl = document.getElementById('noteContent');
const formTitleEl = document.getElementById('formTitle');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const listContainer = document.getElementById('notesListContainer');

function escapeHTML(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function setCreateMode() {
  editingNoteId = null;
  noteForm.reset();
  formTitleEl.textContent = 'Nouvelle note';
  saveNoteBtn.textContent = 'Ajouter la note';
  cancelEditBtn.style.display = 'none';
}

function setEditMode(note) {
  editingNoteId = note.id;
  noteTitleEl.value = note.title || '';
  noteContentEl.value = note.content || '';
  formTitleEl.textContent = 'Modifier la note';
  saveNoteBtn.textContent = 'Enregistrer les modifications';
  cancelEditBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchNotes() {
  const resp = await fetch(NOTES_BASE, { method: 'GET', headers: headersAuthOnly });
  if (!resp.ok) throw new Error(await resp.text().catch(() => `Erreur ${resp.status}`));
  const data = await resp.json().catch(() => []);
  notes = Array.isArray(data) ? data : (data.data || []);
  renderNotes();
}

async function createNote(payload) {
  const resp = await fetch(NOTES_BASE, {
    method: 'POST',
    headers: headersJsonAuth,
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(await resp.text().catch(() => `Erreur ${resp.status}`));
  return resp.json().catch(() => ({}));
}

async function updateNote(id, payload) {
  const resp = await fetch(`${NOTES_BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: headersJsonAuth,
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(await resp.text().catch(() => `Erreur ${resp.status}`));
  return resp.json().catch(() => ({}));
}

async function deleteNote(id) {
  const resp = await fetch(`${NOTES_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headersAuthOnly,
  });
  if (!resp.ok) throw new Error(await resp.text().catch(() => `Erreur ${resp.status}`));
  return true;
}

function renderNotes() {
  if (!notes || notes.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>Aucune note pour le moment</h3>
        <p>Créez votre première note ci-dessus</p>
      </div>
    `;
    return;
  }

  const items = notes.map(n => `
    <div class="note-card">
      <div class="note-title">${escapeHTML(n.title)}</div>
      <div class="note-content">${escapeHTML(n.content)}</div>
      <div class="note-actions" style="display:flex; gap:8px;">
        <button class="btn btn-small btn-edit icon-btn" data-action="edit" data-id="${n.id}" aria-label="Modifier">
          <!-- crayon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          <span>Modifier</span>
        </button>
        <button class="btn btn-small btn-delete icon-btn" data-action="delete" data-id="${n.id}" aria-label="Supprimer">
          <!-- corbeille -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  `).join('');

  listContainer.innerHTML = `<div class="notes-list">${items}</div>`;
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = noteTitleEl.value.trim();
  const content = noteContentEl.value.trim();
  if (!title || !content) return;

  try {
    if (editingNoteId !== null) {
      await updateNote(editingNoteId, { title, content });
    } else {
      await createNote({ title, content });
    }
    setCreateMode();
    await fetchNotes();
  } catch (err) {
    alert(err?.message || 'Enregistrement impossible');
  }
});

cancelEditBtn.addEventListener('click', () => setCreateMode());

listContainer.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const note = notes.find(n => String(n.id) === String(id));

  if (action === 'edit' && note) {
    setEditMode(note);
  }

  if (action === 'delete') {
    if (!confirm('Supprimer cette note ?')) return;
    try {
      await deleteNote(id);
      notes = notes.filter(n => String(n.id) !== String(id));
      renderNotes();
    } catch (err) {
      alert(err?.message || 'Suppression impossible');
    }
  }
});

setCreateMode();
fetchNotes().catch(err => {
  listContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Impossible de charger les notes</h3>
      <p>${escapeHTML(err?.message || 'Erreur réseau')}</p>
    </div>
  `;
});

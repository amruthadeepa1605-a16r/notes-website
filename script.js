document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('noteForm');
    const notesGrid = document.getElementById('notesGrid');
    const imageUpload = document.getElementById('imageUpload');
    
    let notes = JSON.parse(localStorage.getItem('websiteNotes')) || [];
    let editingId = null;

    // Load notes on start
    renderNotes();

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        
        if (!title || !content) {
            alert('Please fill title and content');
            return;
        }

        const imageData = imageUpload.dataset.image || null;
        const now = new Date().toLocaleString();

        if (editingId) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === editingId);
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                image: imageData,
                updated: now
            };
            editingId = null;
            form.querySelector('button').textContent = 'Add Note';
        } else {
            // Add new note
            notes.unshift({
                id: Date.now(),
                title,
                content,
                image: imageData,
                created: now,
                updated: now
            });
        }

        saveNotes();
        form.reset();
        delete imageUpload.dataset.image;
        renderNotes();
    });

    // Image upload preview
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imageUpload.dataset.image = event.target.result;
                showImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function showImagePreview(imageData) {
        // Simple preview in form
        let preview = document.querySelector('.image-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = '<img src="" style="width:100%;border-radius:12px;margin-bottom:15px;">';
            document.querySelector('.add-note').insertBefore(preview, document.querySelector('.form-actions'));
        }
        preview.querySelector('img').src = imageData;
    }

    function renderNotes() {
        if (notes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-edit"></i>
                    <p>No notes yet. Add your first one!</p>
                </div>
            `;
            return;
        }

        notesGrid.innerHTML = notes.map(note => `
            <div class="note-card">
                <div class="note-header">
                    <div>
                        <h3 class="note-title">${escapeHtml(note.title)}</h3>
                        <div class="note-date">${note.updated}</div>
                    </div>
                    <div class="note-actions">
                        <button class="btn-edit" onclick="editNote(${note.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteNote(${note.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${note.image ? `<img src="${note.image}" alt="Note image" class="note-image">` : ''}
                <p class="note-content">${escapeHtml(note.content)}</p>
            </div>
        `).join('');
    }

    function editNote(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').value = note.content;
            if (note.image) {
                imageUpload.dataset.image = note.image;
                showImagePreview(note.image);
            }
            editingId = id;
            form.querySelector('button').textContent = 'Update Note';
            document.getElementById('noteTitle').focus();
        }
    }

    function deleteNote(id) {
        if (confirm('Delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            renderNotes();
        }
    }

    function saveNotes() {
        localStorage.setItem('websiteNotes', JSON.stringify(notes));
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Global functions for onclick
    window.editNote = editNote;
    window.deleteNote = deleteNote;
});
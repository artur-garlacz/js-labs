class Storage {
  static getData(itemName) {
    const value = localStorage.getItem(itemName);
    if (!!value) {
      return JSON.parse(value);
    }

    return null;
  }

  static setData(itemName, values) {
    localStorage.setItem(itemName, values);
  }
}

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join(",");

class NoteList {
  notes = [];
  searchText = "";

  constructor() {
    this.notes = Storage.getData("notes") || [];
  }

  saveNotes() {
    Storage.setData("notes", JSON.stringify(this.notes));
  }

  addNote(note) {
    const newNote = {
      ...note,
      id: uuidv4(),
      createdAt: new Date(),
      isComplete: false,
    };

    this.notes.push(newNote);
    this.saveNotes();
  }

  deleteNote(id) {
    const notes = this.notes.filter((note) => note.id !== id);
    this.notes = [...notes];
    this.saveNotes();
  }

  editNote(updatedNote) {
    const notes = this.notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    this.notes = [...notes];
    this.saveNotes();
  }

  toggleMarkAsDone(id) {
    const notes = this.notes.map((note) => {
      if (note.id === id) {
        note.isComplete = !note.isComplete;
      }
      return note;
    });
    this.notes = [...notes];
    this.saveNotes();
  }

  filterNotes(value) {
    this.searchText = value;
    const notes = this.notes.filter(
      (note) =>
        note.title.indexOf(value) !== -1 || note.content.indexOf(value) !== -1
    );
    console.log(notes, "filtered");
    return notes;
  }
}

const createSubmitBtn = document.getElementById("createNote");
const editSubmitBtn = document.getElementById("editNote");
const remainingNotesContainer = document.getElementById("remainingNotes");
const doneNotesContainer = document.getElementById("doneNotes");
const searchInp = document.getElementById("search");

class App {
  noteList = new NoteList();
  silentMode = false;
  currentEditingNote;

  initialize() {
    // document.querySelector("input[type='datetime-local']").min =
    //   new Date().toISOString();
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    document.getElementById("remindAt").min = now.toISOString().slice(0, 16);
    document.getElementById("remindAt").value = now.toISOString().slice(0, 16);

    createSubmitBtn.addEventListener("click", () => {
      this.handleCreateNote();
    });
    editSubmitBtn.addEventListener("click", () => {
      this.handleEditNote();
    });
    searchInp.addEventListener("keyup", (e) => {
      this.handleFilteringNote(e);
    });

    this.renderNotes();
  }

  handleCreateNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const color = document.getElementById("color").value;
    const tag = document.getElementById("tag").value;
    const pin = document.getElementById("pin").checked;
    const showReminder = document.getElementById("showReminder").checked;
    const remindAt = document.getElementById("remindAt").value;

    const note = {
      title,
      content,
      color,
      pin,
      tags: [tag],
      remindAt: showReminder ? remindAt : null,
    };
    this.noteList.addNote(note);
    this.renderNotes();
  }

  setNoteValuesToEditForm(note) {
    this.currentEditingNote = note;
    document.getElementById("editTitle").value = note.title;
    document.getElementById("editContent").value = note.content;
    document.getElementById("editColor").value = note.color;
    document.getElementById("editPin").checked = note.pin;
  }

  handleEditNote() {
    const title = document.getElementById("editTitle").value;
    const content = document.getElementById("editContent").value;
    const color = document.getElementById("editColor").value;
    const pin = document.getElementById("editPin").checked;

    const note = {
      ...this.currentEditingNote,
      title,
      content,
      color,
      pin,
    };

    this.noteList.editNote(note);
    this.renderNotes();
  }

  handleDeleteNote(id) {
    this.noteList.deleteNote(id);
    this.renderNotes();
  }

  handleToggleNote(id) {
    this.noteList.toggleMarkAsDone(id);
    this.renderNotes();
  }

  handleFilteringNote(e) {
    const notes = this.noteList.filterNotes(e.target.value);
    this.renderNotes(notes);
  }

  renderNote(note) {
    const createElement = document.createElement("li");
    createElement.className = "note p-3";
    const rgbColor = hexToRgb(note.color);
    createElement.style.background = `rgba(${rgbColor},0.12)`;

    createElement.innerHTML = `
      <div>
        <h3 class="note-title">${note.title || "-"}</h3>
      </div>
      <p class="m-0">${note.content || "-"}</p>
      <div class="d-flex justify-content-between w-100">
        <p class="m-0">${note.tags?.map((tag) => tag) || "-"}</p></br>
        <p class="m-0">${new Date(note.createdAt).toDateString() || "-"}</p>
      </div>
    `;

    // toggle action
    const createToggleBtn = document.createElement("button");
    createToggleBtn.innerText = note.isComplete ? "Move to do" : "Mark as done";
    createToggleBtn.addEventListener("click", () =>
      this.handleToggleNote(note.id)
    );

    // delete action
    const createDeleteBtn = document.createElement("button");
    createDeleteBtn.innerText = "Delete";
    createDeleteBtn.addEventListener("click", () =>
      this.handleDeleteNote(note.id)
    );

    // edit action
    const createEditBtn = document.createElement("button");
    createEditBtn.innerText = "Edit";
    createEditBtn.setAttribute("data-toggle", "modal");
    createEditBtn.setAttribute("data-target", "#editModal");
    createEditBtn.addEventListener("click", () =>
      this.setNoteValuesToEditForm(note)
    );

    if (note.remindAt && !this.silentMode) {
      const wait = new Date(note.remindAt).getTime() - Date.now();

      if (wait > 0) {
        setTimeout(() => {
          alert("Przypomnienie wydarzenia: " + note.title);
        }, wait);
      }
    }

    createElement.appendChild(createToggleBtn);
    createElement.appendChild(createDeleteBtn);
    createElement.appendChild(createEditBtn);
    const listContainer = note.isComplete
      ? doneNotesContainer
      : remainingNotesContainer;
    listContainer.appendChild(createElement);
  }

  renderNotes(notes = this.noteList.notes) {
    remainingNotesContainer.innerHTML = "";
    doneNotesContainer.innerHTML = "";

    if (!notes || !notes.length) return;

    notes.forEach((note) => this.renderNote(note));
  }
}

const newApp = new App();
newApp.initialize();

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
        note.title.indexOf(value) !== -1 ||
        note.content.indexOf(value) !== -1 ||
        note.tags.some((tag) => tag.indexOf(value) !== -1)
    );
    return notes;
  }
}

const createNoteBtn = document.getElementById("createNote");
const saveNoteBtn = document.getElementById("saveNote");
const remainingNotesContainer = document.getElementById("remainingNotes");
const doneNotesContainer = document.getElementById("doneNotes");
const searchInp = document.getElementById("search");
const modalLabel = document.getElementById("modalLabel");

// class Form {

// }

class App {
  noteList = new NoteList();
  silentMode = false;
  currentEditingNote;

  initialize() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    document.getElementById("remindAt").min = now.toISOString().slice(0, 16);
    document.getElementById("remindAt").value = now.toISOString().slice(0, 16);

    createNoteBtn.onclick = () => this.setNoteDefaultValuesToForm(null);
    saveNoteBtn.onclick = () => this.handleSubmitNote();
    searchInp.addEventListener("keyup", (e) => {
      this.handleFilteringNote(e);
    });

    this.renderNotes();
  }

  getSubmittedValues() {
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

    return note;
  }

  setNoteDefaultValuesToForm(note) {
    this.currentEditingNote = note;

    if (!!note) {
      modalLabel.innerText = "Edit note";
    } else {
      modalLabel.innerText = "Create note";
    }

    document.getElementById("title").value = note?.title || "";
    document.getElementById("content").value = note?.content || "";
    document.getElementById("color").value = note?.color || "";
    document.getElementById("tag").value = note?.tags[0] || "";
    document.getElementById("pin").checked = note?.pin || false;
    document.getElementById("showReminder").checked = !!note?.remindAt || false;
    document.getElementById("remindAt").value = note?.remindAt || "";
  }

  handleSubmitNote() {
    console.log("sumbitted note");
    const note = this.getSubmittedValues();
    if (!!this.currentEditingNote) {
      this.handleEditNote(note);
    } else {
      this.handleCreateNote(note);
    }
  }

  handleCreateNote(note) {
    this.noteList.addNote(note);
    this.renderNotes();
  }

  handleEditNote(note) {
    const updatedNote = {
      ...this.currentEditingNote,
      ...note,
    };

    this.noteList.editNote(updatedNote);
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
    const noteElement = document.createElement("div");
    noteElement.className = "note p-3";
    const rgbColor = hexToRgb(note.color);
    noteElement.style.borderColor = note.color;
    noteElement.style.background = `rgba(${rgbColor},0.12)`;

    noteElement.innerHTML = `
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
    createEditBtn.setAttribute("data-target", "#modal");
    createEditBtn.addEventListener("click", () =>
      this.setNoteDefaultValuesToForm(note)
    );

    const taskList = document.createElement("ul");

    [{ name: "new", isComplete: true }].forEach((task) => {
      let li = document.createElement("li");
      li.innerText = task.name;
      li.style.textDecorationLine = "line-through";
      taskList.appendChild(li);
    });

    if (note.remindAt && !this.silentMode) {
      const wait = new Date(note.remindAt).getTime() - Date.now();

      if (wait > 0) {
        setTimeout(() => {
          alert("Przypomnienie wydarzenia: " + note.title);
        }, wait);
      }
    }

    noteElement.appendChild(taskList);
    noteElement.appendChild(createToggleBtn);
    noteElement.appendChild(createDeleteBtn);
    noteElement.appendChild(createEditBtn);
    const listContainer = note.isComplete
      ? doneNotesContainer
      : remainingNotesContainer;
    listContainer.appendChild(noteElement);
  }

  renderTask(task) {
    let li = document.createElement("li");
    li.innerText = task.name;
    li.style.textDecorationLine = task.isComplete ? "line-through" : "none";
    li.onclick = () => (task.isComplete = !task.isComplete);
    taskList.appendChild(li);
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

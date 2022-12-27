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

const submitBtn = document.getElementById("create_task");
const remainingNotesContainer = document.getElementById("remaining-notes");
const doneNotesContainer = document.getElementById("done-notes");
const searchInp = document.getElementById("search");

// const app = {
//   notes: Storage.getData("notes") || [],
//   searchText: "",
//   init() {
//     submitBtn.addEventListener("click", () => {
//       this.addNoteToList();
//     });
//     searchInp.addEventListener("keyup", (e) => {
//       this.filterNotes(e);
//     });
//     this.renderList(this.notes);
//   },
//   renderList(notes) {
//     listContainer.innerHTML = "";

//     if (!notes || !notes.length) return;

//     notes.forEach((note) => this.renderNoteItem(note));
//   },
//   renderNoteItem(note) {
//     const createElement = document.createElement("li");
//     createElement.className = "note p-3";
//     const rgbColor = hexToRgb(note.color);
//     createElement.style.background = `rgba(${rgbColor},0.12)`;

//     // const createDeleteBtn = document.createElement("button");
//     // createDeleteBtn.innerText = "Delete";
//     // createDeleteBtn.addEventListener("click", () => {
//     //   this.deleteNote(note.id);
//     // });

//     createElement.innerHTML = `
//     <div>
//       <h3 class="note-title">${note.title || "-"}</h3>
//       <span class="edit-note">Edit</span>
//       <span class="delete-note">Delete</span>
//     </div>
//     <div class="d-flex justify-content-between w-100">
//       <p class="m-0">${note.content || "-"}</p>
//       <p class="m-0">${note.createdAt || "-"}</p>
//     </div>
//     `;

//     listContainer.appendChild(createElement);

//     listContainer
//       .querySelector(".delete-note")
//       .addEventListener("click", () => {
//         this.deleteNote(note.id);
//       });

//     listContainer.querySelector(".edit-note").addEventListener("click", () => {
//       this.deleteNote(note.id);
//     });
//   },
//   addNoteToList() {
//     const title = document.getElementById("title").value;
//     const content = document.getElementById("content").value;
//     const color = document.getElementById("color").value;
//     const pin = document.getElementById("pin").value;
//     const newNote = {
//       id: uuidv4(),
//       title,
//       content,
//       color,
//       pin,
//       createdAt: new Date(),
//       isComplete: false,
//     };

//     this.notes.push(newNote);
//     this.renderNoteItem(newNote);
//     Storage.setData("notes", JSON.stringify(this.notes));
//   },
//   filterNotes(e) {
//     const { value } = e.target;
//     this.searchText = value;
//     const notes = this.notes.filter(
//       (note) =>
//         note.title.indexOf(value) !== -1 || note.content.indexOf(value) !== -1
//     );
//     console.log(notes, "filtered");
//     this.renderList(notes);
//   },
//   deleteNote(id) {
//     console.log(id);
//     const notes = this.notes.filter((note) => note.id == id);
//     this.notes = [...notes];
//     Storage.setData("notes", JSON.stringify(this.notes));
//     this.renderList(notes);
//   },
//   editNote(updatedNote) {
//     const notes = this.notes.map((note) =>
//       note.id === updatedNote.id ? updatedNote : note
//     );

//     // Storage.setData("notes", JSON.stringify(this.notes));
//     // this.renderList(notes);
//   },
//   markNoteAsCompleted(e) {},
// };

// app.init();

class App {
  noteList = new NoteList();

  initialize() {
    submitBtn.addEventListener("click", () => {
      this.handleCreateNote();
    });
    searchInp.addEventListener("keyup", (e) => {
      this.handleFilteringNote(e);
    });
    // this.renderList(this.notes);
    this.renderNotes();
  }

  handleCreateNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const color = document.getElementById("color").value;
    const pin = document.getElementById("pin").checked;

    const note = {
      title,
      content,
      color,
      pin,
    };
    this.noteList.addNote(note);
    this.renderNotes();
  }

  handleEditNote(id) {
    this.noteList.editNote(id);
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
      <div class="d-flex justify-content-between w-100">
        <p class="m-0">${note.content || "-"}</p>
        <p class="m-0">${note.createdAt || "-"}</p>
      </div>
    `;

    // toggle action
    const createToggleBtn = document.createElement("button");
    createToggleBtn.innerText = "Toggle";
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
    createEditBtn.addEventListener("click", () => this.handleEditNote(note.id));

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

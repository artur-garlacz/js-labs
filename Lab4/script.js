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
    console.log(updatedNote);
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
    const notes = this.notes.filter(
      (note) =>
        note.title.indexOf(value) !== -1 ||
        note.content.indexOf(value) !== -1 ||
        note.tags.some((tag) => tag.indexOf(value) !== -1)
    );
    return notes;
  }

  changeTaskStatus(noteId, taskId) {
    this.notes.map((note) => {
      if (note.id === noteId) {
        note.tasks = note.tasks.map((task) =>
          task.id === taskId ? { ...task, isComplete: !task.isComplete } : task
        );

        return note;
      }

      return note;
    });
    this.saveNotes();
  }
}

const createNoteBtn = document.getElementById("createNote");
const saveNoteBtn = document.getElementById("saveNote");
const remainingNotesContainer = document.getElementById("remainingNotes");
const doneNotesContainer = document.getElementById("doneNotes");
const searchInp = document.getElementById("search");
const modalLabel = document.getElementById("modalLabel");

// ---------------------------------------------------------
class Form {
  currentEditingNote;

  constructor() {
    document.getElementById("addTask").onclick = () => this.addNewTaskField();
    createNoteBtn.onclick = () => this.setNoteDefaultValuesToForm(null);
  }

  getSubmittedValues() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const color = document.getElementById("color").value;
    const tag = document.getElementById("tag").value;
    const pin = document.getElementById("pin").checked;
    const showReminder = document.getElementById("showReminder").checked;
    const remindAt = document.getElementById("remindAt").value;
    const taskList = document.querySelectorAll("input.task");

    const tasks = [];
    taskList.forEach((task) => {
      task.value !== "" &&
        tasks.push({ id: uuidv4(), name: task.value, isComplete: false });
    });
    console.log(taskList, tasks);

    const note = {
      ...this.currentEditingNote,
      title,
      content,
      color,
      pin,
      tags: [tag],
      remindAt: remindAt,
      showReminder,
      tasks,
    };

    console.log(note);

    return note;
  }

  setNoteDefaultValuesToForm(note) {
    this.currentEditingNote = note;

    if (!!note) {
      modalLabel.innerText = "Edit note";
    } else {
      modalLabel.innerText = "Create note";
    }

    const taskList = document.getElementById("taskList");

    document.getElementById("title").value = note?.title || "";
    document.getElementById("content").value = note?.content || "";
    document.getElementById("color").value = note?.color || "";
    document.getElementById("tag").value = note?.tags[0] || "";
    document.getElementById("pin").checked = note?.pin || false;
    document.getElementById("showReminder").checked =
      note?.showReminder || false;
    document.getElementById("remindAt").value = note?.remindAt || "";

    taskList.innerHTML = "";
    if (!!note?.tasks && !!note?.tasks.length) {
      note.tasks.forEach((task) => {
        this.addNewTaskField(task.name);
      });
    }
  }

  addNewTaskField(inpValue) {
    const taskList = document.getElementById("taskList");

    let li = document.createElement("li");
    li.className = "d-flex mb-2";

    let taskInp = document.createElement("input");
    taskInp.className = "task form-control";
    taskInp.setAttribute("placeholder", "New task");
    taskInp.value = inpValue || "";

    const removeBtn = document.createElement("button");
    removeBtn.innerText = "x";
    removeBtn.setAttribute("type", "button");
    removeBtn.addEventListener("click", (e) => {
      this.removeTaskField(e.target.parentNode);
    });

    li.appendChild(taskInp);
    li.appendChild(removeBtn);

    taskList.appendChild(li);
  }

  removeTaskField(node) {
    const taskList = document.getElementById("taskList");
    taskList.removeChild(node);
  }
}

// ---------------------------------------------------------

class App {
  noteList = new NoteList();
  form = new Form();
  silentMode = false;
  currentEditingNote;

  init() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    document.getElementById("remindAt").min = now.toISOString().slice(0, 16);
    document.getElementById("remindAt").value = now.toISOString().slice(0, 16);

    saveNoteBtn.onclick = () => this.handleSubmitNote();

    searchInp.addEventListener("keyup", (e) => {
      this.handleFilteringNote(e);
    });

    this.renderNotes();
  }

  handleSubmitNote() {
    const note = this.form.getSubmittedValues();
    if (!!this.form.currentEditingNote) {
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

    console.log(updatedNote);

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

  handleChangeTaskStatus(noteId, taskId) {
    this.noteList.changeTaskStatus(noteId, taskId);
    this.renderNotes();
  }

  renderNote(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "note p-3";
    const rgbColor = hexToRgb(note.color);
    noteElement.style.borderColor = note.color;
    noteElement.style.background = `rgba(${rgbColor},0.12)`;

    noteElement.innerHTML = `
      <div>
        <h3 class="note-title">${note.title || "-"} ${
      !!note.pin ? '<i class="fa fa-bookmark"></i>' : ""
    }</h3>
        
        </div>
      <p class="my-2">${note.content || "-"}</p>
      <div class="d-flex justify-content-between w-100">
        <p class="m-0 note-tag">${note.tags?.map((tag) => tag) || "-"}</p></br>
        <p class="m-0">${new Date(note.createdAt).toDateString() || "-"}</p>
      </div>
    `;

    // toggle action
    const createToggleBtn = document.createElement("button");
    createToggleBtn.className = "btn";
    createToggleBtn.innerText = note.isComplete ? "Move to do" : "Mark as done";
    createToggleBtn.addEventListener("click", () =>
      this.handleToggleNote(note.id)
    );

    // delete action
    const createDeleteBtn = document.createElement("button");
    createDeleteBtn.innerText = "Delete";
    createDeleteBtn.className = "btn";
    createDeleteBtn.addEventListener("click", () =>
      this.handleDeleteNote(note.id)
    );

    // edit action
    const createEditBtn = document.createElement("button");
    createEditBtn.innerText = "Edit";
    createEditBtn.className = "btn";
    createEditBtn.setAttribute("data-toggle", "modal");
    createEditBtn.setAttribute("data-target", "#modal");
    createEditBtn.addEventListener("click", () =>
      this.form.setNoteDefaultValuesToForm(note)
    );

    if (!!note?.tasks?.length) {
      const taskList = document.createElement("ul");
      taskList.className = "p-3";
      note.tasks?.forEach((task) => {
        taskList.appendChild(this.getRenderedTask(note.id, task));
      });
      noteElement.appendChild(taskList);
    }

    if (note.remindAt && !this.silentMode) {
      const wait = new Date(note.remindAt).getTime() - Date.now();

      if (wait > 0) {
        setTimeout(() => {
          alert("Przypomnienie wydarzenia: " + note.title);
        }, wait);
      }
    }

    noteElement.appendChild(createToggleBtn);
    noteElement.appendChild(createDeleteBtn);
    noteElement.appendChild(createEditBtn);
    const listContainer = note.isComplete
      ? doneNotesContainer
      : remainingNotesContainer;
    listContainer.appendChild(noteElement);
  }

  getRenderedTask(noteId, task) {
    let li = document.createElement("li");
    li.innerText = task.name;
    li.className = "cursor-pointer";
    li.style.textDecorationLine = task.isComplete ? "line-through" : "none";
    li.onclick = () => {
      this.handleChangeTaskStatus(noteId, task.id);
    };

    return li;
  }

  renderNotes(notes) {
    notes = notes || this.noteList.notes;
    remainingNotesContainer.innerHTML = "";
    doneNotesContainer.innerHTML = "";

    if (!notes || !notes.length) return;

    const sortedNotes = notes.sort((a, b) => b.pin - a.pin);

    sortedNotes.forEach((note) => this.renderNote(note));
  }
}

const newApp = new App();
newApp.init();

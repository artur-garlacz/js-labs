class Storage {
  static getData(itemName) {
    const value = localStorage.getItem(itemName);
    console.log(value);
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

const submitBtn = document.getElementById("create_task");
const listContainer = document.querySelector("ul.list-container");
const searchInp = document.getElementById("search");

const app = {
  notes: Storage.getData("notes") || [],
  searchText: "",
  init() {
    submitBtn.addEventListener("click", () => {
      this.addNoteToList();
    });
    searchInp.addEventListener("keyup", (e) => {
      this.filterNotes(e);
    });
    this.renderList(this.notes);
  },
  renderList(notes) {
    listContainer.innerHTML = "";

    if (!notes || !notes.length) return;

    notes.forEach((note) => this.renderNoteItem(note));
  },
  renderNoteItem(note) {
    const createElement = document.createElement("li");
    createElement.className = "note p-3";
    const rgbColor = hexToRgb(note.color);
    createElement.style.background = `rgba(${rgbColor},0.12)`;

    const createDeleteBtn = document.createElement("button");
    createDeleteBtn.addEventListener("click", () => {
      this.deleteNote(note.id);
    });

    createElement.innerHTML = `
    <h3 class="note-title">${note.title || "-"}</h3>
    <div class="d-flex justify-content-between w-100">
      <p class="m-0">${note.content || "-"}</p>
      <p class="m-0">${note.createdAt || "-"}</p>
    </div>
    `;

    createElement.appendChild(createDeleteBtn);
    listContainer.appendChild(createElement);
  },
  addNoteToList() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const color = document.getElementById("color").value;
    const pin = document.getElementById("pin").value;
    const newNote = {
      id: uuidv4(),
      title,
      content,
      color,
      pin,
      createdAt: new Date(),
      isComplete: false,
    };

    this.notes.push(newNote);
    this.renderNoteItem(newNote);
    Storage.setData("notes", JSON.stringify(this.notes));
  },
  filterNotes(e) {
    const { value } = e.target;
    this.searchText = value;
    const notes = this.notes.filter(
      (note) =>
        note.title.indexOf(value) !== -1 || note.content.indexOf(value) !== -1
    );
    console.log(notes, "filtered");
    this.renderList(notes);
  },
  deleteNote(id) {
    console.log(id);
    const notes = this.notes.filter((note) => note.id == id);
    this.notes = [...notes];
    Storage.setData("notes", JSON.stringify(this.notes));
    this.renderList(notes);
  },
  markNoteAsCompleted(e) {},
};

app.init();

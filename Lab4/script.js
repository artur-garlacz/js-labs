class Note {
  tag = null;
  remindAt = null;
  title;
  content;
  color;
  pin;
  createdAt;

  constructor({ title, content, color, pin }) {
    this.title = title;
    this.content = content;
    this.color = color;
    this.pin = pin;
    this.createdAt = new Date();
  }

  updateTag(tag) {
    this.tag = tag;
  }

  updateRemidAt(time) {
    this.remindAt = time;
  }
}

class Storage {
  static getData(itemName) {
    const value = JSON.parse(localStorage.getItem(itemName));
    console.log(value);
    if (value) {
      return value;
    }

    return null;
  }

  static setData(itemName, values) {
    localStorage.setItem(itemName, values);
  }
}

const submitBtn = document.getElementById("create_task");
const listContainer = document.querySelector("ul.list-container");

const app = {
  notes: Storage.getData("notes") || [],
  init() {
    submitBtn.addEventListener("click", () => {
      this.addNoteToList();
    });
    this.renderList();
  },
  renderList() {
    if (!this.notes || !this.notes.length) return;

    this.notes.forEach((note) => this.renderNoteItem(note));
  },
  renderNoteItem(note) {
    const createElement = document.createElement("li");
    createElement.innerText = "ELlo";
    listContainer.appendChild(createElement);
  },
  addNoteToList() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const color = document.getElementById("color").value;
    const pin = document.getElementById("color").value;

    this.notes.push({
      title,
      content,
      color,
      pin,
    });
    this.renderNoteItem();
    Storage.setData("notes", JSON.stringify(this.notes));
  },
};

app.init();

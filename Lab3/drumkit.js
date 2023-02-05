const sounds = [
  "boom",
  "clap",
  "hihat",
  "kick",
  "openhat",
  "ride",
  "snare",
  "tink",
  "tom",
];

const chars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const playAllTracksBtn = document.getElementById("playAllTracks");
const playSelectedTracksBtn = document.getElementById("playSelectedTracks");
const createTrackBtn = document.getElementById("createTrack");
const turnOnMetronomeBtn = document.getElementById("turnOnMetronome");
const turnOffMetronomeBtn = document.getElementById("turnOffMetronome");
const metronomeBpm = document.getElementById("metronomeBpm");

function playSound(url, options) {
  return new Promise(function (resolve, reject) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.autoplay = true;
    audio.onerror = reject;
    audio.onended = resolve;

    audio.src = url;
  });
}

function getArrayIndex(array, index) {
  if (array.length % index === 0) return 0;

  if (array.length <= index) {
    let laps = Math.floor(index / array.length);
    return index - laps * array.length;
  }

  return index;
}

const KeyToSound = chars.reduce((prev, curr, index) => {
  let idx = getArrayIndex(sounds, index);
  return { ...prev, [curr]: sounds[idx] };
}, {});

const app = {
  currentTrack: null,
  selectedTracks: [],
  trackRecordings: {},
  metronome: null,
  init() {
    document.addEventListener("keypress", (e) => this.onKeyPress(e));
    this.assingTracks();
    this.initSelectingTrack();
    playAllTracksBtn.onclick = () => this.playAllRecordings();
    playSelectedTracksBtn.onclick = () => this.playSelectedRecordings();
    createTrackBtn.onclick = () => this.createTrack();
    turnOnMetronomeBtn.onclick = () => this.turnOnMetronome();
    turnOffMetronomeBtn.onclick = () => this.turnOffMetronome();
  },
  onKeyPress(event) {
    const sound = KeyToSound[event.key];
    if (!sound) return;

    this.setPlayer(sound);
  },
  setPlayer(sound) {
    this.addSoundToRecording(sound);
    playSound(`./sounds/${sound}.wav`);
  },
  addSoundToRecording(sound) {
    if (!this.currentTrack) return;

    this.trackRecordings[this.currentTrack].push({
      sound,
      startTime: Date.now(),
    });
  },
  initTrackRecordings(trackId) {
    this.trackRecordings[trackId] = [];
  },
  initSelectingTrack() {
    document.querySelectorAll(".track").forEach((track) => {
      track.querySelector("input").onclick = () => {
        this.selectedTracks.push(track.getAttribute("id"));
      };
    });
  },
  playAllRecordings() {
    Object.keys(this.trackRecordings).forEach((trackId) => {
      this.playRecording(trackId);
    });
  },
  playSelectedRecordings() {
    if (!this.selectedTracks.length) return;

    this.selectedTracks.forEach((track) => {
      this.playRecording(track);
    });
  },
  playRecording(currentTrack) {
    console.log(currentTrack, "playRecording");
    currentTrack = currentTrack || this.currentTrack;
    if (!currentTrack || !this.trackRecordings[currentTrack].length) return;

    const playlist = this.trackRecordings[currentTrack];

    let delayTime = 0;
    playlist.forEach(({ sound, startTime }, idx) => {
      delayTime +=
        idx === 0 ? delayTime : startTime - playlist[idx - 1].startTime;
      setTimeout(() => {
        playSound(`./sounds/${sound}.wav`);
      }, delayTime);
    });
  },
  assingTracks() {
    const tracks = document.getElementsByClassName("track");

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const trackId = track.getAttribute("id");
      this.initTrackRecordings(trackId);

      this.assingPlayerButton(track);
      track.addEventListener("click", (e) => {
        this.toggleSelectedTrack(e);
      });
    }
  },
  createTrack() {
    const tracks = document.getElementsByClassName("track");

    const track = document.createElement("div");
    track.setAttribute("id", `track${tracks.length + 1}`);
    track.className = "track";

    const inp = document.createElement("input");
    inp.setAttribute("type", "checkbox");

    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.innerText = "Play";

    const cleanBtn = document.createElement("button");
    cleanBtn.className = "clear-btn";
    cleanBtn.innerText = "Clear";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerText = "Remove";

    track.innerText = tracks.length + 1;
    track.appendChild(playBtn);
    track.appendChild(inp);
    track.appendChild(cleanBtn);
    track.appendChild(removeBtn);
    document.querySelector(".tracks").appendChild(track);

    this.assingTracks();
    this.initSelectingTrack();
  },
  removeTrack(track, trackId) {
    document.querySelector(".tracks").removeChild(track);
    this.trackRecordings[trackId] = [];
  },
  toggleSelectedTrack(e) {
    console.log(e.target, this.currentTrack, e.target.getAttribute("id"));

    if (!!this.currentTrack) {
      document
        .getElementById(this.currentTrack)
        .classList.remove("track-active");
    }
    const trackId = e.target.getAttribute("id");
    this.currentTrack = trackId;
    e.target.classList.add("track-active");
  },
  assingPlayerButton(track) {
    const trackId = track.getAttribute("id");
    track.querySelector("button.play-btn").addEventListener("click", (e) => {
      e.stopPropagation();

      this.playRecording(trackId);
    });

    track.querySelector("button.clear-btn").addEventListener("click", (e) => {
      e.stopPropagation();

      this.clearTrackRecording(trackId);
    });

    track.querySelector("button.remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeTrack(track, trackId);
    });
  },
  clearTrackRecording(trackId) {
    this.trackRecordings[trackId] = [];
  },
  turnOnMetronome() {
    const bpm = metronomeBpm.value;
    if (!bpm) return;
    const delay = 60000 / parseInt(bpm);
    console.log(delay, bpm);

    if (this.metronome) {
      clearInterval(this.metronome);
    }

    this.metronome = setInterval(() => playSound("./sounds/tink.wav"), delay);
  },
  turnOffMetronome() {
    clearInterval(this.metronome);
  },
};

app.init();

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

const tracks = document.getElementsByClassName("track");

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
  trackRecordings: {},
  init() {
    document.addEventListener("keypress", (e) => this.onKeyPress(e));
    this.assingTracks();
  },
  onKeyPress(event) {
    const sound = KeyToSound[event.key];
    this.setPlayer(sound);
  },
  setPlayer(sound) {
    const player = document.querySelector("#player");
    player.setAttribute("src", `./sounds/${sound}.wav`);
    this.addSoundToRecording(sound);
    this.playSound(player);
  },
  playSound(sound) {
    sound.currentTime = 0;
    sound.play();
  },
  addSoundToRecording(sound) {
    console.log(sound);
    if (!this.currentTrack) return;

    this.trackRecordings[this.currentTrack].push(sound);
  },
  initTrackRecordings(trackId) {
    this.trackRecordings[trackId] = [];
  },
  playRecording(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("playRecording");

    if (!this.currentTrack || !this.trackRecordings[this.currentTrack].length)
      return;

    this.trackRecordings[this.currentTrack].forEach((sound) => {
      this.setPlayer(sound);
    });
  },
  assingTracks() {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const trackId = track.getAttribute("id");
      this.initTrackRecordings(trackId);

      this.assingPlayerButton(track);
      track.addEventListener("click", (e) => this.toggleSelectedTrack(e));
    }
  },
  toggleSelectedTrack(e) {
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
    track
      .querySelector("button")
      .addEventListener("click", (e) => this.playRecording(e));
  },
};

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

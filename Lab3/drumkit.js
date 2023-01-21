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

function playSound(url) {
  return new Promise(function (resolve, reject) {
    console.log("audio");

    // return a promise
    const audio = new Audio(); // create audio wo/ src
    audio.preload = "auto"; // intend to play through
    audio.autoplay = true; // autoplay when loaded
    audio.onerror = reject; // on error, reject
    audio.onended = resolve; // when done, resolve

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
  init() {
    document.addEventListener("keypress", (e) => this.onKeyPress(e));
    this.assingTracks();
    this.initSelectingTrack();
    playAllTracksBtn.onclick = () => this.playAllRecordings();
    playSelectedTracksBtn.onclick = () => this.playSelectedRecordings();
    createTrackBtn.onclick = () => this.createTrack();
  },
  onKeyPress(event) {
    const sound = KeyToSound[event.key];
    this.setPlayer(sound);
  },
  setPlayer(sound, playerId = "#player") {
    const player = document.querySelector(playerId);
    player.setAttribute("src", `./sounds/${sound}.wav`);
    this.addSoundToRecording(sound);
    console.log(sound)
    // this.playSound(player);
    playSound(`./sounds/${sound}.wav`);
  },
  // playSound(sound) {
  //   sound.currentTime = 0;
  //   const playPromise = sound.play();

  //   console.log(sound, playPromise);

  //   if (playPromise != undefined) {
  //     playPromise
  //       .then(() => {
  //         sound.pause();
  //       })
  //       .catch((err) => console.log(err));
  //   }
  // },
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
      track.querySelector("input").addEventListener("click", (e) => {
        this.selectedTracks.push(track.getAttribute("id"));
      });
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
    // this.setPlayer(sound, `#${this.currentTrack}-player`);
    console.log("SOUND");
    
    let delayTime = 0;
    playlist.forEach(({ sound, startTime }, idx) => {
      delayTime +=
        idx === 0 ? delayTime : startTime - playlist[idx - 1].startTime;
      setTimeout(() => {
        // const audio = new Audio();
        // audio.loop = false;
        // audio.src = `./sounds/${sound}.wav`;
        // console.log(audio, audio.src);
        // audio.play();
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
      track.addEventListener("click", (e) => this.toggleSelectedTrack(e));
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
    playBtn.innerText = "Play";

    track.innerText = tracks.length + 1;
    track.appendChild(playBtn);
    track.appendChild(inp);
    document.querySelector(".tracks").appendChild(track);

    this.assingTracks();
    this.initSelectingTrack();
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
    const trackId = track.getAttribute("id");
    track
      .querySelector("button.play-btn")
      .addEventListener("click", () =>
        this.playRecording(trackId)
      );
    
    track
      .querySelector("button.clear-btn")
      .addEventListener("click", () =>
        this.clearTrackRecording(trackId)
      );
  },
  clearTrackRecording(trackId){
    this.trackRecordings[trackId] = [];
  }
};

app.init();

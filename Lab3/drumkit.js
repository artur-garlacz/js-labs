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
  trackRecordings: {},
  init() {
    document.addEventListener("keypress", (e) => this.onKeyPress(e));
    this.assingTracks();
  },
  onKeyPress(event) {
    const sound = KeyToSound[event.key];
    this.setPlayer(sound);
  },
  setPlayer(sound, playerId = "#player") {
    const player = document.querySelector(playerId);
    player.setAttribute("src", `./sounds/${sound}.wav`);
    this.addSoundToRecording(sound);
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

    const playlist = this.trackRecordings[this.currentTrack];
    // this.setPlayer(sound, `#${this.currentTrack}-player`);
    console.log("SOUND");
    // playSound(`./sounds/${sound}.wav`);

    const audio = new Audio();
    let i = 0;

    audio.addEventListener(
      "ended",
      function () {
        console.log(i, playlist, playlist[i]);

        if (++i === playlist.length) {
          audio.pause();
        }
        audio.playbackRate = 0.2;
        audio.src = `./sounds/${playlist[i]}.wav`;
        audio.play();
      },
      true
    );
    audio.volume = 0.3;
    audio.loop = false;
    audio.playbackRate = 0.2;
    audio.src = `./sounds/${playlist[0]}.wav`;
    audio.play();

    // playSound(`./sounds/${playlist[0]}.wav`).then(() => {
    //   console.log(i, playlist, playlist[i]);

    //   i = ++i < playlist.length ? i : 0;
    //   playSound(`./sounds/${playlist[i]}.wav`);
    // });
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

app.init();

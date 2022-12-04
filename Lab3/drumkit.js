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

function onKeyPress(event) {
  const sound = KeyToSound[event.key];
  const player = document.querySelector("#s1");
  player.setAttribute("src", `./sounds/${sound}.wav`);
  playSound(player);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

// function assingTracks() {
//   const tracks = document.getElementsByClassName("track");

//   for (let i = 0; tracks.length; i++) {
//     const track = tracks[i];
//     track.addEventListener("click", () => {});
//   }
// }

const app = {
  currentTrack: 0,
  init() {
    document.addEventListener("keypress", this.onKeyPress);
    this.assingTracks();

    if (this.currentTrack) {
    }
  },
  onKeyPress(event) {
    const sound = KeyToSound[event.key];
    const player = document.querySelector("#s1");
    player.setAttribute("src", `./sounds/${sound}.wav`);
    playSound(player);
  },
  playSound(sound) {
    sound.currentTime = 0;
    sound.play();
  },
  assingTracks() {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.getAttribute("id") !== this.currentTrack) {
        track.classList.remove("track-active");
      }

      track.addEventListener("click", (e) => {
        if (!!this.currentTime) {
          document
            .getElementById(this.currentTime)
            .classList.remove("track-active");
        }

        this.currentTime = e.target.getAttribute("id");
        e.target.classList.add("track-active");
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

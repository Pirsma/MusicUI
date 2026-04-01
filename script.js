const audio = document.getElementById("audio");
const lyricsDiv = document.getElementById("lyrics");
const playBtn = document.getElementById("playBtn");

const progress = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("current");
const durationEl = document.getElementById("duration");

let lyrics = [];

/* FORMAT TIME */
function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

/* PLAY / PAUSE */
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.innerText = "Pause";
  } else {
    audio.pause();
    playBtn.innerText = "Play";
  }
});

/* LOAD DURATION */
audio.addEventListener("loadedmetadata", () => {
  durationEl.innerText = formatTime(audio.duration);
});

/* UPDATE PROGRESS */
audio.addEventListener("timeupdate", () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + "%";

  currentTimeEl.innerText = formatTime(audio.currentTime);
});

/* SEEK */
progressBar.addEventListener("click", (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

/* LOAD LRC */
fetch("AlexandraLyrics.lrc")
  .then(res => res.text())
  .then(text => {
    const lines = text.split("\n");

    lines.forEach(line => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);

      if (match && match[3].trim() !== "") {
        const min = parseInt(match[1]);
        const sec = parseFloat(match[2]);
        const time = min * 60 + sec;
        const textLine = match[3].trim();

        lyrics.push({ time, text: textLine });
      }
    });

    createLyrics();
  });

function createLyrics() {
  lyrics.forEach(line => {
    const div = document.createElement("div");
    div.className = "line";
    div.innerText = line.text;
    lyricsDiv.appendChild(div);
  });

  animateLyrics();
}

function animateLyrics() {
  const lines = document.querySelectorAll(".line");

  audio.addEventListener("timeupdate", () => {
    const current = audio.currentTime;

    lines.forEach((line, i) => {
      line.classList.remove("active", "near");

      if (
        current >= lyrics[i].time &&
        (i === lyrics.length - 1 || current < lyrics[i + 1].time)
      ) {
        line.classList.add("active");

        if (lines[i - 1]) lines[i - 1].classList.add("near");
        if (lines[i + 1]) lines[i + 1].classList.add("near");

        line.scrollIntoView({
          behavior: "auto",
          block: "center"
        });
      }
    });
  });
}

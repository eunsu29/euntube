import getBlobDuration from "get-blob-duration";

const videoContainer = document.getElementById("jsVideoPlayer");
const videoPlayer = document.querySelector("#jsVideoPlayer video");
const playBtn = document.getElementById("jsPlayButton");
const volumeBtn = document.getElementById("jsVolumeButton");
const fullScrnBtn = document.getElementById("jsFullScreen");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("jsVolume");

const registerView = () => {
  const videoId = window.location.href.split("/videos/")[1];
  fetch(`/api/${videoId}/view`, {
    method: "POST",
  });
};

function handlePlayClick() {
  if (videoPlayer.paused) {
    videoPlayer.play();
    playBtn.innerHTML = "<i class='fas fa-pause'></i>";
  } else {
    videoPlayer.pause();
    playBtn.innerHTML = "<i class='fas fa-play'></i>";
  }
}

function handleVolumeClick() {
  if (videoPlayer.muted) {
    videoPlayer.muted = false;
    volumeBtn.innerHTML = "<i class='fas fa-volume-up'></i>";
    volumeRange.value = videoPlayer.volume;
  } else {
    volumeRange.value = 0;
    videoPlayer.muted = true;
    volumeBtn.innerHTML = "<i class='fas fa-volume-mute'></i>";
  }
}

function handleVolumehover() {
  volumeRange.setAttribute("style", "opacity:1");
}

function handleVolumeout() {
  volumeRange.setAttribute("style", "opacity:0");
}

function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch((err) => Promise.resolve(err));
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen().catch((err) => Promise.resolve(err));
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen().catch((err) => Promise.resolve(err));
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen().catch((err) => Promise.resolve(err));
  }
  fullScrnBtn.removeEventListener("click", exitFullScreen);
  fullScrnBtn.addEventListener("click", goFullScreen);
  fullScrnBtn.innerHTML = "<i class='fas fa-expand'></i>";
  videoPlayer.className = "video__normalscreen";
}

function goFullScreen() {
  if (videoContainer.requestFullscreen) {
    videoContainer.requestFullscreen();
  } else if (videoContainer.mozRequestFullScreen) {
    videoContainer.mozRequestFullScreen();
  } else if (videoContainer.webkitRequestFullscreen) {
    videoContainer.webkitRequestFullscreen();
  } else if (videoContainer.msRequestFullscreen) {
    videoContainer.msRequestFullscreen();
  }
  fullScrnBtn.removeEventListener("click", goFullScreen);
  fullScrnBtn.addEventListener("click", exitFullScreen);
  fullScrnBtn.innerHTML = "<i class='fas fa-compress'></i>";
  videoPlayer.className = "video__fullscreen";
}

function escFullScreen() {
  if (document.webkitIsFullScreen === false) {
    exitFullScreen();
  } else if (document.mozFullScreen === false) {
    exitFullScreen();
  } else if (document.msFullscreenElement === false) {
    exitFullScreen();
  }
}

const formatDate = (seconds) => {
  const secondsNumber = parseInt(seconds, 10);
  let hours = Math.floor(secondsNumber / 3600);
  let minutes = Math.floor((secondsNumber - hours * 3600) / 60);
  let totalSeconds = secondsNumber - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (totalSeconds < 10) {
    totalSeconds = `0${totalSeconds}`;
  }
  return `${hours}:${minutes}:${totalSeconds}`;
};

function getCurrentTime() {
  currentTime.innerHTML = formatDate(Math.floor(videoPlayer.currentTime));
}

async function setTotalTime() {
  const blob = await fetch(videoPlayer.src).then((response) => response.blob());
  const duration = await getBlobDuration(blob);
  const totalTimeString = formatDate(duration);
  totalTime.innerHTML = totalTimeString;
}

function handleEnded() {
  registerView();
  videoPlayer.currentTime = 0;
  playBtn.innerHTML = "<i class='fas fa-play'></i>";
}

function handleDrag(event) {
  const {
    target: { value },
  } = event;
  videoPlayer.volume = value;
  if (value >= 0.6) {
    volumeBtn.innerHTML = "<i class='fas fa-volume-up'></i>";
  } else if (value >= 0.2) {
    volumeBtn.innerHTML = "<i class='fas fa-volume-down'></i>";
  } else {
    volumeBtn.innerHTML = "<i class='fas fa-volume-off'></i>";
  }
}

function init() {
  videoPlayer.volume = 0.5;

  playBtn.addEventListener("click", handlePlayClick);

  volumeBtn.addEventListener("click", handleVolumeClick);
  volumeBtn.addEventListener("mouseover", handleVolumehover);
  volumeBtn.addEventListener("mouseout", handleVolumeout);
  volumeRange.addEventListener("input", handleDrag);

  fullScrnBtn.addEventListener("click", goFullScreen);

  document.onreadystatechange = () => {
    if (document.readyState === "complete") {
      videoPlayer.addEventListener("loadedmetadata", setTotalTime);
    }
  };
  videoPlayer.addEventListener("timeupdate", getCurrentTime);
  videoPlayer.addEventListener("ended", handleEnded);

  if (document.addEventListener) {
    document.addEventListener("fullscreenchange", escFullScreen, false);
    document.addEventListener("mozfullscreenchange", escFullScreen, false);
    document.addEventListener("MSFullscreenChange", escFullScreen, false);
    document.addEventListener("webkitfullscreenchange", escFullScreen, false);
  }
}

if (videoContainer) {
  init();
}

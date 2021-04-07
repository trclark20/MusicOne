const {dialog} = require('electron').remote;

var playing = false;
var muted = false;
var clickedOnMenu = false;

document.addEventListener("click", function(e) {
  if (e.target.nodeName != 'A') {
    clickedOnMenu = false;

    var selectedMenu = document.getElementById('title-bar').querySelectorAll('.activeMenu')
    if (selectedMenu.length > 0) {
      selectedMenu[0].classList.remove('activeMenu')
      selectedMenu[0].querySelector('.dropdown-content').classList.remove('active')
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const { remote } = require('electron') ;
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  const audioPlayerContainer = document.getElementById('audio-player-container');
  const seekSlider = document.getElementById('seek-slider');

  const showRangeProgress = (rangeInput) => {
    if (rangeInput === seekSlider)
      audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
    else
      audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
  }

  seekSlider.addEventListener('input', (e) => {
    showRangeProgress(e.target);
  })

  //volumeSlider.addEventListener('input', (e) => {
    //showRangeProgress(e.target);
//})

  const audio = document.querySelector('audio');
  const duration = document.getElementById('duration');
  const currentTime = document.getElementById('current-time');
  let rAF = null;

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
}

  const setSliderMax = () => {
    seekSlider.max = Math.floor(audio.duration);
  }

  const displayBufferedAmount = () => {
    const bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
    audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
}

  const displayDuration = () => {
    duration.textContent = calculateTime(audio.duration);
  }

  const resetAudioPlayer = () => {
    seekSlider.value = 0;
    audio.currentTime = 0;
    currentTime.textContent = calculateTime(seekSlider.value);
    audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    setSliderMax();
  }

  if (audio.readyState > 0) {
    displayDuration();
    setSliderMax();
    displayBufferedAmount();
  } else {
    audio.addEventListener('loadedmetadata', () => {
      displayDuration();
      setSliderMax();
      displayBufferedAmount();
    });
  }

  audio.addEventListener('progress', displayBufferedAmount);

  seekSlider.addEventListener('input', () => {
    currentTime.textContent = calculateTime(seekSlider.value);
  });

  seekSlider.addEventListener('change', () => {
    audio.currentTime = seekSlider.value;
  });

  document.getElementById("min-button").addEventListener("click", function (e) {
    var win = remote.getCurrentWindow();
    win.minimize();
  });

  const whilePlaying = () => {
    seekSlider.value = Math.floor(audio.currentTime);
    currentTime.textContent = calculateTime(seekSlider.value);
    audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    rAF = requestAnimationFrame(whilePlaying);
  }

  document.getElementById("play-button").addEventListener("click", function (e) {
    if (!playing) {
      audio.play();
      document.querySelector('#play-button').classList.toggle("fa-pause-circle")
      document.querySelector('#play-button').classList.toggle("fa-play-circle")
      requestAnimationFrame(whilePlaying);
      playing = true;
    }
    else {
      audio.pause();
      document.querySelector('#play-button').classList.toggle("fa-pause-circle")
      document.querySelector('#play-button').classList.toggle("fa-play-circle")
      cancelAnimationFrame(rAF);
      playing = false;
    }
  });

  document.getElementById("volume-button").addEventListener("click", function (e) {
    if (muted) {
      audio.muted = false;
      muted = false;
      document.querySelector('#volume-button').classList.toggle("fa-volume-up")
      document.querySelector('#volume-button').classList.toggle("fa-volume-mute")
    }
    else {
      audio.muted = true;
      muted = true;
      document.querySelector('#volume-button').classList.toggle("fa-volume-up")
      document.querySelector('#volume-button').classList.toggle("fa-volume-mute")
    }
  });

  seekSlider.addEventListener('input', () => {
    currentTime.textContent = calculateTime(seekSlider.value);
    if (!audio.paused)
      cancelAnimationFrame(rAF);
  });

  seekSlider.addEventListener('change', () => {
    audio.currentTime = seekSlider.value;
    if (!audio.paused)
      requestAnimationFrame(whilePlaying);
  })

  document.getElementById("max-button").addEventListener("click", function (e) {
    var win = remote.getCurrentWindow();
    if (!win.isMaximized()) {
      win.maximize();
    } else {
      win.unmaximize();
    }
  });

  document.getElementById("close-button").addEventListener("click", function (e) {
    window.close();
  });

  document.getElementById('open-file').addEventListener('click', function (event) {
      dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections']
      })
      .then(result => {
        if (result.canceled) return;
        document.getElementById('audio').setAttribute("src", result.filePaths[0]);
        document.getElementById("audio player").load()
        resetAudioPlayer();
        audio.play();
        if (document.querySelector('#play-button').classList.contains("fa-play-circle"))
        {
          document.querySelector('#play-button').classList.toggle("fa-play-circle")
          document.querySelector('#play-button').classList.toggle("fa-pause-circle")
        }
        requestAnimationFrame(whilePlaying);
        playing = true;
      });
    });

  var element = document.getElementsByClassName("dropdown-menu");
  for (var i = 0; i < element.length; i++)
  {
    element[i].addEventListener("click", menuClick);
    element[i].addEventListener("mouseenter", menuEnter);
  }

  function menuEnter(e) {
      for (var i = 0; i < element.length; i++)
      {
        if (element[i].querySelector('.dropdown-content').classList.contains('active')) {
          element[i].querySelector('.dropdown-content').classList.remove('active');
          element[i].classList.remove('activeMenu')
        }
      }

      if (clickedOnMenu) {
        this.classList.add('activeMenu')
        this.querySelector('.dropdown-content').classList.add('active');
      }
    }

  function menuClick(e) {
    clickedOnMenu ^= true;

    if (this.querySelector('.dropdown-content').classList.contains('active')) {
      this.querySelector('.dropdown-content').classList.remove('active');
      this.classList.remove('activeMenu')
    } else {
      this.querySelector('.dropdown-content').classList.add('active');
      this.classList.add('activeMenu')
    }
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

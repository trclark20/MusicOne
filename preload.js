const {dialog} = require('electron').remote;

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

  document.getElementById("min-button").addEventListener("click", function (e) {
    var win = remote.getCurrentWindow();
    win.minimize();
  });

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

(function () {
  var hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  var hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function playVideo(shell) {
    var video = shell.querySelector('video[data-stream]');
    var button = shell.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-stream');

    if (!source) {
      return;
    }

    if (button) {
      button.classList.add('hidden');
    }

    if (video.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', '1');
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hlsPlayer) {
          video._hlsPlayer.destroy();
        }

        var player = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        video._hlsPlayer = player;
        player.loadSource(source);
        player.attachMedia(video);
        player.on(Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute('data-ready', '1');
          video.play().catch(function () {});
        });
        player.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            player.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            player.recoverMediaError();
          } else {
            player.destroy();
          }
        });
      } else {
        video.src = source;
        video.setAttribute('data-ready', '1');
        video.play().catch(function () {});
      }
    }).catch(function () {
      video.src = source;
      video.setAttribute('data-ready', '1');
      video.play().catch(function () {});
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video[data-stream]');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          playVideo(shell);
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
  });
})();

(function () {
    function setupMoviePlayer(videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var ready = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function bindStream() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function playMovie() {
            bindStream();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            video.controls = true;
            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', playMovie);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playMovie();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
}());

(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".nav-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var list = document.querySelector("[data-card-list]");
            var empty = panel.querySelector("[data-empty-state]");
            var activeFilter = "all";

            if (!list) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }

            function apply() {
                var words = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];
                var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
                var shown = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var category = card.getAttribute("data-category") || "";
                    var matchText = words.every(function (word) {
                        return text.indexOf(word) !== -1;
                    });
                    var matchFilter = activeFilter === "all" || category === activeFilter;
                    var visible = matchText && matchFilter;
                    card.classList.toggle("is-hidden", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeFilter = chip.getAttribute("data-filter-value") || "all";
                    apply();
                });
            });

            apply();
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-video");
        var startLayer = document.getElementById("player-start");
        var hlsInstance = null;
        var mounted = false;

        if (!video || !sourceUrl) {
            return;
        }

        function mount() {
            if (mounted) {
                return;
            }
            mounted = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            mount();
            if (startLayer) {
                startLayer.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (startLayer) {
                        startLayer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (startLayer) {
            startLayer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (startLayer) {
                startLayer.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (startLayer) {
                startLayer.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

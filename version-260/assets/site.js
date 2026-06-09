(function () {
    var initialized = false;

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function makeElement(tagName, className, text) {
        var element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-go]"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    function setupGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
        var index = window.SITE_MOVIE_INDEX || [];
        if (!forms.length || !index.length) {
            return;
        }

        forms.forEach(function (form) {
            var input = form.querySelector("input[type='search']");
            var panel = form.querySelector("[data-search-results]");
            if (!input || !panel) {
                return;
            }

            function find(query) {
                var needle = normalize(query);
                if (!needle) {
                    return [];
                }
                return index.filter(function (movie) {
                    return normalize(movie.text).indexOf(needle) !== -1;
                }).slice(0, 10);
            }

            function render(results) {
                panel.textContent = "";
                if (!results.length) {
                    panel.classList.remove("is-open");
                    return;
                }
                results.forEach(function (movie) {
                    var item = makeElement("a", "search-result");
                    item.href = movie.url;
                    var image = makeElement("img");
                    image.src = movie.image;
                    image.alt = movie.title;
                    image.loading = "lazy";
                    var info = makeElement("div");
                    var title = makeElement("strong", "", movie.title);
                    var meta = makeElement("span", "", [movie.year, movie.type, movie.category].filter(Boolean).join(" · "));
                    info.appendChild(title);
                    info.appendChild(meta);
                    item.appendChild(image);
                    item.appendChild(info);
                    panel.appendChild(item);
                });
                panel.classList.add("is-open");
            }

            input.addEventListener("input", function () {
                render(find(input.value));
            });

            input.addEventListener("focus", function () {
                render(find(input.value));
            });

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var results = find(input.value);
                if (results.length) {
                    window.location.href = results[0].url;
                }
            });

            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove("is-open");
                }
            });
        });
    }

    function setupPageFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var keyword = root.querySelector("[data-filter-keyword]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var empty = root.querySelector("[data-filter-empty]");

            function apply() {
                var q = normalize(keyword ? keyword.value : "");
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matchKeyword = !q || normalize(card.getAttribute("data-search-text")).indexOf(q) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
                    var matched = matchKeyword && matchYear && matchType;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function attachHls(video, videoUrl) {
        if (!video || !videoUrl) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = videoUrl;
    }

    function initMoviePlayer(videoUrl) {
        var shell = document.getElementById("movie-player-shell");
        var video = document.getElementById("movie-player");
        var start = document.getElementById("player-start");
        if (!shell || !video || !start || !videoUrl) {
            return;
        }
        attachHls(video, videoUrl);

        function begin() {
            shell.classList.add("is-playing");
            video.play().catch(function () {
                video.controls = true;
                shell.classList.remove("is-playing");
            });
        }

        start.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });
    }

    window.Site = {
        init: function () {
            if (initialized) {
                return;
            }
            initialized = true;
            setupMenu();
            setupHero();
            setupGlobalSearch();
            setupPageFilters();
        },
        initMoviePlayer: initMoviePlayer
    };
})();

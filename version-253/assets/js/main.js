(function () {
    var root = document.body ? document.body.getAttribute('data-root') || './' : './';

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function prefix(url) {
        if (!url) {
            return root;
        }
        if (/^(https?:)?\/\//.test(url)) {
            return url;
        }
        return root + url.replace(/^\.\//, '');
    }

    function setupMobile() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearch() {
        qsa('[data-site-search]').forEach(function (box) {
            var input = box.querySelector('input');
            var panel = box.querySelector('[data-search-panel]');
            if (!input || !panel || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
                return;
            }
            input.addEventListener('input', function () {
                var key = normalize(input.value);
                if (!key) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    return;
                }
                var result = window.MOVIE_SEARCH_DATA.filter(function (item) {
                    return normalize(item.title + ' ' + item.genre + ' ' + item.region + ' ' + item.year + ' ' + item.tags).indexOf(key) !== -1;
                }).slice(0, 10);
                panel.innerHTML = result.map(function (item) {
                    return '<a class="search-result" href="' + prefix(item.url) + '"><img src="' + prefix(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span></a>';
                }).join('');
                panel.classList.toggle('is-open', result.length > 0);
            });
            document.addEventListener('click', function (event) {
                if (!box.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupFilters() {
        qsa('[data-card-filter]').forEach(function (wrap) {
            var input = wrap.querySelector('[data-filter-input]');
            var select = wrap.querySelector('[data-filter-select]');
            var cards = qsa('.movie-card, .rank-item', wrap);
            var empty = wrap.querySelector('[data-empty]');
            function apply() {
                var key = normalize(input ? input.value : '');
                var genre = normalize(select ? select.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var hay = normalize(card.getAttribute('data-search'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var matchText = !key || hay.indexOf(key) !== -1;
                    var matchGenre = !genre || cardGenre.indexOf(genre) !== -1 || hay.indexOf(genre) !== -1;
                    var ok = matchText && matchGenre;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (select) {
                select.addEventListener('change', apply);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobile();
        setupSearch();
        setupHero();
        setupFilters();
    });
}());

(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInput = document.getElementById('globalSearchInput');
    var searchResults = document.getElementById('globalSearchResults');
    var searchData = window.MOVIES_SEARCH_DATA || [];

    function closeSearch() {
        if (searchResults) {
            searchResults.classList.remove('is-open');
            searchResults.innerHTML = '';
        }
    }

    if (searchInput && searchResults && searchData.length) {
        searchInput.addEventListener('input', function () {
            var keyword = searchInput.value.trim().toLowerCase();

            if (!keyword) {
                closeSearch();
                return;
            }

            var matched = searchData.filter(function (item) {
                return item.title.toLowerCase().indexOf(keyword) >= 0 ||
                    item.category.toLowerCase().indexOf(keyword) >= 0 ||
                    item.tags.toLowerCase().indexOf(keyword) >= 0;
            }).slice(0, 14);

            if (!matched.length) {
                searchResults.innerHTML = '<a href="categories.html"><strong>浏览全部分类</strong><span>进入分类页继续筛选</span></a>';
                searchResults.classList.add('is-open');
                return;
            }

            searchResults.innerHTML = matched.map(function (item) {
                return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.category + ' · ' + item.year) + '</span></a>';
            }).join('');
            searchResults.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!searchResults.contains(event.target) && event.target !== searchInput) {
                closeSearch();
            }
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-region-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));

    function applyLocalFilter() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var cardRegion = card.getAttribute('data-region') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var visible = true;

            if (keyword && text.indexOf(keyword) < 0) {
                visible = false;
            }

            if (region && cardRegion !== region) {
                visible = false;
            }

            if (year && cardYear !== year) {
                visible = false;
            }

            card.style.display = visible ? '' : 'none';
        });
    }

    [filterInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyLocalFilter);
            control.addEventListener('change', applyLocalFilter);
        }
    });

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }
}());

(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function norm(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = one('[data-menu-toggle]');
    var links = one('[data-nav-links]');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('is-open');
      });
    }

    all('[data-search-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var form = one('[data-search-form]');
        if (form) {
          form.classList.toggle('is-open');
          var input = one('input', form);
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initSearchForms() {
    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = one('input[type="search"]', form);
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './movies.html?q=' + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var root = one('[data-hero]');
    if (!root) {
      return;
    }
    var slides = all('[data-hero-slide]', root);
    var dots = all('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = one('[data-filter-panel]');
    var cards = all('[data-movie-card]');
    if (!panel || !cards.length) {
      return;
    }

    var search = one('#page-search');
    var region = one('#region-filter');
    var year = one('#year-filter');
    var type = one('#type-filter');
    var category = one('#category-filter');
    var empty = one('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && search) {
      search.value = q;
    }

    function apply() {
      var keyword = norm(search && search.value);
      var wantedRegion = norm(region && region.value);
      var wantedYear = norm(year && year.value);
      var wantedType = norm(type && type.value);
      var wantedCategory = norm(category && category.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = norm(card.getAttribute('data-search'));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (wantedRegion && norm(card.getAttribute('data-region')) !== wantedRegion) {
          ok = false;
        }
        if (wantedYear && norm(card.getAttribute('data-year')) !== wantedYear) {
          ok = false;
        }
        if (wantedType && norm(card.getAttribute('data-type')) !== wantedType) {
          ok = false;
        }
        if (wantedCategory && norm(card.getAttribute('data-category')) !== wantedCategory) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, region, year, type, category].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  }

  function initPlayers() {
    all('[data-player]').forEach(function (frame) {
      var video = one('video[data-src]', frame);
      var button = one('.player-start', frame);
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute('data-src');
      var loaded = false;
      var hls = null;

      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        video.controls = true;
        frame.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        frame.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initImages() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('is-missing');
      }
    }, true);
  }

  function initBackTop() {
    all('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
    initImages();
    initBackTop();
  });
})();

(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot') || '0'));
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var scopes = selectAll('[data-filter-scope]');
    if (!scopes.length) {
      return;
    }
    var query = new URLSearchParams(window.location.search).get('q') || '';
    scopes.forEach(function (scope) {
      var search = scope.querySelector('[data-card-search]');
      var empty = scope.querySelector('[data-empty-state]');
      var container = scope.parentElement || document;
      var cards = selectAll('.js-card', container).filter(function (card) {
        return !card.closest('.filter-panel');
      });
      var state = {
        genre: '',
        region: '',
        year: '',
        keyword: query.trim().toLowerCase()
      };
      if (search && query) {
        search.value = query;
      }
      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var matchesKeyword = !state.keyword || text.indexOf(state.keyword) !== -1;
          var matchesGenre = !state.genre || (card.getAttribute('data-genre') || '').indexOf(state.genre) !== -1;
          var matchesRegion = !state.region || (card.getAttribute('data-region') || '').indexOf(state.region) !== -1;
          var matchesYear = !state.year || (card.getAttribute('data-year') || '') === state.year;
          var show = matchesKeyword && matchesGenre && matchesRegion && matchesYear;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      if (search) {
        search.addEventListener('input', function () {
          state.keyword = search.value.trim().toLowerCase();
          apply();
        });
      }
      selectAll('[data-filter-button]', scope).forEach(function (button) {
        button.addEventListener('click', function () {
          var field = button.getAttribute('data-filter-field');
          var value = button.getAttribute('data-filter-value') || '';
          state[field] = value;
          selectAll('[data-filter-field="' + field + '"]', scope).forEach(function (peer) {
            peer.classList.toggle('active', peer === button);
          });
          apply();
        });
        if ((button.getAttribute('data-filter-value') || '') === '') {
          button.classList.add('active');
        }
      });
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-video');
  var button = document.getElementById('movie-play');
  if (!video || !button || !sourceUrl) {
    return;
  }
  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
    video.load();
  }
  function play() {
    attach();
    video.controls = true;
    button.classList.add('hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }
  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}

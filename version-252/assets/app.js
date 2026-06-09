(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function getActiveFilter(target) {
    var active = document.querySelector('[data-filter].active[data-target="' + target + '"]');
    return active ? active.getAttribute('data-filter') : 'all';
  }

  function updateCatalog(target) {
    var wrap = document.querySelector(target);

    if (!wrap) {
      return;
    }

    var input = document.querySelector('[data-search-input][data-target="' + target + '"]');
    var query = normalize(input ? input.value : '');
    var filter = getActiveFilter(target);
    var cards = Array.prototype.slice.call(wrap.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-keywords'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) >= 0;
      var matchFilter = filter === 'all' || haystack.indexOf(normalize(filter)) >= 0;
      var show = matchQuery && matchFilter;

      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    var empty = document.querySelector('[data-empty-for="' + target + '"]');

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      updateCatalog(input.getAttribute('data-target'));
    });
  });

  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = button.getAttribute('data-target');
      document.querySelectorAll('[data-filter][data-target="' + target + '"]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      updateCatalog(target);
    });
  });
})();

// Theme toggle
(function () {
  var stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  // Theme toggle
  var themeButtons = document.querySelectorAll('.theme-toggle button');
  var currentTheme = localStorage.getItem('theme') || 'system';

  function updateActiveButton() {
    themeButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
  }

  updateActiveButton();

  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentTheme = btn.dataset.theme;
      if (currentTheme === 'system') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
      } else {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
      }
      updateActiveButton();
    });
  });

  // Download button dropdown
  var DOWNLOADS = [
    {
      label: 'Apple Silicon',
      url: 'https://github.com/olegakbarov/weekend.software/releases/download/v0.2.0/Weekend.Software_0.2.0_aarch64.dmg',
    },
    {
      label: 'Intel',
      url: 'https://github.com/olegakbarov/weekend.software/releases/download/v0.2.0/Weekend.Software_0.2.0_x64.dmg',
    },
  ];

  var selected = 0;
  var splitEl = document.querySelector('.download-split');
  var mainLink = document.querySelector('.download-main');
  var toggleBtn = document.querySelector('.download-toggle');
  var dropdown = document.querySelector('.download-dropdown');
  var mainLabel = document.querySelector('.download-label');
  var options = document.querySelectorAll('.download-option');

  function updateDownload() {
    mainLink.href = DOWNLOADS[selected].url;
    mainLabel.textContent = 'Download for ' + DOWNLOADS[selected].label;
    options.forEach(function (opt, i) {
      opt.classList.toggle('active', i === selected);
    });
  }

  toggleBtn.addEventListener('click', function () {
    dropdown.classList.toggle('open');
  });

  options.forEach(function (opt, i) {
    opt.addEventListener('click', function () {
      selected = i;
      updateDownload();
      dropdown.classList.remove('open');
    });
  });

  document.addEventListener('mousedown', function (e) {
    if (splitEl && !splitEl.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
});

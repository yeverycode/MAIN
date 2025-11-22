// 테마 전환 및 로고/이미지 스위칭
(function initTheme() {
  const html = document.documentElement;
  const logo = document.querySelector('.nav__logo');
  const themeImages = document.querySelectorAll('[data-theme-dark][data-theme-light]');
  const themeToggle = document.querySelector('#themeSwitch');

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
    }
    if (logo) {
      const nextLogo = theme === 'dark' ? logo.dataset.logoDark : logo.dataset.logoLight;
      if (nextLogo) logo.src = nextLogo;
    }
    themeImages.forEach((img) => {
      const nextSrc = theme === 'dark' ? img.dataset.themeDark : img.dataset.themeLight;
      if (nextSrc) img.setAttribute('src', nextSrc);
    });
  };

  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  themeToggle?.addEventListener('change', (e) => {
    const next = e.target.checked ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
})();

// 스크롤 등장 애니메이션
(function initReveal() {
  const html = document.documentElement;
  const all = document.querySelectorAll('.reveal');

  html.classList.add('reveal-ready');

  const failOpen = () => all.forEach((el) => el.classList.add('is-inview'));
  if (!all.length) return;

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      failOpen();
      return;
    }
    if (!('IntersectionObserver' in window)) {
      failOpen();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-inview');
            }, 50);
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    document.querySelectorAll('.reveal-stagger').forEach((group) => {
      group.querySelectorAll('.reveal').forEach((el, idx) => {
        if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', idx);
        io.observe(el);
      });
    });

    document.querySelectorAll('.reveal:not(.reveal-stagger .reveal)').forEach((el) => io.observe(el));
  } catch (e) {
    console.error('[reveal] init error:', e);
    failOpen();
  }
})();

// 인트로 섹션 라인 애니메이션
(function initIntroLine() {
  const secIntro = document.querySelector('.sec-intro');
  if (!secIntro) return;

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      secIntro.classList.add('line-active');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      secIntro.classList.add('line-active');
      return;
    }

    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('line-active');
            }, 300);
            lineObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    lineObserver.observe(secIntro);
  } catch (e) {
    console.error('[line animation] init error:', e);
    secIntro.classList.add('line-active');
  }
})();

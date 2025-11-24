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

// 레일 토글 & 스크롤 버튼
(function initRail() {
  const rail = document.querySelector('.rail');
  const trigger = document.querySelector('.rail-trigger');
  const scrollBtn = document.querySelector('.rail-scroll');
  const collapseBtn = document.querySelector('.rail-collapse');
  if (!rail || !trigger || !scrollBtn) return;

  const setRailState = (open) => {
    rail.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const toggleRail = () => setRailState(!rail.classList.contains('is-open'));

  trigger.addEventListener('click', toggleRail);
  collapseBtn?.addEventListener('click', () => setRailState(false));

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  const updateScrollBtn = () => {
    const nearTop = window.scrollY <= 10;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;

    const showUp = !nearTop && nearBottom;

    scrollBtn.classList.toggle('is-up', showUp);
    scrollBtn.classList.toggle('is-down', nearTop);
    scrollBtn.setAttribute(
      'aria-label',
      showUp ? '맨 위로 이동' : '맨 아래로 이동'
    );
  };

  scrollBtn.addEventListener('click', () => {
    const nearBottom = scrollBtn.classList.contains('is-up');
    if (nearBottom) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  });

  window.addEventListener('scroll', updateScrollBtn, { passive: true });
  updateScrollBtn();
})();

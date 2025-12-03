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

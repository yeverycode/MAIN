(function handleHeaderOnScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggle = () => {
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

(function animateIntroCopy() {
  const intro = document.querySelector('.prof-intro-text');
  if (!intro) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.classList.add('is-visible');
    return;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intro.classList.add('is-visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    io.observe(intro);
  } else {
    intro.classList.add('is-visible');
  }
})();

// 교수 카드 플러스 버튼 클릭 시 공통 상세 페이지로 이동
(function initProfCardLinks() {
  const buttons = document.querySelectorAll('.prof-card__plus');
  buttons.forEach((btn) => {
    const id = btn.dataset.profId;
    if (!id) return;

    btn.addEventListener('click', () => {
      window.location.href = `/pages/prof/8_tomato_professor.html?id=${encodeURIComponent(id)}`;
    });
  });
})();

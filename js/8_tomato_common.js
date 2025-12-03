// 공통: 레일 토글 & 스크롤 버튼
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


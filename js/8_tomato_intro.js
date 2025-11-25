
document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll(".intro-section-wrapper");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.1 });

  wrappers.forEach(w => observer.observe(w));
});



/***********************************************
 * TRACK CARD 애니메이션
 ***********************************************/
const trackCards = document.querySelectorAll('.track-card');

const trackObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.3 });

trackCards.forEach(card => trackObserver.observe(card));


/***********************************************
 * TRACK 제목/설명 애니메이션
 ***********************************************/
const introTrack = document.querySelector('.intro-track');

const trackTitleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      introTrack.classList.add('show');
    }
  });
}, { threshold: 0.3 });

trackTitleObserver.observe(introTrack);





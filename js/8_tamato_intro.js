document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".intro-section").forEach(section => {
    observer.observe(section);
  });
});

window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".intro-section");

  let current = "";

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
      current = sec.dataset.section;
    }
  });

  document.querySelectorAll(".section-number").forEach(num => {
    if (num.dataset.section === current) {
      num.classList.add("active");
    } else {
      num.classList.remove("active");
    }
  });
});

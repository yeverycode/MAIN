
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



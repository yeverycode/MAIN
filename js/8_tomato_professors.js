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

(function renderProfessors() {
  const grid = document.querySelector('[data-prof-grid]');
  if (!grid) return;

  const buildDesc = (lines) => {
    const p = document.createElement('p');
    p.className = 'prof-card__desc';
    if (!Array.isArray(lines) || !lines.length) return p;

    lines.forEach((line, idx) => {
      p.appendChild(document.createTextNode(line));
      if (idx < lines.length - 1) {
        p.appendChild(document.createElement('br'));
      }
    });
    return p;
  };

  const createCard = (prof) => {
    const card = document.createElement('article');
    card.className = 'prof-card';

    const nameRow = document.createElement('div');
    nameRow.className = 'prof-card__name-row';

    const name = document.createElement('h2');
    name.className = 'prof-card__name';
    name.textContent = prof.name;
    nameRow.appendChild(name);

    const lab = document.createElement('span');
    lab.className = 'prof-card__lab';
    lab.textContent = `| ${prof.lab}`;
    nameRow.appendChild(lab);
    card.appendChild(nameRow);

    card.appendChild(buildDesc(prof.desc));

    const imageWrap = document.createElement('div');
    imageWrap.className = 'prof-card__image-wrap';

    const img = document.createElement('img');
    img.className = 'prof-card__avatar';
    img.src = prof.image;
    img.alt = prof.imageAlt || `${prof.name} 교수님 사진`;
    imageWrap.appendChild(img);

    const mask = document.createElement('div');
    mask.className = 'prof-card__image-mask transition-opacity duration-500';
    mask.setAttribute('aria-hidden', 'true');
    imageWrap.appendChild(mask);

    card.appendChild(imageWrap);

    const button = document.createElement('button');
    button.className = 'prof-card__plus';
    button.type = 'button';
    button.dataset.profId = prof.id;
    button.setAttribute('aria-label', `${prof.name} 교수님 상세 보기`);
    button.innerHTML = `
      <svg class="prof-card__plus-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5v14M5 12h14" />
      </svg>
    `;
    card.appendChild(button);

    return card;
  };

  const render = (list) => {
    grid.innerHTML = '';
    list
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      .forEach((prof) => grid.appendChild(createCard(prof)));
  };

  fetch('/data/professor/8_tomato_professors.json')
    .then((res) => res.json())
    .then(render)
    .catch((err) => {
      console.error('Failed to load professor cards', err);
    });
})();

(function initProfCardLinks() {
  const grid = document.querySelector('[data-prof-grid]');
  if (!grid) return;

    const handleClick = (id) => {
      window.location.href = `/pages/prof/8_tomato_professor.html?id=${encodeURIComponent(id)}`;
    };

  grid.addEventListener('click', (event) => {
    const btn = event.target.closest('.prof-card__plus');
    if (!btn || !btn.dataset.profId) return;
    handleClick(btn.dataset.profId);
  });
})();

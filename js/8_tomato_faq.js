(() => {
  const state = {
    category: 'all',
    query: '',
    searchType: 'all'
  };

  const els = {
    list: document.getElementById('faqList'),
    empty: document.getElementById('faqEmpty'),
    categories: document.getElementById('faqCategories'),
    search: document.getElementById('faqSearch'),
    searchForm: document.getElementById('faqSearchForm'),
    searchType: document.getElementById('faqSearchType'),
    count: document.getElementById('faqCount'),
    subtitle: document.getElementById('faqSubtitle'),
    contactHeading: document.getElementById('faqContactHeading'),
    contactDescription: document.getElementById('faqContactDescription'),
    contactLink: document.getElementById('faqContactLink')
  };

  const categoryMap = new Map();
  let faqs = [];

  const createParagraph = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  const normalize = (value = '') => String(value).toLowerCase().replace(/\s+/g, ' ').trim();

  const matchesQuery = (item, query) => {
    if (!query) return true;
    const normalizedQuestion = normalize(item.question);
    const normalizedAnswer = normalize((item.answer || []).join(' '));
    const normalizedTags = normalize((item.tags || []).join(' '));

    switch (state.searchType) {
      case 'question':
        return normalizedQuestion.includes(query);
      case 'answer':
        return normalizedAnswer.includes(query);
      default:
        return [normalizedQuestion, normalizedAnswer, normalizedTags].some((text) => text.includes(query));
    }
  };

  const renderList = () => {
    if (!els.list) return;
    els.list.innerHTML = '';

    const filtered = faqs.filter((item) => {
      const categoryOk = state.category === 'all' || item.category === state.category;
      return categoryOk && matchesQuery(item, state.query);
    });

    if (els.count) {
      els.count.textContent = `총 ${filtered.length}개 질문`;
    }

    if (!filtered.length) {
      if (els.empty) {
        els.empty.hidden = false;
      }
      return;
    }

    if (els.empty) {
      els.empty.hidden = true;
    }

    filtered.forEach((item, index) => {
      const details = document.createElement('details');
      details.className = 'faq-item';
      details.dataset.category = item.category;

      const summary = document.createElement('summary');
      summary.className = 'faq-question';

      const left = document.createElement('div');
      left.className = 'faq-question__left';

      const icon = document.createElement('span');
      icon.className = 'faq-question__icon';
      icon.textContent = 'Q';

      const text = document.createElement('span');
      text.className = 'faq-question__text';
      text.textContent = item.question;

      left.append(icon, text);

      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('class', 'faq-question__arrow');
      arrow.setAttribute('width', '20');
      arrow.setAttribute('height', '20');
      arrow.setAttribute('viewBox', '0 0 24 24');
      arrow.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M6 9l6 6 6-6');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('fill', 'none');
      arrow.appendChild(path);

      summary.append(left, arrow);

      const answer = document.createElement('div');
      answer.className = 'faq-answer';

      const answerContent = document.createElement('div');
      answerContent.className = 'faq-answer__content';
      (item.answer || []).forEach((paragraph) => {
        answerContent.appendChild(createParagraph(paragraph));
      });

      answer.appendChild(answerContent);
      details.append(summary, answer);
      els.list.appendChild(details);
    });
  };

  const activateCategory = (nextCategory) => {
    state.category = nextCategory;

    if (els.categories) {
      els.categories.querySelectorAll('.faq-chip').forEach((label) => {
        const input = label.querySelector('input[name="faq-category"]');
        if (!input) return;
        const isActive = input.value === nextCategory;
        label.classList.toggle('is-active', isActive);
        label.setAttribute('aria-checked', String(isActive));
        if (isActive) input.checked = true;
      });
    }

    renderList();
  };

  const bindEvents = () => {
    if (els.categories) {
      els.categories.addEventListener('change', (event) => {
        const input = event.target.closest('input[name="faq-category"]');
        if (!input) return;
        activateCategory(input.value);
      });
    }

    if (els.searchForm) {
      els.searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
      });
    }

    if (els.search) {
      els.search.addEventListener('input', (event) => {
        state.query = normalize(event.target.value);
        renderList();
      });
    }

    if (els.searchType) {
      els.searchType.addEventListener('change', (event) => {
        state.searchType = event.target.value || 'all';
        renderList();
      });
    }
  };

  const renderCategories = (categories = []) => {
    if (!els.categories) return;

    els.categories.innerHTML = '';
    categories.forEach((category, index) => {
      categoryMap.set(category.id, category.label);

      const label = document.createElement('label');
      label.className = 'faq-chip';
      label.setAttribute('role', 'radio');
      label.setAttribute('aria-checked', 'false');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'faq-category';
      input.value = category.id;
      input.className = 'faq-chip__input';

      const span = document.createElement('span');
      span.textContent = category.label;

      const isDefault = category.id === 'all' || index === 0;
      if (isDefault) {
        input.checked = true;
        label.classList.add('is-active');
        label.setAttribute('aria-checked', 'true');
        state.category = category.id;
      }

      label.append(input, span);
      els.categories.appendChild(label);
    });
  };

  const hydrateMeta = (meta = {}) => {
    if (els.subtitle && meta.subtitle) {
      els.subtitle.textContent = meta.subtitle;
    }

    if (meta.contact) {
      const { heading, description, actionText, actionHref } = meta.contact;
      if (els.contactHeading) {
        els.contactHeading.textContent = heading || '';
      }
      if (els.contactDescription) {
        els.contactDescription.textContent = description || '';
      }
      if (els.contactLink && actionHref) {
        els.contactLink.href = actionHref;
        els.contactLink.textContent = actionText || '문의하기';
      }
    }
  };

  const showError = () => {
    if (els.empty) {
      els.empty.hidden = false;
      els.empty.textContent = 'FAQ를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.';
    }
  };

  const init = async () => {
    try {
      const res = await fetch('/data/8_tomato_faq.json');
      if (!res.ok) throw new Error('Failed to load FAQ data');
      const data = await res.json();
      faqs = data.faqs || [];
      renderCategories(data.categories || []);
      hydrateMeta(data.meta);
      bindEvents();
      renderList();
    } catch (error) {
      console.error(error);
      showError();
    }
  };

  init();
})();

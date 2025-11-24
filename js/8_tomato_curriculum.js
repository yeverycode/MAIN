document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('curriculumGrid');
  const empty = document.getElementById('curriculumEmpty');
  const gradeSelect = document.getElementById('gradeSelect');
  const semesterSelect = document.getElementById('semesterSelect');
  const searchForm = document.getElementById('curriculumSearchForm');
  const searchInput = document.getElementById('curriculumSearch');
  const searchType = document.getElementById('curriculumSearchType');

  let courses = [];

  fetch('/data/8_tomato_curriculum.json')
    .then((res) => res.json())
    .then((data) => {
      courses = data;
      renderList();
    })
    .catch(() => {
      grid.innerHTML = '<p class="curriculum-empty">커리큘럼 정보를 불러오지 못했습니다.</p>';
    });

  const handleChange = () => renderList();
  gradeSelect.addEventListener('change', handleChange);
  semesterSelect.addEventListener('change', handleChange);

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderList();
  });

  function matchesSearch(item, query, type) {
    if (!query) return true;
    const normalized = query.toLowerCase();

    if (type === 'title') {
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.subtitle.toLowerCase().includes(normalized)
      );
    }

    if (type === 'tag') {
      return item.tags.some((tag) => tag.toLowerCase().includes(normalized));
    }

    return (
      item.title.toLowerCase().includes(normalized) ||
      item.subtitle.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized) ||
      item.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }

  function renderList() {
    if (!courses.length) return;

    const grade = gradeSelect.value;
    const semester = semesterSelect.value;
    const keyword = searchInput.value.trim();
    const keywordType = searchType.value;

    const filtered = courses.filter((course) => {
      const matchGrade = !grade || String(course.grade) === grade;
      const matchSemester = !semester || String(course.semester) === semester;
      const matchKeyword = matchesSearch(course, keyword, keywordType);
      return matchGrade && matchSemester && matchKeyword;
    });

    grid.innerHTML = '';

    if (!filtered.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    filtered.forEach((course) => {
      const card = document.createElement('article');
      card.className = 'curriculum-card';

      card.innerHTML = `
        <span class="curriculum-card__dot" aria-hidden="true"></span>
        <h3 class="curriculum-card__title">${course.title}</h3>
        <div class="curriculum-card__line" aria-hidden="true"></div>
        <p class="curriculum-card__subtitle">${course.subtitle}</p>
        <p class="curriculum-card__desc">${course.description}</p>
        <div class="curriculum-card__meta">
          ${course.tags.map((tag) => `<span class="curriculum-card__tag">${tag}</span>`).join('')}
        </div>
      `;

      grid.appendChild(card);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const profId = params.get('id');

  if (!profId) {
    renderError('잘못된 접근입니다. 교수 정보를 찾을 수 없습니다.');
    return;
  }

  loadProfessor(profId);
});

async function loadProfessor(id) {
  try {
    const response = await fetch('/data/professors.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const prof = data[id];

    if (!prof) {
      renderError('교수 정보를 찾을 수 없습니다.');
      return;
    }

    renderProfessor(prof);
  } catch (error) {
    console.error('Failed to load professor data:', error);
    renderError('교수 정보를 불러오는 중 문제가 발생했습니다.');
  }
}

function renderProfessor(prof) {
  // 기본 프로필 정보
  setText('#prof-role', prof.role || '');
  setText('#prof-name', prof.name || '');
  setText('#prof-phone', prof.phone || '연락처 정보 없음');
  setText('#prof-office', prof.office || '연구실 정보 없음');

  const photoEl = document.querySelector('#prof-photo');
  if (photoEl) {
    photoEl.src = prof.photo || '/assets/8_tomato_home_white.png';
    photoEl.alt = `${prof.name || '교수님'} 사진`;
  }

  const emailLink = document.querySelector('#prof-email-link');
  const emailText = document.querySelector('#prof-email-text');
  if (emailLink && emailText) {
    const email = prof.email || '';
    if (email) {
      emailLink.href = `mailto:${email}`;
      emailText.textContent = email;
    } else {
      emailLink.removeAttribute('href');
      emailText.textContent = '이메일 정보 없음';
    }
  }

  // 관심 분야
  const interestsWrap = document.querySelector('#prof-interests');
  if (interestsWrap) {
    interestsWrap.innerHTML = '';
    if (Array.isArray(prof.interests) && prof.interests.length > 0) {
      prof.interests.forEach((interest) => {
        const tag = document.createElement('span');
        tag.className = 'prof-tag';
        tag.textContent = interest;
        interestsWrap.appendChild(tag);
      });
    } else {
      interestsWrap.textContent = '관심분야 정보가 없습니다.';
    }
  }

  // 주요 경력
  const historyTable = document.querySelector('#prof-history');
  if (historyTable) {
    historyTable.innerHTML = '';
    if (Array.isArray(prof.history) && prof.history.length > 0) {
      prof.history.forEach((item) => {
        const tr = document.createElement('tr');
        tr.className = 'prof-table__row';
        tr.append(
          createCell('prof-table__cell prof-table__cell--period', item.period || ''),
          createCell('prof-table__cell prof-table__cell--text', item.text || '')
        );
        historyTable.appendChild(tr);
      });
    } else {
      appendEmptyRow(historyTable, '경력 정보가 없습니다.', 2);
    }
  }

  // 담당 교과목
  const coursesTable = document.querySelector('#prof-courses');
  if (coursesTable) {
    coursesTable.innerHTML = '';
    if (Array.isArray(prof.courses) && prof.courses.length > 0) {
      prof.courses.forEach((termData) => {
        const courseList = Array.isArray(termData.list) && termData.list.length > 0
          ? termData.list
          : [{ code: '', name: '교과목 정보가 없습니다.' }];

        courseList.forEach((course, index) => {
          const tr = document.createElement('tr');
          tr.className = 'prof-table__row';

          tr.append(
            createCell('prof-table__cell prof-table__cell--term', index === 0 ? (termData.term || '') : ''),
            createCell('prof-table__cell prof-table__cell--code', course.code || ''),
            createCell('prof-table__cell prof-table__cell--name', course.name || '')
          );

          coursesTable.appendChild(tr);
        });
      });
    } else {
      appendEmptyRow(coursesTable, '담당 교과목 정보가 없습니다.', 3);
    }
  }

  // 논문 게재
  const pubTable = document.querySelector('#prof-pubs');
  if (pubTable) {
    pubTable.innerHTML = '';
    if (Array.isArray(prof.publications) && prof.publications.length > 0) {
      prof.publications.forEach((pub) => {
        const tr = document.createElement('tr');
        tr.className = 'prof-table__row';

        tr.append(
          createCell('prof-table__cell prof-table__cell--title', pub.title || ''),
          createCell('prof-table__cell prof-table__cell--meta', pub.date || ''),
          createCell('prof-table__cell prof-table__cell--meta', pub.journal || ''),
          createCell('prof-table__cell prof-table__cell--meta', pub.publisher || ''),
          createCell('prof-table__cell prof-table__cell--meta', pub.articleNumber || '')
        );

        pubTable.appendChild(tr);
      });
    } else {
      appendEmptyRow(pubTable, '논문 정보가 없습니다.', 5);
    }
  }
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = value || '';
  }
}

function renderError(message) {
  const targets = ['#prof-role', '#prof-name', '#prof-phone', '#prof-office', '#prof-interests', '#prof-history', '#prof-courses', '#prof-pubs'];
  targets.forEach((selector) => setText(selector, ''));

  const detail = document.querySelector('.prof-detail');
  if (detail) {
    detail.innerHTML = `<p style="padding: 32px; font-size: 16px;">${message}</p>`;
  }
}

function createCell(className, text) {
  const td = document.createElement('td');
  td.className = className;
  td.textContent = text;
  return td;
}

function appendEmptyRow(tbody, message, colspan) {
  const tr = document.createElement('tr');
  tr.className = 'prof-table__row';

  const td = document.createElement('td');
  td.className = 'prof-table__cell prof-table__cell--empty';
  td.colSpan = colspan;
  td.textContent = message;

  tr.appendChild(td);
  tbody.appendChild(tr);
}

const LAB_DATA_URL = '/data/8_tomato_lab_test.json';
let fields = {};

const initScores = () =>
  Object.keys(fields).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '가장 끌리는 분야는?',
    options: [
      { text: '서버·네트워크·보안', score: 'systemsNetwork' },
      { text: '비전·그래픽스·VR', score: 'visionGraphics' },
      { text: '데이터·추천·LLM', score: 'dataInfoGraph' },
      { text: 'HCI·UX·지능형 서비스', score: 'humanAI' }
    ]
  },
  {
    id: 2,
    question: '해보고 싶은 프로젝트는?',
    options: [
      { text: '대규모 서비스 안정화', score: 'systemsNetwork' },
      { text: '이미지·3D 화면 만들기', score: 'visionGraphics' },
      { text: '데이터로 패턴 찾기', score: 'dataInfoGraph' },
      { text: '사용자 경험 설계하기', score: 'humanAI' }
    ]
  },
  {
    id: 3,
    question: '내가 관심 있는 분야는?',
    options: [
      { text: '구조·성능·보안', score: 'systemsNetwork' },
      { text: '눈에 보이는 결과 중시', score: 'visionGraphics' },
      { text: '숫자·그래프 분석', score: 'dataInfoGraph' },
      { text: '사람 반응·경험에 집중', score: 'humanAI' }
    ]
  },
  {
    id: 4,
    question: '가장 기대되는 활동은?',
    options: [
      { text: '시스템·네트워크 실습', score: 'systemsNetwork' },
      { text: '비전·그래픽스 프로젝트', score: 'visionGraphics' },
      { text: '데이터·모델 실험', score: 'dataInfoGraph' },
      { text: '사용자·프로토타입 테스트', score: 'humanAI' }
    ]
  },
  {
    id: 5,
    question: '가까운 진로 방향은?',
    options: [
      { text: '플랫폼·보안 엔지니어', score: 'systemsNetwork' },
      { text: 'CV·그래픽스·VR 엔지니어', score: 'visionGraphics' },
      { text: '데이터·추천·LLM 엔지니어', score: 'dataInfoGraph' },
      { text: 'UX·프로덕트·서비스 기획', score: 'humanAI' }
    ]
  }
];


// 상태 관리
let currentQuestion = 0;
let answers = {};
let scores = initScores();

// 요소 참조
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startBtn = document.getElementById('startBtn');
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const currentStepEl = document.getElementById('currentStep');
const labScrollStatic = document.querySelector('.lab-scroll-static');
const labRow1 = document.getElementById('labRow1');
const labRow2 = document.getElementById('labRow2');
if (startBtn) startBtn.disabled = true;

function renderLabLogos() {
  if (!labRow1 || !labRow2 || !Object.keys(fields).length) return;

  const labs = Object.values(fields).flatMap((field) => field.labs);
  if (!labs.length) return;

  const row1Labs = labs.slice(0, 6);
  const row2Labs = labs.slice(6, 12);

  const buildRow = (el, items) => {
    const doubled = items.concat(items); // duplicate for seamless scroll animation
    el.innerHTML = doubled
      .map(
        (lab) => `
        <div class="lab-card">
          <img src="${lab.logo}" alt="${lab.englishName} Lab Logo" loading="lazy">
        </div>
      `
      )
      .join('');
  };

  buildRow(labRow1, row1Labs);
  buildRow(labRow2, row2Labs.length ? row2Labs : row1Labs);
}

async function loadFields() {
  try {
    const response = await fetch(LAB_DATA_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Failed to load lab data: ${response.status}`);
    fields = await response.json();
    scores = initScores();
    renderLabLogos();
    if (startBtn) startBtn.disabled = false;
  } catch (error) {
    console.error(error);
    if (startBtn) startBtn.textContent = '데이터를 불러오지 못했습니다';
    if (questionContainer) {
      questionContainer.innerHTML =
        '<p class="lab-error">연구실 정보를 불러오지 못했습니다.</p>';
    }
  }
}

// 시작 버튼
if (startBtn) {
  startBtn.addEventListener('click', () => {
    if (labScrollStatic) labScrollStatic.classList.add('is-hidden');
    welcomeScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    renderQuestion();
    updateProgress();
  });
}

// 질문 렌더링
function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  questionContainer.innerHTML = `
    <div class="question-card">
      <div class="question-number">질문 ${q.id}/${QUESTIONS.length}</div>
      <h3 class="question-text">${q.question}</h3>
      <div class="options-grid">
        ${q.options
          .map(
            (opt) => `
          <button 
            class="option-card ${
              answers[q.id] === opt.score ? 'selected' : ''
            }" 
            data-score="${opt.score}"
            data-question="${q.id}"
          >
            <span class="option-text">${opt.text}</span>
            <span class="option-check">✓</span>
          </button>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  // 옵션 클릭 이벤트
  document.querySelectorAll('.option-card').forEach((card) => {
    card.addEventListener('click', () => {
      const score = card.dataset.score;
      const qId = parseInt(card.dataset.question, 10);

      // 현재 질문의 카드만 선택 해제
      document
        .querySelectorAll(`.option-card[data-question="${qId}"]`)
        .forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');

      answers[qId] = score;
      nextBtn.disabled = false;
    });
  });

  updateButtons();
}

// 진행 바 업데이트
function updateProgress() {
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  progressFill.style.width = `${progress}%`;
  if (currentStepEl) currentStepEl.textContent = currentQuestion + 1;
}

// 버튼 상태 업데이트
function updateButtons() {
  prevBtn.style.visibility = currentQuestion > 0 ? 'visible' : 'hidden';
  nextBtn.disabled = !answers[QUESTIONS[currentQuestion].id];
  nextBtn.textContent =
    currentQuestion === QUESTIONS.length - 1 ? '결과 보기' : '다음';
}

// 이전 버튼
prevBtn.addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    updateProgress();
  }
});

// 다음 버튼
nextBtn.addEventListener('click', () => {
  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion++;
    renderQuestion();
    updateProgress();
  } else {
    calculateResult();
  }
});

// 동점 해소용 우승 카테고리 결정 함수
function getWinnerKeyFromScores(scores, answers) {
  const entries = Object.entries(scores);
  const maxScore = Math.max(...entries.map(([, v]) => v));
  const top = entries.filter(([, v]) => v === maxScore);

  // 1) 동점이 아니면 그대로 반환
  if (top.length === 1) return top[0][0];

  // 2) 최근에 선택한 답변을 우선시 (마지막 질문일수록 영향 크게)
  const answerOrderDesc = Object.entries(answers)
    .sort((a, b) => Number(b[0]) - Number(a[0])) // id 큰 순 = 마지막 질문부터
    .map(([, v]) => v); // 선택된 카테고리 key 배열

  for (const selected of answerOrderDesc) {
    if (top.some(([k]) => k === selected)) {
      return selected;
    }
  }

  // 3) 고정 우선순위(최후 동점 방지용)
  const PRIORITY = ['humanAI', 'dataInfoGraph', 'visionGraphics', 'systemsNetwork'];
  for (const key of PRIORITY) {
    if (top.some(([k]) => k === key)) return key;
  }

  // 4) 정말 최후의 수단
  return top[0][0];
}

// 결과 계산
function calculateResult() {
  if (!Object.keys(fields).length) return;

  scores = initScores();

  Object.values(answers).forEach((answer) => {
    if (Object.prototype.hasOwnProperty.call(scores, answer)) {
      scores[answer]++;
    }
  });

  const winnerKey = getWinnerKeyFromScores(scores, answers);
  if (winnerKey) {
    showResult(winnerKey);
  }
}

// 결과 표시
function showResult(key) {
  const field = fields[key];
  if (!field) return;

  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  const resultContainer = document.getElementById('resultContainer');
  const scoreBars = Object.entries(scores)
    .map(([k, score]) => {
      const info = fields[k];
      if (!info) return '';

      return `
      <div class="score-bar-item">
        <div class="score-bar-label">${info.title}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${
            (score / QUESTIONS.length) * 100
          }%; background: ${info.color}"></div>
        </div>
        <div class="score-bar-value">${score}/${QUESTIONS.length}</div>
      </div>
    `;
    })
    .join('');

  resultContainer.innerHTML = `
    <section class="result-hero" style="--accent-color:${field.color}">
      <p class="result-kicker">당신에게 맞는 AI 분야는</p>
      <h2 class="result-title">${field.fullTitle}</h2>
      <p class="result-subtitle">${field.desc}</p>
    </section>

    <section class="result-labs" style="--accent-color:${field.color}">
      <div class="result-cards-grid">
        ${field.labs
          .map(
            (lab) => `
          <article class="info-card">
            <span class="card-dot" aria-hidden="true"></span>
            <div class="card-eyebrow">${lab.englishName}</div>
            <div class="card-line" aria-hidden="true"></div>
            <h3 class="card-title">${lab.koreanName}</h3>
            <img class="card-logo" src="${lab.logo}" alt="${
              lab.englishName
            } logo" loading="lazy">
            <a class="card-more" href="${lab.url}" target="_blank" rel="noopener">+ MORE</a>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <div class="result-score">
      <h4>세부 점수</h4>
      <div class="score-bars">
        ${scoreBars}
      </div>
    </div>

    <div class="result-actions">
      <button class="btn btn--primary" id="restartBtn">다시 테스트하기</button>
      <button class="btn btn--ghost" id="shareBtn">결과 공유하기</button>
    </div>
  `;

  document.getElementById('restartBtn').addEventListener('click', () => {
    currentQuestion = 0;
    answers = {};
    scores = initScores();
    resultScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    quizScreen.style.display = 'none';
    if (labScrollStatic) labScrollStatic.classList.remove('is-hidden');
  });

  document.getElementById('shareBtn').addEventListener('click', () => {
    const shareText = `나의 AI 분야는 "${field.title}"입니다!\n숙명여대 AI공학부 적성 테스트에서 확인하세요.`;
    if (navigator.share) {
      navigator
        .share({
          title: 'AI 분야 적성 테스트',
          text: shareText,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(shareText + '\n' + window.location.href)
        .then(() => alert('결과가 클립보드에 복사되었습니다!'))
        .catch(() => {});
    }
  });

  resultScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

loadFields();

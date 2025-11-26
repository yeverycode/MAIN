// 테마 토글 + 로고 전환
(function initTheme() {
  const html = document.documentElement;
  const logo = document.querySelector('.nav__logo');
  const themeToggle = document.querySelector('#themeSwitch');
  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
    }
    if (logo) {
      const nextLogo = theme === 'dark' ? logo.dataset.logoDark : logo.dataset.logoLight;
      if (nextLogo) logo.src = nextLogo;
    }
  };
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  themeToggle?.addEventListener('change', (e) => {
    const next = e.target.checked ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
})();

// 분야/연구실 데이터
const FIELDS = {
  aiData: {
    title: '인공지능·데이터 사이언스',
    fullTitle: '인공지능·데이터 사이언스형 (AI Modeling & Data Science)',
    desc: 'AI 모델링, 비전, 추천, 데이터 중심 연구로 모델 성능과 데이터 가치를 끌어올립니다.',
    color: '#2563EB',
    labs: [
      { name: '그래프·추천·언어 모델 연구실', prof: '최윤혁', room: '수련교수회관 202호', url: 'https://choiyoonhyuk.github.io/' },
      { name: '지능형비전처리 연구실 (IVPL)', prof: '김병규', room: '새힘관 102호', url: 'http://ivpl.sookmyung.ac.kr' },
      { name: '3차원 인공지능 유니버스 연구실', prof: '강지우', room: '명신관 618호', url: 'http://www.aiunilab.com/' },
      { name: '데이터 분석 연구실', prof: '박영호', room: '새힘관 508호', url: 'https://sites.google.com/site/dbsook/professor' }
    ]
  },
  iotHci: {
    title: '지능형 시스템·IoT·인간 중심 인터랙션',
    fullTitle: '지능형 시스템·IoT·인간 중심 인터랙션형 (Intelligent Systems, IoT & HCI)',
    desc: '에이전트·IoT·UX·BCI 중심으로 사람과 사물을 연결하는 지능형 시스템을 설계합니다.',
    color: '#10B981',
    labs: [
      { name: '지능형 시스템 연구실', prof: '임유진', room: '새힘관 104호', url: 'https://sites.google.com/view/yujin91' },
      { name: '지식 및 정보공학 연구실', prof: '김철연', room: '새힘관 103호', url: 'https://kie.sookmyung.ac.kr/' },
      { name: '인간 중심 인공지능 연구실', prof: '김상연', room: '명신관 511호', url: 'https://sangyeonk.com' },
      { name: '인간 컴퓨터 상호작용 연구실', prof: '동서연', room: '새힘관 604호', url: 'https://sites.google.com/site/sydonglab/' }
    ]
  },
  systems: {
    title: '시스템·네트워크·보안·그래픽스',
    fullTitle: '시스템·네트워크·보안·그래픽스형 (Systems, Network Security & Graphics)',
    desc: '시스템, 네트워크, 보안, 그래픽스를 다루며 견고한 인프라와 시각 기술을 연구합니다.',
    color: '#EF4444',
    labs: [
      { name: '스마트 분산시스템 연구실', prof: '윤용익', room: '새힘관 512호', url: 'http://mm.sookmyung.ac.kr/~yiyoon' },
      { name: '지능형 시스템 소프트웨어 연구실', prof: '이종우', room: '새힘관 509호', url: 'https://sites.google.com/view/jwleelab' },
      { name: '시스템 네트워크 보안 연구실', prof: '정성훈', room: '명신관 508A호', url: 'https://www.snsec.net' },
      { name: '컴퓨터 그래픽스/가상현실 연구실', prof: '박화진', room: '새힘관 510호', url: 'https://sites.google.com/sookmyung.ac.kr/cgvr/home' }
    ]
  }
};

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '가장 흥미로운 주제는?',
    options: [
      { text: '그래프·비전·추천 같은 AI 모델링', score: 'aiData', icon: '🧠' },
      { text: 'IoT/에이전트와 UX, BCI 결합', score: 'iotHci', icon: '🤝' },
      { text: '네트워크·보안·그래픽스 같은 시스템', score: 'systems', icon: '🛡️' }
    ]
  },
  {
    id: 2,
    question: '어떤 환경을 선호하나요?',
    options: [
      { text: '데이터를 모으고 모델 성능을 높이는 환경', score: 'aiData', icon: '🧠' },
      { text: '센서·사용자와 실시간으로 상호작용하는 환경', score: 'iotHci', icon: '🤝' },
      { text: '안정성·성능이 핵심인 시스템/보안 환경', score: 'systems', icon: '🛡️' }
    ]
  },
  {
    id: 3,
    question: '나의 강점은?',
    options: [
      { text: '데이터 분석과 모델 튜닝', score: 'aiData', icon: '🧠' },
      { text: '사람/기기 경험 설계와 연결성', score: 'iotHci', icon: '🤝' },
      { text: '문제 해결과 시스템 최적화', score: 'systems', icon: '🛡️' }
    ]
  }
];

// 상태 관리
let currentQuestion = 0;
let answers = {};
let scores = { aiData: 0, iotHci: 0, systems: 0 };

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

// 시작 버튼
startBtn.addEventListener('click', () => {
  welcomeScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  renderQuestion();
  updateProgress();
});

// 질문 렌더링
function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  questionContainer.innerHTML = `
    <div class="question-card">
      <div class="question-number">질문 ${q.id}/${QUESTIONS.length}</div>
      <h3 class="question-text">${q.question}</h3>
      <div class="options-grid">
        ${q.options.map((opt) => `
          <button 
            class="option-card ${answers[q.id] === opt.score ? 'selected' : ''}" 
            data-score="${opt.score}"
            data-question="${q.id}"
          >
            <span class="option-icon">${opt.icon}</span>
            <span class="option-text">${opt.text}</span>
            <span class="option-check">✓</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // 옵션 클릭 이벤트
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const score = card.dataset.score;
      const qId = parseInt(card.dataset.question, 10);

      document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
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
  currentStepEl.textContent = currentQuestion + 1;
}

// 버튼 상태 업데이트
function updateButtons() {
  prevBtn.style.visibility = currentQuestion > 0 ? 'visible' : 'hidden';
  nextBtn.disabled = !answers[QUESTIONS[currentQuestion].id];
  nextBtn.textContent = currentQuestion === QUESTIONS.length - 1 ? '결과 보기' : '다음';
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

// 결과 계산
function calculateResult() {
  scores = { aiData: 0, iotHci: 0, systems: 0 };
  Object.values(answers).forEach(answer => {
    scores[answer]++;
  });
  const topKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  showResult(topKey);
}

// 결과 표시
function showResult(key) {
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  const field = FIELDS[key];
  const resultContainer = document.getElementById('resultContainer');

  resultContainer.innerHTML = `
    <div class="result-header">
      <div class="result-badge">당신의 AI 분야는</div>
      <h2 class="result-title">${field.fullTitle}</h2>
      <p class="result-desc">${field.desc}</p>
    </div>

    <div class="result-labs">
      <h3 class="result-labs-title">추천 연구실</h3>
      <div class="labs-list">
        ${field.labs.map(lab => `
          <div class="lab-item">
            <div class="lab-item-header">
              <h4 class="lab-name">${lab.name}</h4>
              <a href="${lab.url}" target="_blank" rel="noopener" class="lab-link">
                홈페이지 →
              </a>
            </div>
            <div class="lab-info">
              <span class="lab-prof">지도교수 ${lab.prof}</span>
              <span class="lab-room">${lab.room}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="result-score">
      <h4>세부 점수</h4>
      <div class="score-bars">
        ${Object.entries(scores).map(([k, score]) => `
          <div class="score-bar-item">
            <div class="score-bar-label">${FIELDS[k].title}</div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width: ${(score / QUESTIONS.length) * 100}%; background: ${FIELDS[k].color}"></div>
            </div>
            <div class="score-bar-value">${score}/${QUESTIONS.length}</div>
          </div>
        `).join('')}
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
    scores = { aiData: 0, iotHci: 0, systems: 0 };
    resultScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
  });

  document.getElementById('shareBtn').addEventListener('click', () => {
    const shareText = `나의 AI 분야는 "${field.title}"입니다!\n숙명여대 AI공학부 적성 테스트에서 확인하세요.`;
    if (navigator.share) {
      navigator.share({
        title: 'AI 분야 적성 테스트',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText + '\n' + window.location.href)
        .then(() => alert('결과가 클립보드에 복사되었습니다!'))
        .catch(() => {});
    }
  });

  resultScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

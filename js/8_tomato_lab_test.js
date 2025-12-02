// 분야/연구실 데이터
const FIELDS = {
  systemsNetwork: {
    title: '시스템·네트워크',
    fullTitle: '시스템·네트워크형',
    desc: '분산 시스템, 시스템 소프트웨어, 네트워크 보안 전반을 다루며 견고한 인프라를 설계합니다.',
    color: '#1D4ED8',
    labs: [
      { englishName: 'Smart Distributed System Lab.', koreanName: '스마트 분산시스템 연구실', prof: '윤용익', room: '새힘관 512호', url: 'http://mm.sookmyung.ac.kr/~yiyoon', logo: '/assets/lab_logo/color/8_tomato_yiyoon_logo.png' },
      { englishName: 'Smart System Software Lab.', koreanName: '지능형 시스템 소프트웨어 연구실', prof: '이종우', room: '새힘관 509호', url: 'https://sites.google.com/view/jwleelab', logo: '/assets/lab_logo/color/8_tomato_jwlee_logo.png' },
      { englishName: 'System and Network Security Lab.', koreanName: '시스템 네트워크 보안 연구실', prof: '정성훈', room: '명신관 508A호', url: 'https://www.snsec.net', logo: '/assets/lab_logo/color/8_tomato_shjeong_logo.png' }
    ]
  },
  visionGraphics: {
    title: '비전·그래픽스·VR/AR',
    fullTitle: '비전·그래픽스·VR/AR형',
    desc: '컴퓨터 비전과 3D 그래픽스, VR/AR을 중심으로 시각 지능과 몰입 경험을 연구합니다.',
    color: '#2563EB',
    labs: [
      { englishName: 'CG/VR Lab.', koreanName: '컴퓨터 그래픽스/가상현실 연구실', prof: '박화진', room: '새힘관 510호', url: 'https://sites.google.com/sookmyung.ac.kr/cgvr/home', logo: '/assets/lab_logo/color/8_tomato_hjpark_logo.png' },
      { englishName: 'IVPL (Intelligent Vision Processing Lab.)', koreanName: '지능형 비전처리 연구실', prof: '김병규', room: '새힘관 102호', url: 'http://ivpl.sookmyung.ac.kr', logo: '/assets/lab_logo/color/8_tomato_bgkim_logo.png' },
      { englishName: '3D AI Universe Lab.', koreanName: '3차원 인공지능 유니버스 연구실', prof: '강지우', room: '명신관 618호', url: 'http://www.aiunilab.com/', logo: '/assets/lab_logo/color/8_tomato_jwkang_logo.png' }
    ]
  },
  dataInfoGraph: {
    title: '데이터·정보·그래프',
    fullTitle: '데이터·정보·그래프형',
    desc: '데이터 분석, 정보공학, 그래프·추천·언어 모델링으로 데이터 기반 지능을 구현합니다.',
    color: '#0EA5E9',
    labs: [
      { englishName: 'Data Analytics Lab.', koreanName: '데이터 분석 연구실', prof: '박영호', room: '새힘관 508호', url: 'https://sites.google.com/site/dbsook/professor', logo: '/assets/lab_logo/color/8_tomato_yhpark_logo.png' },
      { englishName: 'Knowledge and Information Engineering Lab.', koreanName: '지식 및 정보 공학 연구실', prof: '김철연', room: '새힘관 103호', url: 'https://kie.sookmyung.ac.kr/', logo: '/assets/lab_logo/color/8_tomato_cykim_logo.png' },
      { englishName: 'Graph·Recommender·LLM Lab.', koreanName: '그래프·추천·언어 모델 연구실', prof: '최윤혁', room: '수련교수회관 202호', url: 'https://choiyoonhyuk.github.io/', logo: '/assets/lab_logo/color/8_tomato_yhchoi_logo.png' }
    ]
  },
  humanAI: {
    title: '인간 중심 AI·인터페이스',
    fullTitle: '인간 중심 AI·인터페이스형',
    desc: 'HCI, 지능형 시스템, 인간 중심 AI로 사람과 기술의 상호작용을 연구합니다.',
    color: '#10B981',
    labs: [
      { englishName: 'Intelligent System Lab.', koreanName: '지능형 시스템 연구실', prof: '임유진', room: '새힘관 104호', url: 'https://sites.google.com/view/yujin91', logo: '/assets/lab_logo/color/8_tomato_yjlim_logo.png' },
      { englishName: 'Human Computer Interaction Lab.', koreanName: '인간 컴퓨터 상호작용 연구실', prof: '동서연', room: '새힘관 604호', url: 'https://sites.google.com/site/sydonglab/', logo: '/assets/lab_logo/color/8_tomato_sydong_logo.png' },
      { englishName: 'Human-centered AI Lab.', koreanName: '인간 중심 인공지능 연구실', prof: '김상연', room: '명신관 511호', url: 'https://sangyeonk.com', logo: '/assets/lab_logo/color/8_tomato_sykim_logo.png' }
    ]
  }
};

const initScores = () => Object.keys(FIELDS).reduce((acc, key) => {
  acc[key] = 0;
  return acc;
}, {});

// 질문 데이터
const QUESTIONS = [
  {
    id: 1,
    question: '가장 흥미로운 주제는?',
    options: [
      { text: '분산 시스템·네트워크·보안', score: 'systemsNetwork' },
      { text: '비전·그래픽스·VR/AR', score: 'visionGraphics' },
      { text: '데이터 분석·정보공학·그래프/추천', score: 'dataInfoGraph' },
      { text: 'HCI·인간 중심 AI·지능형 시스템', score: 'humanAI' }
    ]
  },
  {
    id: 2,
    question: '어떤 유형의 문제를 풀고 싶나요?',
    options: [
      { text: '안정적 인프라, 네트워크/보안 최적화', score: 'systemsNetwork'},
      { text: '시각 지능과 몰입형 경험', score: 'visionGraphics'},
      { text: '데이터 기반 인사이트와 추천/LLM', score: 'dataInfoGraph'},
      { text: '사용자 경험과 인터페이스 설계', score: 'humanAI'}
    ]
  },
  {
    id: 3,
    question: '나의 강점은?',
    options: [
      { text: '시스템 설계·보안 사고력', score: 'systemsNetwork'},
      { text: '시각/3D 처리와 구현', score: 'visionGraphics'},
      { text: '데이터 분석과 모델링', score: 'dataInfoGraph'},
      { text: '사용자·인터랙션 설계', score: 'humanAI'}
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
        ${q.options.map((opt) => `
          <button 
            class="option-card ${answers[q.id] === opt.score ? 'selected' : ''}" 
            data-score="${opt.score}"
            data-question="${q.id}"
          >
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
  if (currentStepEl) currentStepEl.textContent = currentQuestion + 1;
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
  scores = initScores();
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
    <section class="result-hero" style="--accent-color:${field.color}">
      <p class="result-kicker">당신에게 맞는 AI 분야는</p>
      <h2 class="result-title">${field.fullTitle}</h2>
      <p class="result-subtitle">${field.desc}</p>
    </section>

    <section class="result-labs" style="--accent-color:${field.color}">
      <div class="result-cards-grid">
        ${field.labs.map(lab => `
          <article class="info-card">
            <span class="card-dot" aria-hidden="true"></span>
            <div class="card-eyebrow">${lab.englishName}</div>
            <div class="card-line" aria-hidden="true"></div>
            <h3 class="card-title">${lab.koreanName}</h3>
            <img class="card-logo" src="${lab.logo}" alt="${lab.englishName} logo" loading="lazy">
            <a class="card-more" href="${lab.url}" target="_blank" rel="noopener">+ MORE</a>
          </article>
        `).join('')}
      </div>
    </section>

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
    scores = initScores();
    resultScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    quizScreen.style.display = 'none';
    if (labScrollStatic) labScrollStatic.classList.remove('is-hidden');
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

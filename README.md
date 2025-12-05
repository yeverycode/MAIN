# 2025 Fall Web-Progamming 🍅Tomato Team Project🍅

## 숙명여자대학교 인공지능공학부 웹사이트

학과·학생회 정보, 이벤트, 교수·연구실 소개, 적성 테스트 등을 담은 정적 멀티페이지 사이트입니다. 별도 빌드 없이 HTML/CSS/JS와 JSON 데이터로 구동하며, 페이지별 스크립트가 인터랙션과 필터링을 담당합니다.

## 주요 기능

- 메인 랜딩: 애니메이션 히어로, 학과 소개 카드, 고정 네비게이션 드롭다운.
- 학과 소개/커리큘럼: JSON(`data/8_tomato_curriculum.json`) 기반 학년/학기/키워드 필터링 및 검색.
- 학생회/FAQ: 학생회 구성과 FAQ 데이터를 카드·아코디언 형태로 표시.
- 이벤트: 연간 일정, 진행/지난 이벤트 목록, D-Day/정원 표시, 배너 슬라이드, 상세/신청 페이지(`pages/event/*`, `js/8_tomato_event_*.js`).
- 교수·연구실: JSON(`data/professor/8_tomato_professors.json`)으로 교수 카드 생성, 상세 페이지 라우팅, 연구실 적성 테스트(퀴즈 + 공유) 제공.
- 리크루팅: Kakao 지도 연동, 모집 요강/우대사항/지원 링크 안내.

## 디렉터리 구조

- `pages/` : 개별 HTML 페이지 (메인, 소개, 커리큘럼, 학생회, 이벤트, 교수, FAQ, 리크루트 등).
- `js/` : 페이지별 바닐라 JS 스크립트. 데이터 로딩, 필터링, 폼 상태 관리, 로컬 스토리지 저장 등을 담당.
- `css/` : 공통 스타일(`8_tomato_common.css`)과 페이지 전용 스타일.
- `data/` : 사이트 콘텐츠 JSON(커리큘럼, 이벤트, FAQ, 연구실 테스트, 교수 데이터 등).
- `assets/` : 이미지, 아이콘, 로고 리소스.

브라우저에서 `http://localhost:3000/pages/8_tomato_main.html`을 열고 네비게이션으로 다른 페이지에 이동합니다.

## 데이터 수정

- 콘텐츠는 대부분 `data/` 하위 JSON에서 불러옵니다.
  - 커리큘럼: `data/8_tomato_curriculum.json`
  - 이벤트: `data/8_tomato_event_list.json`, `data/8_tomato_event_calendar.json`, `data/event_apply/*.json`
  - FAQ: `data/8_tomato_faq.json`
  - 교수/연구실: `data/professor/*.json`, `data/8_tomato_lab_test.json`
- 이미지나 로고를 교체하려면 `assets/` 경로나 JSON 내 이미지 URL을 수정하세요.

## 기술 스택 및 특이사항

- 정적 HTML + 바닐라 JS + CSS (별도 빌드/의존성 없음).
- 로컬 스토리지로 이벤트 신청 인원, 퀴즈 답변 등을 기억합니다.
- `prefers-reduced-motion` 대응 애니메이션, 접근성 속성(aria-label/role) 일부 적용.
- 리크루트 페이지는 Kakao Maps SDK 스크립트를 사용합니다. 온라인 환경에서만 지도 로딩이 가능합니다.

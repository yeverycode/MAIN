// /js/8_tomato_events.js

let eventsData = [];
let bannerIntervalId = null;

// 오늘 날짜(00:00 기준)
const today = new Date();
today.setHours(0, 0, 0, 0);

// 진행중 / 지난 상태 계산
function getStatus(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < today) return "past";      // 기간 끝난 경우
  return "ongoing";                    // 오늘 이후는 진행/예정
}

// D-Day 라벨 (진행중이면 마감일까지 남은 일수)
function getDDayLabel(startStr, endStr) {
  const target = new Date(endStr || startStr);
  target.setHours(0, 0, 0, 0);

  const diffMs = target - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  return "종료";
}

// 상태별 배너 이미지 수집
function getBannerItemsByStatus(status) {
  const items = [];

  eventsData.forEach((ev) => {
    if (getStatus(ev.startDate, ev.endDate) !== status) return;
    const banners = ev.bannerImages && ev.bannerImages.length
      ? ev.bannerImages
      : ev.image
        ? [ev.image]
        : [];

    banners.forEach((src) => {
      items.push({
        src,
        title: ev.title || "이벤트",
      });
    });
  });

  if (!items.length) {
    items.push({
      src: "https://placehold.co/1245x214?text=%EC%A7%84%ED%96%89%EC%A4%91%EC%9D%B8%2F%EC%A7%80%EB%82%9C%20%EC%9D%B4%EB%B2%A4%ED%8A%B8%20%EB%B0%B0%EB%84%88",
      title: "이벤트 배너",
    });
  }

  return items;
}

function renderBannerDots(dotsEl, count, activeIndex) {
  dotsEl.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement("span");
    dot.className = `dot${i === activeIndex ? " dot--active" : ""}`;
    dotsEl.appendChild(dot);
  }
}

// 배너 회전 시작
function startBannerRotation(status) {
  const imageEl = document.querySelector(".event-banner__image");
  const dotsEl = document.querySelector(".event-banner__dots");
  if (!imageEl || !dotsEl) return;

  const items = getBannerItemsByStatus(status);
  let index = 0;

  const applyFrame = () => {
    const current = items[index];
    imageEl.src = current.src;
    imageEl.alt = `${current.title} 배너`;
    renderBannerDots(dotsEl, items.length, index);
  };

  applyFrame();

  if (bannerIntervalId) clearInterval(bannerIntervalId);
  bannerIntervalId = null;

  if (items.length > 1) {
    bannerIntervalId = setInterval(() => {
      index = (index + 1) % items.length;
      applyFrame();
    }, 4000);
  }
}

// 카드 DOM 생성
function createEventCard(event) {
  const status = getStatus(event.startDate, event.endDate);
  const dday = getDDayLabel(event.startDate, event.endDate);

  const article = document.createElement("article");
  article.className = "event-card";
  article.dataset.status = status;

  article.innerHTML = `
    <a href="${event.link}" class="event-card__link">
      <div class="event-card__thumb">
        <img src="${event.image}" alt="${event.title} 포스터" />
      </div>
      <div class="event-card__body">
        <h3 class="event-card__title">${event.title}</h3>
        <p class="event-card__desc">${event.description}</p>
        <div class="event-card__meta">
          <span class="event-card__period">${event.periodText}</span>
          <span class="event-card__dday">${dday}</span>
        </div>
      </div>
    </a>
  `;

  return article;
}

// 리스트 렌더링
function renderEvents(filterStatus = "ongoing") {
  const listEl = document.getElementById("eventList");
  listEl.innerHTML = "";

  const filtered = eventsData.filter(
    (ev) => getStatus(ev.startDate, ev.endDate) === filterStatus
  );

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "event-list__empty";
    empty.textContent =
      filterStatus === "ongoing"
        ? "현재 진행중인 이벤트가 없습니다."
        : "지난 이벤트가 아직 없습니다.";
    listEl.appendChild(empty);
    return;
  }

  filtered
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // 최신순
    .forEach((ev) => listEl.appendChild(createEventCard(ev)));
}

// 탭 클릭 설정
// 리스트 / 캘린더 뷰 토글
function setupViewToggle() {
  const buttons = document.querySelectorAll(".view-icon");
  const listView = document.getElementById("eventList");
  const calendarView = document.getElementById("eventCalendar");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;

      buttons.forEach((c) => {
        c.classList.remove("view-icon--active");
        c.setAttribute("aria-pressed", "false");
      });
      button.classList.add("view-icon--active");
      button.setAttribute("aria-pressed", "true");

      if (view === "list") {
        listView.hidden = false;
        calendarView.hidden = true;
      } else {
        listView.hidden = true;
        calendarView.hidden = false;
      }
    });
  });
}

// JSON 로드
async function loadEvents() {
  try {
    const res = await fetch("/data/8_tomato_event_list.json");
    if (!res.ok) throw new Error("이벤트 데이터를 불러오지 못했습니다.");
    eventsData = await res.json();
  } catch (err) {
    console.error(err);
    const listEl = document.getElementById("eventList");
    if (listEl) {
      listEl.innerHTML =
        '<p class="event-list__empty">이벤트 데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
  }
}

// 상태 탭 설정 (진행중 / 지난)
function setupStatusTabs(defaultStatus = "ongoing") {
  const tabs = document.querySelectorAll(".page-hero__subnav [data-status]");

  const activate = (status) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.status === status;
      const parent = tab.closest("li");
      if (parent) {
        parent.classList.toggle("is-active", isActive);
      }
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
    renderEvents(status);
    startBannerRotation(status);
  };

  activate(defaultStatus);

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const status = tab.dataset.status;
      activate(status);
    });
  });
}

// 진행중 이벤트가 없으면 자동으로 지난 탭으로 이동
function getDefaultStatus() {
  const hasOngoing = eventsData.some(
    (ev) => getStatus(ev.startDate, ev.endDate) === "ongoing"
  );
  return hasOngoing ? "ongoing" : "past";
}

// 초기 실행
document.addEventListener("DOMContentLoaded", async () => {
  await loadEvents();
  const defaultStatus = getDefaultStatus();
  setupStatusTabs(defaultStatus);
  setupViewToggle();
  renderEvents(defaultStatus);
  startBannerRotation(defaultStatus);
});

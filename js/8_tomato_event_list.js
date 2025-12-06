let eventsData = [];
let calendarSourceEvents = [];
let bannerIntervalId = null;
const APPLY_STORAGE_KEY = "tomato_event_apply_state_v1";

const today = new Date();
today.setHours(0, 0, 0, 0);

const CALENDAR_MONTH_LABELS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const calendarState = {
  events: [],
  filter: "all",
  currentYear: null,
  currentMonth: null,
  selectedDate: null,
  initialized: false,
};

function pickNumber(...candidates) {
  for (const value of candidates) {
    if (Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function loadApplyState() {
  try {
    const raw = localStorage.getItem(APPLY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("apply storage load error", err);
    return {};
  }
}

function mergeStoredCounts(event) {
  if (!event?.id) return event;
  const state = loadApplyState();
  const stored = state[String(event.id)];
  if (!stored) return event;

  const mergedApplied = pickNumber(stored.applied, stored.appliedCount, event.appliedCount);
  const mergedCapacity = pickNumber(stored.capacity, event.capacity);
  const mergedWaiting = pickNumber(stored.waitingCount, event.waitingCount);

  return {
    ...event,
    appliedCount: mergedApplied ?? event.appliedCount,
    capacity: mergedCapacity ?? event.capacity,
    waitingCount: mergedWaiting ?? event.waitingCount,
  };
}

function normalizeStatus(status) {
  const val = (status || "").toString().toLowerCase();
  if (["open", "closed", "finished"].includes(val)) return val;
  return null;
}

function getStatus(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < today) return "past";
  return "ongoing";
}

function getDDayLabel(startStr, endStr) {
  const target = new Date(endStr || startStr);
  target.setHours(0, 0, 0, 0);

  const diffMs = target - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  return "종료";
}

function getListStatus(event) {
  const calc = getStatus(event.startDate, event.endDate);
  if (calc === "past") return "past";

  const explicit = normalizeStatus(event.status);
  if (explicit === "finished") return "past";
  if (explicit === "open" || explicit === "closed") return "ongoing";

  return calc;
}

function getStatusLabel(event, listStatus) {
  if (listStatus === "past") return "종료";

  const explicit = normalizeStatus(event.status);
  if (explicit === "open") return "접수 중";
  if (explicit === "closed") return "마감";
  if (explicit === "finished") return "종료";
  return "진행";
}

function getCapacityInfo(event, status) {
  if (status !== "ongoing") return null;

  const { capacity, appliedCount, waitingCount, waitingAvailable } = event || {};
  const total = Number.isFinite(capacity) ? capacity : null;
  const applied = Number.isFinite(appliedCount) ? appliedCount : null;
  const waiting = Number.isFinite(waitingCount) ? waitingCount : null;

  if (total !== null && applied !== null) {
    if (applied < total) {
      return {
        label: `${applied}/${total} 신청`,
        modifier: "",
      };
    }

    const waitingLabel =
      waiting !== null
        ? ` · 대기 ${waiting}명`
        : waitingAvailable === true
        ? " · 대기 가능"
        : "";

    return {
      label: `정원 ${total}명 마감${waitingLabel}`,
      modifier: "event-card__capacity--full",
    };
  }

  const parts = [];
  if (total !== null) parts.push(`선착순 ${total}명 신청`);
  if (waitingAvailable === true) parts.push("대기 가능");

  if (parts.length === 0) return null;

  return {
    label: parts.join(" / "),
    modifier: "",
  };
}

function getDetailHref(event) {
  const targetId = event?.sourceId ?? event?.id;
  return targetId
    ? `/pages/event/8_tomato_event_apply.html?id=${targetId}`
    : event?.link || "#";
}

function getBannerItemsByStatus(status) {
  const items = [];

  eventsData.forEach((ev) => {
    if (getListStatus(ev) !== status) return;
    const hasBannerField = Object.prototype.hasOwnProperty.call(ev, "bannerImages");
    const banners =
      Array.isArray(ev.bannerImages) && ev.bannerImages.length
        ? ev.bannerImages
        : hasBannerField
        ? []
        : ev.image
        ? [ev.image]
        : [];

    banners.forEach((src) => {
      items.push({
        src,
        title: ev.title || "이벤트",
        href: getDetailHref(ev),
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

function startBannerRotation(status) {
  const viewport = document.querySelector(".event-banner__viewport");
  const trackEl = document.querySelector(".event-banner__track");
  const dotsEl = document.querySelector(".event-banner__dots");
  const prevBtn = document.querySelector(".event-banner__arrow--prev");
  const nextBtn = document.querySelector(".event-banner__arrow--next");
  if (!viewport || !trackEl || !dotsEl) return;

  // Reset track to drop previous listeners
  const trackParent = trackEl.parentNode;
  const newTrack = trackEl.cloneNode(false);
  trackParent.replaceChild(newTrack, trackEl);
  let track = newTrack;

  const items = getBannerItemsByStatus(status);
  const realCount = items.length;
  if (bannerIntervalId) {
    clearInterval(bannerIntervalId);
    bannerIntervalId = null;
  }

  track.innerHTML = "";
  if (realCount === 0) return;

  // Build cloned slides for seamless loop: [lastClone, ...items, firstClone]
  const slides = [];
  const makeImg = (item, idx) => {
    const img = document.createElement("img");
    img.className = "event-banner__image";
    img.src = item.src;
    img.alt = `${item.title || "이벤트"} 배너`;
    img.loading = idx === 0 ? "eager" : "lazy";
    return img;
  };

  if (realCount > 1) slides.push(makeImg(items[realCount - 1], -1));
  items.forEach((item, idx) => slides.push(makeImg(item, idx)));
  if (realCount > 1) slides.push(makeImg(items[0], realCount));

  slides.forEach((img) => track.appendChild(img));

  let index = realCount > 1 ? 1 : 0; // start at first real slide
  let currentHref = items[0]?.href || "#";

  const setTransition = (enable) => {
    track.style.transition = enable ? "transform 0.55s ease" : "none";
  };

  const applyFrame = (withTransition = true) => {
    const realIndex = realCount > 1 ? (index - 1 + realCount) % realCount : index;
    currentHref = items[realIndex]?.href || "#";
    setTransition(withTransition);
    track.style.transform = `translateX(-${index * 100}%)`;
    renderBannerDots(dotsEl, realCount, realIndex);
  };

  const restartInterval = () => {
    if (bannerIntervalId) clearInterval(bannerIntervalId);
    bannerIntervalId = null;

    if (realCount > 1) {
      bannerIntervalId = setInterval(() => {
        index += 1;
        applyFrame(true);
      }, 4000);
    }
  };

  const normalizeIndex = () => {
    if (realCount <= 1) return;
    if (index === 0) {
      index = realCount;
      applyFrame(false);
    } else if (index === realCount + 1) {
      index = 1;
      applyFrame(false);
    }
  };

  const goTo = (nextIndex) => {
    index = nextIndex;
    applyFrame(true);
    restartInterval();
  };

  track.addEventListener("transitionend", normalizeIndex);

  applyFrame(false);

  viewport.style.cursor = items.length ? "pointer" : "default";
  viewport.onclick = () => {
    if (currentHref) window.location.href = currentHref;
  };

  const disableNav = realCount <= 1;
  if (prevBtn) {
    prevBtn.disabled = disableNav;
    prevBtn.onclick = disableNav ? null : () => goTo(index - 1);
  }
  if (nextBtn) {
    nextBtn.disabled = disableNav;
    nextBtn.onclick = disableNav ? null : () => goTo(index + 1);
  }

  restartInterval();
}

function createEventCard(event) {
  const status = getListStatus(event);
  const dday = getDDayLabel(event.startDate, event.endDate);
  const statusLabel = getStatusLabel(event, status);
  const capacityInfo = getCapacityInfo(event, status);
  const isPast = status === "past";
  const showStatus = !isPast;
  const detailHref = getDetailHref(event);
  const imageSrc =
    event.image || "https://placehold.co/600x400/0B50D0/FFFFFF?text=EVENT";

  const metaParts = [];

  if (isPast) {
    metaParts.push(
      `<span class="event-card__status event-card__status--past">종료</span>`
    );
  } else {
    metaParts.push(`<span class="event-card__period">${event.periodText}</span>`);
    metaParts.push(`<span class="event-card__dday">${dday}</span>`);
    if (showStatus) {
      metaParts.push(`<span class="event-card__status">${statusLabel}</span>`);
    }
    if (capacityInfo?.label) {
      metaParts.push(
        `<span class="event-card__capacity${capacityInfo.modifier ? ` ${capacityInfo.modifier}` : ""}">${capacityInfo.label}</span>`
      );
    }
  }

  const article = document.createElement("article");
  article.className = "event-card";
  article.dataset.status = status;

  article.innerHTML = `
    <a href="${detailHref}" class="event-card__link">
      <div class="event-card__thumb">
        <img src="${imageSrc}" alt="${event.title} 포스터" />
      </div>
      <div class="event-card__body">
        <h3 class="event-card__title">${event.title}</h3>
        <p class="event-card__desc">${event.description}</p>
        <div class="event-card__meta">${metaParts.join("")}</div>
      </div>
    </a>
  `;

  return article;
}

function renderEvents(filterStatus = "ongoing") {
  const listEl = document.getElementById("eventList");
  listEl.innerHTML = "";

  const filtered = eventsData.filter((ev) => getListStatus(ev) === filterStatus);

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

  const sorted = filtered.sort((a, b) => {
    if (filterStatus === "past") {
      const aId = pickNumber(a?.id);
      const bId = pickNumber(b?.id);
      if (aId !== null && bId !== null) return bId - aId;
      return String(b?.id ?? "").localeCompare(String(a?.id ?? ""));
    }
    return new Date(b.startDate) - new Date(a.startDate);
  });

  sorted.forEach((ev) => listEl.appendChild(createEventCard(ev)));
}

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

async function loadEvents() {
  const LIST_URL = "/data/8_tomato_event_list.json";
  const CALENDAR_URL = "/data/8_tomato_event_calendar.json";

  try {
    const listRes = await fetch(LIST_URL);
    if (!listRes.ok) throw new Error("이벤트 리스트 데이터를 불러오지 못했습니다.");
    const listData = await listRes.json();
    eventsData = Array.isArray(listData)
      ? listData.map((ev) => mergeStoredCounts(ev))
      : [];
  } catch (err) {
    console.error(err);
    const listEl = document.getElementById("eventList");
    if (listEl) {
      listEl.innerHTML =
        '<p class="event-list__empty">이벤트 데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
  }

  try {
    const calRes = await fetch(CALENDAR_URL);
    if (!calRes.ok) throw new Error("캘린더 데이터를 불러오지 못했습니다.");
    const calData = await calRes.json();
    calendarSourceEvents = Array.isArray(calData?.events)
      ? calData.events
      : Array.isArray(calData)
      ? calData
      : [];
  } catch (err) {
    console.warn("캘린더 데이터 로드 오류", err);
    calendarSourceEvents = [];
  }
}

function getEventType(event) {
  return event?.type || "event";
}

function parseDateLocal(str) {
  if (!str || typeof str !== "string") return null;
  const [y, m, d] = str.split("-").map((v) => Number(v));
  if ([y, m, d].some((n) => Number.isNaN(n))) return null;
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateStr(date) {
  if (!(date instanceof Date) || Number.isNaN(date)) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseEventDateRange(eventDateStr) {
  if (!eventDateStr || typeof eventDateStr !== "string") return null;

  const first = eventDateStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (!first) return null;

  const startYear = Number(first[1]);
  const startMonth = Number(first[2]);
  const startDay = Number(first[3]);

  const start = new Date(startYear, startMonth - 1, startDay);
  start.setHours(0, 0, 0, 0);

  let end = start;
  const range = eventDateStr.match(
    /~\s*(?:(\d{4})\.\s*)?(\d{1,2})\.\s*(\d{1,2})/
  );
  if (range) {
    const endYear = range[1] ? Number(range[1]) : startYear;
    const endMonth = Number(range[2]);
    const endDay = Number(range[3]);
    end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(0, 0, 0, 0);
  }

  return {
    startDate: formatDateStr(start),
    endDate: formatDateStr(end),
    _startDate: start,
    _endDate: end,
  };
}

function isSameDateLocal(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function passesCalendarFilter(event) {
  if (!event) return false;
  if (calendarState.filter === "all") return true;
  const status = getListStatus(event);
  if (calendarState.filter === "ongoing") return status === "ongoing";
  if (calendarState.filter === "past") return status === "past";
  return true;
}

function isListEvent(ev) {
  return ev && ev.fromEventList === true;
}

function getCalendarLabel(ev, dateStr) {
  if (!isListEvent(ev)) {
    return ev.title || "";
  }

  if (ev.isEndMarker) {
    return ev.title || "";
  }

  return `${ev.title} 신청기간`;
}

function getCalendarEventsFromList() {
  const calendarEvents = Array.isArray(calendarSourceEvents)
    ? calendarSourceEvents
    : [];

  const result = [];

  calendarEvents.forEach((ev, idx) => {
    if (!ev || (ev.type || "event") !== "event") return;

    const start = parseDateLocal(ev.startDate);
    const end = parseDateLocal(ev.endDate || ev.startDate);
    if (!start || !end) return;

    const baseId =
      ev.id !== undefined && ev.id !== null ? ev.id : `cal-event-${idx}`;

    result.push({
      ...ev,
      id: `${baseId}-apply`,
      sourceId: baseId,
      type: "department",
      sourceType: ev.type || "event",
      categoryLabel: "학과 일정",
      startDate: ev.startDate,
      endDate: ev.endDate || ev.startDate,
      _startDate: start,
      _endDate: end,
      _trackIndex: null,
      fromEventList: true,
      isEndMarker: false,
    });

    const eventDateRange = parseEventDateRange(ev.eventDate);
    if (eventDateRange) {
      result.push({
        ...ev,
        id: `${baseId}-event`,
        sourceId: baseId,
        sourceType: ev.type || "event",
        startDate: eventDateRange.startDate,
        endDate: eventDateRange.endDate,
        _startDate: eventDateRange._startDate,
        _endDate: eventDateRange._endDate,
        _trackIndex: null,
        fromEventList: false,
        isEndMarker: false,
      });
    }
  });

  return result;
}

function getCalendarOtherEvents() {
  return (calendarSourceEvents || [])
    .filter((ev) => ev && (ev.type === "academic" || ev.type === "department"))
    .map((ev) => {
      const start = parseDateLocal(ev.startDate);
      const end = parseDateLocal(ev.endDate);
      if (!start || !end) return null;
      return {
        ...ev,
        _startDate: start,
        _endDate: end,
        _trackIndex: null,
        fromEventList: false,
        categoryLabel:
          ev.categoryLabel || (ev.type === "academic" ? "학사 일정" : "학과 일정"),
      };
    })
    .filter(Boolean);
}

function prepareCalendarTracks(year, month) {
  calendarState.events.forEach((ev) => {
    ev._trackIndex = null;
  });

  const monthStart = new Date(year, month - 1, 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, month, 0);
  monthEnd.setHours(0, 0, 0, 0);

  const multiDay = calendarState.events
    .filter((ev) => {
      if (!passesCalendarFilter(ev)) return false;
      if (!ev._startDate || !ev._endDate) return false;
      if (isSameDateLocal(ev._startDate, ev._endDate)) return false;
      return ev._endDate >= monthStart && ev._startDate <= monthEnd;
    })
    .map((ev) => ({
      ev,
      start: ev._startDate < monthStart ? monthStart : ev._startDate,
      end: ev._endDate > monthEnd ? monthEnd : ev._endDate,
    }))
    .sort(
      (a, b) =>
        a.start - b.start ||
        (a.ev.id || "").toString().localeCompare((b.ev.id || "").toString())
    );

  const trackEndDates = [];

  multiDay.forEach(({ ev, start, end }) => {
    let trackIdx = 0;
    for (; trackIdx < trackEndDates.length; trackIdx += 1) {
      if (start > trackEndDates[trackIdx]) break;
    }
    if (trackIdx === trackEndDates.length) {
      trackEndDates.push(end);
    } else if (end > trackEndDates[trackIdx]) {
      trackEndDates[trackIdx] = end;
    }
    ev._trackIndex = trackIdx;
  });
}

function getCalendarStartDate() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function updateCalendarHeader() {
  const { currentYear, currentMonth } = calendarState;
  const yearEl = document.getElementById("calendarYear");
  const monthNumEl = document.getElementById("calendarMonthNumber");
  const monthLabelEl = document.getElementById("calendarMonthLabel");

  if (yearEl) yearEl.textContent = currentYear ?? "--";
  if (monthNumEl) monthNumEl.textContent = currentMonth ?? "--";
  if (monthLabelEl)
    monthLabelEl.textContent =
      currentMonth ? CALENDAR_MONTH_LABELS[currentMonth - 1] || "" : "";
}

function updateCalendarSelectedDayUI() {
  const cells = document.querySelectorAll(".calendar-day");
  cells.forEach((c) => c.classList.remove("is-selected"));
  cells.forEach((c) => {
    if (c.dataset.date === calendarState.selectedDate) {
      c.classList.add("is-selected");
    }
  });
}

function renderCalendarDetail() {
  const detailDateText = document.getElementById("detailDateText");
  const detailList = document.getElementById("detailEventList");
  if (!detailDateText || !detailList) return;

  detailList.innerHTML = "";
  if (!calendarState.selectedDate) return;

  const [y, m, d] = calendarState.selectedDate.split("-");
  detailDateText.textContent = `${Number(m)}월 ${Number(d)}일 일정`;

  const target = parseDateLocal(calendarState.selectedDate);
  const events = calendarState.events.filter(
    (ev) =>
      passesCalendarFilter(ev) &&
      ev._startDate &&
      ev._endDate &&
      ev._startDate <= target &&
      ev._endDate >= target
  );

  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "calendar-detail__empty";
    empty.textContent = "등록된 일정이 없습니다.";
    detailList.appendChild(empty);
    return;
  }

  events.forEach((ev) => {
    const typeMod =
      ev.type === "academic" || ev.type === "department" ? ev.type : "event";
    const showApply =
      (ev.sourceType || ev.type) === "event" && !!(ev.sourceId ?? ev.id);

    const card = document.createElement("article");
    card.className = "calendar-detail-card";

    const metaRow = document.createElement("div");
    metaRow.className = "calendar-detail-card__meta";

    const badge = document.createElement("span");
    badge.className = `detail-badge detail-badge--${typeMod}`;
    badge.textContent = ev.categoryLabel || "학과 행사";
    metaRow.appendChild(badge);

    const titleRow = document.createElement("div");
    titleRow.className = "calendar-detail-card__title-row";

    const title = document.createElement("h3");
    title.className = "calendar-detail-card__title";
    const href = getDetailHref(ev);
    if (href && href !== "#") {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = ev.title;
      title.appendChild(link);
    } else {
      title.textContent = ev.title;
    }
    titleRow.appendChild(title);

    if (showApply) {
      const applyLink = document.createElement("a");
      applyLink.className = "detail-apply detail-apply--title";
      const targetId = ev.sourceId ?? ev.id;
      applyLink.href = `/pages/event/8_tomato_event_apply.html?id=${targetId}`;
      applyLink.textContent = "+APPLY";
      titleRow.appendChild(applyLink);
    }

    const bodyRow = document.createElement("div");
    bodyRow.className = "calendar-detail-card__body";

    const desc = document.createElement("p");
    desc.className = "calendar-detail-card__desc";
    desc.textContent = ev.description || "";
    bodyRow.appendChild(desc);

    card.appendChild(metaRow);
    card.appendChild(titleRow);
    card.appendChild(bodyRow);

    detailList.appendChild(card);
  });
}

function renderCalendarGrid() {
  const grid = document.getElementById("calendarGrid");
  if (!grid || !calendarState.currentYear || !calendarState.currentMonth) return;

  grid.innerHTML = "";

  const year = calendarState.currentYear;
  const month = calendarState.currentMonth;
  prepareCalendarTracks(year, month);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - firstDay + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cell.classList.add("is-empty");
      grid.appendChild(cell);
      continue;
    }

    const dateObj = new Date(year, month - 1, dayNumber);
    dateObj.setHours(0, 0, 0, 0);
    const dateStr = formatDateStr(dateObj);

    cell.dataset.date = dateStr;

    const num = document.createElement("div");
    num.className = "calendar-day__number";
    num.textContent = dayNumber;
    cell.appendChild(num);

    const eventsWrapper = document.createElement("div");
    eventsWrapper.className = "calendar-day__events";

    const dayEvents = calendarState.events.filter((ev) => {
      if (!passesCalendarFilter(ev)) return false;
      if (!ev._startDate || !ev._endDate) return false;
      return dateObj >= ev._startDate && dateObj <= ev._endDate;
    });

    const multiEvents = [];
    const singleEvents = [];

    dayEvents.forEach((ev) => {
      if (isSameDateLocal(ev._startDate, ev._endDate)) {
        singleEvents.push(ev);
      } else {
        multiEvents.push(ev);
      }
    });

    if (multiEvents.length > 0) {
      const maxTrack = Math.max(
        ...multiEvents.map((ev) =>
          typeof ev._trackIndex === "number" ? ev._trackIndex : 0
        )
      );

      for (let t = 0; t <= maxTrack; t += 1) {
        const ev = multiEvents.find(
          (m) => typeof m._trackIndex === "number" && m._trackIndex === t
        );

        if (ev) {
          const typeMod =
            ev.type === "academic" || ev.type === "department" ? ev.type : "event";
          const isStart = isSameDateLocal(dateObj, ev._startDate);
          const isEnd = isSameDateLocal(dateObj, ev._endDate);

          const label = getCalendarLabel(ev, dateStr);

          const pill = document.createElement("div");
          pill.className =
            `calendar-event-pill calendar-event-pill--${typeMod} calendar-range-seg`;
          pill.textContent = label;
          pill.title = label;

          if (isStart && isEnd) {
          } else if (isStart) {
            pill.classList.add("calendar-range-seg--start");
          } else if (isEnd) {
            pill.classList.add(
              "calendar-range-seg--end",
              "calendar-range-seg--ghost"
            );
          } else {
            pill.classList.add(
              "calendar-range-seg--middle",
              "calendar-range-seg--ghost"
            );
          }

          eventsWrapper.appendChild(pill);
        } else {
          const spacer = document.createElement("div");
          spacer.className =
            "calendar-event-pill calendar-range-seg calendar-range-spacer";
          spacer.textContent = "\u00a0";
          eventsWrapper.appendChild(spacer);
        }
      }
    }

    singleEvents.forEach((ev) => {
      const typeMod =
        ev.type === "academic" || ev.type === "department" ? ev.type : "event";
      const label = getCalendarLabel(ev, dateStr);

      const pill = document.createElement("div");
      pill.className = `calendar-event-pill calendar-event-pill--${typeMod}`;
      pill.textContent = label;
      pill.title = label;
      eventsWrapper.appendChild(pill);
    });

    cell.appendChild(eventsWrapper);

    cell.addEventListener("click", () => {
      calendarState.selectedDate = dateStr;
      updateCalendarSelectedDayUI();
      renderCalendarDetail();
    });

    grid.appendChild(cell);
  }

  updateCalendarSelectedDayUI();
}

function setupCalendarFilters() {
  const chips = document.querySelectorAll("[data-calendar-filter]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      calendarState.filter = chip.dataset.calendarFilter || "all";
      renderCalendarGrid();
      renderCalendarDetail();
    });
  });
}

function changeCalendarMonth(delta) {
  if (!calendarState.currentYear || !calendarState.currentMonth) return;

  let y = calendarState.currentYear;
  let m = calendarState.currentMonth + delta;

  if (m < 1) {
    m = 12;
    y -= 1;
  } else if (m > 12) {
    m = 1;
    y += 1;
  }

  calendarState.currentYear = y;
  calendarState.currentMonth = m;

  const nextSelected =
    parseDateLocal(calendarState.selectedDate) || new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const adjustedDay = Math.min(nextSelected.getDate(), daysInMonth);
  const newSelected = new Date(y, m - 1, adjustedDay);
  newSelected.setHours(0, 0, 0, 0);
  calendarState.selectedDate = formatDateStr(newSelected);

  updateCalendarHeader();
  renderCalendarGrid();
  renderCalendarDetail();
}

function setupCalendarNavigation() {
  const prevBtn = document.getElementById("calendarPrevMonth");
  const nextBtn = document.getElementById("calendarNextMonth");
  if (prevBtn) prevBtn.addEventListener("click", () => changeCalendarMonth(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => changeCalendarMonth(1));
}

async function initEventCalendar() {
  const container = document.getElementById("eventCalendar");
  if (!container) return;

  const baseEvents = getCalendarEventsFromList();
  const extraEvents = getCalendarOtherEvents();
  calendarState.events = [...baseEvents, ...extraEvents].sort(
    (a, b) => a._startDate - b._startDate
  );

  if (!calendarState.events.length) {
    container.innerHTML =
      '<p class="event-list__empty">캘린더에 표시할 이벤트가 없습니다.</p>';
    return;
  }

  calendarState.events.forEach((ev) => {
    if (!ev.categoryLabel) {
      ev.categoryLabel =
        ev.type === "academic"
          ? "학사 일정"
          : ev.type === "department"
          ? "학과 일정"
          : "학과 행사";
    }
  });

  const startDate = getCalendarStartDate();
  calendarState.currentYear = startDate.getFullYear();
  calendarState.currentMonth = startDate.getMonth() + 1;
  calendarState.selectedDate = formatDateStr(startDate);

  setupCalendarFilters();
  setupCalendarNavigation();
  updateCalendarHeader();
  renderCalendarGrid();
  renderCalendarDetail();
  calendarState.initialized = true;
}

function setupStatusTabs(defaultStatus = "ongoing") {
  const tabs = document.querySelectorAll(".page-hero__subnav [data-status]");

  const parseHashStatus = () => {
    const hash = (window.location.hash || "").replace("#", "");
    if (hash === "past" || hash === "ongoing") return hash;
    return null;
  };

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

  window.addEventListener("hashchange", () => {
    const hashStatus = parseHashStatus();
    if (hashStatus) activate(hashStatus);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const status = tab.dataset.status;
      activate(status);
    });
  });
}

function getDefaultStatus() {
  const hash = (window.location.hash || "").replace("#", "");
  if (hash === "past" || hash === "ongoing") return hash;
  const hasOngoing = eventsData.some(
    (ev) => getListStatus(ev) === "ongoing"
  );
  return hasOngoing ? "ongoing" : "past";
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadEvents();
  const defaultStatus = getDefaultStatus();
  setupStatusTabs(defaultStatus);
  setupViewToggle();
  renderEvents(defaultStatus);
  startBannerRotation(defaultStatus);
  await initEventCalendar();
});

const INITIAL_YEAR = 2025;
const INITIAL_MONTH = 12;

function parseDate(str) {
  if (typeof str !== "string") return new Date(NaN);
  const parts = str.split("-");
  if (parts.length !== 3) return new Date(NaN);
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const state = {
  meta: null,
  events: [],
  filterType: "all",
  selectedDate: null,

  currentYear: null,
  currentMonth: null
};

document.addEventListener("DOMContentLoaded", () => {
  initFilterButtons();
  initMonthNav();
  loadCalendar(INITIAL_YEAR, INITIAL_MONTH);
});

function passFilter(ev) {
  if (state.filterType === "all") return true;
  return ev.type === state.filterType;
}

function loadCalendar(year, month) {
  const url = getCalendarUrl(year, month);

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`캘린더 JSON 로드 실패: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      state.meta = data.meta || null;
      state.currentYear = data.meta?.year ?? year;
      state.currentMonth = data.meta?.month ?? month;

      state.events = (data.events || []).map((ev) => ({
        ...ev,
        _startDate: parseDate(ev.startDate),
        _endDate: parseDate(ev.endDate),
        _trackIndex: null
      }));

      prepareMultiDayTracks();
      initHeader();
      renderCalendar();
      initDefaultSelection();
      renderDetailForSelectedDate();
    })
    .catch((err) => {
      console.error(err);
    });
}

function prepareMultiDayTracks() {
  state.events.forEach((ev) => {
    ev._trackIndex = null;
  });

  if (!state.meta || !state.events.length) return;

  const year = state.meta.year;
  const month = state.meta.month;
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, daysInMonth);

  const multi = [];

  state.events.forEach((ev) => {
    if (!passFilter(ev)) return;

    const start = ev._startDate;
    const end = ev._endDate;
    if (!start || !end || isNaN(start) || isNaN(end)) return;

    if (isSameDate(start, end)) return; // 하루짜리

    if (end < monthStart || start > monthEnd) return;

    let effStart = start < monthStart ? monthStart : start;
    let effEnd = end > monthEnd ? monthEnd : end;

    multi.push({ ev, start: effStart, end: effEnd });
  });

  if (!multi.length) return;

  multi.sort(
    (a, b) =>
      a.start - b.start ||
      (a.ev.id || "").localeCompare(b.ev.id || "")
  );

  const tracksEnd = [];

  multi.forEach(({ ev, start, end }) => {
    let track = 0;
    for (; track < tracksEnd.length; track++) {
      if (start > tracksEnd[track]) break;
    }
    if (track === tracksEnd.length) {
      tracksEnd.push(end);
    } else {
      if (end > tracksEnd[track]) tracksEnd[track] = end;
    }

    ev._trackIndex = track;
  });
}


function initHeader() {
  const { meta } = state;
  if (!meta) return;

  const yearEl = document.getElementById("calendarYear");
  const monthNumEl = document.getElementById("calendarMonthNumber");
  const monthLabelEl = document.getElementById("calendarMonthLabel");

  if (yearEl) yearEl.textContent = meta.year;
  if (monthNumEl) monthNumEl.textContent = meta.monthNumber || meta.month;
  if (monthLabelEl) monthLabelEl.textContent = meta.monthLabel || "";
}


function initFilterButtons() {
  const buttons = document.querySelectorAll(".filter-chip");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      state.filterType = btn.dataset.type || "all";

      prepareMultiDayTracks();
      renderCalendar();
      renderDetailForSelectedDate();
    });
  });
}


function initMonthNav() {
  const prevBtn = document.getElementById("calendarPrevMonth");
  const nextBtn = document.getElementById("calendarNextMonth");
  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener("click", () => changeMonth(-1));
  nextBtn.addEventListener("click", () => changeMonth(1));
}

function changeMonth(delta) {
  if (!state.currentYear || !state.currentMonth) return;

  let y = state.currentYear;
  let m = state.currentMonth + delta;

  if (m < 1) {
    m = 12;
    y -= 1;
  } else if (m > 12) {
    m = 1;
    y += 1;
  }

  loadCalendar(y, m);
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  if (!grid || !state.meta) return;

  grid.innerHTML = "";

  const year = state.meta.year;
  const month = state.meta.month;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - firstDay + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cell.classList.add("is-empty");
      grid.appendChild(cell);
      continue;
    }

    const dateObj = new Date(year, month - 1, dayNumber);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;

    cell.dataset.date = dateStr;

    const num = document.createElement("div");
    num.className = "calendar-day__number";
    num.textContent = dayNumber;
    cell.appendChild(num);

    const eventsWrapper = document.createElement("div");
    eventsWrapper.className = "calendar-day__events";

    const dayEvents = state.events.filter((ev) => {
      if (!passFilter(ev)) return false;
      const start = ev._startDate;
      const end = ev._endDate;
      if (!start || !end || isNaN(start) || isNaN(end)) return false;
      return dateObj >= start && dateObj <= end;
    });

    const multiEvents = [];
    const singleEvents = [];

    dayEvents.forEach((ev) => {
      const start = ev._startDate;
      const end = ev._endDate;
      if (isSameDate(start, end)) {
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

      for (let t = 0; t <= maxTrack; t++) {
        const ev = multiEvents.find(
          (m) => typeof m._trackIndex === "number" && m._trackIndex === t
        );

        if (ev) {
          const start = ev._startDate;
          const end = ev._endDate;
          const isStart = isSameDate(dateObj, start);
          const isEnd = isSameDate(dateObj, end);

          const pill = document.createElement("div");
          pill.className =
            "calendar-event-pill calendar-event-pill--" +
            ev.type +
            " calendar-range-seg";

          pill.textContent = ev.title;
          pill.title = ev.title;

          if (isStart && isEnd) {
            // 하루지만 범위형으로 온 경우
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
      const pill = document.createElement("div");
      pill.className =
        "calendar-event-pill calendar-event-pill--" + ev.type;
      pill.textContent = ev.title;
      pill.title = ev.title;
      eventsWrapper.appendChild(pill);
    });

    cell.appendChild(eventsWrapper);

    cell.addEventListener("click", () => {
      state.selectedDate = dateStr;
      updateSelectedDayUI();
      renderDetailForSelectedDate();
    });

    grid.appendChild(cell);
  }

  updateSelectedDayUI();
}

function getEventsForDate(dateStr) {
  const target = parseDate(dateStr);

  return state.events.filter((ev) => {
    const start = ev._startDate;
    const end = ev._endDate;
    if (!start || !end || isNaN(start) || isNaN(end)) return false;
    return start <= target && target <= end;
  });
}

function initDefaultSelection() {
  if (!state.meta) return;

  const today = new Date();
  const y = state.meta.year;
  const m = state.meta.month;

  if (today.getFullYear() === y && today.getMonth() + 1 === m) {
    state.selectedDate = `${y}-${String(m).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
  } else {
    state.selectedDate = `${y}-${String(m).padStart(2, "0")}-01`;
  }

  updateSelectedDayUI();
}

function updateSelectedDayUI() {
  const cells = document.querySelectorAll(".calendar-day");
  cells.forEach((c) => c.classList.remove("is-selected"));
  cells.forEach((c) => {
    if (c.dataset.date === state.selectedDate) {
      c.classList.add("is-selected");
    }
  });
}

function renderDetailForSelectedDate() {
  const detailDateText = document.getElementById("detailDateText");
  const detailList = document.getElementById("detailEventList");
  if (!detailDateText || !detailList) return;

  detailList.innerHTML = "";
  if (!state.selectedDate) return;

  const [y, m, d] = state.selectedDate.split("-");
  detailDateText.textContent = `${Number(m)}월 ${Number(d)}일 일정`;

  const events = getEventsForDate(state.selectedDate).filter(passFilter);

  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "calendar-detail__empty";
    empty.textContent = "등록된 일정이 없습니다.";
    detailList.appendChild(empty);
    return;
  }

  events.forEach((ev) => {
    const card = document.createElement("article");
    card.className = "calendar-detail-card";

    const metaRow = document.createElement("div");
    metaRow.className = "calendar-detail-card__meta";

    const badge = document.createElement("span");
    badge.className = `detail-badge detail-badge--${ev.type}`;
    badge.textContent = ev.categoryLabel || "";
    metaRow.appendChild(badge);

    if (ev.time) {
      const timeSpan = document.createElement("span");
      timeSpan.className = "detail-time";
      timeSpan.textContent = ev.time;
      metaRow.appendChild(timeSpan);
    }

    const title = document.createElement("h3");
    title.className = "calendar-detail-card__title";
    title.textContent = ev.title;

    const desc = document.createElement("p");
    desc.className = "calendar-detail-card__desc";
    desc.textContent = ev.description || "";

    card.appendChild(metaRow);
    card.appendChild(title);
    card.appendChild(desc);

    detailList.appendChild(card);
  });
}
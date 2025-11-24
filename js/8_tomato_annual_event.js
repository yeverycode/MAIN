(function () {
  const grid = document.getElementById("eventGrid");
  if (!grid) return;

  const DATA_URL = "/data/8_tomato_annual_event.json";
  const searchForm = document.querySelector(".event-search");
  const searchInput = document.getElementById("event-search-query");
  const searchType = document.getElementById("event-search-type");
  const termRadios = document.querySelectorAll('input[name="event-term"]');

  // 상세 인터뷰 페이지가 준비된 항목 매핑 (없으면 클릭 이벤트 생략)
  const interviewMap = {
    "신입생 OT": "1",
    "1학기 개강총회": "2",
    "학부연구실 설명회": "3",
    "1학기 졸업 전시회": "4",
    "총 MT": "5",
    "스승의 날": "6",
    "전공 박람회": "7",
    "IPS 대회": "8",
    "1학기 종강총회": "9",
    "2학기 개강총회": "10",
    "공과대학 10주년 학술제": "11",
    "진로콘서트": "12",
    "2학기 졸업 전시회": "13",
    "Uni-D": "14",
    "AI인의 밤": "15"
  };

  let events = [];

  init();

  function init() {
    setState("loading");

    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        events = (Array.isArray(data) ? data : []).map(normalizeEvent);
        renderEvents(events);
        bindControls();
        setState("ready");
      })
      .catch((err) => {
        console.error(err);
        setState("error", "행사 목록을 불러오는 데 실패했습니다.");
      });
  }

  function normalizeEvent(item, idx) {
    const month = extractMonth(item.date);
    const semester = month && month <= 6 ? "first" : "second";
    const title = item.title || `행사 ${idx + 1}`;

    return {
      id: item.id || `event-${idx + 1}`,
      title,
      date: item.date || "",
      image: item.image || "",
      alt: item.alt || `${title} 이미지`,
      semester,
      interviewId: interviewMap[title] || null
    };
  }

  function bindControls() {
    termRadios.forEach((radio) => {
      radio.addEventListener("change", applyFilters);
    });

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        applyFilters();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
  }

  function applyFilters() {
    const term = document.querySelector('input[name="event-term"]:checked')?.value || "all";
    const keyword = (searchInput?.value || "").trim().toLowerCase();
    const type = searchType?.value || "all";

    const result = events.filter((event) => {
      const matchesTerm = term === "all" || event.semester === term;
      if (!matchesTerm) return false;

      if (!keyword) return true;

      const targets =
        type === "title"
          ? [event.title]
          : type === "content"
          ? [event.date, event.alt]
          : [event.title, event.date, event.alt];

      return targets.some((text) => (text || "").toLowerCase().includes(keyword));
    });

    renderEvents(result);
  }

  function renderEvents(list) {
    grid.innerHTML = "";

    if (!list.length) {
      grid.dataset.state = "empty";
      grid.insertAdjacentHTML(
        "beforeend",
        '<p class="event-empty">조건에 맞는 행사가 없습니다.</p>'
      );
      return;
    }

    const frag = document.createDocumentFragment();

    list.forEach((event) => {
      const card = document.createElement("article");
      card.className = "event-card";
      card.dataset.eventId = event.id;
      card.dataset.semester = event.semester;

      const thumb = document.createElement("div");
      thumb.className = "event-card__thumb";
      const img = document.createElement("img");
      img.src = event.image;
      img.alt = event.alt;
      thumb.appendChild(img);

      const body = document.createElement("div");
      body.className = "event-card__body";

      const title = document.createElement("h3");
      title.className = "event-card__title";
      title.textContent = event.title;

      const date = document.createElement("p");
      date.className = "event-card__date";
      date.textContent = event.date;

      body.appendChild(title);
      body.appendChild(date);

      card.appendChild(thumb);
      card.appendChild(body);

      // 상세 페이지가 있는 항목만 클릭 이동 제공
      if (event.interviewId) {
        card.setAttribute("role", "button");
        card.tabIndex = 0;
        card.addEventListener("click", () =>
          goDetail(event.interviewId)
        );
        card.addEventListener("keypress", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goDetail(event.interviewId);
          }
        });
      }

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function goDetail(id) {
    window.location.href = `/pages/event/8_tomato_event_interview.html?id=${id}`;
  }

  function extractMonth(dateStr) {
    if (typeof dateStr !== "string") return null;
    const dotMatch = dateStr.match(/\d{4}\.\s*(\d{1,2})/);
    if (dotMatch) return Number(dotMatch[1]);

    const monthMatch = dateStr.match(/(\d{1,2})월/);
    return monthMatch ? Number(monthMatch[1]) : null;
  }

  function setState(state, message) {
    grid.dataset.state = state;
    if (state === "error") {
      grid.innerHTML = `<p class="event-empty">${message || "데이터를 불러오는 중 문제가 발생했습니다."}</p>`;
    }
  }
})();

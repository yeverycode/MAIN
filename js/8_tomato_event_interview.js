(function () {
  const manifest = [
    { id: "1", title: "신입생 OT" },
    { id: "2", title: "1학기 개강총회" },
    { id: "3", title: "학부연구실 설명회" },
    { id: "4", title: "1학기 졸업 전시회" },
    { id: "5", title: "총 MT" },
    { id: "6", title: "스승의 날" },
    { id: "7", title: "전공 박람회" },
    { id: "8", title: "IPS 대회" },
    { id: "9", title: "1학기 종강총회" },
    { id: "10", title: "2학기 개강총회" },
    { id: "11", title: "공과대학 10주년 학술제" },
    { id: "12", title: "진로콘서트" },
    { id: "13", title: "2학기 졸업 전시회" },
    { id: "14", title: "Uni-D" },
    { id: "15", title: "AI인의 밤" }
  ];

  const DEFAULTS = {
    cover: "/assets/event_interview_cover.svg",
    qa: "/assets/event_interview_q1.svg",
    gallery: "/assets/event_interview_gallery.svg"
  };

  let resizeTimer;

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id") || "1";
  const jsonPath = `/data/event_interview/8_tomato_${eventId}.json`;
  const fallbackPath = "/data/8_tomato_event_interview.json";

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error("JSON load error");
      return res.json();
    })
    .then((data) => renderEvent(data, eventId))
    .catch(() => {
      fetch(fallbackPath)
        .then((res) => res.json())
        .then((data) => renderEvent(data, eventId, true))
        .catch((err) => console.error("데이터를 불러오지 못했습니다.", err));
    });

  function renderEvent(data, currentId, isFallback = false) {
    setText("event-meta-title", data.title || "");

    const coverImg = document.getElementById("event-cover");
    if (coverImg) {
      coverImg.src = data.heroImage || DEFAULTS.cover;
      coverImg.alt = data.heroAlt || data.title || "행사 대표 이미지";
    }

    setText("event-tag", data.categoryLabel || "1학기");
    setText("event-name", data.title || "");
    setText("event-date-full", data.meta?.eventDate || data.date || "");
    setText("event-location", data.meta?.location || "-");

    const [target1, target2] = data.meta?.target || [];
    setText("event-target-line1", target1 || "");
    setText("event-target-line2", target2 || "");
    setHTML("event-description", formatMultiline(data.meta?.description));

    const interview = Array.isArray(data.interview) ? data.interview : [];
    fillQA(1, interview[0]);
    fillQA(2, interview[1]);
    fillQA(3, interview[2]);
    fillQA(4, interview[3]);
    fillQA(5, interview[4]);
    fillQA(6, interview[5]);

    const topImg = document.getElementById("qa-top-image");
    const topRow = document.querySelector(".qa-row--image-with-questions");
    if (topImg && topRow) {
      const topSrc = data.minImage || data.heroImage || data.galleryImage || "";
      if (topSrc) {
        topImg.src = topSrc;
        topImg.alt = data.minAlt || data.heroAlt || data.title || "행사 이미지";
        topRow.classList.remove("qa-row--no-image");
        topImg.addEventListener("load", syncTopImageHeight, { once: true });
      } else {
        topRow.classList.add("qa-row--no-image");
        resetTopImageHeight();
      }
    }

    const bottomImg = document.getElementById("qa-bottom-image");
    const bottomRow = document.querySelector(".qa-row--image-bottom");
    if (bottomImg && bottomRow) {
      const bottom =
        data.galleryImage ||
        (data.galleryImages && data.galleryImages[0]) ||
        data.heroImage ||
        data.minImage ||
        "";
      if (bottom) {
        bottomImg.src = bottom;
        bottomImg.alt =
          data.galleryAlt ||
          data.heroAlt ||
          data.minAlt ||
          "행사 갤러리 이미지";
        bottomRow.classList.remove("qa-row--no-image");
      } else {
        bottomRow.classList.add("qa-row--no-image");
      }
    }

    syncTopImageHeight();
    requestAnimationFrame(syncTopImageHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncTopImageHeight).catch(() => {});
    }
    setPager(currentId, data.title, isFallback);
  }

  function fillQA(index, item) {
    const wrap = document.getElementById(`q${index}-wrap`);
    if (!wrap) return;

    if (!item) {
      wrap.classList.add("is-hidden");
      return;
    }

    setText(`q${index}-label`, `Q${item.no || index}`);
    setText(`q${index}-question`, item.question || "");
    setHTML(`q${index}-answer`, formatMultiline(item.answer));
  }

  function setPager(currentId, currentTitle, isFallback) {
    const pager = document.querySelector(".event-detail__pager");
    const divider = document.querySelector(".event-detail__pager-divider");
    const prevLink = document.getElementById("prev-link");
    const nextLink = document.getElementById("next-link");
    const prevTitle = document.getElementById("prev-title");
    const nextTitle = document.getElementById("next-title");

    const idx = manifest.findIndex((m) => String(m.id) === String(currentId));

    const prev = idx > 0 ? manifest[idx - 1] : null;
    const next = idx >= 0 && idx < manifest.length - 1 ? manifest[idx + 1] : null;

    if (prev && prevLink && prevTitle) {
      prevLink.href = `/pages/event/8_tomato_event_interview.html?id=${prev.id}`;
      prevTitle.textContent = prev.title;
      prevLink.classList.remove("is-hidden");
    } else if (prevLink) {
      prevLink.classList.add("is-hidden");
    }

    if (next && nextLink && nextTitle) {
      nextLink.href = `/pages/event/8_tomato_event_interview.html?id=${next.id}`;
      nextTitle.textContent = next.title;
      nextLink.classList.remove("is-hidden");
    } else if (nextLink) {
      nextLink.classList.add("is-hidden");
    }

    const hasPrev = prev && prevLink && !prevLink.classList.contains("is-hidden");
    const hasNext = next && nextLink && !nextLink.classList.contains("is-hidden");

    if (pager) {
      pager.classList.toggle("pager--single", hasPrev !== hasNext);
      pager.classList.toggle("pager--next-only", !hasPrev && hasNext);
      pager.classList.toggle("pager--prev-only", hasPrev && !hasNext);
    }

    if (divider) {
      divider.style.display = hasPrev && hasNext ? "block" : "none";
    }

    if (isFallback && currentTitle && idx >= 0) {
      manifest[idx].title = currentTitle;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "string") el.textContent = value;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el && typeof html === "string") el.innerHTML = html;
  }

  function formatMultiline(text) {
    if (!text) return "";
    return text
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .trim();
  }

  function syncTopImageHeight() {
    const row = document.querySelector(".qa-row--image-with-questions");
    if (!row || row.classList.contains("qa-row--no-image")) return resetTopImageHeight();

    const contentCol = row.querySelector(".qa-row__content-col");
    const imageCol = row.querySelector(".qa-row__image");
    const img = row.querySelector(".qa-row__image img");
    if (!contentCol || !imageCol || !img) return;

    const targetHeight = contentCol.getBoundingClientRect().height;
    if (targetHeight > 0) {
      imageCol.style.height = `${targetHeight}px`;
      img.style.height = `${targetHeight}px`;
    }
  }

  function resetTopImageHeight() {
    const imageCol = document.querySelector(".qa-row--image-with-questions .qa-row__image");
    const img = document.querySelector(".qa-row--image-with-questions .qa-row__image img");
    if (imageCol) imageCol.style.height = "";
    if (img) img.style.height = "";
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncTopImageHeight, 150);
  });

  window.addEventListener("load", syncTopImageHeight);
})();

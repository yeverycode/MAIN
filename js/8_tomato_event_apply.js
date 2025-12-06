(function () {
  const APPLY_URL = "/data/8_tomato_event_apply.json";
  const APPLY_DETAIL_BASE = "/data/event_apply";
  const LIST_URL = "/data/8_tomato_event_calendar.json";
  const DEFAULT_ID = "1";
  const APPLY_STORAGE_KEY = "tomato_event_apply_state_v1";
  let posterImages = [];
  let posterIndex = 0;
  let posterAlt = "";
  let currentEvent = null;

  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id") || DEFAULT_ID;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toFiniteNumber(value) {
    if (Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
    return null;
  }

  function pickNumber(...candidates) {
    for (const value of candidates) {
      const num = toFiniteNumber(value);
      if (num !== null) return num;
    }
    return null;
  }

  function maxNumber(...candidates) {
    let result = null;
    candidates.forEach((value) => {
      const num = toFiniteNumber(value);
      if (num === null) return;
      result = result === null ? num : Math.max(result, num);
    });
    return result;
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

  function saveApplyState(state) {
    try {
      localStorage.setItem(APPLY_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("apply storage save error", err);
    }
  }

  function getStoredCounts(id) {
    const state = loadApplyState();
    return state?.[String(id)] || null;
  }

  function mergeStoredCounts(event) {
    if (!event?.id) return event;
    const stored = getStoredCounts(event.id);
    if (!stored) return event;

    const mergedApplied = maxNumber(event.appliedCount, stored.applied, stored.appliedCount);
    const mergedCapacity = maxNumber(event.capacity, stored.capacity);
    const mergedWaiting = maxNumber(event.waitingCount, stored.waitingCount);

    return {
      ...event,
      appliedCount: mergedApplied ?? event.appliedCount,
      capacity: mergedCapacity ?? event.capacity,
      waitingCount: mergedWaiting ?? event.waitingCount
    };
  }

  function primeApplyState(listArr) {
    if (!Array.isArray(listArr) || !listArr.length) return;
    const state = loadApplyState();
    let mutated = false;

    listArr.forEach((ev) => {
      const id = String(ev.id || "");
      if (!id || state[id]) return;
      state[id] = {
        applied: pickNumber(ev.appliedCount),
        capacity: pickNumber(ev.capacity),
        waitingCount: pickNumber(ev.waitingCount),
        waitingAvailable: ev.waitingAvailable === true
      };
      mutated = true;
    });

    if (mutated) saveApplyState(state);
  }

  function recordApplication(event) {
    if (!event?.id) return null;
    const id = String(event.id);
    const state = loadApplyState();
    const prev = state[id] || {};

    const baseApplied = maxNumber(event.appliedCount, prev.applied, prev.appliedCount) || 0;
    const nextApplied = baseApplied + 1;

    const updated = {
      applied: nextApplied,
      capacity: maxNumber(event.capacity, prev.capacity),
      waitingCount: maxNumber(event.waitingCount, prev.waitingCount),
      waitingAvailable: prev.waitingAvailable ?? event.waitingAvailable === true,
      updatedAt: new Date().toISOString()
    };

    state[id] = updated;
    saveApplyState(state);
    return updated;
  }

  function normalizeStatus(status) {
    const val = (status || "").toString().toLowerCase();
    if (["open", "closed", "finished"].includes(val)) return val;
    return null;
  }

  function getStatus(startStr, endStr) {
    if (!startStr && !endStr) return null;
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(0, 0, 0, 0);

    if (end && end < today) return "past";
    if (start && start > today) return "ongoing";
    if (start && today >= start && (!end || today <= end)) return "ongoing";
    return null;
  }

  function getListStatus(event) {
    if (!event) return null;
    const calc = getStatus(event.startDate, event.endDate);
    if (calc === "past") return "past";

    const explicit = normalizeStatus(event.status);
    if (explicit === "finished") return "past";
    if (explicit === "open" || explicit === "closed") return "ongoing";
    return calc;
  }

  function isClosedEvent(status, event) {
    const explicit = normalizeStatus(event?.status);
    if (status === "past") return true;
    if (explicit === "closed" || explicit === "finished") return true;
    return false;
  }

  function setSubnavActive(status) {
    if (!status) return;
    const tabs = document.querySelectorAll(".page-hero__subnav [data-status]");
    tabs.forEach((tab) => {
      const isActive = tab.dataset.status === status;
      const parent = tab.closest("li");
      if (parent) parent.classList.toggle("is-active", isActive);
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  }

  Promise.all([fetchJson(LIST_URL), loadApplyDetail(currentId)])
    .then(([listData, applyDetail]) => handleData(listData, applyDetail))
    .catch((err) => {
      console.error(err);
      showError("이벤트 정보를 불러오는 데 실패했습니다.");
    });

  function fetchJson(url) {
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(`${url} load error`);
      return res.json();
    });
  }

  function loadApplyDetail(id) {
    const detailPath = `${APPLY_DETAIL_BASE}/8_tomato_${id}.json`;

    return fetchJson(detailPath)
      .catch(() =>
        fetchJson(APPLY_URL)
          .then((applyArr) => {
            if (!Array.isArray(applyArr)) return null;
            return applyArr.find((item) => String(item.id) === String(id)) || null;
          })
          .catch(() => null)
      );
  }

  function handleData(listData, applyDetail) {
    const listArr = normalizeListData(listData);
    primeApplyState(listArr);

    if (!listArr.length && !applyDetail) {
      showError("준비된 신청 안내가 없습니다.");
      return;
    }

    const manifest = listArr.length
      ? listArr.map((item, idx) => ({
          id: String(item.id || idx + 1),
          title: item.title || `이벤트 ${idx + 1}`
        }))
      : applyDetail
      ? [
          {
            id: String(applyDetail.id || currentId),
            title: applyDetail.title || `이벤트 ${currentId}`
          }
        ]
      : [];

    const listItem =
      listArr.find((item) => String(item.id) === String(currentId)) ||
      listArr[0] ||
      null;

    const eventData =
      applyDetail || (listItem ? buildFallbackDetail(listItem) : null);
    const status = getListStatus(listItem);
    const mergedEvent = mergeStoredCounts(eventData);

    if (!mergedEvent) {
      showError("해당 이벤트 데이터를 찾을 수 없습니다.");
      return;
    }

    setSubnavActive(status || "ongoing");
    currentEvent = mergedEvent;
    renderEvent(mergedEvent, status);
    setPager(manifest, mergedEvent.id);
  }

  function normalizeListData(listData) {
    const arr = Array.isArray(listData)
      ? listData
      : Array.isArray(listData?.events)
      ? listData.events
      : [];

    return arr.filter((item) => (item.type || "event") === "event");
  }

  function buildFallbackDetail(item) {
    if (!item) return null;
    const title = item.title || "이벤트";
    const period =
      (typeof item.periodText === "string"
        ? item.periodText.replace(/^\s*기간\s*:\s*/i, "").trim()
        : "") ||
      buildPeriod(item.startDate, item.endDate);

    const poster =
      item.image ||
      (Array.isArray(item.bannerImages) && item.bannerImages[0]) ||
      "";

    return {
      id: item.id,
      title,
      headline: `${title} 신청 안내`,
      applyPeriod: period || "",
      target: "인공지능공학부 재학생",
      location: "-",
      applyMethod: "신청폼 제출",
      capacity: pickNumber(item.capacity),
      appliedCount: pickNumber(item.appliedCount),
      waitingCount: pickNumber(item.waitingCount),
      waitingAvailable: item.waitingAvailable === true,
      status: item.status,
      posterImage: poster,
      posterAlt: `${title} 포스터`,
      payment: {
        fee: "-",
        account: "-"
      },
      notices: [],
      cta: {
        label: "신청하기",
        link: "#"
      }
    };
  }

  function buildPeriod(start, end) {
    if (!start && !end) return "";
    if (start && end) return `${start} ~ ${end}`;
    return start || end || "";
  }

  function buildCapacityLabel(event) {
    const total = pickNumber(event?.capacity);
    const applied = pickNumber(event?.appliedCount);
    const waiting = pickNumber(event?.waitingCount);
    const waitingAvailable = event?.waitingAvailable === true;

    if (total !== null && applied !== null) {
      const isFull = applied >= total;
      const tail = isFull
        ? waiting !== null
          ? ` · 대기 ${waiting}명`
          : waitingAvailable
          ? " · 대기 가능"
          : ""
        : "";

      return {
        text: isFull ? `정원 ${total}명 마감${tail}` : `${applied}/${total}`,
        isFull
      };
    }

    if (total !== null) {
      return { text: `선착순 ${total}명 모집`, isFull: false };
    }

    if (waitingAvailable) {
      return { text: "대기 신청 가능", isFull: false };
    }

    return { text: "", isFull: false };
  }

  function renderCapacity(event, status) {
    const valueEl = document.getElementById("apply-capacity-value");
    const wrap = document.querySelector(".apply-capacity");
    const isClosed = isClosedEvent(status, event);
    if (!valueEl || !event) return;

    if (wrap) wrap.classList.toggle("is-closed", isClosed);

    if (isClosed) {
      valueEl.textContent = "신청이 마감되었습니다.";
      valueEl.classList.remove("is-full");
      return;
    }

    const { text, isFull } = buildCapacityLabel(event);
    valueEl.textContent = text || "신청 현황 정보가 없습니다.";
    valueEl.classList.toggle("is-full", Boolean(isFull));
  }

  function renderSelfNote(event, status) {
    const noteEl = document.getElementById("apply-capacity-self");
    const isClosed = isClosedEvent(status, event);
    if (!noteEl || !event?.id) return;

    if (isClosed) {
      noteEl.textContent = "";
      return;
    }

    const stored = getStoredCounts(event.id);
    const baseCount = pickNumber(event.appliedCount);
    const current = stored?.applied ?? baseCount ?? 0;
    const nextCount = current + 1; // n+1번째 신청자 안내

    noteEl.textContent = `신청폼을 제출하여 ${nextCount}번째 신청자가 되어주세요.`;
  }

  function renderEvent(event, status) {
    document.title = `${event.title || "이벤트 신청"} | 숙명여자대학교 인공지능공학부`;

    setText("apply-meta-title", event.title || "");
    setText("apply-headline", event.headline || event.title || "");
    setText("apply-period", event.applyPeriod || "");
    renderEventDate(event.eventDate);
    setText("apply-target", event.target || "");
    setText("apply-location", event.location || "-");
    setText("apply-method", event.applyMethod || "");
    renderCapacity(event, status);
    renderSelfNote(event, status);

    posterAlt = event.posterAlt || event.headline || event.title || "이벤트 포스터";
    posterImages = buildPosterImages(event);
    posterIndex = 0;
    renderPoster();
    bindPosterControls();

    renderPayment(event.payment);

    renderNotices(event.notices);
    renderCTA(event, event.cta, status);
  }

  function renderEventDate(eventDate) {
    const cell = document.getElementById("apply-event-date");
    const hasDate = typeof eventDate === "string" && eventDate.trim().length > 0;

    if (cell) cell.textContent = hasDate ? eventDate : "";
  }

  function renderPayment(payment) {
    const panel = document.getElementById("payment-panel");
    const feeCell = document.getElementById("payment-fee");
    const accountCell = document.getElementById("payment-account");

    const fee = typeof payment?.fee === "string" ? payment.fee.trim() : "";
    const account = typeof payment?.account === "string" ? payment.account.trim() : "";
    const hasFee = fee && fee !== "-";
    const hasAccount = account && account !== "-";
    const shouldShow = hasFee || hasAccount;

    if (panel) panel.hidden = !shouldShow;

    if (!shouldShow) {
      if (feeCell) feeCell.textContent = "";
      if (accountCell) accountCell.textContent = "";
      return;
    }

    setText("payment-fee", hasFee ? payment.fee : "-");
    setText("payment-account", hasAccount ? payment.account : "-");
  }

  function renderNotices(notices) {
    const list = document.getElementById("apply-notices");
    if (!list) return;
    list.innerHTML = "";

    const items = Array.isArray(notices) ? notices : [];
    if (!items.length) {
      const li = document.createElement("li");
      li.dataset.index = "-";
      li.textContent = "주의 사항이 준비 중입니다.";
      list.appendChild(li);
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((text, idx) => {
      const li = document.createElement("li");
      li.dataset.index = idx + 1;
      li.textContent = text;
      frag.appendChild(li);
    });
    list.appendChild(frag);
  }

  function renderCTA(event, cta, status) {
    const btn = document.getElementById("apply-cta-button");
    const ctaWrap = document.querySelector(".apply-capacity__cta");
    const isClosed = isClosedEvent(status, event);
    if (!btn) return;

    const label = cta?.label || "신청하기";
    const eventDateText = event?.eventDate || event?.applyPeriod || "";
    const baseApplied = pickNumber(event?.appliedCount);
    const nextApplicant = baseApplied !== null ? baseApplied + 1 : null;

    const params = new URLSearchParams({
      id: event?.id || currentId,
      title: event?.title || "",
      eventDate: eventDateText
    });

    if (nextApplicant !== null) {
      params.append("position", String(nextApplicant));
    }

    const DEFAULT_FORM_PATH = "/pages/event/8_tomato_event_form.html";
    const rawCtaLink =
      typeof cta?.link === "string" && cta.link.trim().length
        ? cta.link.trim()
        : "";
    const baseLink = rawCtaLink || DEFAULT_FORM_PATH;
    const isExternalLink = /^https?:\/\//i.test(baseLink);
    const paramStr = params.toString();
    const link =
      !isExternalLink && paramStr
        ? `${baseLink}${baseLink.includes("?") ? "&" : "?"}${paramStr}`
        : baseLink;
    const isPast = status === "past";

    if (ctaWrap) {
      ctaWrap.style.display = isClosed ? "none" : "";
    }

    if (isPast || isClosed) {
      btn.textContent = "신청 마감";
      btn.href = "#";
      btn.setAttribute("disabled", "true");
      btn.setAttribute("aria-disabled", "true");
      btn.classList.add("is-disabled");
      btn.removeAttribute("target");
      btn.rel = "";
    } else {
      btn.textContent = label;
      btn.href = link;
      btn.removeAttribute("disabled");
      btn.removeAttribute("aria-disabled");
      btn.classList.remove("is-disabled");

      const isExternal = /^https?:\/\//i.test(link);
      btn.target = isExternal ? "_blank" : "_self";
      btn.rel = isExternal ? "noreferrer noopener" : "";
    }
  }

  function buildPosterImages(event) {
    const items = Array.isArray(event.posterImages) ? event.posterImages : [];
    const merged = [];
    if (event.posterImage) merged.push(event.posterImage);
    merged.push(...items);
    return merged.filter(Boolean);
  }

  function renderPoster() {
    const poster = document.getElementById("apply-poster");
    const dotsWrap = document.getElementById("apply-poster-dots");
    const hasImages = posterImages.length > 0;

    if (poster) {
      if (hasImages) {
        const safeIndex = ((posterIndex % posterImages.length) + posterImages.length) % posterImages.length;
        posterIndex = safeIndex;
        poster.src = posterImages[posterIndex];
        poster.alt = posterAlt;
        poster.removeAttribute("data-empty");
      } else {
        poster.removeAttribute("src");
        poster.alt = "";
        poster.setAttribute("data-empty", "true");
      }
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      if (posterImages.length > 1) {
        const frag = document.createDocumentFragment();
        posterImages.forEach((_, idx) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "apply-poster__dot" + (idx === posterIndex ? " is-active" : "");
          dot.addEventListener("click", () => {
            posterIndex = idx;
            renderPoster();
          });
          frag.appendChild(dot);
        });
        dotsWrap.appendChild(frag);
      }
    }
  }

  function bindPosterControls() {
    const prevBtn = document.getElementById("apply-poster-prev");
    const nextBtn = document.getElementById("apply-poster-next");
    const hasMultiple = posterImages.length > 1;

    if (prevBtn && nextBtn) {
      prevBtn.style.display = hasMultiple ? "flex" : "none";
      nextBtn.style.display = hasMultiple ? "flex" : "none";

      prevBtn.onclick = hasMultiple
        ? () => {
            posterIndex = (posterIndex - 1 + posterImages.length) % posterImages.length;
            renderPoster();
          }
        : null;

      nextBtn.onclick = hasMultiple
        ? () => {
            posterIndex = (posterIndex + 1) % posterImages.length;
            renderPoster();
          }
        : null;
    }
  }

  function setPager(manifest, currentId) {
    const pager = document.querySelector(".apply-detail__pager");
    const divider = document.querySelector(".apply-detail__pager-divider");
    const prevLink = document.getElementById("apply-prev-link");
    const nextLink = document.getElementById("apply-next-link");
    const prevTitle = document.getElementById("apply-prev-title");
    const nextTitle = document.getElementById("apply-next-title");

    const idx = manifest.findIndex((m) => String(m.id) === String(currentId));
    const prev = idx > 0 ? manifest[idx - 1] : null;
    const next = idx >= 0 && idx < manifest.length - 1 ? manifest[idx + 1] : null;

    if (prev && prevLink && prevTitle) {
      prevLink.href = `/pages/event/8_tomato_event_apply.html?id=${prev.id}`;
      prevTitle.textContent = prev.title;
      prevLink.classList.remove("is-hidden");
    } else if (prevLink) {
      prevLink.classList.add("is-hidden");
    }

    if (next && nextLink && nextTitle) {
      nextLink.href = `/pages/event/8_tomato_event_apply.html?id=${next.id}`;
      nextTitle.textContent = next.title;
      nextLink.classList.remove("is-hidden");
    } else if (nextLink) {
      nextLink.classList.add("is-hidden");
    }

    const hasPrev = prev && prevLink && !prevLink.classList.contains("is-hidden");
    const hasNext = next && nextLink && !nextLink.classList.contains("is-hidden");

    if (pager) {
      pager.classList.toggle("pager--single", hasPrev !== hasNext);
      pager.classList.toggle("pager--prev-only", hasPrev && !hasNext);
    }

    if (divider) {
      divider.style.display = hasPrev && hasNext ? "block" : "none";
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "string") el.textContent = value;
  }

  function showError(message) {
    const main = document.getElementById("main");
    if (main) {
      main.innerHTML = `<p style="padding:32px; text-align:center;">${message}</p>`;
    }
  }
})();

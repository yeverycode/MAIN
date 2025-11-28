(function () {
  const APPLY_STORAGE_KEY = "tomato_event_apply_state_v1";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("event-form");
    const titleEl = document.getElementById("form-title");
    const submitButton = form?.querySelector(".submit-button");
    const eventMeta = getEventMeta();

    if (!form || !titleEl || !submitButton) return;

    setTitleFromQuery(titleEl, eventMeta);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = getInputValue("apply-name");
      const phone = getInputValue("apply-phone");
      const nextPosition = recordApplication(eventMeta);
      showFinalState(name, phone, { ...eventMeta, position: nextPosition });
    });

    function showFinalState(nameValue, phoneValue, meta) {
      const fallbackUrl = `/pages/event/8_tomato_event_apply.html${window.location.search || ""}`;
      const applicantName = nameValue || "신청자";
      const applicantPhone = phoneValue || "입력하신 번호";
      const eventTitle = meta.title || "이벤트";
      const eventDateText = meta.eventDate || "행사 일정";
      const positionText = Number.isFinite(meta.position) && meta.position > 0
        ? `${meta.position}번째 신청자`
        : "신청자";

      form.innerHTML = `
        <p class="form-final-message">
          ${applicantName}님은 ${eventTitle} ${positionText}입니다.<br>
          상세 안내사항은 ${eventDateText}에 ${applicantPhone}로 안내드립니다.<br>
          감사합니다.
        </p>
      `;

      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "submit-button";
      backButton.textContent = "뒤로 가기";
      form.appendChild(backButton);

      backButton.addEventListener("click", () => {
        const hasReferrer = document.referrer && document.referrer !== window.location.href;
        if (hasReferrer && window.history.length > 1) {
          const currentHref = window.location.href;
          window.history.back();
          setTimeout(() => {
            if (window.location.href === currentHref) {
              window.location.href = fallbackUrl;
            }
          }, 300);
          return;
        }
        window.location.href = fallbackUrl;
      });
    }

    function setTitleFromQuery(el, meta) {
      const safeTitle = meta.title;
      const finalTitle = safeTitle ? `${safeTitle} 신청폼` : "이벤트 신청폼";
      el.textContent = finalTitle;
      document.title = `${finalTitle} | 숙명여자대학교 인공지능공학부`;
    }

    function getInputValue(id) {
      const el = document.getElementById(id);
      return el && typeof el.value === "string" ? el.value.trim() : "";
    }

    function getEventMeta() {
      const params = new URLSearchParams(window.location.search);
      const rawTitle = params.get("title");
      const rawEventDate = params.get("eventDate");
      const rawPosition = params.get("position");
      const id = params.get("id") || "";

      const title = rawTitle && rawTitle.trim().length ? rawTitle.trim() : null;
      const eventDate = rawEventDate && rawEventDate.trim().length ? rawEventDate.trim() : null;

      const parsedPosition = rawPosition && rawPosition.trim().length ? Number(rawPosition) : null;
      const position = Number.isFinite(parsedPosition) && parsedPosition > 0 ? parsedPosition : null;

      return { id, title, eventDate, position };
    }

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

    function saveApplyState(state) {
      try {
        localStorage.setItem(APPLY_STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("apply storage save error", err);
      }
    }

    function recordApplication(meta) {
      const id = meta.id || "default";
      const state = loadApplyState();
      const prev = state[id] || {};

      // 기본값을 position-1 또는 기존 기록/기본 JSON에서 가져옴
      const baseApplied = pickNumber(
        prev.applied,
        prev.appliedCount,
        meta.position ? meta.position - 1 : null
      );
      const nextApplied = (baseApplied ?? 0) + 1;

      state[id] = {
        ...prev,
        applied: nextApplied,
        updatedAt: new Date().toISOString()
      };
      saveApplyState(state);
      return nextApplied;
    }
  });
})();

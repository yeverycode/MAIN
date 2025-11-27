(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("event-form");
    const titleEl = document.getElementById("form-title");
    const submitButton = form?.querySelector(".submit-button");

    if (!form || !titleEl || !submitButton) return;

    setTitleFromQuery(titleEl);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showFinalState();
    });

    function showFinalState() {
      const fallbackUrl = `/pages/event/8_tomato_event_apply.html${window.location.search || ""}`;

      form.innerHTML = `
        <p class="form-final-message">
          조예인님은 2025 AI인의 밤 73번째 신청자입니다.<br>
          상세 안내사항은 2025.12.17 (수) 18:00 ~ 21:30에 01012345678로 안내드립니다.<br>
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

    function setTitleFromQuery(el) {
      const params = new URLSearchParams(window.location.search);
      const title = params.get("title");
      const safeTitle = title && title.trim().length ? title.trim() : null;
      const finalTitle = safeTitle ? `${safeTitle} 신청폼` : "이벤트 신청폼";
      el.textContent = finalTitle;
      document.title = `${finalTitle} | 숙명여자대학교 인공지능공학부`;
    }
  });
})();

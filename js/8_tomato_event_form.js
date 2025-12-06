(function () {
  const APPLY_STORAGE_KEY_EVENT = "tomato_event_apply_state_v1";
  const APPLY_STORAGE_KEY_RECRUIT = "tomato_recruit_apply_state_v1";

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }
  
  function getSelectValue(id) {
    const el = document.getElementById(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
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

  function loadApplyState(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn("apply storage load error", err);
      return {};
    }
  }

  function saveApplyState(key, state) {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn("apply storage save error", err);
    }
  }
  
  function recordApplication(meta, storageKey) {
    const id = meta.id || "default";
    const state = loadApplyState(storageKey);
    const prev = state[id] || {};

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
    saveApplyState(storageKey, state);
    return nextApplied;
  }
  

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("event-form");
    const titleEl = document.getElementById("form-title");
    const submitButton = form?.querySelector(".submit-button");
    const eventMeta = getEventMeta();

    if (!form || !titleEl || !submitButton || !eventMeta) return;
      
    setTitleFromQuery(titleEl, eventMeta);
      
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const validation = validateEventForm();
      if (!validation) return;
      const { name, phone } = validation;
      const nextPosition = recordApplication(eventMeta, APPLY_STORAGE_KEY_EVENT);
      showEventFinalState(name, phone, { ...eventMeta, position: nextPosition });
    });


    function showEventFinalState(nameValue, phoneValue, meta) {
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
          상세 안내사항은 ${eventDateText}에<br>${applicantPhone}로 안내드립니다.<br>
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
      if (el) el.textContent = finalTitle;
      document.title = `${finalTitle} | 숙명여자대학교 인공지능공학부`;
    }

    function validateEventForm() {
      const name = getInputValue("apply-name");
      const studentId = getInputValue("apply-student-id");
      const phone = getInputValue("apply-phone");

      if (!name) {
        alert("이름을 입력해 주세요.");
        document.getElementById("apply-name")?.focus();
        return null;
      }

      if (!/^[0-9]{7}$/.test(studentId)) {
        alert("학번은 숫자 7자리로 입력해 주세요.");
        document.getElementById("apply-student-id")?.focus();
        return null;
      }

      const phoneRegex = /^01[0-9]-(\d{4})-(\d{4})$/;
      if (!phoneRegex.test(phone)) {
        alert("전화번호를 010-1234-5678 형식으로 입력해 주세요.");
        document.getElementById("apply-phone")?.focus();
        return null;
      }

      return { name, studentId, phone };
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
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const recruitForm = document.getElementById("recruitment-form");
    const titleEl = document.getElementById("form-title");
    
    const recruitMeta = {
      id: "smwu_ai_council_recruit_current",
      title: "제N대 학생회 MAIN 모집",
      eventDate: "면접 일정", 
      position: null 
    };

    if (!recruitForm) return;

    if (titleEl && document.title.includes("RECRUIT APPLY")) {
        const finalTitle = "학생회 모집 지원서 작성";
        titleEl.textContent = finalTitle;
        document.title = `${finalTitle} | 숙명여자대학교 인공지능공학부`;
    }
    
    function updateRecruitLabels() {
        const dept1 = getSelectValue("dept1");
        const dept2 = getSelectValue("dept2");
        if (document.getElementById("dept1-reason-label")) {
            document.getElementById("dept1-reason-label").textContent = `${dept1 || "1지망 부서"}를 지원한 이유*`;
        }
        if (document.getElementById("dept2-reason-label")) {
            document.getElementById("dept2-reason-label").textContent = `${dept2 || "2지망 부서"}를 지원한 이유*`;
        }
    }

    function updateFileLabel(e) {
        const fileLabel = document.getElementById("file-dropdown-label");
        if (fileLabel) {
             const fileName = e.target.files[0]?.name || "파일을 선택해주세요.";
             fileLabel.textContent = fileName;
        }
    }

    document.getElementById("dept1")?.addEventListener("change", updateRecruitLabels);
    document.getElementById("dept2")?.addEventListener("change", updateRecruitLabels);

    document.getElementById("portfolio-file")?.addEventListener("change", updateFileLabel);
    
    updateRecruitLabels();


    recruitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = getInputValue("name");
      const phone = getInputValue("phone");
      const dept1 = getSelectValue("dept1");
      const dept2 = getSelectValue("dept2");
      
      recordApplication(recruitMeta, APPLY_STORAGE_KEY_RECRUIT); 
      
      showRecruitFinalState(name, phone, dept1, dept2, recruitMeta);
    });

    function showRecruitFinalState(nameValue, phoneValue, dept1Value, dept2Value, meta) {
      const fallbackUrl = `/pages/8_tomato_recruit.html`; 
      
      const applicantName = nameValue || "지원자";
      const applicantPhone = phoneValue || "입력하신 번호";
      const eventTitle = meta.title || "학생회 모집";
      
      const deptText = dept1Value && dept2Value 
        ? `${dept1Value} (1지망), ${dept2Value} (2지망)`
        : dept1Value || dept2Value || "부서";

      recruitForm.innerHTML = `
        <p class="form-final-message">
          ${applicantName}님, **${eventTitle}** 지원이 완료되었습니다.<br>
          지망 부서: **${deptText}**<br>
          면접 일정 등 상세 안내사항은 추후 **${applicantPhone}**로 안내드립니다.<br>
          **지원해주셔서 감사합니다.**
        </p>
      `;

      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "submit-button";
      backButton.textContent = "돌아가기";
      recruitForm.appendChild(backButton);

      backButton.addEventListener("click", () => {
        window.location.href = fallbackUrl;
      });
    }
  });

})();

// /js/8_tomato_event.js

(function () {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event") || "freshman-ot-2025";
  const jsonPath = `/data/event_${eventId}.json`;

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error("JSON load error");
      return res.json();
    })
    .then(renderEvent)
    .catch((err) => {
      console.error(err);
    });

  function renderEvent(data) {
    // 상단 메타
    setText("event-meta-title", data.title);
    setText("event-meta-date", data.headerDate || data.date);

    // 썸네일 + 카드
    const coverImg = document.getElementById("event-cover");
    if (coverImg && data.heroImage) {
      coverImg.src = data.heroImage;
      coverImg.alt = data.heroAlt || data.title;
    }

    setText("event-tag", data.categoryLabel || "연간 행사");
    setText("event-name", data.title);
    setText("event-date-sub", data.date);
    setText("event-date-full", data.meta?.eventDate || data.date);

    const [target1, target2] = data.meta?.target || [];
    setText("event-target-line1", target1 || "");
    setText("event-target-line2", target2 || "");
    setHTML("event-description", toHtml(data.meta?.description || ""));

    // 인터뷰 Q&A
    const interviewRoot = document.getElementById("event-interview");
    if (interviewRoot && Array.isArray(data.interview)) {
      data.interview.forEach((item, index) => {
        const card = createQACard(item, index);
        interviewRoot.appendChild(card);
      });
    }

    // 갤러리
    const galleryRoot = document.getElementById("event-gallery");
    if (galleryRoot && Array.isArray(data.galleryImages)) {
      data.galleryImages.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        galleryRoot.appendChild(img);
      });
    }
  }

  function createQACard(item, index) {
    const wrapper = document.createElement("article");
    wrapper.classList.add("qa-card");

    const layout = item.layout || "image-left";
    const hasImage = !!item.image;

    if (!hasImage) {
      wrapper.classList.add("qa-card--text-only");
    } else if (layout === "image-right") {
      wrapper.classList.add("qa-card--image-right");
    }

    const imageEl = document.createElement("div");
    imageEl.className = "qa-card__image";

    if (hasImage) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.imageAlt || item.question;
      img.loading = "lazy";
      imageEl.appendChild(img);
    }

    const content = document.createElement("div");
    content.className = "qa-card__content";

    const label = document.createElement("div");
    label.className = "qa-card__label";
    label.textContent = `Q${item.no || index + 1}`;

    const q = document.createElement("h2");
    q.className = "qa-card__question";
    q.textContent = item.question;

    const a = document.createElement("p");
    a.className = "qa-card__answer";
    a.innerHTML = toHtml(item.answer);

    content.appendChild(label);
    content.appendChild(q);
    content.appendChild(a);

    // 순서: image-left / image-right / text-only 처리
    if (hasImage) {
      if (layout === "image-right") {
        wrapper.appendChild(content);
        wrapper.appendChild(imageEl);
      } else {
        wrapper.appendChild(imageEl);
        wrapper.appendChild(content);
      }
    } else {
      wrapper.appendChild(content);
    }

    return wrapper;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "string") el.textContent = value;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el && typeof html === "string") el.innerHTML = html;
  }

  function toHtml(text) {
    if (!text) return "";
    // 빈 줄 기준으로 단락 분리
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
      .map((p) =>
        `<p>${p
          .replace(/\n/g, "<br>")
          .replace(/  /g, "&nbsp;&nbsp;")}</p>`
      )
      .join("");
  }
})();

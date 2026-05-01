const works = [
  {
    title: "本",
    description: "シェーディングの練習として、合成皮革カバーの質感とページ側面の重なりを意識しました。",
    image: "images/book1984_2.png",
    video: "videos/book1984.mp4",
    ratio: "16 / 9",
  },
  {
    title: "ロッカー",
    description: "金属の質感を重視した作品です。",
    image: "images/rokka.png",
    ratio: "1 / 1",
  },
  {
    title: "スノードーム",
    description: "雪の表現とガラス越しの見え方を工夫しました。",
    image: "images/snowglobe.png",
    video: "videos/snowglobe.mp4",
    ratio: "1 / 1",
  },
  {
    title: "本棚",
    description: "以前作った本を使って制作しました。アニメーションにも挑戦し、自然な回転や細かな揺れが今後の課題です。",
    image: "images/hondana.png",
    video: "videos/hondana.mp4",
    ratio: "16 / 9",
  },
  {
    title: "遮断機",
    description: " ",
    image: "images/syadanki.png",
    video: "videos/syadanki.mp4",
    ratio: "16 / 9",
  },

];

const featuredMedia = document.querySelector("#featuredMedia");
const featuredTitle = document.querySelector("#featuredTitle");
const featuredDescription = document.querySelector("#featuredDescription");
const workCount = document.querySelector("#workCount");
const thumbnailGrid = document.querySelector("#thumbnailGrid");

let activeIndex = 0;

function mediaElement(work) {
  if (work.video) {
    const video = document.createElement("video");
    video.src = work.video;
    video.poster = work.image;
    video.controls = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("aria-label", `${work.title} video`);
    return video;
  }

  const image = document.createElement("img");
  image.src = work.image;
  image.alt = work.title;
  return image;
}

function renderFeatured(index) {
  const work = works[index];
  featuredMedia.style.setProperty("--featured-ratio", work.ratio);
  featuredMedia.replaceChildren(mediaElement(work));
  featuredTitle.textContent = work.title;
  featuredDescription.textContent = work.description;
  workCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}`;
  featuredMedia.style.setProperty("--zoom-scale", "0.78");
  updateActiveThumbnail();
  updateScrollZoom();
}

function renderThumbnails() {
  const fragment = document.createDocumentFragment();

  works.forEach((work, index) => {
    const button = document.createElement("button");
    button.className = "thumbnail";
    button.type = "button";
    button.setAttribute("aria-label", `${work.title} を表示`);
    button.addEventListener("click", () => {
      activeIndex = index;
      renderFeatured(activeIndex);
      document.querySelector(".featured-work").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    const visual = document.createElement("span");
    visual.className = "thumbnail-visual";

    const image = document.createElement("img");
    image.src = work.image;
    image.alt = "";
    image.loading = "lazy";

    const title = document.createElement("span");
    title.className = "thumbnail-title";
    title.textContent = work.title;

    const meta = document.createElement("span");
    meta.className = "thumbnail-meta";
    meta.textContent = work.video ? "画像 + 動画" : "画像";

    const text = document.createElement("span");
    text.className = "thumbnail-text";
    text.append(title, meta);

    visual.append(image);
    button.append(visual, text);
    fragment.append(button);
  });

  thumbnailGrid.replaceChildren(fragment);
}

function updateActiveThumbnail() {
  document.querySelectorAll(".thumbnail").forEach((thumbnail, index) => {
    const isActive = index === activeIndex;
    thumbnail.classList.toggle("is-active", isActive);
    thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function updateScrollZoom() {
  const rect = featuredMedia.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const mediaCenter = rect.top + rect.height / 2;
  const zoomStart = window.innerHeight * 0.95;
  const progress = Math.min(1, Math.max(0, (zoomStart - mediaCenter) / (zoomStart - viewportCenter)));
  const scale = 0.78 + progress * 0.34;
  featuredMedia.style.setProperty("--zoom-scale", scale.toFixed(3));
}

renderThumbnails();
renderFeatured(activeIndex);

window.addEventListener("scroll", updateScrollZoom, { passive: true });
window.addEventListener("resize", updateScrollZoom);

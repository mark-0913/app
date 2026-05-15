const works = [
  {
    title: "本",
    description: "シェーディングの練習として、合成皮革カバーの質感とページ側面の重なりを意識。",
    image: "images/book1984_2.png",
    video: "videos/book1984.mp4",
    imageRatio: "16 / 9",
    videoRatio: "16 / 9",
  },
  {
    title: "ロッカー",
    description: "金属の質感を重視した作品です。",
    image: "images/rokka.png",
    imageRatio: "1 / 1",
  },
  {
    title: "スノードーム",
    description: "雪の表現とガラス越しの見え方を工夫。",
    image: "images/snowglobe.png",
    video: "videos/snowglobe.mp4",
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
  },
  {
    title: "本棚",
    description: "以前作った本を使って制作。アニメーションに挑戦し、自然な回転や細かな揺れが今後の課題。",
    image: "images/hondana.png",
    video: "videos/hondana.mp4",
    imageRatio: "16 / 9",
    videoRatio: "16 / 9",
  },
  {
    title: "遮断機",
    description: " ",
    image: "images/syadanki.png",
    videos: ["videos/syadanki-omote.mp4", "videos/syadanki-ura.mp4"],
    imageRatio: "16 / 9",
    videoRatio: "1 / 1",
  },
  {
    title: "シャンデリア",
    description: "エミッションを使用して照明を作成。",
    image: "images/syoumei.png",
    videos: ["videos/syoumei1.mp4", "videos/syoumei.mp4"],
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
  }, 
  {
    title: "ポスト",
    description: "シェーダーの練習",
    image: "images/post.png",
    videos: ["videos/post.mp4","videos/post1.mp4"],
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
  },
  {
    title: "知恵の輪",
    description: "金属の粉吹きや錆の質感を意識して制作",
    image: "images/tienowa.png",
    video: "videos/tienowa.mp4",
    imageRatio: "16 / 9",
    videoRatio: "16 / 9",
  },
  {
    title: "目薬",
    description: "透明なプラスチックと液体のシェーディング練習",
    image: "images/megusuri.png",
    video: "videos/megusuri.mp4",
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
  },
  {
    title: "オープンリールデッキ",
    description: "ローポリでレトロな雰囲気",
    image: "images/openreeldeck.png",
    imageRatio: "1 / 1",
  },
  {
    title: "ホットコーヒー",
    description: "ステンレスマグカップの質感と湯気が立ち上る様子",
    image: "images/coffee1.png",
    videos: ["videos/coffee.mp4","videos/hotcoffee.mp4"],
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
    sources: [
    { label: "使用したHDRIs", url: "https://polyhaven.com/a/cedar_bridge_sunset_1" },
    ],
  },

];
/* 
 {
    title: "",
    description: "",
    image: "images/.png",
    images: ["images/.png", "images/.png"],
    videos: ["videos/.mp4", "videos/.mp4"],
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
    sources: [
      // { label: "Texture source name", url: "https://example.com" },
    ],
  },
*/
const featuredMedia = document.querySelector("#featuredMedia");
const featuredTitle = document.querySelector("#featuredTitle");
const featuredDescription = document.querySelector("#featuredDescription");
const featuredSources = document.querySelector("#featuredSources");
const featuredCopy = document.querySelector(".featured-copy");
const workCount = document.querySelector("#workCount");
const thumbnailGrid = document.querySelector("#thumbnailGrid");
const sortToggle = document.querySelector("#sortToggle");
const sortLabel = document.querySelector("#sortLabel");
const sortMark = document.querySelector("#sortMark");

let activeIndex = 0;
let sortOrder = "oldest";

function mediaElement(work) {
  const mediaItems = mediaItemsFor(work);

  if (mediaItems.length > 1) {
    const carousel = document.createElement("div");
    carousel.className = "featured-carousel";

    const scroller = document.createElement("div");
    scroller.className = "featured-media-scroll";
    scroller.setAttribute("aria-label", `${work.title} media`);

    const indicators = document.createElement("div");
    indicators.className = "carousel-indicators";
    indicators.setAttribute("aria-label", "動画の位置");

    let scrollTimer;

    function scrollToMedia(index) {
      const nextMedia = scroller.querySelectorAll(".featured-media-item")[index];
      if (!nextMedia) return;

      scroller.scrollTo({
        left: nextMedia.offsetLeft,
        behavior: "smooth",
      });
      updateIndicators(index);
    }

    function visibleMediaIndex() {
      const mediaElements = [...scroller.querySelectorAll(".featured-media-item")];
      const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
      return mediaElements.reduce((closest, media, index) => {
        const mediaCenter = media.offsetLeft + media.clientWidth / 2;
        const distance = Math.abs(scrollerCenter - mediaCenter);
        return distance < closest.distance ? { index, distance } : closest;
      }, { index: 0, distance: Infinity }).index;
    }

    function playVisibleVideo() {
      const videoElements = [...scroller.querySelectorAll("video")];
      const mediaElements = [...scroller.querySelectorAll(".featured-media-item")];
      const activeIndex = visibleMediaIndex();
      videoElements.forEach((video) => {
        if (video === mediaElements[activeIndex]) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
      updateIndicators(activeIndex);
    }

    mediaItems.forEach((item, index) => {
      const element = createMediaItem(work, item, index);
      if (item.type === "video") {
        element.autoplay = index === 0;
        element.loop = true;
      }
      scroller.append(element);

      const indicator = document.createElement("button");
      indicator.className = "carousel-indicator";
      indicator.type = "button";
      indicator.setAttribute("aria-label", `メディア ${index + 1} を表示`);
      indicator.addEventListener("click", () => scrollToMedia(index));
      indicators.append(indicator);
    });

    function updateIndicators(activeIndicatorIndex) {
      indicators.querySelectorAll(".carousel-indicator").forEach((indicator, index) => {
        indicator.classList.toggle("is-active", index === activeIndicatorIndex);
        indicator.setAttribute("aria-current", index === activeIndicatorIndex ? "true" : "false");
      });
    }

    scroller.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(playVisibleVideo, 140);
    }, { passive: true });

    const previousButton = carouselButton("前のメディア", "prev", () => {
      const currentIndex = currentMediaIndex(scroller);
      scrollToMedia((currentIndex - 1 + mediaItems.length) % mediaItems.length);
    });

    const nextButton = carouselButton("次のメディア", "next", () => {
      const currentIndex = currentMediaIndex(scroller);
      scrollToMedia((currentIndex + 1) % mediaItems.length);
    });

    updateIndicators(0);
    carousel.append(scroller, previousButton, nextButton, indicators);
    return carousel;
  }

  if (mediaItems.length === 1) {
    const element = createMediaItem(work, mediaItems[0], 0);
    if (element instanceof HTMLVideoElement) {
      element.loop = true;
      element.autoplay = true;
    }
    return element;
  }

  const image = document.createElement("img");
  image.src = primaryImageFor(work);
  image.alt = work.title;
  return image;
}

function carouselButton(label, direction, onClick) {
  const button = document.createElement("button");
  button.className = `carousel-arrow carousel-arrow-${direction}`;
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.textContent = direction === "prev" ? "<" : ">";
  button.addEventListener("click", onClick);
  return button;
}

function mediaItemsFor(work) {
  const images = work.images || (work.image ? [work.image] : []);
  const videos = work.videos || (work.video ? [work.video] : []);
  return [
    ...images.map((src) => ({ type: "image", src })),
    ...videos.map((src) => ({ type: "video", src })),
  ];
}

function primaryImageFor(work) {
  return work.image || work.images?.[0] || "";
}

function mediaLabel(imageCount, videoCount) {
  if (imageCount > 1 && videoCount > 1) return `画像 ${imageCount}枚 + 動画 ${videoCount}本`;
  if (imageCount > 1 && videoCount === 1) return `画像 ${imageCount}枚 + 動画`;
  if (imageCount === 1 && videoCount > 1) return `画像 + 動画 ${videoCount}本`;
  if (imageCount === 1 && videoCount === 1) return "画像 + 動画";
  if (imageCount > 1) return `画像 ${imageCount}枚`;
  return "画像";
}

function createMediaItem(work, item, index) {
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.poster = primaryImageFor(work);
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.className = "featured-media-item";
    video.setAttribute("aria-label", `${work.title} video ${index + 1}`);
    return video;
  }

  const image = document.createElement("img");
  image.src = item.src;
  image.alt = work.title;
  image.className = "featured-media-item";
  return image;
}

function currentMediaIndex(scroller) {
  const mediaElements = [...scroller.querySelectorAll(".featured-media-item")];
  const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
  return mediaElements.reduce((closest, media, index) => {
    const mediaCenter = media.offsetLeft + media.clientWidth / 2;
    const distance = Math.abs(scrollerCenter - mediaCenter);
    return distance < closest.distance ? { index, distance } : closest;
  }, { index: 0, distance: Infinity }).index;
}

function sourceLinksFor(work) {
  return (work.sources || [])
    .map((source) => {
      if (typeof source === "string") {
        return { label: "使用したtexture/HDRIs", url: source };
      }

      return {
        label: source.label || "使用したtexture/HDRIs",
        url: source.url,
      };
    })
    .filter((source) => source.url);
}

function renderSourceLinks(work) {
  const sources = sourceLinksFor(work);

  if (sources.length === 0) {
    featuredSources.hidden = true;
    featuredSources.replaceChildren();
    return;
  }

  const fragment = document.createDocumentFragment();

  sources.forEach((source) => {
    const link = document.createElement("a");
    link.className = "source-link";
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = source.label;
    fragment.append(link);
  });

  featuredSources.hidden = false;
  featuredSources.replaceChildren(fragment);
}

function syncFeaturedCopyHeight() {
  if (window.matchMedia("(max-width: 800px)").matches) {
    featuredCopy.style.removeProperty("--featured-copy-height");
    return;
  }

  const visibleMedia = featuredMedia.querySelector(".featured-media-scroll, img, video");
  const mediaHeight = visibleMedia?.getBoundingClientRect().height;

  if (mediaHeight) {
    featuredCopy.style.setProperty("--featured-copy-height", `${Math.round(mediaHeight)}px`);
  }
}

function renderFeatured(index) {
  const work = works[index];
  const mediaItems = mediaItemsFor(work);
  const ratio = mediaItems[0]?.type === "video" ? work.videoRatio || work.imageRatio : work.imageRatio || work.videoRatio;
  featuredMedia.style.setProperty("--featured-ratio", ratio);
  featuredMedia.replaceChildren(mediaElement(work));
  featuredTitle.textContent = work.title;
  featuredDescription.textContent = work.description;
  renderSourceLinks(work);
  updateWorkCount();
  featuredMedia.style.setProperty("--zoom-scale", "0.78");
  updateActiveThumbnail();
  updateScrollZoom();
  requestAnimationFrame(syncFeaturedCopyHeight);
}

function sortedWorks() {
  const orderedWorks = works.map((work, index) => ({ work, index }));
  return sortOrder === "newest" ? orderedWorks.reverse() : orderedWorks;
}

function activeDisplayIndex() {
  return sortedWorks().findIndex(({ index }) => index === activeIndex);
}

function updateWorkCount() {
  const displayIndex = activeDisplayIndex();
  const safeIndex = displayIndex >= 0 ? displayIndex : activeIndex;
  workCount.textContent = `${String(safeIndex + 1).padStart(2, "0")} / ${String(works.length).padStart(2, "0")}`;
}

function updateSortControl() {
  const isNewest = sortOrder === "newest";
  sortLabel.textContent = isNewest ? "新しい順" : "古い順";
  sortMark.textContent = isNewest ? "↑" : "↓";
  sortToggle.setAttribute("aria-label", `並び順を${isNewest ? "古い順" : "新しい順"}にする`);
  sortToggle.setAttribute("aria-pressed", isNewest ? "true" : "false");
}

function renderThumbnails() {
  const fragment = document.createDocumentFragment();

  sortedWorks().forEach(({ work, index }) => {
    const button = document.createElement("button");
    button.className = "thumbnail";
    button.type = "button";
    button.dataset.workIndex = String(index);
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
    image.src = primaryImageFor(work);
    image.alt = "";
    image.loading = "lazy";

    const title = document.createElement("span");
    title.className = "thumbnail-title";
    title.textContent = work.title;

    const meta = document.createElement("span");
    meta.className = "thumbnail-meta";
    const imageCount = work.images?.length || (work.image ? 1 : 0);
    const videoCount = work.videos?.length || (work.video ? 1 : 0);
    meta.textContent = mediaLabel(imageCount, videoCount);

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
  document.querySelectorAll(".thumbnail").forEach((thumbnail) => {
    const isActive = Number(thumbnail.dataset.workIndex) === activeIndex;
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

sortToggle.addEventListener("click", () => {
  sortOrder = sortOrder === "oldest" ? "newest" : "oldest";
  renderThumbnails();
  updateSortControl();
  updateActiveThumbnail();
  updateWorkCount();
});

updateSortControl();
renderThumbnails();
renderFeatured(activeIndex);

window.addEventListener("scroll", updateScrollZoom, { passive: true });
window.addEventListener("resize", () => {
  updateScrollZoom();
  syncFeaturedCopyHeight();
});

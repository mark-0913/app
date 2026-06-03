let works = [];
const worksDataPath = "data/works.json";
const initialWorkId = "tienowa";
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
const tagSummary = document.querySelector("#tagSummary");
const tagClear = document.querySelector("#tagClear");
const tagCheckboxes = [...document.querySelectorAll('input[name="tagFilter"]')];

let activeIndex = 0;
let sortOrder = "oldest";
let activeTags = [];

async function loadWorks() {
  const response = await fetch(worksDataPath);
  if (!response.ok) {
    throw new Error(`${worksDataPath} could not be loaded: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`${worksDataPath} must contain an array.`);
  }

  works = data;
}

function showLoadError(error) {
  console.error(error);
  featuredTitle.textContent = "作品データを読み込めませんでした";
  featuredDescription.textContent = "ローカルサーバーで開いているか、data/works.json の形式を確認してください。";
  workCount.textContent = "00 / 00";
}

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

function normalizeTag(tag) {
  return String(tag).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function workMatchesTag(work) {
  if (activeTags.length === 0) return true;
  const workTags = (work.tags || []).map(normalizeTag);
  return activeTags.some((activeTag) => workTags.includes(normalizeTag(activeTag)));
}

function displayedWorks() {
  return sortedWorks().filter(({ work }) => workMatchesTag(work));
}

function activeDisplayIndex() {
  return displayedWorks().findIndex(({ index }) => index === activeIndex);
}

function updateWorkCount() {
  const totalWorks = displayedWorks().length;
  if (totalWorks === 0) {
    workCount.textContent = "00 / 00";
    return;
  }

  const displayIndex = activeDisplayIndex();
  const safeIndex = displayIndex >= 0 ? displayIndex : activeIndex;
  workCount.textContent = `${String(safeIndex + 1).padStart(2, "0")} / ${String(totalWorks).padStart(2, "0")}`;
}

function updateSortControl() {
  const isNewest = sortOrder === "newest";
  sortLabel.textContent = isNewest ? "新しい順" : "古い順";
  sortMark.textContent = isNewest ? "↑" : "↓";
  sortToggle.setAttribute("aria-label", `並び順を${isNewest ? "古い順" : "新しい順"}にする`);
  sortToggle.setAttribute("aria-pressed", isNewest ? "true" : "false");
}

function updateTagSummary() {
  if (activeTags.length === 0) {
    tagSummary.textContent = "タグ: すべて";
    return;
  }

  tagSummary.textContent = `タグ: ${activeTags.length}件選択中`;
}

function preserveScrollPosition(update) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  update();
  requestAnimationFrame(() => {
    window.scrollTo(scrollX, scrollY);
  });
}

function renderThumbnails() {
  const fragment = document.createDocumentFragment();
  const worksToRender = displayedWorks();

  if (worksToRender.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "thumbnail-empty";
    emptyMessage.textContent = "このタグの作品はまだありません。";
    thumbnailGrid.replaceChildren(emptyMessage);
    return;
  }

  worksToRender.forEach(({ work, index }) => {
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

function syncActiveWorkWithFilter() {
  const worksToRender = displayedWorks();
  if (worksToRender.length === 0) {
    updateWorkCount();
    updateActiveThumbnail();
    return;
  }

  const activeWorkIsVisible = worksToRender.some(({ index }) => index === activeIndex);
  if (!activeWorkIsVisible) {
    activeIndex = worksToRender[0].index;
    renderFeatured(activeIndex);
    return;
  }

  updateWorkCount();
  updateActiveThumbnail();
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

function setInitialWork() {
  const initialIndex = works.findIndex((work) => work.id === initialWorkId);
  activeIndex = initialIndex >= 0 ? initialIndex : 0;
}

sortToggle.addEventListener("click", () => {
  sortOrder = sortOrder === "oldest" ? "newest" : "oldest";
  renderThumbnails();
  updateSortControl();
  syncActiveWorkWithFilter();
});

tagCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    preserveScrollPosition(() => {
      activeTags = tagCheckboxes
        .filter((tagCheckbox) => tagCheckbox.checked)
        .map((tagCheckbox) => tagCheckbox.value);
      updateTagSummary();
      renderThumbnails();
      syncActiveWorkWithFilter();
    });
  });
});

tagClear.addEventListener("click", () => {
  preserveScrollPosition(() => {
    tagCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    activeTags = [];
    updateTagSummary();
    renderThumbnails();
    syncActiveWorkWithFilter();
  });
});

async function init() {
  try {
    await loadWorks();
    setInitialWork();
    updateSortControl();
    updateTagSummary();
    renderThumbnails();
    renderFeatured(activeIndex);
  } catch (error) {
    showLoadError(error);
  }
}

init();

window.addEventListener("scroll", updateScrollZoom, { passive: true });
window.addEventListener("resize", () => {
  updateScrollZoom();
  syncFeaturedCopyHeight();
});

const works = [
  {
    title: "本",
    description: "シェーディングの練習として、合成皮革カバーの質感とページ側面の重なりを意識しました。",
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
    description: "雪の表現とガラス越しの見え方を工夫しました。",
    image: "images/snowglobe.png",
    video: "videos/snowglobe.mp4",
    imageRatio: "1 / 1",
    videoRatio: "1 / 1",
  },
  {
    title: "本棚",
    description: "以前作った本を使って制作しました。アニメーションにも挑戦し、自然な回転や細かな揺れが今後の課題。",
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
    description: "レトロな雰囲気",
    image: "images/openreeldeck.png",
    imageRatio: "1 / 1",
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
  },
*/
const featuredMedia = document.querySelector("#featuredMedia");
const featuredTitle = document.querySelector("#featuredTitle");
const featuredDescription = document.querySelector("#featuredDescription");
const workCount = document.querySelector("#workCount");
const thumbnailGrid = document.querySelector("#thumbnailGrid");

let activeIndex = 0;

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
        element.addEventListener("ended", () => {
          const nextIndex = (index + 1) % mediaItems.length;
          const nextMedia = scroller.querySelectorAll(".featured-media-item")[nextIndex];
          if (nextMedia instanceof HTMLVideoElement) {
            nextMedia.currentTime = 0;
          }
          scrollToMedia(nextIndex);
          if (nextMedia instanceof HTMLVideoElement) {
            nextMedia.play().catch(() => {});
          }
        });
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

function renderFeatured(index) {
  const work = works[index];
  const mediaItems = mediaItemsFor(work);
  const ratio = mediaItems[0]?.type === "video" ? work.videoRatio || work.imageRatio : work.imageRatio || work.videoRatio;
  featuredMedia.style.setProperty("--featured-ratio", ratio);
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

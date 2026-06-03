const worksDataPath = "data/works.json";
const workList = document.querySelector("#workList");
const statusMessage = document.querySelector("#statusMessage");
const workSearch = document.querySelector("#workSearch");
const copyJson = document.querySelector("#copyJson");
const downloadJson = document.querySelector("#downloadJson");
const workTemplate = document.querySelector("#workTemplate");

const tagGroups = [
  {
    name: "人工物",
    tags: [
      ["Vehicle", "乗り物"],
      ["Weapon", "武器"],
      ["Product Design", "製品"],
      ["Architecture", "建築"],
    ],
  },
  {
    name: "有機物",
    tags: [
      ["Character", "キャラクター"],
      ["Creature", "生物"],
      ["Animal", "動物"],
      ["Human", "人物"],
    ],
  },
  {
    name: "環境",
    tags: [
      ["Cityscape", "都市景観"],
      ["Interior", "室内"],
      ["Exterior", "屋外"],
    ],
  },
  {
    name: "小物",
    tags: [
      ["Furniture", "家具"],
      ["Tools", "道具"],
      ["Food", "食べ物"],
      ["Daily Objects", "日用品"],
    ],
  },
  {
    name: "材質表現",
    tags: [
      ["Metal", ""],
      ["Glass", ""],
      ["Wood", ""],
      ["Stone", ""],
      ["Fabric", ""],
      ["Liquid", ""],
      ["Plastic", ""],
    ],
  },
  {
    name: "VFX",
    tags: [
      ["Explosion", ""],
      ["Smoke", ""],
      ["Fire", ""],
      ["Water Simulation", ""],
      ["Geometry Nodes", ""],
    ],
  },
  {
    name: "Stylized",
    tags: [
      ["Anime Style", ""],
      ["Low Poly", ""],
      ["Toon", ""],
      ["Hand Painted", ""],
    ],
  },
];

const legacyTagSuggestions = new Map([
  ["book", "Daily Objects"],
  ["leather", "Fabric"],
  ["lowpoly", "Low Poly"],
  ["smoke", "Smoke"],
  ["metal", "Metal"],
  ["glass", "Glass"],
  ["wood", "Wood"],
  ["stone", "Stone"],
  ["fabric", "Fabric"],
  ["liquid", "Liquid"],
  ["plastic", "Plastic"],
]);

const catalogTags = tagGroups.flatMap((group) => group.tags.map(([tag]) => tag));
const catalogTagKeys = new Map(catalogTags.map((tag) => [normalizeTag(tag), tag]));
let works = [];

function normalizeTag(tag) {
  return String(tag).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function primaryImageFor(work) {
  return work.image || work.images?.[0] || "";
}

function suggestedTagsFor(work) {
  const suggestions = new Set();

  (work.tags || []).forEach((tag) => {
    const key = normalizeTag(tag);
    if (catalogTagKeys.has(key)) {
      suggestions.add(catalogTagKeys.get(key));
    }
    if (legacyTagSuggestions.has(key)) {
      suggestions.add(legacyTagSuggestions.get(key));
    }
  });

  return suggestions;
}

function preservedTagsFor(work) {
  return (work.tags || []).filter((tag) => {
    const key = normalizeTag(tag);
    return !catalogTagKeys.has(key) && !legacyTagSuggestions.has(key);
  });
}

function tagLabel(tag, japaneseLabel) {
  return japaneseLabel ? `${tag}（${japaneseLabel}）` : tag;
}

function renderWork(work) {
  const node = workTemplate.content.firstElementChild.cloneNode(true);
  const image = node.querySelector(".work-image");
  const title = node.querySelector("h2");
  const id = node.querySelector(".work-id");
  const legacyTags = node.querySelector(".legacy-tags");
  const tagGroupsElement = node.querySelector(".tag-groups");
  const suggestions = suggestedTagsFor(work);
  const preservedTags = preservedTagsFor(work);

  node.dataset.search = [
    work.id,
    work.title,
    ...(work.tags || []),
  ].join(" ").toLowerCase();
  node.dataset.workId = work.id;

  image.src = primaryImageFor(work);
  image.alt = work.title;
  title.textContent = work.title;
  id.textContent = work.id;

  if (preservedTags.length > 0) {
    legacyTags.textContent = `保持される既存タグ: ${preservedTags.join(", ")}`;
  } else {
    legacyTags.textContent = "保持される既存タグ: なし";
  }

  tagGroups.forEach((group) => {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = group.name;
    fieldset.append(legend);

    group.tags.forEach(([tag, japaneseLabel]) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = `tags-${work.id}`;
      checkbox.value = tag;
      checkbox.checked = suggestions.has(tag);
      label.append(checkbox, tagLabel(tag, japaneseLabel));
      fieldset.append(label);
    });

    tagGroupsElement.append(fieldset);
  });

  return node;
}

function renderWorks() {
  const fragment = document.createDocumentFragment();
  works.forEach((work) => fragment.append(renderWork(work)));
  workList.replaceChildren(fragment);
  filterWorks();
  statusMessage.textContent = `${works.length}件の作品を読み込みました。チェックを変更して works.json を出力できます。`;
}

function filterWorks() {
  const query = workSearch.value.trim().toLowerCase();
  workList.querySelectorAll(".work-card").forEach((card) => {
    card.hidden = query.length > 0 && !card.dataset.search.includes(query);
  });
}

function selectedTagsFor(work) {
  return [...document.querySelectorAll(`input[name="tags-${CSS.escape(work.id)}"]:checked`)]
    .map((checkbox) => checkbox.value);
}

function buildUpdatedWorks() {
  return works.map((work) => ({
    ...work,
    tags: [...new Set([...selectedTagsFor(work), ...preservedTagsFor(work)])],
  }));
}

function jsonOutput() {
  return `${JSON.stringify(buildUpdatedWorks(), null, 2)}\n`;
}

async function copyOutput() {
  await navigator.clipboard.writeText(jsonOutput());
  statusMessage.textContent = "更新済みJSONをクリップボードへコピーしました。";
}

function downloadOutput() {
  const blob = new Blob([jsonOutput()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "works.json";
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.textContent = "更新済み works.json をダウンロードしました。";
}

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

workSearch.addEventListener("input", filterWorks);
copyJson.addEventListener("click", () => {
  copyOutput().catch(() => {
    statusMessage.textContent = "コピーできませんでした。ダウンロードを使ってください。";
  });
});
downloadJson.addEventListener("click", downloadOutput);

loadWorks()
  .then(renderWorks)
  .catch((error) => {
    console.error(error);
    statusMessage.textContent = "data/works.json を読み込めませんでした。ローカルサーバーで開いているか確認してください。";
  });

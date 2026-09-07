// ---------- Icônes (SVG inline, pas d'emoji) ----------
const ICON_PATHS = {
  rings: '<circle cx="9" cy="14" r="5.2"/><circle cx="15" cy="14" r="5.2"/>',
  heart: '<path d="M12 20.5c-4.8-3-9-6.6-9-11A5 5 0 0 1 12 6.2 5 5 0 0 1 21 9.5c0 4.4-4.2 8-9 11z"/>',
  people: '<circle cx="8" cy="7.5" r="2.6"/><circle cx="16" cy="7.5" r="2.6"/><path d="M3 20c0-3.3 2.2-5.5 5-5.5s5 2.2 5 5.5M11 20c0-3.3 2.2-5.5 5-5.5s5 2.2 5 5.5"/>',
  briefcase: '<rect x="3.5" y="8" width="17" height="11" rx="1.6"/><path d="M8.5 8V6.2A1.7 1.7 0 0 1 10.2 4.5h3.6A1.7 1.7 0 0 1 15.5 6.2V8"/><path d="M3.5 13h17"/>',
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/>',
  star: '<path d="M12 4.5 14.6 10l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 10.9l6-.9z"/>',
  starFilled: '<path d="M12 4.5 14.6 10l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 10.9l6-.9z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  backpack: '<path d="M8 8V6a4 4 0 0 1 8 0v2"/><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 12h.01M15 12h.01"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7 9.6 4.4A1.6 1.6 0 0 1 11 3.5h2a1.6 1.6 0 0 1 1.4.9L16 7"/><circle cx="12" cy="13.5" r="3.6"/>',
  speech: '<path d="M4 5h16v11H8l-4 4z"/>',
  pencil: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 6.5l3.5 3.5"/>',
  trash: '<path d="M5 7h14M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M7 7l1 13h8l1-13"/>',
  checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.3 2.3 4.7-4.9"/>',
  alertTriangle: '<path d="M12 4.5 21 19H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".2" fill="currentColor" stroke-width="2"/>',
  xCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>'
};

function icon(name, cls = "icon") {
  const inner = ICON_PATHS[name] || "";
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

// ---------- IndexedDB wrapper ----------
const DB_NAME = "poses-db";
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("poses")) {
        const store = db.createObjectStore("poses", { keyPath: "id", autoIncrement: true });
        store.createIndex("cat", "cat");
        store.createIndex("sub", "sub");
        store.createIndex("favorite", "favorite");
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeName, mode) {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getMeta(key) {
  const store = await tx("meta", "readonly");
  return idbRequest(store.get(key));
}
async function setMeta(key, value) {
  const store = await tx("meta", "readwrite");
  return idbRequest(store.put({ key, value }));
}

async function getAllPoses() {
  const store = await tx("poses", "readonly");
  return idbRequest(store.getAll());
}
async function getPose(id) {
  const store = await tx("poses", "readonly");
  return idbRequest(store.get(id));
}
async function addPose(pose) {
  const store = await tx("poses", "readwrite");
  return idbRequest(store.add(pose));
}
async function putPose(pose) {
  const store = await tx("poses", "readwrite");
  return idbRequest(store.put(pose));
}
async function deletePose(id) {
  const store = await tx("poses", "readwrite");
  return idbRequest(store.delete(id));
}

async function ensureSeeded() {
  const meta = await getMeta("seeded");
  if (meta && meta.value) return;
  const store = await tx("poses", "readwrite");
  for (const p of SEED_POSES) {
    store.add({
      cat: p.cat,
      sub: p.sub,
      name: p.name,
      direction: p.direction,
      technique: p.technique,
      focal: p.focal || null,
      photo: null,
      favorite: false,
      custom: false,
      createdAt: Date.now()
    });
  }
  await setMeta("seeded", true);
}

// Comble le champ focal pour les poses de base déjà installées avant cette mise à jour.
async function migrateFocalData() {
  const done = await getMeta("focal-migrated");
  if (done && done.value) return;
  const all = await getAllPoses();
  const byKey = {};
  for (const s of SEED_POSES) byKey[`${s.cat}|${s.sub}|${s.name}`] = s.focal;
  for (const p of all) {
    if (!p.custom && !p.focal) {
      const key = `${p.cat}|${p.sub}|${p.name}`;
      if (byKey[key]) {
        p.focal = byKey[key];
        await putPose(p);
      }
    }
  }
  await setMeta("focal-migrated", true);
}

// ---------- Équipement (optionnel) ----------
async function getEquipment() {
  const meta = await getMeta("equipment");
  return meta && meta.value ? meta.value : null; // null = pas encore configuré
}
async function saveEquipment(lenses) {
  await setMeta("equipment", lenses); // lenses: [] autorisé (configuré mais vide)
}

// coverage: null (pas de matériel configuré ou pose sans focale), "covered", "partial", "none"
function poseCoverage(pose, lenses) {
  if (!lenses || !pose.focal) return null;
  const [pMin, pMax] = pose.focal;
  let bestPartial = false;
  for (const l of lenses) {
    if (l.minMM <= pMin && l.maxMM >= pMax) return "covered";
    if (l.maxMM >= pMin && l.minMM <= pMax) bestPartial = true;
  }
  return bestPartial ? "partial" : "none";
}

function coverageBadge(status) {
  if (status === "covered") return `<span class="gear-badge gear-ok" title="Couvert par ton matériel">${icon("checkCircle", "icon")} Couvert</span>`;
  if (status === "partial") return `<span class="gear-badge gear-partial" title="Partiellement couvert">${icon("alertTriangle", "icon")} Partiel</span>`;
  if (status === "none") return `<span class="gear-badge gear-none" title="Non couvert par ton matériel">${icon("xCircle", "icon")} Non couvert</span>`;
  return "";
}

// ---------- Helpers ----------
function catById(id) { return CATEGORIES.find((c) => c.id === id); }
function subById(cat, id) { return cat ? cat.subcategories.find((s) => s.id === id) : null; }

function resizeImage(file, maxDim = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ---------- Router ----------
const appEl = document.getElementById("app");

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  return hash.split("/").filter(Boolean);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", async () => {
  await ensureSeeded();
  await migrateFocalData();
  render();
  registerSW();
});

async function render() {
  const parts = currentRoute();
  if (parts[0] === "cat" && parts[1] && parts[2]) {
    await renderPoseList(parts[1], parts[2]);
  } else if (parts[0] === "cat" && parts[1]) {
    await renderSubcats(parts[1]);
  } else if (parts[0] === "pose" && parts[1]) {
    await renderPoseDetail(Number(parts[1]));
  } else if (parts[0] === "add") {
    await renderForm(null, parts[1], parts[2]);
  } else if (parts[0] === "edit" && parts[1]) {
    await renderForm(Number(parts[1]));
  } else if (parts[0] === "favoris") {
    await renderFavorites();
  } else if (parts[0] === "recherche") {
    await renderSearch();
  } else if (parts[0] === "materiel") {
    await renderEquipment();
  } else {
    await renderHome();
  }
  renderBottomNav();
  window.scrollTo(0, 0);
}

function topbar(title, opts = {}) {
  const backBtn = opts.back
    ? `<button class="back-btn" onclick="history.back()">${icon("arrowLeft")}</button>`
    : "";
  const heading = opts.logo
    ? `<img class="brand-logo" src="icons/logo-white.png" alt="Victor Fernet Photographie">`
    : `<h1>${escapeHtml(title)}</h1>`;
  return `<div class="topbar">${backBtn}${heading}</div>`;
}

// ---------- Views ----------
async function renderHome() {
  const all = await getAllPoses();
  const tiles = CATEGORIES.map((c) => {
    const count = all.filter((p) => p.cat === c.id).length;
    return `<a class="tile" href="#/cat/${c.id}">
      ${icon(c.icon)}
      <span class="label">${escapeHtml(c.label)}</span>
      <span class="count">${count} pose${count > 1 ? "s" : ""}</span>
    </a>`;
  }).join("");

  appEl.innerHTML = `
    ${topbar("Poses", { logo: true })}
    <div class="search-wrap">
      <div class="search-input-wrap">
        ${icon("search")}
        <input class="search-input" id="home-search" type="text" placeholder="Rechercher une pose..." />
      </div>
    </div>
    <div class="grid">${tiles}</div>
    <button class="fab" onclick="location.hash='#/add'">${icon("plus")}</button>
  `;
  document.getElementById("home-search").addEventListener("input", (e) => {
    const q = e.target.value.trim();
    if (q.length >= 2) {
      sessionStorage.setItem("searchQuery", q);
      location.hash = "#/recherche";
    }
  });
}

async function renderSearch() {
  const q = (sessionStorage.getItem("searchQuery") || "").toLowerCase();
  const all = await getAllPoses();
  const lenses = await getEquipment();
  const results = all.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    (p.direction || "").toLowerCase().includes(q) ||
    (p.technique || "").toLowerCase().includes(q)
  );
  appEl.innerHTML = `
    ${topbar("Résultats", { back: true })}
    <div class="search-wrap">
      <input class="search-input" id="home-search" type="text" placeholder="Rechercher une pose..." value="${escapeHtml(q)}" />
    </div>
    ${results.length ? `<div class="pose-grid">${results.map((p) => poseCardHtml(p, lenses)).join("")}</div>` : emptyState("search", "Aucun résultat")}
  `;
  document.getElementById("home-search").addEventListener("input", (e) => {
    sessionStorage.setItem("searchQuery", e.target.value.trim());
    renderSearch();
  });
}

async function renderSubcats(catId) {
  const cat = catById(catId);
  if (!cat) { location.hash = "#/"; return; }
  const all = await getAllPoses();
  const rows = cat.subcategories.map((s) => {
    const count = all.filter((p) => p.cat === catId && p.sub === s.id).length;
    return `<a class="subcat-row" href="#/cat/${catId}/${s.id}">
      <div>
        <div class="label">${escapeHtml(s.label)}</div>
        <div class="count">${count} pose${count > 1 ? "s" : ""}</div>
      </div>
      <span class="chev">${icon("chevronRight", "icon icon-sm")}</span>
    </a>`;
  }).join("");
  appEl.innerHTML = `
    ${topbar(cat.label, { back: true })}
    <div class="list">${rows}</div>
    <button class="fab" onclick="location.hash='#/add/${catId}'">${icon("plus")}</button>
  `;
}

function poseCardHtml(p, lenses) {
  const thumb = p.photo
    ? `<img src="${p.photo}" alt="">`
    : icon("camera", "icon");
  const badge = coverageBadge(poseCoverage(p, lenses));
  return `<a class="pose-card" href="#/pose/${p.id}">
    <button class="fav-btn" onclick="event.preventDefault();event.stopPropagation();toggleFavorite(${p.id})">${icon(p.favorite ? "starFilled" : "star", "icon")}</button>
    <div class="thumb">${thumb}</div>
    <div class="info"><div class="name">${escapeHtml(p.name)}</div>${badge}</div>
  </a>`;
}

function emptyState(iconName, text) {
  return `<div class="empty-state">${icon(iconName)}<div>${escapeHtml(text)}</div></div>`;
}

async function renderPoseList(catId, subId) {
  const cat = catById(catId);
  const sub = subById(cat, subId);
  if (!cat || !sub) { location.hash = "#/"; return; }
  const all = await getAllPoses();
  const lenses = await getEquipment();
  const poses = all.filter((p) => p.cat === catId && p.sub === subId);
  appEl.innerHTML = `
    ${topbar(sub.label, { back: true })}
    ${poses.length ? `<div class="pose-grid">${poses.map((p) => poseCardHtml(p, lenses)).join("")}</div>` : emptyState("camera", "Aucune pose ici pour l'instant")}
    <button class="fab" onclick="location.hash='#/add/${catId}/${subId}'">${icon("plus")}</button>
  `;
}

async function renderFavorites() {
  const all = await getAllPoses();
  const lenses = await getEquipment();
  const favs = all.filter((p) => p.favorite);
  appEl.innerHTML = `
    ${topbar("Favoris")}
    ${favs.length ? `<div class="pose-grid">${favs.map((p) => poseCardHtml(p, lenses)).join("")}</div>` : emptyState("star", "Aucun favori pour l'instant")}
  `;
}

async function renderPoseDetail(id) {
  const p = await getPose(id);
  if (!p) { location.hash = "#/"; return; }
  const cat = catById(p.cat);
  const sub = subById(cat, p.sub);
  const photo = p.photo ? `<img src="${p.photo}" alt="">` : icon("camera", "icon");
  const lenses = await getEquipment();
  const status = poseCoverage(p, lenses);
  let gearBlock = "";
  if (status) {
    const texts = {
      covered: { iconName: "checkCircle", text: "Tu as un objectif adapté à cette pose." },
      partial: { iconName: "alertTriangle", text: "Ton matériel couvre une partie de la focale recommandée." },
      none: { iconName: "xCircle", text: "Aucun de tes objectifs ne couvre cette focale." }
    };
    const t = texts[status];
    gearBlock = `<div class="card-block">
      <div class="eyebrow">${icon("backpack")} Matériel</div>
      <p>${icon(t.iconName, "icon icon-sm")} ${t.text}</p>
    </div>`;
  }
  appEl.innerHTML = `
    ${topbar(sub ? sub.label : "Pose", { back: true })}
    <div class="detail">
      <div class="photo">${photo}</div>
      <h2>${escapeHtml(p.name)}</h2>
      <div class="card-block">
        <div class="eyebrow">${icon("speech")} Direction</div>
        <p>${escapeHtml(p.direction || "—")}</p>
      </div>
      <div class="card-block">
        <div class="eyebrow">${icon("camera")} Technique</div>
        <p>${escapeHtml(p.technique || "—")}</p>
      </div>
      ${gearBlock}
      <div class="detail-actions">
        <button class="btn btn-secondary" onclick="toggleFavorite(${p.id}, true)">${icon(p.favorite ? "starFilled" : "star")} ${p.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}</button>
      </div>
      <div class="detail-actions">
        <button class="btn btn-secondary" onclick="location.hash='#/edit/${p.id}'">${icon("pencil")} Modifier</button>
        <button class="btn btn-danger" onclick="confirmDelete(${p.id})">${icon("trash")} Supprimer</button>
      </div>
    </div>
  `;
}

window.toggleFavorite = async function (id, rerenderDetail) {
  const p = await getPose(id);
  if (!p) return;
  p.favorite = !p.favorite;
  await putPose(p);
  if (rerenderDetail) render();
  else {
    const btn = document.querySelector(`.pose-card[href="#/pose/${id}"] .fav-btn`);
    if (btn) btn.innerHTML = icon(p.favorite ? "starFilled" : "star", "icon");
  }
};

window.confirmDelete = async function (id) {
  if (!confirm("Supprimer cette pose ?")) return;
  await deletePose(id);
  history.back();
  setTimeout(() => { if (location.hash.includes(`/pose/${id}`)) location.hash = "#/"; }, 50);
};

async function renderForm(editId, presetCat, presetSub) {
  const isEdit = !!editId;
  let pose = { cat: presetCat || CATEGORIES[0].id, sub: "", name: "", direction: "", technique: "", photo: null };
  if (isEdit) {
    const existing = await getPose(editId);
    if (!existing) { location.hash = "#/"; return; }
    pose = existing;
  } else if (presetSub) {
    pose.sub = presetSub;
  }
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === pose.cat ? "selected" : ""}>${escapeHtml(c.label)}</option>`).join("");

  appEl.innerHTML = `
    ${topbar(isEdit ? "Modifier la pose" : "Nouvelle pose", { back: true })}
    <form class="pose-form" id="pose-form">
      <div class="field">
        <label>Photo</label>
        <div class="photo-picker">
          <div class="photo-preview" id="photo-preview">${pose.photo ? `<img src="${pose.photo}">` : icon("camera", "icon")}</div>
          <div class="photo-actions">
            <label>Prendre une photo<input type="file" accept="image/*" capture="environment" id="photo-camera"></label>
            <label>Choisir dans la galerie<input type="file" accept="image/*" id="photo-gallery"></label>
          </div>
        </div>
      </div>
      <div class="field">
        <label>Catégorie</label>
        <select id="f-cat">${catOptions}</select>
      </div>
      <div class="field">
        <label>Sous-catégorie</label>
        <select id="f-sub"></select>
      </div>
      <div class="field">
        <label>Nom de la pose</label>
        <input type="text" id="f-name" value="${escapeHtml(pose.name)}" placeholder="Ex: Front contre front" required>
      </div>
      <div class="field">
        <label>Conseil de direction</label>
        <textarea id="f-direction" placeholder="Ce que tu dis / fais faire aux sujets">${escapeHtml(pose.direction)}</textarea>
      </div>
      <div class="field">
        <label>Infos techniques</label>
        <textarea id="f-technique" placeholder="Focale, ouverture, lumière...">${escapeHtml(pose.technique)}</textarea>
      </div>
      <button type="submit" class="btn btn-primary">${isEdit ? "Enregistrer" : "Ajouter la pose"}</button>
    </form>
  `;

  let photoData = pose.photo;

  function populateSub(selectedSub) {
    const cat = catById(document.getElementById("f-cat").value);
    const subSel = document.getElementById("f-sub");
    subSel.innerHTML = cat.subcategories.map((s) => `<option value="${s.id}" ${s.id === selectedSub ? "selected" : ""}>${escapeHtml(s.label)}</option>`).join("");
  }
  populateSub(pose.sub);
  document.getElementById("f-cat").addEventListener("change", () => populateSub(null));

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    photoData = await resizeImage(file);
    document.getElementById("photo-preview").innerHTML = `<img src="${photoData}">`;
  }
  document.getElementById("photo-camera").addEventListener("change", handleFile);
  document.getElementById("photo-gallery").addEventListener("change", handleFile);

  document.getElementById("pose-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
      cat: document.getElementById("f-cat").value,
      sub: document.getElementById("f-sub").value,
      name: document.getElementById("f-name").value.trim() || "Sans titre",
      direction: document.getElementById("f-direction").value.trim(),
      technique: document.getElementById("f-technique").value.trim(),
      photo: photoData,
      favorite: pose.favorite || false,
      custom: true,
      createdAt: pose.createdAt || Date.now()
    };
    if (isEdit) {
      updated.id = editId;
      await putPose(updated);
      location.hash = `#/pose/${editId}`;
    } else {
      const newId = await addPose(updated);
      location.hash = `#/pose/${newId}`;
    }
  });
}

function renderBottomNav() {
  const parts = currentRoute();
  const activeHome = parts.length === 0 || parts[0] === "cat" || parts[0] === "pose" || parts[0] === "recherche";
  const activeFav = parts[0] === "favoris";
  const activeAdd = parts[0] === "add" || parts[0] === "edit";
  const activeGear = parts[0] === "materiel";
  const nav = document.getElementById("bottom-nav");
  nav.innerHTML = `
    <a class="nav-item ${activeHome ? "active" : ""}" href="#/">${icon("home")}Accueil</a>
    <a class="nav-item ${activeFav ? "active" : ""}" href="#/favoris">${icon("star")}Favoris</a>
    <a class="nav-item ${activeAdd ? "active" : ""}" href="#/add">${icon("plus")}Ajouter</a>
    <a class="nav-item ${activeGear ? "active" : ""}" href="#/materiel">${icon("backpack")}Matériel</a>
  `;
}

async function renderEquipment() {
  const owned = (await getEquipment()) || [];
  const ownedIds = new Set(owned.filter((l) => l.preset).map((l) => l.presetId));
  const customLenses = owned.filter((l) => !l.preset);

  const presetRows = LENS_PRESETS.map((preset) => {
    const checked = ownedIds.has(preset.id) ? "checked" : "";
    return `<label class="gear-row">
      <input type="checkbox" data-preset-id="${preset.id}" ${checked}>
      <span>${escapeHtml(preset.label)}</span>
    </label>`;
  }).join("");

  const customRows = customLenses.map((l, i) => `
    <div class="gear-row gear-custom">
      <span>${escapeHtml(l.label)} (${l.minMM}-${l.maxMM}mm)</span>
      <button type="button" class="gear-remove" data-remove-custom="${i}">${icon("xCircle", "icon icon-sm")}</button>
    </div>
  `).join("");

  appEl.innerHTML = `
    ${topbar("Mon matériel", { back: false })}
    <div class="detail">
      <div class="card-block">
        <p>Facultatif : indique les objectifs que tu possèdes pour voir en un coup d'œil si tu as le bon matériel pour chaque pose. Tu peux ignorer cette page.</p>
      </div>
      <div class="section-title" style="padding-left:0;">Objectifs courants</div>
      <div id="preset-list">${presetRows}</div>
      <div class="section-title" style="padding-left:0;">Objectifs personnalisés</div>
      <div id="custom-list">${customRows || '<p style="color:var(--text-dim);font-size:14px;">Aucun pour l\'instant.</p>'}</div>
      <button type="button" class="btn btn-secondary" id="add-custom-btn">+ Ajouter un objectif personnalisé</button>
      <div id="custom-form" style="display:none;" class="card-block">
        <div class="field"><label>Nom</label><input type="text" id="cl-label" placeholder="Ex: 135mm f/1.8"></div>
        <div class="field"><label>Focale min (mm)</label><input type="text" inputmode="numeric" id="cl-min" placeholder="Ex: 135"></div>
        <div class="field"><label>Focale max (mm)</label><input type="text" inputmode="numeric" id="cl-max" placeholder="Ex: 135"></div>
        <button type="button" class="btn btn-primary" id="cl-save">Ajouter</button>
      </div>
      <div class="detail-actions" style="margin-top:16px;">
        <button type="button" class="btn btn-primary" id="gear-save">Enregistrer</button>
      </div>
    </div>
  `;

  let localCustom = customLenses.slice();

  function collectAndSave() {
    const presetChecked = Array.from(document.querySelectorAll("#preset-list input[type=checkbox]:checked"))
      .map((el) => el.dataset.presetId);
    const presetLenses = LENS_PRESETS.filter((p) => presetChecked.includes(p.id))
      .map((p) => ({ preset: true, presetId: p.id, label: p.label, minMM: p.minMM, maxMM: p.maxMM }));
    return [...presetLenses, ...localCustom];
  }

  document.getElementById("add-custom-btn").addEventListener("click", () => {
    document.getElementById("custom-form").style.display = "block";
  });

  document.getElementById("cl-save").addEventListener("click", () => {
    const label = document.getElementById("cl-label").value.trim();
    const min = parseInt(document.getElementById("cl-min").value, 10);
    const max = parseInt(document.getElementById("cl-max").value, 10);
    if (!label || isNaN(min) || isNaN(max)) { alert("Renseigne le nom et les focales."); return; }
    localCustom.push({ preset: false, label, minMM: min, maxMM: max });
    saveEquipment(collectAndSave());
    renderEquipment();
  });

  document.querySelectorAll("[data-remove-custom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.removeCustom);
      localCustom.splice(idx, 1);
      saveEquipment(collectAndSave());
      renderEquipment();
    });
  });

  document.getElementById("gear-save").addEventListener("click", async () => {
    await saveEquipment(collectAndSave());
    location.hash = "#/";
  });
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

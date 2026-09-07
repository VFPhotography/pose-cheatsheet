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
      photo: null,
      favorite: false,
      custom: false,
      createdAt: Date.now()
    });
  }
  await setMeta("seeded", true);
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
  } else {
    await renderHome();
  }
  renderBottomNav();
  window.scrollTo(0, 0);
}

function topbar(title, opts = {}) {
  const backBtn = opts.back
    ? `<button class="back-btn" onclick="history.back()">←</button>`
    : "";
  return `<div class="topbar">${backBtn}<h1>${escapeHtml(title)}</h1></div>`;
}

// ---------- Views ----------
async function renderHome() {
  const all = await getAllPoses();
  const tiles = CATEGORIES.map((c) => {
    const count = all.filter((p) => p.cat === c.id).length;
    return `<a class="tile" href="#/cat/${c.id}">
      <span class="emoji">${c.icon}</span>
      <span class="label">${escapeHtml(c.label)}</span>
      <span class="count">${count} pose${count > 1 ? "s" : ""}</span>
    </a>`;
  }).join("");

  appEl.innerHTML = `
    ${topbar("Poses")}
    <div class="search-wrap">
      <input class="search-input" id="home-search" type="text" placeholder="Rechercher une pose..." />
    </div>
    <div class="grid">${tiles}</div>
    <button class="fab" onclick="location.hash='#/add'">+</button>
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
    ${results.length ? `<div class="pose-grid">${results.map(poseCardHtml).join("")}</div>` : emptyState("🔍", "Aucun résultat")}
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
      <span class="chev">›</span>
    </a>`;
  }).join("");
  appEl.innerHTML = `
    ${topbar(cat.icon + " " + cat.label, { back: true })}
    <div class="list">${rows}</div>
    <button class="fab" onclick="location.hash='#/add/${catId}'">+</button>
  `;
}

function poseCardHtml(p) {
  const thumb = p.photo
    ? `<img src="${p.photo}" alt="">`
    : `<span>📷</span>`;
  return `<a class="pose-card" href="#/pose/${p.id}">
    <button class="fav-btn" onclick="event.preventDefault();event.stopPropagation();toggleFavorite(${p.id})">${p.favorite ? "★" : "☆"}</button>
    <div class="thumb">${thumb}</div>
    <div class="info"><div class="name">${escapeHtml(p.name)}</div></div>
  </a>`;
}

function emptyState(emoji, text) {
  return `<div class="empty-state"><div class="emoji">${emoji}</div><div>${escapeHtml(text)}</div></div>`;
}

async function renderPoseList(catId, subId) {
  const cat = catById(catId);
  const sub = subById(cat, subId);
  if (!cat || !sub) { location.hash = "#/"; return; }
  const all = await getAllPoses();
  const poses = all.filter((p) => p.cat === catId && p.sub === subId);
  appEl.innerHTML = `
    ${topbar(sub.label, { back: true })}
    ${poses.length ? `<div class="pose-grid">${poses.map(poseCardHtml).join("")}</div>` : emptyState("📷", "Aucune pose ici pour l'instant")}
    <button class="fab" onclick="location.hash='#/add/${catId}/${subId}'">+</button>
  `;
}

async function renderFavorites() {
  const all = await getAllPoses();
  const favs = all.filter((p) => p.favorite);
  appEl.innerHTML = `
    ${topbar("Favoris")}
    ${favs.length ? `<div class="pose-grid">${favs.map(poseCardHtml).join("")}</div>` : emptyState("★", "Aucun favori pour l'instant")}
  `;
}

async function renderPoseDetail(id) {
  const p = await getPose(id);
  if (!p) { location.hash = "#/"; return; }
  const cat = catById(p.cat);
  const sub = subById(cat, p.sub);
  const photo = p.photo ? `<img src="${p.photo}" alt="">` : `<span>📷</span>`;
  appEl.innerHTML = `
    ${topbar(sub ? sub.label : "Pose", { back: true })}
    <div class="detail">
      <div class="photo">${photo}</div>
      <h2>${escapeHtml(p.name)}</h2>
      <div class="card-block">
        <div class="eyebrow">💬 Direction</div>
        <p>${escapeHtml(p.direction || "—")}</p>
      </div>
      <div class="card-block">
        <div class="eyebrow">📷 Technique</div>
        <p>${escapeHtml(p.technique || "—")}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-secondary" onclick="toggleFavorite(${p.id}, true)">${p.favorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}</button>
      </div>
      <div class="detail-actions">
        <button class="btn btn-secondary" onclick="location.hash='#/edit/${p.id}'">✏️ Modifier</button>
        <button class="btn btn-danger" onclick="confirmDelete(${p.id})">🗑 Supprimer</button>
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
    if (btn) btn.textContent = p.favorite ? "★" : "☆";
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
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === pose.cat ? "selected" : ""}>${c.icon} ${escapeHtml(c.label)}</option>`).join("");

  appEl.innerHTML = `
    ${topbar(isEdit ? "Modifier la pose" : "Nouvelle pose", { back: true })}
    <form class="pose-form" id="pose-form">
      <div class="field">
        <label>Photo</label>
        <div class="photo-picker">
          <div class="photo-preview" id="photo-preview">${pose.photo ? `<img src="${pose.photo}">` : "📷"}</div>
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
  const nav = document.getElementById("bottom-nav");
  nav.innerHTML = `
    <a class="nav-item ${activeHome ? "active" : ""}" href="#/"><span class="icon">🏠</span>Accueil</a>
    <a class="nav-item ${activeFav ? "active" : ""}" href="#/favoris"><span class="icon">★</span>Favoris</a>
    <a class="nav-item ${activeAdd ? "active" : ""}" href="#/add"><span class="icon">＋</span>Ajouter</a>
  `;
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

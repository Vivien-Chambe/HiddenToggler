

(() => {
  // Éviter plusieurs panneaux
  if (window.__hiddenVisibilityPanelInitialized) {
    const panel = document.getElementById("__hv-panel");
    if (panel) {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
    return;
  }
  window.__hiddenVisibilityPanelInitialized = true;

  const hiddenElements = []; // { el, originalInlineVisibility, forcedVisible, checkbox, row, meta }
  let allToggledOn = false;

  // ---------- Création du panneau ----------

  const panel = document.createElement("div");
  panel.id = "__hv-panel";
  panel.className = "hv-panel";

  const style = document.createElement("style");
  style.textContent = `
    .hv-panel {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 380px;
      max-height: 72vh;
      z-index: 999999;
      background: #050816;
      color: #f5f5f7;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(148,163,184,0.35);
    }

    .hv-header {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      background: radial-gradient(circle at top left, #3b82f6 0, #020617 60%);
      border-bottom: 1px solid rgba(148,163,184,0.4);
    }

    .hv-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hv-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #6b7280;
      box-shadow: 0 0 0 4px rgba(107,114,128,0.25);
      flex-shrink: 0;
      transition: background 0.2s, box-shadow 0.2s;
    }
    .hv-dot--active {
      background: #22c55e;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.35);
    }

    .hv-title-text {
      font-weight: 600;
      letter-spacing: 0.02em;
      font-size: 13px;
    }

    .hv-sub {
      font-size: 11px;
      opacity: 0.85;
    }

    .hv-header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hv-count {
      font-size: 11px;
      opacity: 0.9;
      white-space: nowrap;
    }

    .hv-btn {
      border: none;
      background: rgba(15,23,42,0.45);
      color: inherit;
      cursor: pointer;
      padding: 4px 7px;
      border-radius: 999px;
      font-size: 11px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease, transform 0.08s;
    }

    .hv-btn:hover {
      background: rgba(15,23,42,0.8);
      transform: translateY(-0.5px);
    }

    .hv-btn-icon {
      border-radius: 999px;
      padding: 2px 6px;
      background: transparent;
      font-size: 14px;
    }

    .hv-body {
      padding: 6px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: radial-gradient(circle at bottom right, #1f2937 0, #020617 60%);
    }

    .hv-body-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 4px;
    }

    .hv-body-title {
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.7;
      letter-spacing: 0.08em;
    }

    .hv-search {
      flex: 1;
      position: relative;
    }

    .hv-search-input {
      width: 100%;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.5);
      background: rgba(15,23,42,0.85);
      color: #e5e7eb;
      padding: 4px 8px 4px 20px;
      font-size: 11px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }

    .hv-search-input::placeholder {
      color: rgba(156,163,175,0.8);
    }

    .hv-search-input:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 1px rgba(37,99,235,0.7);
      background: rgba(15,23,42,0.95);
    }

    .hv-search-icon {
      position: absolute;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      opacity: 0.7;
    }

    .hv-list {
      max-height: 46vh;
      overflow-y: auto;
      padding-right: 2px;
      margin-top: 2px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hv-list::-webkit-scrollbar {
      width: 6px;
    }
    .hv-list::-webkit-scrollbar-track {
      background: transparent;
    }
    .hv-list::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,0.5);
      border-radius: 999px;
    }
    .hv-list::-webkit-scrollbar-thumb:hover {
      background: rgba(148,163,184,0.85);
    }

    .hv-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px;
      border-radius: 9px;
      background: rgba(15,23,42,0.82);
      border: 1px solid rgba(15,23,42,0.9);
      transition: background 0.12s ease, border-color 0.12s ease, transform 0.06s;
    }

    .hv-row:hover {
      background: rgba(30,64,175,0.55);
      border-color: rgba(96,165,250,0.9);
      transform: translateY(-0.5px);
    }

    .hv-row-main {
      display: flex;
      align-items: baseline;
      gap: 4px;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hv-row-sub {
      font-size: 10px;
      color: rgba(209,213,219,0.85);
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hv-row-text {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }

    .hv-tag-chip {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 5px;
      border-radius: 999px;
      background: rgba(59,130,246,0.2);
      color: #93c5fd;
      flex-shrink: 0;
    }

    .hv-id {
      color: #f97316;
    }
    .hv-class {
      color: #a3e635;
    }

    .hv-row-label {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .hv-row-tag {
      padding: 2px 6px;
      border-radius: 999px;
      background: rgba(148,163,184,0.22);
      font-size: 10px;
      opacity: 0.9;
      flex-shrink: 0;
    }

    /* Toggle switch */

    .hv-switch {
      position: relative;
      display: inline-block;
      width: 34px;
      height: 18px;
      flex-shrink: 0;
    }

    .hv-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .hv-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: rgba(15,23,42,0.9);
      border-radius: 999px;
      transition: background-color 0.2s ease;
      box-shadow: inset 0 0 0 1px rgba(148,163,184,0.5);
    }

    .hv-slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 2px;
      top: 2px;
      border-radius: 999px;
      background-color: #e5e7eb;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }

    .hv-switch input:checked + .hv-slider {
      background: linear-gradient(90deg, #22c55e, #3b82f6);
      box-shadow: inset 0 0 0 1px rgba(34,197,94,0.4);
    }

    .hv-switch input:checked + .hv-slider:before {
      transform: translateX(16px);
      background-color: #f9fafb;
      box-shadow: 0 1px 5px rgba(59,130,246,0.8);
    }

    .hv-switch-small {
      width: 30px;
      height: 16px;
    }
    .hv-switch-small .hv-slider:before {
      height: 12px;
      width: 12px;
      top: 2px;
      left: 2px;
    }
    .hv-switch-small input:checked + .hv-slider:before {
      transform: translateX(14px);
    }
  `;
  panel.appendChild(style);

  // ----- Header -----
  const header = document.createElement("div");
  header.className = "hv-header";

  const titleBox = document.createElement("div");
  titleBox.className = "hv-title";

  const dot = document.createElement("div");
  dot.className = "hv-dot";

  const titleTextWrapper = document.createElement("div");
  const titleText = document.createElement("div");
  titleText.className = "hv-title-text";
  titleText.textContent = "Visibility Hidden Inspector";

  const sub = document.createElement("div");
  sub.className = "hv-sub";
  sub.textContent = "Liste des éléments visibility:hidden";

  titleTextWrapper.appendChild(titleText);
  titleTextWrapper.appendChild(sub);

  titleBox.appendChild(dot);
  titleBox.appendChild(titleTextWrapper);

  const headerRight = document.createElement("div");
  headerRight.className = "hv-header-right";

  const countSpan = document.createElement("span");
  countSpan.className = "hv-count";
  countSpan.textContent = "0 élément";

  // Toggle global
  const globalSwitch = document.createElement("label");
  globalSwitch.className = "hv-switch";

  const globalInput = document.createElement("input");
  globalInput.type = "checkbox";
  globalInput.id = "__hv-global-toggle";

  const globalSlider = document.createElement("span");
  globalSlider.className = "hv-slider";

  globalSwitch.appendChild(globalInput);
  globalSwitch.appendChild(globalSlider);

  // Bouton refresh
  const refreshBtn = document.createElement("button");
  refreshBtn.className = "hv-btn";
  refreshBtn.textContent = "↻";
  refreshBtn.title = "Rafraîchir la liste";

  // Bouton fermer
  const closeBtn = document.createElement("button");
  closeBtn.className = "hv-btn hv-btn-icon";
  closeBtn.textContent = "×";
  closeBtn.title = "Fermer le panneau";

  closeBtn.addEventListener("click", () => {
    panel.style.display = "none";
  });

  headerRight.appendChild(countSpan);
  headerRight.appendChild(refreshBtn);
  headerRight.appendChild(globalSwitch);
  headerRight.appendChild(closeBtn);

  header.appendChild(titleBox);
  header.appendChild(headerRight);

  // ----- Corps -----
  const body = document.createElement("div");
  body.className = "hv-body";

  const bodyHeader = document.createElement("div");
  bodyHeader.className = "hv-body-header";

  const bodyTitle = document.createElement("div");
  bodyTitle.className = "hv-body-title";
  bodyTitle.textContent = "Éléments trouvés";

  // barre de recherche
  const searchWrapper = document.createElement("div");
  searchWrapper.className = "hv-search";

  const searchInput = document.createElement("input");
  searchInput.className = "hv-search-input";
  searchInput.placeholder = "Filtrer (tag, #id, .class, texte...)";

  const searchIcon = document.createElement("span");
  searchIcon.className = "hv-search-icon";
  searchIcon.textContent = "🔍";

  searchWrapper.appendChild(searchInput);
  searchWrapper.appendChild(searchIcon);

  bodyHeader.appendChild(bodyTitle);
  bodyHeader.appendChild(searchWrapper);

  const listContainer = document.createElement("div");
  listContainer.className = "hv-list";

  body.appendChild(bodyHeader);
  body.appendChild(listContainer);

  panel.appendChild(header);
  panel.appendChild(body);

  document.documentElement.appendChild(panel);

  // ---------- Fonctions ----------

  function plural(count, one, many) {
    return count <= 1 ? one : many;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => {
      switch (c) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#39;";
      }
      return c;
    });
  }

  function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const classes =
      el.className && typeof el.className === "string"
        ? "." + el.className.trim().replace(/\s+/g, ".")
        : "";

    let text = (el.textContent || "").trim().replace(/\s+/g, " ");
    if (text.length > 80) text = text.slice(0, 77) + "…";

    return { tag, id, classes, text };
  }

  function applyVisibilityToggle(item, on) {
    item.forcedVisible = on;
    if (on) {
      item.el.style.visibility = "visible";
      if (!item._originalOutline) {
        item._originalOutline = item.el.style.outline;
      }
      item.el.style.outline = item._originalOutline || "2px dashed #f97316";
    } else {
      item.el.style.visibility = item.originalInlineVisibility;
      if (item._originalOutline !== undefined) {
        item.el.style.outline = item._originalOutline;
      } else {
        item.el.style.outline = "";
      }
    }
    updateDotState();
  }

  function refreshGlobalToggleState() {
    if (hiddenElements.length === 0) {
      allToggledOn = false;
      globalInput.checked = false;
      return;
    }
    const allOn = hiddenElements.length > 0 && hiddenElements.every((i) => i.forcedVisible);
    allToggledOn = allOn;
    globalInput.checked = allOn;
  }

  function updateCount() {
    const n = hiddenElements.length;
    countSpan.textContent = `${n} ${plural(n, "élément", "éléments")}`;
  }

  function updateDotState() {
    const anyOn = hiddenElements.some((i) => i.forcedVisible);
    if (anyOn) {
      dot.classList.add("hv-dot--active");
    } else {
      dot.classList.remove("hv-dot--active");
    }
  }

  function buildRow(item) {
    const { meta } = item;

    const row = document.createElement("div");
    row.className = "hv-row";

    const smallSwitch = document.createElement("label");
    smallSwitch.className = "hv-switch hv-switch-small";

    const cb = document.createElement("input");
    cb.type = "checkbox";

    const slider = document.createElement("span");
    slider.className = "hv-slider";

    smallSwitch.appendChild(cb);
    smallSwitch.appendChild(slider);

    item.checkbox = cb;

    cb.addEventListener("change", () => {
      applyVisibilityToggle(item, cb.checked);
      refreshGlobalToggleState();
    });

    const label = document.createElement("div");
    label.className = "hv-row-label";

    const main = document.createElement("div");
    main.className = "hv-row-main";
    main.innerHTML = `
      <span class="hv-tag-chip">${meta.tag}</span>
      ${meta.id ? `<span class="hv-id">${meta.id}</span>` : ""}
      ${meta.classes ? `<span class="hv-class">${meta.classes}</span>` : ""}
    `;

    const textDiv = document.createElement("div");
    textDiv.className = "hv-row-sub";
    textDiv.innerHTML = meta.text ? escapeHtml(meta.text) : "<span style='opacity:.7'>Aucun texte</span>";

    label.appendChild(main);
    label.appendChild(textDiv);

    label.addEventListener("click", () => {
      item.el.scrollIntoView({ behavior: "smooth", block: "center" });
      const previousOutline = item.el.style.outline;
      item.el.style.outline = "2px solid #22d3ee";
      setTimeout(() => {
        item.el.style.outline = previousOutline;
      }, 1500);
    });

    // highlight au survol de la ligne
    row.addEventListener("mouseenter", () => {
      item._hoverPrevOutline = item.el.style.outline;
      item.el.style.outline = "2px solid #60a5fa";
    });
    row.addEventListener("mouseleave", () => {
      if (item.forcedVisible) {
        item.el.style.outline = item._originalOutline || "2px dashed #f97316";
      } else {
        item.el.style.outline = item._hoverPrevOutline || "";
      }
    });

    const tag = document.createElement("div");
    tag.className = "hv-row-tag";
    tag.textContent = "hidden";

    row.appendChild(smallSwitch);
    row.appendChild(label);
    row.appendChild(tag);

    item.row = row;
    return row;
  }

  // ---------- Scan des éléments visibility:hidden ----------
  function scanHiddenElements() {
    hiddenElements.length = 0;
    listContainer.innerHTML = "";

    const allNodes = Array.from(document.querySelectorAll("*"));
    const candidates = allNodes.filter((el) => {
      if (el.closest("#__hv-panel")) return false;
      const cs = getComputedStyle(el);
      return cs.visibility === "hidden";
    });

    candidates.forEach((el) => {
      const meta = describeElement(el);

      const item = {
        el,
        originalInlineVisibility: el.style.visibility || "",
        forcedVisible: false,
        checkbox: null,
        row: null,
        meta
      };

      hiddenElements.push(item);
      const row = buildRow(item);
      listContainer.appendChild(row);
    });

    updateCount();
    refreshGlobalToggleState();
    updateDotState();

    if (hiddenElements.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "hv-row";
      const txt = document.createElement("div");
      txt.className = "hv-row-sub";
      txt.textContent = "Aucun élément visibility:hidden trouvé sur cette page.";
      emptyRow.appendChild(txt);
      listContainer.appendChild(emptyRow);
    }
  }

  // Scan initial
  scanHiddenElements();

  // ---------- Gestion du toggle global ----------
  globalInput.addEventListener("change", () => {
    const on = globalInput.checked;
    hiddenElements.forEach((item) => {
      if (item.checkbox) item.checkbox.checked = on;
      applyVisibilityToggle(item, on);
    });
    allToggledOn = on;
    updateDotState();
  });

  // ---------- Rafraîchir ----------
  refreshBtn.addEventListener("click", () => {
    scanHiddenElements();
  });

  // ---------- Filtre / recherche ----------
  function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();
    hiddenElements.forEach((item) => {
      if (!item.row) return;
      if (!q) {
        item.row.style.display = "";
        return;
      }
      const { tag, id, classes, text } = item.meta;
      const haystack = `${tag} ${id} ${classes} ${text}`.toLowerCase();
      item.row.style.display = haystack.includes(q) ? "" : "none";
    });
  }

  searchInput.addEventListener("input", () => {
    applyFilter();
  });
})();


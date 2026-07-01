const DATA_URL = "data/midwest-city-resources.json";
const verifiedFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

const categoryIcons = {
  "Crisis & Emergency": "!",
  "Mental Health & Substance Use": "♥",
  "Navigation & Referrals": "⌕",
  "City Services": "⌂",
  "Utilities & Financial Help": "$",
  "Public Benefits": "✓",
  "Food & Basic Needs": "◆",
  "Housing & Shelter": "⌂",
  "Health Care": "+",
  "Youth & Family": "★",
  "Education & Employment": "→",
  "Veterans & Military": "★",
  "Transportation": "↔",
  "Senior Services": "◷",
  "Disability Services": "♿",
  "Legal Aid": "§",
  "Domestic Violence & Safety": "●",
  "Family & Community Support": "◉"
};

const quickNeedMap = {
  "Crisis Help": { query: "crisis emergency 911 988 domestic violence", category: "" },
  Food: { query: "food pantry basic needs", category: "Food & Basic Needs" },
  Housing: { query: "housing shelter homeless rent", category: "Housing & Shelter" },
  "Mental Health": { query: "mental health substance crisis counseling", category: "Mental Health & Substance Use" },
  Utilities: { query: "utility utilities financial assistance", category: "Utilities & Financial Help" },
  Veterans: { query: "veterans military Tinker", category: "Veterans & Military" },
  Seniors: { query: "senior aging caregiver", category: "Senior Services" },
  "Youth & Families": { query: "youth family students children schools", category: "Youth & Family" },
  Transportation: { query: "transportation transit bus", category: "Transportation" },
  "City Services": { query: "city services utilities police trash permits", category: "City Services" }
};

let resources = [];
let currentQuickNeed = "";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function resourceSearchText(resource) {
  return normalize([
    resource.name,
    resource.category,
    resource.description,
    resource.phone,
    resource.address,
    resource.hours,
    resource.eligibility,
    resource.confidence,
    ...(resource.audiences || []),
    ...(resource.needs || [])
  ].join(" "));
}

function iconFor(resource) {
  return categoryIcons[resource.category] || "•";
}

function telHref(phone) {
  const cleaned = String(phone || "").replace(/[^0-9+]/g, "");
  return cleaned ? `tel:${cleaned}` : "#";
}

function detailRows(resource) {
  const tags = [...(resource.audiences || []), ...(resource.needs || [])];
  return `
    <dl class="resource-details">
      <div><dt>Location / service area</dt><dd>${resource.address || "Confirm directly"}</dd></div>
      <div><dt>Hours</dt><dd>${resource.hours || "Confirm directly"}</dd></div>
      <div><dt>Eligibility</dt><dd>${resource.eligibility || "Confirm directly"}</dd></div>
      <div><dt>Last verified</dt><dd>${verifiedFormatter.format(new Date(`${resource.lastVerified}T00:00:00`))}</dd></div>
      <div><dt>Confidence</dt><dd>${resource.confidence || "Confirm directly"}</dd></div>
      <div><dt>Source</dt><dd><a class="source-link" href="${resource.sourceUrl}" target="_blank" rel="noopener noreferrer">View source</a></dd></div>
    </dl>
    <div class="tag-list">${tags.slice(0, 10).map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
}

function createResourceCard(resource, options = {}) {
  const card = document.createElement("article");
  card.className = `resource-card portal-resource-card confidence-${normalize(resource.confidence)}${options.compact ? " compact-resource-card" : ""}`;

  card.innerHTML = `
    <div class="resource-main-row">
      <div class="resource-icon" aria-hidden="true">${iconFor(resource)}</div>
      <div class="resource-content">
        <div class="resource-card-header">
          <span class="category">${resource.category}</span>
          ${options.compact ? "" : `<span class="resource-confidence-dot">${resource.confidence} confidence</span>`}
        </div>
        <h3>${resource.name}</h3>
        <p>${resource.description}</p>
      </div>
      <div class="resource-actions primary-actions">
        <a class="button primary small" href="${resource.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
        ${resource.phone ? `<a class="button secondary small call-button" href="${telHref(resource.phone)}">Call</a>` : ""}
      </div>
    </div>
    ${options.compact ? "" : `<details class="resource-extra"><summary>Details</summary>${detailRows(resource)}</details>`}
  `;
  return card;
}

function populateFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  const audienceFilter = document.getElementById("audienceFilter");

  uniqueSorted(resources.map((resource) => resource.category)).forEach((category) => {
    categoryFilter.append(new Option(category, category));
  });

  uniqueSorted(resources.flatMap((resource) => [...(resource.audiences || []), ...(resource.needs || [])])).forEach((audience) => {
    audienceFilter.append(new Option(audience, audience));
  });

  renderCategoryChips();
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  if (!container) return;
  container.replaceChildren();

  const categories = uniqueSorted(resources.map((resource) => resource.category));
  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "All resources";
  all.dataset.category = "";
  container.append(all);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.category = category;
    button.innerHTML = `<span aria-hidden="true">${categoryIcons[category] || "•"}</span>${category}`;
    container.append(button);
  });

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    currentQuickNeed = "";
    document.getElementById("resourceSearch").value = "";
    document.getElementById("categoryFilter").value = button.dataset.category;
    applyFilters();
    document.getElementById("directory-app").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function getFilteredResources() {
  const query = normalize(document.getElementById("resourceSearch").value.trim());
  const category = document.getElementById("categoryFilter").value;
  const audience = document.getElementById("audienceFilter").value;
  const confidence = document.getElementById("confidenceFilter").value;

  return resources.filter((resource) => {
    const categoryMatches = !category || resource.category === category;
    const audienceMatches = !audience || [...(resource.audiences || []), ...(resource.needs || [])].includes(audience);
    const confidenceMatches = !confidence || resource.confidence === confidence;
    const queryMatches = !query || resourceSearchText(resource).includes(query);
    return categoryMatches && audienceMatches && confidenceMatches && queryMatches;
  });
}

function sortResources(list) {
  const sort = document.getElementById("sortFilter").value;
  const confidenceRank = { High: 0, Medium: 1, Low: 2 };

  return [...list].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === "verified") return b.lastVerified.localeCompare(a.lastVerified) || a.name.localeCompare(b.name);
    if (sort === "confidence") return (confidenceRank[a.confidence] ?? 9) - (confidenceRank[b.confidence] ?? 9) || a.name.localeCompare(b.name);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name);
  });
}

function renderActiveFilters(total) {
  const container = document.getElementById("activeFilters");
  const filters = [];
  const query = document.getElementById("resourceSearch").value.trim();
  const category = document.getElementById("categoryFilter").value;
  const audience = document.getElementById("audienceFilter").value;
  const confidence = document.getElementById("confidenceFilter").value;

  if (currentQuickNeed) filters.push(`Quick need: ${currentQuickNeed}`);
  if (query) filters.push(`Keyword: ${query}`);
  if (category) filters.push(`Category: ${category}`);
  if (audience) filters.push(`Audience/need: ${audience}`);
  if (confidence) filters.push(`Confidence: ${confidence}`);

  container.innerHTML = filters.length
    ? filters.map((filter) => `<span>${filter}</span>`).join("")
    : `<span>Showing ${total} resources across all categories</span>`;
}

function updateCategoryChipState() {
  const selected = document.getElementById("categoryFilter").value;
  document.querySelectorAll("#categoryChips button[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === selected);
  });
}

function applyFilters() {
  const cards = document.getElementById("resourceCards");
  const empty = document.getElementById("resourceEmpty");
  const count = document.getElementById("resourceCount");
  const filtered = sortResources(getFilteredResources());

  cards.replaceChildren(...filtered.map((resource) => createResourceCard(resource)));
  empty.hidden = filtered.length > 0;
  count.textContent = `${filtered.length} of ${resources.length} resources shown`;
  renderActiveFilters(filtered.length);
  updateCategoryChipState();

  document.querySelectorAll(".quick-needs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.quick === currentQuickNeed);
  });
}

function renderFeatured() {
  const featured = resources.filter((resource) => resource.featured);
  document.getElementById("featuredResources").replaceChildren(...featured.map((resource) => createResourceCard(resource, { compact: true })));
}

function wireEvents() {
  document.querySelector(".finder-search").addEventListener("submit", (event) => {
    event.preventDefault();
    currentQuickNeed = "";
    applyFilters();
    document.getElementById("directory-app").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ["resourceSearch", "categoryFilter", "audienceFilter", "confidenceFilter", "sortFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => { currentQuickNeed = ""; applyFilters(); });
    document.getElementById(id).addEventListener("change", () => { currentQuickNeed = ""; applyFilters(); });
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    currentQuickNeed = "";
    ["resourceSearch", "categoryFilter", "audienceFilter", "confidenceFilter"].forEach((id) => { document.getElementById(id).value = ""; });
    document.getElementById("sortFilter").value = "featured";
    applyFilters();
  });

  document.querySelectorAll(".quick-needs button").forEach((button) => {
    button.addEventListener("click", () => {
      const quick = quickNeedMap[button.dataset.quick];
      if (!quick) return;
      currentQuickNeed = button.dataset.quick;
      document.getElementById("resourceSearch").value = quick.query;
      document.getElementById("categoryFilter").value = quick.category;
      document.getElementById("audienceFilter").value = "";
      document.getElementById("confidenceFilter").value = "";
      applyFilters();
      document.getElementById("directory-app").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function initDirectory() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Unable to load ${DATA_URL}: ${response.status}`);
    resources = await response.json();
    populateFilters();
    renderFeatured();
    wireEvents();
    applyFilters();
  } catch (error) {
    document.getElementById("resourceCount").textContent = "Resource data could not be loaded.";
    console.error(error);
  }
}

initDirectory();

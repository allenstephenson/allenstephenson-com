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
  "Crisis Help": {
    label: "Crisis",
    categories: ["Crisis & Emergency", "Domestic Violence & Safety"],
    terms: ["crisis", "emergency", "911", "988", "suicide", "domestic violence", "safety planning", "emergency shelter", "immediate danger", "overdose"],
    mode: "any"
  },
  Food: {
    categories: ["Food & Basic Needs"],
    terms: ["food", "pantry", "groceries", "meals", "baby supplies", "infant supplies", "basic needs"],
    mode: "any"
  },
  Housing: {
    categories: ["Housing & Shelter"],
    terms: ["housing", "shelter", "homeless", "homelessness", "rent", "rental", "eviction", "home repair", "rehabilitation", "transitional housing", "affordable housing"],
    mode: "any"
  },
  "Mental Health": {
    categories: ["Mental Health & Substance Use"],
    terms: ["mental health", "behavioral health", "substance use", "counseling", "crisis", "peer support", "recovery"],
    mode: "any"
  },
  Utilities: {
    categories: ["Utilities & Financial Help"],
    terms: ["utility", "utilities", "electric", "water", "gas", "financial assistance", "bill assistance"],
    mode: "any"
  },
  Veterans: {
    categories: ["Veterans & Military"],
    terms: ["veteran", "veterans", "military", "Tinker", "ODVA", "benefits"],
    mode: "any"
  },
  Seniors: {
    categories: ["Senior Services"],
    terms: ["senior", "seniors", "aging", "caregiver", "lunch", "older adults"],
    mode: "any"
  },
  "Youth & Families": {
    categories: ["Youth & Family", "Family & Community Support"],
    terms: ["youth", "family", "families", "children", "students", "tutoring", "Head Start", "child care", "school", "after school"],
    mode: "any"
  },
  Transportation: {
    categories: ["Transportation"],
    terms: ["transportation", "transit", "bus", "bus pass", "paratransit", "mobility"],
    mode: "any"
  },
  "City Services": {
    categories: ["City Services"],
    terms: ["Midwest City", "city", "city hall", "permits", "police", "utilities", "trash", "recycling", "neighborhood", "grants", "code enforcement"],
    mode: "any"
  }
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

function quickNeedSearchText(resource) {
  return normalize([
    resource.name,
    resource.category,
    resource.description,
    resource.hours,
    resource.eligibility,
    ...(resource.audiences || []),
    ...(resource.needs || [])
  ].join(" "));
}

function searchTokens(query) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

function matchesSearchQuery(resource, query) {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return true;

  const text = resourceSearchText(resource);
  if (text.includes(normalizedQuery)) return true;

  const tokens = searchTokens(normalizedQuery);
  return tokens.length > 1 && tokens.every((token) => text.includes(token));
}

function quickNeedLabel(quickNeed) {
  return quickNeedMap[quickNeed]?.label || quickNeed;
}

function matchesQuickNeed(resource, quickNeed) {
  if (!quickNeed) return true;

  const quick = quickNeedMap[quickNeed];
  if (!quick) return true;

  const categories = quick.categories || [];
  if (categories.includes(resource.category)) return true;

  const terms = quick.terms || [];
  if (!terms.length) return false;

  const text = quickNeedSearchText(resource);
  const matcher = (term) => text.includes(normalize(term));
  return quick.mode === "all" ? terms.every(matcher) : terms.some(matcher);
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
      <div><dt>Phone</dt><dd>${resource.phone || "Confirm directly"}</dd></div>
      <div><dt>Source</dt><dd><a class="source-link" href="${resource.sourceUrl}" target="_blank" rel="noopener noreferrer">View source</a></dd></div>
    </dl>
    <div class="tag-list">${tags.slice(0, 10).map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
}

function createResourceCard(resource) {
  const card = document.createElement("article");
  card.className = `resource-card portal-resource-card confidence-${normalize(resource.confidence)}`;

  card.innerHTML = `
    <div class="resource-main-row">
      <div class="resource-icon" aria-hidden="true">${iconFor(resource)}</div>
      <div class="resource-content">
        <div class="resource-card-header">
          <span class="category">${resource.category}</span>
        </div>
        <h3>${resource.name}</h3>
        <p>${resource.description}</p>
      </div>
      <div class="resource-actions primary-actions">
        <a class="button primary small" href="${resource.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
        ${resource.phone ? `<a class="button secondary small call-button" href="${telHref(resource.phone)}">Call</a>` : ""}
      </div>
    </div>
    <details class="resource-extra"><summary>Details</summary>${detailRows(resource)}</details>
  `;
  return card;
}

function isUrgentResource(resource) {
  const text = resourceSearchText(resource);
  return resource.category === "Crisis & Emergency"
    || text.includes("mental health crisis")
    || text.includes("suicide")
    || text.includes("domestic violence")
    || text.includes("emergency shelter")
    || text.includes("immediate danger")
    || text.includes("overdose")
    || text.includes("veteran crisis");
}

function createUrgentCard(resource) {
  const card = document.createElement("article");
  card.className = "urgent-card";
  card.innerHTML = `
    <div class="urgent-card-body">
      <span class="category">${resource.category}</span>
      <h3>${resource.name}</h3>
      <p>${resource.description}</p>
      <small>${resource.phone ? `Phone: ${resource.phone}` : "Confirm availability directly"}</small>
    </div>
    <div class="urgent-card-actions">
      <a class="button primary small" href="${resource.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
      ${resource.phone ? `<a class="button secondary small" href="${telHref(resource.phone)}">Call</a>` : ""}
    </div>
  `;
  return card;
}

function createCoreUrgentCard({ label, title, description, href, action }) {
  const card = document.createElement("article");
  card.className = "urgent-card core-urgent-card";
  card.innerHTML = `
    <div class="urgent-card-body">
      <span class="category">${label}</span>
      <h3>${title}</h3>
      <p>${description}</p>
      <small>Available now</small>
    </div>
    <div class="urgent-card-actions">
      <a class="button primary small" href="${href}">${action}</a>
    </div>
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

  return resources.filter((resource) => {
    const categoryMatches = !category || resource.category === category;
    const audienceMatches = !audience || [...(resource.audiences || []), ...(resource.needs || [])].includes(audience);
    const queryMatches = matchesSearchQuery(resource, query);
    const quickNeedMatches = matchesQuickNeed(resource, currentQuickNeed);
    return categoryMatches && audienceMatches && queryMatches && quickNeedMatches;
  });
}

function sortResources(list) {
  return [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
}

function renderActiveFilters(total) {
  const container = document.getElementById("activeFilters");
  const filters = [];
  const query = document.getElementById("resourceSearch").value.trim();
  const category = document.getElementById("categoryFilter").value;
  const audience = document.getElementById("audienceFilter").value;

  if (currentQuickNeed) filters.push(`Quick need: ${quickNeedLabel(currentQuickNeed)}`);
  if (query) filters.push(`Keyword: ${query}`);
  if (category) filters.push(`Category: ${category}`);
  if (audience) filters.push(`Audience/need: ${audience}`);

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
  const coreActions = [
    { label: "Emergency", title: "Emergency / 911", description: "For immediate danger, fire, serious injury, or a crime in progress.", href: "tel:911", action: "Call 911" },
    { label: "Crisis", title: "Mental health crisis / 988", description: "Call or text for suicide, mental health, or substance-use crisis support.", href: "tel:988", action: "Call 988" },
    { label: "Referrals", title: "Community referrals / 211", description: "Get connected to nearby food, housing, utility, and social-service referrals.", href: "tel:211", action: "Call 211" }
  ];
  const featured = resources.filter((resource) => resource.featured && isUrgentResource(resource));
  document.getElementById("featuredResources").replaceChildren(
    ...coreActions.map(createCoreUrgentCard),
    ...featured.map(createUrgentCard)
  );
}

function wireEvents() {
  document.querySelector(".finder-search").addEventListener("submit", (event) => {
    event.preventDefault();
    currentQuickNeed = "";
    applyFilters();
    document.getElementById("directory-app").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  ["resourceSearch", "categoryFilter", "audienceFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => { currentQuickNeed = ""; applyFilters(); });
    document.getElementById(id).addEventListener("change", () => { currentQuickNeed = ""; applyFilters(); });
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    currentQuickNeed = "";
    ["resourceSearch", "categoryFilter", "audienceFilter"].forEach((id) => { document.getElementById(id).value = ""; });
    applyFilters();
  });

  document.querySelectorAll(".quick-needs button").forEach((button) => {
    button.addEventListener("click", () => {
      const quick = quickNeedMap[button.dataset.quick];
      if (!quick) return;
      currentQuickNeed = button.dataset.quick;
      document.getElementById("resourceSearch").value = "";
      document.getElementById("categoryFilter").value = "";
      document.getElementById("audienceFilter").value = "";
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

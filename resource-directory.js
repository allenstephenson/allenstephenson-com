const DATA_URL = "data/midwest-city-resources.json";
const verifiedFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

let resources = [];

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

function createResourceCard(resource) {
  const card = document.createElement("article");
  card.className = `resource-card confidence-${normalize(resource.confidence)}`;
  const tags = [...(resource.audiences || []), ...(resource.needs || [])].slice(0, 7);
  card.innerHTML = `
    <div class="resource-card-header">
      <span class="category">${resource.category}</span>
      <span class="confidence">${resource.confidence} confidence</span>
    </div>
    <h3>${resource.name}</h3>
    <p>${resource.description}</p>
    <dl class="resource-details">
      <div><dt>Phone</dt><dd>${resource.phone || "Confirm directly"}</dd></div>
      <div><dt>Location / service area</dt><dd>${resource.address || "Confirm directly"}</dd></div>
      <div><dt>Hours</dt><dd>${resource.hours || "Confirm directly"}</dd></div>
      <div><dt>Eligibility</dt><dd>${resource.eligibility || "Confirm directly"}</dd></div>
      <div><dt>Last verified</dt><dd>${verifiedFormatter.format(new Date(`${resource.lastVerified}T00:00:00`))}</dd></div>
    </dl>
    <div class="tag-list">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="resource-actions">
      <a class="button primary small" href="${resource.website}" target="_blank" rel="noopener noreferrer">Visit website</a>
      <a class="button secondary small" href="${resource.sourceUrl}" target="_blank" rel="noopener noreferrer">Source</a>
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
}

function applyFilters() {
  const query = normalize(document.getElementById("resourceSearch").value.trim());
  const category = document.getElementById("categoryFilter").value;
  const audience = document.getElementById("audienceFilter").value;
  const cards = document.getElementById("resourceCards");
  const empty = document.getElementById("resourceEmpty");
  const count = document.getElementById("resourceCount");

  const filtered = resources.filter((resource) => {
    const categoryMatches = !category || resource.category === category;
    const audienceMatches = !audience || [...(resource.audiences || []), ...(resource.needs || [])].includes(audience);
    const queryMatches = !query || resourceSearchText(resource).includes(query);
    return categoryMatches && audienceMatches && queryMatches;
  });

  cards.replaceChildren(...filtered.map(createResourceCard));
  empty.hidden = filtered.length > 0;
  count.textContent = `${filtered.length} of ${resources.length} resources shown`;
}

function renderFeatured() {
  const featured = resources.filter((resource) => resource.featured);
  document.getElementById("featuredResources").replaceChildren(...featured.map(createResourceCard));
}

async function initDirectory() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Unable to load ${DATA_URL}: ${response.status}`);
    resources = await response.json();
    populateFilters();
    renderFeatured();
    applyFilters();
    ["resourceSearch", "categoryFilter", "audienceFilter"].forEach((id) => {
      document.getElementById(id).addEventListener("input", applyFilters);
      document.getElementById(id).addEventListener("change", applyFilters);
    });
    document.getElementById("clearFilters").addEventListener("click", () => {
      document.getElementById("resourceSearch").value = "";
      document.getElementById("categoryFilter").value = "";
      document.getElementById("audienceFilter").value = "";
      applyFilters();
    });
  } catch (error) {
    document.getElementById("resourceCount").textContent = "Resource data could not be loaded.";
    console.error(error);
  }
}

initDirectory();

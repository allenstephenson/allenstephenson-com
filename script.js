const aiArticles = [
  { slug: "ai-help-building-inspectors", title: "Can AI Help Building Inspectors?", category: "Field operations", date: "2026-06-03", readTime: "5 min read", summary: "AI-assisted checklists, code lookup, image review, and report drafting may reduce administrative friction while inspectors retain authority." },
  { slug: "ai-records-management", title: "AI for Records Management", category: "Information governance", date: "2026-06-05", readTime: "6 min read", summary: "Classification, retention suggestions, redaction assistance, and search can improve records workflows when paired with policy controls." },
  { slug: "ai-knowledge-management", title: "AI for Knowledge Management", category: "Workforce", date: "2026-06-07", readTime: "4 min read", summary: "Internal assistants can help staff find procedures, policies, and institutional knowledge across fragmented repositories." },
  { slug: "ai-emergency-communications", title: "AI and Emergency Communications", category: "Emergency response", date: "2026-06-10", readTime: "7 min read", summary: "Potential uses include translation, transcription, triage support, and after-action analysis, with strict safeguards for critical decisions." },
  { slug: "practical-uses-ai-government", title: "Practical Uses of AI in Government", category: "Implementation", date: "2026-06-12", readTime: "5 min read", summary: "The strongest AI projects start with narrow workflows, measurable outcomes, data review, staff training, and transparent governance." },
  { slug: "where-ai-should-not-be-used", title: "Where AI Should Not Be Used", category: "Governance", date: "2026-06-15", readTime: "6 min read", summary: "High-impact decisions, sensitive enforcement actions, and opaque automated judgments require caution, public accountability, and human review." }
];

const featuredTopics = [
  "Artificial Intelligence",
  "Cybersecurity",
  "GIS & Mapping",
  "NG911 & Emergency Communications",
  "Public Safety Communications",
  "Cloud & Infrastructure",
  "Smart Infrastructure",
  "Digital Government"
];

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function createArticleCard(article, options = {}) {
  const topic = article.topic || article.category;
  const readingTime = article.readingTime || article.readTime;
  const isExternal = Boolean(options.external);
  const url = isExternal ? article.url : `articles/${article.slug}.html`;
  const isTodoUrl = isExternal && (!article.url || article.url === "TODO");
  const card = document.createElement("article");
  card.className = "article-card";
  card.dataset.search = `${article.title} ${topic} ${article.source || ""} ${article.summary}`.toLowerCase();
  card.innerHTML = `
    ${isExternal ? '<span class="external-label">External article</span>' : ""}
    <span class="category">${topic}</span>
    <h3>${article.title}</h3>
    ${article.source ? `<p class="article-source">Source: <strong>${article.source}</strong></p>` : ""}
    <p>${article.summary}</p>
    <div class="article-meta"><time datetime="${article.date}">${formatDate(article.date)}</time><span>${readingTime}</span></div>
    <a class="read-more" href="${isTodoUrl ? "#" : url}" ${isExternal && !isTodoUrl ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="Read ${article.title}${article.source ? ` from ${article.source}` : ""}">${isTodoUrl ? "URL TODO →" : "Read article →"}</a>
  `;
  return card;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function getLocalDayIndex(date = new Date()) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / millisecondsPerDay);
}

function selectDailyArticles(articles, topics = featuredTopics, date = new Date()) {
  const dayIndex = getLocalDayIndex(date);
  return topics.map((topic) => {
    const topicArticles = articles.filter((article) => article.topic === topic);
    if (!topicArticles.length) return null;
    return topicArticles[dayIndex % topicArticles.length];
  }).filter(Boolean);
}

async function loadFeaturedArticles() {
  const container = document.getElementById("featuredArticles");
  const empty = document.getElementById("featuredArticlesEmpty");
  if (!container) return;

  try {
    const response = await fetch("articles.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Unable to load articles.json: ${response.status}`);
    const articles = await response.json();
    renderArticles("featuredArticles", selectDailyArticles(articles), { external: true });
    updateLastRefreshed();
    filterArticleCards("articleSearch", "featuredArticles");
  } catch (error) {
    container.replaceChildren();
    if (empty) {
      empty.hidden = false;
      empty.textContent = "Featured external articles are temporarily unavailable.";
    }
    console.error(error);
  }
}

function updateLastRefreshed() {
  const element = document.getElementById("lastRefreshed");
  if (!element) return;
  element.textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}

function renderArticles(containerId, articles, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();
  const fragment = document.createDocumentFragment();
  articles.forEach((article) => fragment.appendChild(createArticleCard(article, options)));
  container.appendChild(fragment);
  wireCardEffects(container.querySelectorAll(".article-card"));
}

function filterArticleCards(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;
  const empty = document.getElementById(`${containerId}Empty`);
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let matches = 0;
    container.querySelectorAll(".article-card").forEach((card) => {
      const visible = card.dataset.search.includes(query);
      card.hidden = !visible;
      if (visible) matches += 1;
    });
    if (empty) empty.hidden = matches !== 0;
  });
}

function wireCardEffects(cards) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--y", `${event.clientY - rect.top}px`);
    });
  });
}

loadFeaturedArticles();
renderArticles("aiArticles", aiArticles);
filterArticleCards("aiSearch", "aiArticles");
wireCardEffects(document.querySelectorAll(".feature-card, .radar-card, .project-card"));

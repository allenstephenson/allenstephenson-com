const featuredArticles = [
  { slug: "every-department-it-department", title: "Why Every Department is an IT Department", category: "Operations", date: "2026-05-14", readTime: "5 min read", summary: "Modern public service depends on software, devices, data, and connectivity in every department, not just the technology office." },
  { slug: "what-happens-when-someone-calls-911", title: "What Happens When Someone Calls 911?", category: "Emergency response", date: "2026-05-21", readTime: "6 min read", summary: "A plain-language look at call routing, dispatch workflows, mapping, radio channels, and the systems that connect callers to responders." },
  { slug: "hidden-maps-modern-government", title: "The Hidden Maps Behind Modern Government", category: "GIS", date: "2026-05-28", readTime: "4 min read", summary: "Geographic information systems quietly support permitting, utilities, public works, planning, emergency response, and resident services." },
  { slug: "defending-city-digital-age", title: "Defending a City in the Digital Age", category: "Cybersecurity", date: "2026-06-04", readTime: "7 min read", summary: "Local governments manage identity, endpoint protection, monitoring, training, segmentation, and continuity planning to reduce cyber risk." },
  { slug: "where-government-data-lives", title: "Where Does Government Data Actually Live?", category: "Cloud", date: "2026-06-11", readTime: "5 min read", summary: "Public data may live across on-premises systems, cloud platforms, software vendors, archives, backups, and protected records systems." },
  { slug: "can-ai-improve-local-government", title: "Can Artificial Intelligence Improve Local Government?", category: "AI", date: "2026-06-18", readTime: "6 min read", summary: "AI can help summarize, search, classify, and detect patterns, but public-sector use requires oversight, accountability, and careful boundaries." },
  { slug: "why-cities-still-use-radio-systems", title: "Why Cities Still Use Radio Systems", category: "Communications", date: "2026-06-25", readTime: "4 min read", summary: "Land mobile radio remains vital because emergency communications need coverage, priority access, durability, and field-tested reliability." },
  { slug: "what-happens-during-power-outage", title: "What Happens During a Power Outage?", category: "Resilience", date: "2026-07-02", readTime: "5 min read", summary: "Backup power, redundant networks, emergency operations plans, and recovery procedures help keep essential services available." },
  { slug: "understanding-ng911", title: "Understanding NG911", category: "Public safety", date: "2026-07-09", readTime: "6 min read", summary: "Next Generation 911 modernizes emergency communications with IP-based networks, richer data, improved routing, and new operational responsibilities." },
  { slug: "technology-behind-public-meetings", title: "The Technology Behind Public Meetings", category: "Civic tech", date: "2026-07-16", readTime: "4 min read", summary: "Streaming, agenda management, microphones, room systems, captioning, records retention, and cybersecurity all support transparent public meetings." }
];

const aiArticles = [
  { slug: "ai-help-building-inspectors", title: "Can AI Help Building Inspectors?", category: "Field operations", date: "2026-06-03", readTime: "5 min read", summary: "AI-assisted checklists, code lookup, image review, and report drafting may reduce administrative friction while inspectors retain authority." },
  { slug: "ai-records-management", title: "AI for Records Management", category: "Information governance", date: "2026-06-05", readTime: "6 min read", summary: "Classification, retention suggestions, redaction assistance, and search can improve records workflows when paired with policy controls." },
  { slug: "ai-knowledge-management", title: "AI for Knowledge Management", category: "Workforce", date: "2026-06-07", readTime: "4 min read", summary: "Internal assistants can help staff find procedures, policies, and institutional knowledge across fragmented repositories." },
  { slug: "ai-emergency-communications", title: "AI and Emergency Communications", category: "Emergency response", date: "2026-06-10", readTime: "7 min read", summary: "Potential uses include translation, transcription, triage support, and after-action analysis, with strict safeguards for critical decisions." },
  { slug: "practical-uses-ai-government", title: "Practical Uses of AI in Government", category: "Implementation", date: "2026-06-12", readTime: "5 min read", summary: "The strongest AI projects start with narrow workflows, measurable outcomes, data review, staff training, and transparent governance." },
  { slug: "where-ai-should-not-be-used", title: "Where AI Should Not Be Used", category: "Governance", date: "2026-06-15", readTime: "6 min read", summary: "High-impact decisions, sensitive enforcement actions, and opaque automated judgments require caution, public accountability, and human review." }
];

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";
  card.dataset.search = `${article.title} ${article.category} ${article.summary}`.toLowerCase();
  card.innerHTML = `
    <span class="category">${article.category}</span>
    <h3>${article.title}</h3>
    <p>${article.summary}</p>
    <div class="article-meta"><time datetime="${article.date}">${formatDate(article.date)}</time><span>${article.readTime}</span></div>
    <a class="read-more" href="articles/${article.slug}.html" aria-label="Read ${article.title}">Read article →</a>
  `;
  return card;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function renderArticles(containerId, articles) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();
  const fragment = document.createDocumentFragment();
  articles.forEach((article) => fragment.appendChild(createArticleCard(article)));
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

renderArticles("featuredArticles", featuredArticles);
renderArticles("aiArticles", aiArticles);
filterArticleCards("articleSearch", "featuredArticles");
filterArticleCards("aiSearch", "aiArticles");
wireCardEffects(document.querySelectorAll(".feature-card, .radar-card, .project-card"));

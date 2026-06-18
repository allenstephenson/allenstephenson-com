const featuredArticles = [
  { title: "Why Every Department is an IT Department", category: "Operations", summary: "Modern public service depends on software, devices, data, and connectivity in every department, not just the technology office." },
  { title: "What Happens When Someone Calls 911?", category: "Emergency response", summary: "A plain-language look at call routing, dispatch workflows, mapping, radio channels, and the systems that connect callers to responders." },
  { title: "The Hidden Maps Behind Modern Government", category: "GIS", summary: "Geographic information systems quietly support permitting, utilities, public works, planning, emergency response, and resident services." },
  { title: "Defending a City in the Digital Age", category: "Cybersecurity", summary: "Local governments manage identity, endpoint protection, monitoring, training, segmentation, and continuity planning to reduce cyber risk." },
  { title: "Where Does Government Data Actually Live?", category: "Cloud", summary: "Public data may live across on-premises systems, cloud platforms, software vendors, archives, backups, and protected records systems." },
  { title: "Can Artificial Intelligence Improve Local Government?", category: "AI", summary: "AI can help summarize, search, classify, and detect patterns, but public-sector use requires oversight, accountability, and careful boundaries." },
  { title: "Why Cities Still Use Radio Systems", category: "Communications", summary: "Land mobile radio remains vital because emergency communications need coverage, priority access, durability, and field-tested reliability." },
  { title: "What Happens During a Power Outage?", category: "Resilience", summary: "Backup power, redundant networks, emergency operations plans, and recovery procedures help keep essential services available." },
  { title: "Understanding NG911", category: "Public safety", summary: "Next Generation 911 modernizes emergency communications with IP-based networks, richer data, improved routing, and new operational responsibilities." },
  { title: "The Technology Behind Public Meetings", category: "Civic tech", summary: "Streaming, agenda management, microphones, room systems, captioning, records retention, and cybersecurity all support transparent public meetings." }
];

const aiArticles = [
  { title: "Can AI Help Building Inspectors?", category: "Field operations", summary: "AI-assisted checklists, code lookup, image review, and report drafting may reduce administrative friction while inspectors retain authority." },
  { title: "AI for Records Management", category: "Information governance", summary: "Classification, retention suggestions, redaction assistance, and search can improve records workflows when paired with policy controls." },
  { title: "AI for Knowledge Management", category: "Workforce", summary: "Internal assistants can help staff find procedures, policies, and institutional knowledge across fragmented repositories." },
  { title: "AI and Emergency Communications", category: "Emergency response", summary: "Potential uses include translation, transcription, triage support, and after-action analysis, with strict safeguards for critical decisions." },
  { title: "Practical Uses of AI in Government", category: "Implementation", summary: "The strongest AI projects start with narrow workflows, measurable outcomes, data review, staff training, and transparent governance." },
  { title: "Where AI Should Not Be Used", category: "Governance", summary: "High-impact decisions, sensitive enforcement actions, and opaque automated judgments require caution, public accountability, and human review." }
];

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";
  card.innerHTML = `
    <span class="category">${article.category}</span>
    <h3>${article.title}</h3>
    <p>${article.summary}</p>
    <span class="read-more" aria-label="Article preview for ${article.title}">Preview →</span>
  `;
  return card;
}

function renderArticles(containerId, articles) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const fragment = document.createDocumentFragment();
  articles.forEach((article) => fragment.appendChild(createArticleCard(article)));
  container.appendChild(fragment);
}

renderArticles("featuredArticles", featuredArticles);
renderArticles("aiArticles", aiArticles);

document.querySelectorAll(".feature-card, .article-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });
});

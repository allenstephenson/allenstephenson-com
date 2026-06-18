const featuredArticles = [
  { title: "Why Every Department is an IT Department", category: "Operations", url: "articles/why-every-department-is-an-it-department.html", summary: "Modern public service depends on software, devices, data, and connectivity in every department, not just the technology office." },
  { title: "What Happens When Someone Calls 911?", category: "Emergency response", url: "articles/what-happens-when-someone-calls-911.html", summary: "A plain-language look at call routing, dispatch workflows, mapping, radio channels, and the systems that connect callers to responders." },
  { title: "The Hidden Maps Behind Modern Government", category: "GIS", url: "articles/the-hidden-maps-behind-modern-government.html", summary: "Geographic information systems quietly support permitting, utilities, public works, planning, emergency response, and resident services." },
  { title: "Defending a City in the Digital Age", category: "Cybersecurity", url: "articles/defending-a-city-in-the-digital-age.html", summary: "Local governments manage identity, endpoint protection, monitoring, training, segmentation, and continuity planning to reduce cyber risk." },
  { title: "Where Does Government Data Actually Live?", category: "Cloud", url: "articles/where-does-government-data-actually-live.html", summary: "Public data may live across on-premises systems, cloud platforms, software vendors, archives, backups, and protected records systems." },
  { title: "Can Artificial Intelligence Improve Local Government?", category: "AI", url: "articles/can-artificial-intelligence-improve-local-government.html", summary: "AI can help summarize, search, classify, and detect patterns, but public-sector use requires oversight, accountability, and careful boundaries." },
  { title: "Why Cities Still Use Radio Systems", category: "Communications", url: "articles/why-cities-still-use-radio-systems.html", summary: "Land mobile radio remains vital because emergency communications need coverage, priority access, durability, and field-tested reliability." },
  { title: "What Happens During a Power Outage?", category: "Resilience", url: "articles/what-happens-during-a-power-outage.html", summary: "Backup power, redundant networks, emergency operations plans, and recovery procedures help keep essential services available." },
  { title: "Understanding NG911", category: "Public safety", url: "articles/understanding-ng911.html", summary: "Next Generation 911 modernizes emergency communications with IP-based networks, richer data, improved routing, and new operational responsibilities." },
  { title: "The Technology Behind Public Meetings", category: "Civic tech", url: "articles/the-technology-behind-public-meetings.html", summary: "Streaming, agenda management, microphones, room systems, captioning, records retention, and cybersecurity all support transparent public meetings." }
];

const aiArticles = [
  { title: "Can AI Help Building Inspectors?", category: "Field operations", summary: "AI-assisted checklists, code lookup, image review, and report drafting may reduce administrative friction while inspectors retain authority." },
  { title: "AI for Records Management", category: "Information governance", summary: "Classification, retention suggestions, redaction assistance, and search can improve records workflows when paired with policy controls." },
  { title: "AI for Knowledge Management", category: "Workforce", summary: "Internal assistants can help staff find procedures, policies, and institutional knowledge across fragmented repositories." },
  { title: "AI and Emergency Communications", category: "Emergency response", summary: "Potential uses include translation, transcription, triage support, and after-action analysis, with strict safeguards for critical decisions." },
  { title: "Practical Uses of AI in Government", category: "Implementation", summary: "The strongest AI projects start with narrow workflows, measurable outcomes, data review, staff training, and transparent governance." },
  { title: "Where AI Should Not Be Used", category: "Governance", summary: "High-impact decisions, sensitive enforcement actions, and opaque automated judgments require caution, public accountability, and human review." }
];

const radarItems = [
  ["AI Agents", "Emerging"], ["NG911", "Mainstream"], ["GIS Digital Twins", "Emerging"], ["Zero Trust Security", "Maturing"],
  ["Drone First Responder Programs", "Emerging"], ["Cloud Disaster Recovery", "Mainstream"], ["Smart Infrastructure Sensors", "Maturing"], ["Quantum-Safe Encryption", "Experimental"]
];

const projects = [
  { title: "Smart Water Meter Modernization", summary: "A utility replaces manual reads with secure connected meters, customer usage analytics, leak alerts, and resilient billing integrations." },
  { title: "Citywide Fiber Resilience Project", summary: "A backbone upgrade adds diverse paths, hardened network rooms, and redundant service routes for facilities and public safety sites." },
  { title: "AI-Assisted Permit Review", summary: "A controlled pilot uses AI to check application completeness, surface relevant code references, and reduce administrative review time." },
  { title: "Intelligent Traffic Signal Network", summary: "Signal controllers, sensors, and operations dashboards improve corridor timing, maintenance visibility, and incident response coordination." },
  { title: "Public Meeting Modernization", summary: "Agenda workflows, room audio, streaming, captioning, and searchable archives are redesigned around accessibility and continuity." },
  { title: "Emergency Operations Dashboard", summary: "GIS layers, resource status, weather feeds, facility impacts, and public information workflows are unified for situational awareness." }
];

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";
  const href = article.url || "ai.html";
  card.innerHTML = `
    <span class="category">${article.category}</span>
    <h3>${article.title}</h3>
    <p>${article.summary}</p>
    <a class="read-more" href="${href}" aria-label="Open article: ${article.title}">Preview →</a>
  `;
  return card;
}

function createRadarCard([name, status]) {
  const card = document.createElement("article");
  card.className = `radar-card status-${status.toLowerCase().replaceAll(" ", "-")}`;
  card.innerHTML = `<span class="radar-status">${status}</span><h3>${name}</h3><p>${radarSummary(name, status)}</p>`;
  return card;
}

function radarSummary(name, status) {
  const summaries = {
    "AI Agents": "Task-oriented assistants that may coordinate research, drafting, routing, and workflow support under human supervision.",
    "NG911": "IP-based emergency communications modernization focused on routing, interoperability, data, and resilience.",
    "GIS Digital Twins": "Spatial models that combine maps, assets, sensors, and operational data into a shared view of infrastructure.",
    "Zero Trust Security": "A security model that continuously verifies identity, device health, access, and context before granting trust.",
    "Drone First Responder Programs": "Rapid aerial situational awareness programs that require policy, privacy controls, training, and airspace coordination.",
    "Cloud Disaster Recovery": "Replicated services, backups, and recovery playbooks that keep critical systems available during disruption.",
    "Smart Infrastructure Sensors": "Connected devices that monitor facilities, utilities, streets, and environmental conditions for operational insight.",
    "Quantum-Safe Encryption": "Cryptographic planning for a future where quantum computing may weaken widely used public-key methods."
  };
  return `${summaries[name]} Maturity: ${status}.`;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.innerHTML = `<h3>${project.title}</h3><p>${project.summary}</p><span>Fictional modernization scenario</span>`;
  return card;
}

function renderCards(containerId, items, factory) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.appendChild(factory(item)));
  container.appendChild(fragment);
}

renderCards("featuredArticles", featuredArticles, createArticleCard);
renderCards("aiArticles", aiArticles, createArticleCard);
renderCards("technologyRadar", radarItems, createRadarCard);
renderCards("projectShowcase", projects, createProjectCard);

document.querySelectorAll(".feature-card, .article-card, .radar-card, .project-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });
});

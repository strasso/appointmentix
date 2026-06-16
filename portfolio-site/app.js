const projects = [
  {
    title: "The Medal Detector",
    years: "2021–2022",
    type: "Stop Motion Film",
    category: ["film"],
    roles: ["Stop Motion", "Kurzfilm"],
    description:
      "Frühes Filmprojekt im Bereich Stop Motion. Der Fokus liegt auf präzisem Timing, visueller Konstruktion und erzählerischer Verdichtung über Einzelbilder.",
    focus: "Ein Projekt, das den Einstieg in kontrolliertes visuelles Erzählen markiert."
  },
  {
    title: "Friseur Werbefilm",
    years: "2023",
    type: "Werbefilm",
    category: ["film"],
    roles: ["Commercial", "Kurzformat"],
    description:
      "Kurzes kommerzielles Format mit klarem Fokus auf Rhythmus, prägnante Bildsprache und die Übersetzung eines Kundenauftritts in einen kompakten visuellen Spot.",
    focus: "Verdichtung von Marke und Stimmung in ein knappes Filmformat."
  },
  {
    title: "Tränen des Krieges",
    years: "2023",
    type: "Sound Design & Audio",
    category: ["audio", "film"],
    roles: ["Sound Design", "Audio"],
    description:
      "Tonarbeit für ein inhaltlich schweres Projekt, bei dem Atmosphäre, Spannung und emotionale Wirkung stark über das akustische Konzept getragen werden.",
    focus: "Audio als tragende Ebene für Spannung und emotionale Dichte."
  },
  {
    title: "Das Andere Theater",
    years: "2023–2024",
    type: "Dokumentarfilm",
    category: ["doku", "film"],
    roles: ["Dokumentation", "Theater"],
    description:
      "Dokumentarisches Projekt über ein Theater. Im Vordergrund stehen Beobachtung, Nähe zur Wirklichkeit und die Frage, wie man Arbeitsprozesse und Raumstimmung filmisch überträgt.",
    focus: "Dokumentarische Form mit Blick auf Atmosphäre, Menschen und Raum."
  },
  {
    title: "Soundscape",
    years: "2024",
    type: "Sound Design Projekt",
    category: ["audio"],
    roles: ["Sound Design", "Klangraum"],
    description:
      "Eigenständiges Audio-Projekt rund um Klangräume, Layering und dramaturgische Wirkung von Ton. Die Arbeit untersucht, wie Stimmung allein akustisch aufgebaut werden kann.",
    focus: "Klang nicht als Ergänzung, sondern als eigenständige erzählerische Fläche."
  },
  {
    title: "Projection Mapping",
    years: "2024",
    type: "Openhouse Projekt",
    category: ["installation"],
    roles: ["Mapping", "Raum", "Visuals"],
    description:
      "Projekt an der Schnittstelle von Raum, Licht und bewegtem Bild. Im Zentrum steht, wie visuelle Inhalte auf Architektur oder Flächen wirken und das Publikum direkt im Raum erreichen.",
    focus: "Bewegtbild außerhalb des klassischen Screens gedacht."
  },
  {
    title: "Herr Petrovic",
    years: "2025",
    type: "Pilotfilm",
    category: ["film"],
    roles: ["Regieassistenz", "Set Organisation"],
    description:
      "Mitarbeit als Regieassistenz an einem Pilotfilm. Die Rolle verbindet Organisation, Kommunikation und die Unterstützung von Abläufen zwischen Regie, Produktion und Set.",
    focus: "Regiearbeit praktisch unterstützen und Setprozesse stabil halten."
  },
  {
    title: "Das Rot meiner Hände",
    years: "2025–2026",
    type: "Thriller Pilotfilm",
    category: ["film", "audio"],
    roles: ["Produktion", "Audio", "Pilotfilm"],
    description:
      "Thriller-Projekt mit Verantwortung in Produktion und Audio. Das Projekt bündelt organisatorisches Arbeiten und tonale Gestaltung in einem deutlich narrativen Format.",
    focus: "Spannung entsteht hier sowohl über Produktionspräzision als auch über Klang."
  },
  {
    title: "New Avalon",
    years: "2025–2026",
    type: "Diplom Projekt",
    category: ["audio", "film"],
    roles: ["Diplomprojekt", "Soundscape"],
    description:
      "Diplomprojekt mit Schwerpunkt Soundscape. Die Arbeit verdichtet das Interesse an räumlichem Ton, Atmosphäre und dramaturgischer Klangführung zu einem klaren eigenen Projekt.",
    focus: "Ein zentrales Projekt für das eigene Profil im Bereich Ton und Atmosphäre."
  }
];

const experience = [
  {
    years: "08/2024 & 08/2025",
    title: "Praktikum Redaktion & Recherche",
    company: "RCA Nachrichtenagentur, Graz",
    description:
      "Recherche, journalistische Aufbereitung und telefonische Interviews mit Pressestellen von Unternehmen und Verbänden. Arbeit unter Zeitdruck, mit klarem Fokus auf Genauigkeit und inhaltliche Verdichtung."
  },
  {
    years: "12/2024 – 04/2025",
    title: "Projektleitung Filmproduktion",
    company: "HTBLVA Ortweinschule, Pilotfilmprojekt",
    description:
      "Koordination, Organisation und Mitführung eines Teams von rund 18 Personen. Verantwortung für Ablauf, Abstimmung und Umsetzung eines komplexeren Filmprojekts im schulischen Produktionskontext."
  }
];

const projectGrid = document.getElementById("projectGrid");
const experienceTimeline = document.getElementById("experienceTimeline");
const filterRoot = document.getElementById("projectFilters");

renderProjects("all");
renderExperience();
setupFilters();
setupReveal();

function renderProjects(filter) {
  projectGrid.innerHTML = "";

  projects
    .filter((project) => filter === "all" || project.category.includes(filter))
    .forEach((project, index) => {
      const article = document.createElement("article");
      article.className = "project-card reveal";
      if (index % 2 === 1) {
        article.classList.add("reveal-delay");
      }

      article.innerHTML = `
        <div class="project-top">
          <div>
            <p class="project-type">${project.type}</p>
            <h3>${project.title}</h3>
          </div>
          <p class="year-pill">${project.years}</p>
        </div>
        <p class="project-description">${project.description}</p>
        <p class="project-focus">${project.focus}</p>
        <div class="project-tags">
          ${project.roles.map((role) => `<span>${role}</span>`).join("")}
        </div>
      `;

      projectGrid.appendChild(article);
    });

  setupReveal();
}

function renderExperience() {
  experienceTimeline.innerHTML = experience
    .map(
      (entry) => `
        <article class="timeline-item reveal">
          <p class="eyebrow">${entry.years}</p>
          <h3>${entry.title}</h3>
          <strong>${entry.company}</strong>
          <p>${entry.description}</p>
        </article>
      `
    )
    .join("");
}

function setupFilters() {
  filterRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) {
      return;
    }

    filterRoot.querySelectorAll("[data-filter]").forEach((chip) => {
      chip.classList.toggle("active", chip === button);
    });

    renderProjects(button.dataset.filter);
  });
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    if (!element.classList.contains("in-view")) {
      observer.observe(element);
    }
  });
}

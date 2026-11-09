const modules = {
  mathematics: {
    title: "Mathématiques",
    subtitle: "Outils avancés pour l'analyse et la résolution mathématique.",
    cards: [
      ["∑", "Algèbre", "Expressions algébriques, factorisation et simplification."],
      ["x", "Équations", "Équations du premier et du second degré."],
      ["▦", "Matrices", "Opérations matricielles, déterminants et inverses."],
      ["∫", "Analyse", "Limites, dérivées, intégrales et suites."],
      ["→", "Vecteurs", "Norme, produit scalaire et opérations vectorielles."],
      ["σ", "Statistiques", "Moyenne, variance, écart-type et médiane."]
    ]
  },

  engineering: {
    title: "Ingénierie",
    subtitle: "Calculs physiques, techniques et méthodes numériques.",
    cards: [
      ["⚙", "Physique", "Mécanique, énergie, puissance et mouvement."],
      ["⇄", "Convertisseur", "Conversion des unités physiques et techniques."],
      ["∫", "Méthodes numériques", "Approximation, interpolation et résolution numérique."],
      ["⚡", "Électricité", "Tension, courant, résistance et puissance électrique."],
      ["◈", "Géométrie", "Surfaces, volumes et propriétés géométriques."],
      ["⌁", "Trigonométrie", "Fonctions et identités trigonométriques."]
    ]
  },

  graphs: {
    title: "Graphiques",
    subtitle: "Représentation visuelle et exploration des fonctions.",
    cards: [
      ["ƒ", "Courbes", "Tracer les fonctions mathématiques."],
      ["x²", "Fonctions", "Étudier les fonctions polynomiales."],
      ["∑", "Comparaison", "Afficher plusieurs fonctions sur un même repère."],
      ["⌖", "Coordonnées", "Explorer les points et les coordonnées."]
    ]
  },

  library: {
    title: "Bibliothèque",
    subtitle: "Retrouve tes formules, tes calculs et tes ressources.",
    cards: [
      ["▤", "Formules", "Formules mathématiques et scientifiques."],
      ["◷", "Historique", "Consulter les calculs précédents."],
      ["☆", "Favoris", "Retrouver les formules enregistrées."],
      ["⚙", "Paramètres", "Personnaliser les préférences de calcul."]
    ]
  }
};

export function renderModulePage(routeId) {
  const module = modules[routeId];

  if (!module) {
    return "";
  }

  return `
    <section class="module-section">
      <div class="page-heading">
        <h1>${module.title}</h1>
        <p>${module.subtitle}</p>
      </div>

      <div class="module-grid">
        ${module.cards.map(([icon, title, description]) => `
          <article class="module-card">
            <div class="module-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
            <button
              class="secondary-button module-open"
              data-module="${routeId}"
              data-tool="${title}"
            >
              Explorer
            </button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

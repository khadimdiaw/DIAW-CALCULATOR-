export const routes = [
  { id: "calculate", label: "Calculer", icon: "⌗" },
  { id: "mathematics", label: "Mathématiques", icon: "∑" },
  { id: "engineering", label: "Ingénierie", icon: "⚙" },
  { id: "graphs", label: "Graphiques", icon: "⌁" },
  { id: "library", label: "Bibliothèque", icon: "▤" }
];

let currentRoute = "calculate";

export function navigateTo(routeId) {
  const route = routes.find(item => item.id === routeId);
  if (!route) return;

  currentRoute = routeId;

  document.dispatchEvent(
    new CustomEvent("diaw:navigate", {
      detail: { route, routeId }
    })
  );
}

export function getCurrentRoute() {
  return currentRoute;
}

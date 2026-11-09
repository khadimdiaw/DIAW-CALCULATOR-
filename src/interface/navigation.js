import { routes } from "../app/router.js";

export function renderNavigation() {
  return `
    <nav class="bottom-navigation">
      ${routes.map(route => `
        <button
          class="nav-item ${route.id === "calculate" ? "active" : ""}"
          data-route="${route.id}"
        >
          <span class="nav-icon">${route.icon}</span>
          <span>${route.label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

export function initializeNavigation(onNavigate) {
  const buttons = document.querySelectorAll(".nav-item");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const routeId = button.dataset.route;

      buttons.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      onNavigate(routeId);
    });
  });
}

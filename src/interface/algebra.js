import {
  solveQuadratic
} from "../engine/algebra.js";

import {
  parseQuadraticEquation
} from "../engine/algebra-parser.js";

import {
  renderMathKeyboard,
  initializeMathKeyboard
} from "./math-keyboard.js";

export function renderAlgebraPage() {
  return `
    <section class="module-section">
      <div class="page-heading">
        <h1>Algèbre</h1>
        <p>Résolution interactive des équations mathématiques.</p>
      </div>

      <div class="panel">
        <div class="panel-title">RÉSOLUTION D'ÉQUATIONS</div>

        <div class="equation-preview">
          ax² + bx + c = 0
        </div>

        <div class="algebra-expression">
          <label for="mathExpression">Expression mathématique</label>
          <input
            id="mathExpression"
            type="text"
            placeholder="Ex. : 2x² + 5x - 3 = 0"
            autocomplete="off"
          >
        </div>

        ${renderMathKeyboard()}

        <div class="algebra-fields">
          <label>
            Coefficient a
            <input id="coefficientA" class="math-input" data-math-input type="text" inputmode="decimal" value="1">
          </label>

          <label>
            Coefficient b
            <input id="coefficientB" class="math-input" data-math-input type="text" inputmode="decimal" value="-5">
          </label>

          <label>
            Coefficient c
            <input id="coefficientC" class="math-input" data-math-input type="text" inputmode="decimal" value="6">
          </label>
        </div>

        <button id="solveEquation" class="primary-button">
          Résoudre l'équation
        </button>

        <div id="algebraResult" class="algebra-result"
             aria-live="polite">
          <p class="muted">Saisis une expression ou modifie les coefficients.</p>
        </div>
      </div>

      <button id="backToMath" class="secondary-button">
        ← Retour aux Mathématiques
      </button>
    </section>
  `;
}

export function initializeAlgebra(onBack) {
  initializeMathKeyboard("mathKeyboard");

  const expressionInput = document.querySelector("#mathExpression");
  const solveButton = document.querySelector("#solveEquation");
  const output = document.querySelector("#algebraResult");

  solveButton.addEventListener("click", () => {
    const expression = expressionInput.value.trim();

    try {
      let coefficients;

      if (expression) {
        coefficients = parseQuadraticEquation(expression);
      } else {
        const ids = [
          "coefficientA",
          "coefficientB",
          "coefficientC"
        ];

        const values = ids.map(id =>
          document.querySelector(`#${id}`).value.trim()
        );

        if (values.some(value => value === "")) {
          throw new Error("Veuillez remplir tous les coefficients.");
        }

        coefficients = {
          a: Number(values[0]),
          b: Number(values[1]),
          c: Number(values[2])
        };
      }

      const { a, b, c } = coefficients;

      if (![a, b, c].every(Number.isFinite)) {
        throw new Error("Les coefficients doivent être des nombres valides.");
      }

      const result = solveQuadratic(a, b, c);

      let html = `
        <h3>Résolution</h3>
        <p>Forme réduite : ${a}x² + ${b}x + ${c} = 0</p>
      `;

      if (result.type === "none") {
        html += "<p>Aucune solution.</p>";
      }

      if (result.type === "infinite") {
        html += "<p>Une infinité de solutions.</p>";
      }

      if (result.type === "linear") {
        html += `
          <p>Équation du premier degré</p>
          <p><strong>x = ${result.solution}</strong></p>
        `;
      }

      if (result.type === "complex") {
        html += `
          <p>Discriminant : Δ = ${result.delta}</p>
          <p>Deux solutions complexes.</p>
        `;
      }

      if (result.type === "double") {
        html += `
          <p>Discriminant : Δ = ${result.delta}</p>
          <p>Racine double :</p>
          <p><strong>x = ${result.solution}</strong></p>
        `;
      }

      if (result.type === "quadratic") {
        html += `
          <p>Discriminant : Δ = ${result.delta}</p>
          <p>Deux solutions réelles :</p>
          <p><strong>x₁ = ${result.solutions[0]}</strong></p>
          <p><strong>x₂ = ${result.solutions[1]}</strong></p>
        `;
      }

      if (result.steps?.length) {
        html += `
          <div class="solution-steps">
            <h3>Déroulement de la résolution</h3>
            <ol>
              ${result.steps.map(step => `<li>${step}</li>`).join("")}
            </ol>
          </div>
        `;
      }

      output.innerHTML = html;

    } catch (error) {
      output.textContent = error.message;
    }
  });

  document.querySelector("#backToMath")
    .addEventListener("click", onBack);
}

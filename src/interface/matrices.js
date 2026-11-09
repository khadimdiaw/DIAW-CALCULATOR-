import {
  addMatrices,
  subtractMatrices,
  multiplyMatrices,
  determinant,
  inverseMatrix,
  solveLinearSystem
} from "../engine/matrices.js";

import {
  renderMathKeyboard,
  initializeMathKeyboard
} from "./math-keyboard.js";

export function renderMatricesPage() {
  return `
    <section class="matrix-section">
      <div class="page-heading">
        <h1>Calcul matriciel</h1>
        <p>Outils avancés d'algèbre linéaire et de calcul matriciel.</p>
      </div>

      <div class="matrix-toolbar">
        <label>
          Opération
          <select id="matrixOperation">
            <option value="add">Addition A + B</option>
            <option value="subtract">Soustraction A − B</option>
            <option value="multiply">Multiplication A × B</option>
            <option value="determinant">Déterminant de A</option>
            <option value="inverse">Inverse de A</option>
            <option value="system">Système linéaire AX = B</option>
          </select>
        </label>
      </div>

      ${renderMathKeyboard()}

      <div class="matrix-dimensions">
        <label>
          Lignes de A
          <select id="matrixRows">
            <option>2</option>
            <option>1</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </label>

        <label>
          Colonnes de A
          <select id="matrixCols">
            <option>2</option>
            <option>1</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </label>

        <label id="matrixBColsLabel" hidden>
          Colonnes de B
          <select id="matrixBCols">
            <option>2</option>
            <option>1</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </label>

        <button id="generateMatrices" class="secondary-button">
          Appliquer les dimensions
        </button>
      </div>

      <div class="matrix-inputs">
        <div class="matrix-card">
          <h3>Matrice A</h3>
          <div id="matrixA" class="matrix-grid"></div>
        </div>

        <div class="matrix-card" id="matrixBCard">
          <h3 id="matrixBTitle">Matrice B</h3>
          <div id="matrixB" class="matrix-grid"></div>
        </div>
      </div>

      <div class="matrix-actions">
        <button id="calculateMatrix" class="primary-button">
          Calculer
        </button>
        <button id="resetMatrices" class="secondary-button">
          Réinitialiser
        </button>
        <button id="backMatrices" class="secondary-button">
          Retour
        </button>
      </div>

      <div id="matrixResult" class="matrix-result" aria-live="polite">
        <p>Configure les matrices puis lance un calcul.</p>
      </div>
    </section>
  `;
}

export function initializeMatrices(onBack) {
  initializeMathKeyboard("mathKeyboard");

  const $ = id => document.getElementById(id);

  const operation = $("matrixOperation");
  const rows = $("matrixRows");
  const cols = $("matrixCols");
  const bCols = $("matrixBCols");
  const bColsLabel = $("matrixBColsLabel");
  const areaA = $("matrixA");
  const areaB = $("matrixB");
  const cardB = $("matrixBCard");
  const titleB = $("matrixBTitle");
  const result = $("matrixResult");

  function createGrid(container, rowCount, colCount, prefix) {
    container.style.gridTemplateColumns =
      `repeat(${colCount}, minmax(45px, 1fr))`;

    container.innerHTML = "";

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        const input = document.createElement("input");

        input.type = "text";
        input.inputMode = "decimal";
        input.className = "math-input";
        input.setAttribute("data-math-input", "");
        input.value = i === j ? "1" : "0";
        input.id = `${prefix}_${i}_${j}`;
        input.setAttribute(
          "aria-label",
          `${prefix} ligne ${i + 1}, colonne ${j + 1}`
        );

        container.appendChild(input);
      }
    }
  }

  function updateOperation() {
    const selected = operation.value;
    const squareRequired = [
      "determinant",
      "inverse",
      "system"
    ].includes(selected);

    if (squareRequired) {
      cols.value = rows.value;
      cols.disabled = true;
    } else {
      cols.disabled = false;
    }

    const showB = [
      "add",
      "subtract",
      "multiply",
      "system"
    ].includes(selected);

    cardB.hidden = !showB;
    bColsLabel.hidden = selected !== "multiply";

    titleB.textContent =
      selected === "system" ? "Vecteur B" : "Matrice B";
  }

  function generate() {
    updateOperation();

    const r = Number(rows.value);
    const c = Number(cols.value);
    const selected = operation.value;

    createGrid(areaA, r, c, "A");

    if (selected === "system") {
      createGrid(areaB, r, 1, "B");
    } else if (selected === "multiply") {
      createGrid(areaB, c, Number(bCols.value), "B");
    } else {
      createGrid(areaB, r, c, "B");
    }

    result.innerHTML = "<p>Configure les matrices puis lance un calcul.</p>";
  }

  function readMatrix(prefix, rowCount, colCount) {
    return Array.from({ length: rowCount }, (_, i) =>
      Array.from({ length: colCount }, (_, j) => {
        const input = $(`${prefix}_${i}_${j}`);
        const value = input?.value.trim();

        if (value === "" || !Number.isFinite(Number(value))) {
          throw new Error(
            `Valeur invalide dans ${prefix}, ligne ${i + 1}, colonne ${j + 1}.`
          );
        }

        return Number(value);
      })
    );
  }

  function format(value) {
    if (Math.abs(value) < 1e-10) return "0";
    return Number(value.toPrecision(10)).toString();
  }

  function displayResult(value) {
    result.innerHTML = "";

    if (Array.isArray(value)) {
      const grid = document.createElement("div");
      grid.className = "matrix-output";

      value.forEach(row => {
        const line = document.createElement("div");
        line.className = "matrix-output-row";

        row.forEach(number => {
          const cell = document.createElement("span");
          cell.textContent = format(number);
          line.appendChild(cell);
        });

        grid.appendChild(line);
      });

      result.appendChild(grid);
    } else {
      const output = document.createElement("h2");
      output.textContent = format(value);
      result.appendChild(output);
    }
  }

  $("generateMatrices").addEventListener("click", generate);

  operation.addEventListener("change", generate);
  rows.addEventListener("change", generate);
  cols.addEventListener("change", generate);
  bCols.addEventListener("change", generate);

  $("calculateMatrix").addEventListener("click", () => {
    try {
      const r = Number(rows.value);
      const c = Number(cols.value);
      const selected = operation.value;
      const A = readMatrix("A", r, c);

      let answer;

      if (selected === "add" || selected === "subtract") {
        const B = readMatrix("B", r, c);

        answer = selected === "add"
          ? addMatrices(A, B)
          : subtractMatrices(A, B);
      }

      if (selected === "multiply") {
        const B = readMatrix("B", c, Number(bCols.value));
        answer = multiplyMatrices(A, B);
      }

      if (selected === "determinant") {
        answer = determinant(A);
      }

      if (selected === "inverse") {
        answer = inverseMatrix(A);
      }

      if (selected === "system") {
        const B = readMatrix("B", r, 1).map(row => row[0]);
        answer = solveLinearSystem(A, B).map(value => [value]);
      }

      displayResult(answer);
    } catch (error) {
      result.textContent = error.message;
    }
  });

  $("resetMatrices").addEventListener("click", generate);
  $("backMatrices").addEventListener("click", onBack);

  generate();
}

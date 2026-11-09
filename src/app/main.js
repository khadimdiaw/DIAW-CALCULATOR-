import { renderDisplay } from "../interface/display.js";
import {
  renderKeypad,
  initializeKeypad
} from "../interface/keypad.js";
import { evaluateExpression } from "../engine/evaluator.js";

const app = document.querySelector("#app");

let expression = "";
let angleMode = "DEG";
let lastAnswer = 0;
let history = [];

app.innerHTML = `
  <header class="app-header">
    <div>
      <div class="brand">DIAW <span>CALCULATOR</span></div>
      <div class="version">SCIENTIFIC CALCULATOR · 2.0</div>
    </div>
    <div class="header-status">MODE SCIENTIFIQUE</div>
  </header>

  <main id="pageContent">
    ${renderDisplay()}
    ${renderKeypad()}
  </main>
`;

function formatResult(value) {
  return Number(value.toPrecision(12)).toString();
}

function calculate() {
  if (!expression) return;

  try {
    const result = evaluateExpression(expression, angleMode);
    lastAnswer = result;

    document.querySelector("#result").textContent =
      formatResult(result);

    history.unshift({
      expression,
      result: formatResult(result)
    });

    history = history.slice(0, 50);
  } catch (error) {
    document.querySelector("#result").textContent = error.message;
  }
}

function updateDisplay() {
  const display = document.querySelector("#expression");

  if (display) {
    display.textContent = expression || "0";
  }
}

function handleKey(key) {
  if (key === "=") {
    calculate();
    return;
  }

  if (key === "±") {
    expression = expression.startsWith("-")
      ? expression.slice(1)
      : "-" + expression;
  } else if (key === "Ans") {
    expression += String(lastAnswer);
  } else if (key === "x²") {
    expression += "^2";
  } else if (key === "x³") {
    expression += "^3";
  } else if (key === "xʸ") {
    expression += "^";
  } else if (key === "1/x") {
    expression += "1/(";
  } else {
    expression += key;
  }

  updateDisplay();
}

initializeKeypad(handleKey);

document.querySelector("#clearButton").addEventListener("click", () => {
  expression = "";
  document.querySelector("#result").textContent = "0";
  updateDisplay();
});

document.querySelector("#deleteButton").addEventListener("click", () => {
  expression = expression.slice(0, -1);
  updateDisplay();
});

document.querySelector("#historyButton").addEventListener("click", () => {
  document.querySelector("#result").textContent = history.length
    ? history.slice(0, 3)
        .map(item => `${item.expression} = ${item.result}`)
        .join(" | ")
    : "Aucun calcul enregistré";
});

document.querySelectorAll(".angle-button").forEach(button => {
  button.addEventListener("click", () => {
    angleMode = button.dataset.angle;

    document.querySelectorAll(".angle-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    if (expression) calculate();
  });
});

updateDisplay();

const groups = {
  basic: [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "−"],
    ["0", ".", "(", ")", "+"],
    ["±", "%", "^", "="],
    ["AC", "⌫", ",", "mod"]
  ],

  algebra: [
    ["x", "y", "z", "t"],
    ["a", "b", "c", "Δ"],
    ["x²", "x³", "xʸ", "√("],
    ["(", ")", "=", "≠"],
    ["≤", "≥", "+", "−"],
    ["×", "÷", "±", "⌫"],
    ["π", "∞", "a/b", "AC"]
  ],

  scientific: [
    ["sin(", "cos(", "tan(", "π"],
    ["asin(", "acos(", "atan(", "√("],
    ["log(", "ln(", "exp(", "abs("],
    ["sinh(", "cosh(", "tanh(", "∛("],
    ["e", "^", "!", "±"],
    ["(", ")", "−", "⌫"],
    ["AC", "÷", "×", "="]
  ],

  engineering: [
    ["V", "A", "Ω", "W"],
    ["J", "N", "Pa", "Hz"],
    ["kg", "m", "s", "K"],
    ["π", "e", "√(", "^"],
    ["+", "−", "×", "÷"],
    ["(", ")", "±", "⌫"],
    ["AC", ".", "="]
  ],

  matrices: [
    ["1", "2", "3", "−"],
    ["4", "5", "6", "±"],
    ["7", "8", "9", "×"],
    ["0", ".", ",", "÷"],
    ["(", ")", "[", "]"],
    ["+", "−", "^", "⌫"],
    ["AC", "="]
  ],

  vectors: [
    ["x", "y", "z", "t"],
    ["i", "j", "k", "π"],
    ["+", "−", "×", "÷"],
    ["(", ")", "±", "^"],
    ["√(", "abs(", "dot(", "cross("],
    ["AC", "⌫", "="]
  ],

  analysis: [
    ["x", "y", "f(x)", "π"],
    ["lim(", "d/dx(", "∫(", "Σ("],
    ["sin(", "cos(", "tan(", "ln("],
    ["+", "−", "×", "÷"],
    ["(", ")", "±", "^"],
    ["√(", "∞", "AC", "⌫"]
  ]
};

const labels = {
  basic: "Principal",
  algebra: "Algèbre",
  scientific: "Scientifique",
  engineering: "Ingénierie",
  matrices: "Matrices",
  vectors: "Vecteurs",
  analysis: "Analyse"
};

const symbols = {
  "×": "*",
  "÷": "/",
  "−": "-",
  "π": "pi",
  "√(": "sqrt(",
  "∛(": "cbrt(",
  "²": "^2",
  "³": "^3",
  "x²": "x^2",
  "x³": "x^3",
  "xʸ": "x^",
  "a/b": "/",
  "≠": "!=",
  "≤": "<=",
  "≥": ">="
};

const instances = new WeakMap();

function isEditableField(element, selector) {
  return (
    (element instanceof HTMLInputElement &&
      !["button", "submit", "hidden", "checkbox", "radio"].includes(element.type) &&
      element.matches(selector)) ||
    (element instanceof HTMLTextAreaElement &&
      element.matches(selector))
  );
}

export function renderMathKeyboard(id = "mathKeyboard") {
  return `
    <section class="math-keyboard" id="${id}">
      <div class="math-keyboard-heading">
        <span>CLAVIER MATHÉMATIQUE UNIVERSEL</span>
        <span class="keyboard-status">ACTIF</span>
      </div>

      <div class="math-keyboard-tabs">
        ${Object.entries(labels).map(([key, label], index) => `
          <button
            class="math-keyboard-tab ${index === 0 ? "active" : ""}"
            data-group="${key}"
            type="button"
          >${label}</button>
        `).join("")}
      </div>

      <div class="math-keyboard-keys"></div>
    </section>
  `;
}

export function initializeMathKeyboard(
  id = "mathKeyboard",
  targetSelector = "input.math-input, textarea.math-input, [data-math-input], #mathExpression"
) {
  const keyboard = document.getElementById(id);
  if (!keyboard) return;

  const previous = instances.get(keyboard);
  if (previous) previous.destroy();

  const keysContainer = keyboard.querySelector(
    ".math-keyboard-keys"
  );

  let activeTarget = null;
  let activeGroup = "basic";

  function rememberTarget(event) {
    if (isEditableField(event.target, targetSelector)) {
      activeTarget = event.target;
    }
  }

  function getTarget() {
    if (
      activeTarget &&
      activeTarget.isConnected &&
      isEditableField(activeTarget, targetSelector)
    ) {
      return activeTarget;
    }

    activeTarget = document.querySelector(targetSelector);
    return activeTarget;
  }

  function dispatchInput(target) {
    target.dispatchEvent(
      new Event("input", { bubbles: true })
    );
  }

  function toggleSign(target, start, end) {
    const value = target.value;
    const prefix = value.slice(0, start);

    const match = prefix.match(
      /-?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i
    );

    if (!match) {
      return {
        value:
          value.slice(0, start) +
          "-" +
          value.slice(end),
        cursor: start + 1
      };
    }

    const tokenStart = start - match[0].length;
    const token = match[0];

    if (token.startsWith("-")) {
      return {
        value:
          value.slice(0, tokenStart) +
          token.slice(1) +
          value.slice(end),
        cursor: start - 1
      };
    }

    return {
      value:
        value.slice(0, tokenStart) +
        "-" +
        token +
        value.slice(end),
      cursor: start + 1
    };
  }

  function insert(value) {
    const target = getTarget();
    if (!target) return;

    target.focus();

    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;
    const current = target.value;

    let next = current;
    let cursor = start;

    if (value === "AC") {
      next = "";
      cursor = 0;
    } else if (value === "⌫") {
      if (start === end && start > 0) {
        next =
          current.slice(0, start - 1) +
          current.slice(end);
        cursor = start - 1;
      } else {
        next =
          current.slice(0, start) +
          current.slice(end);
      }
    } else if (value === "±") {
      const result = toggleSign(target, start, end);
      next = result.value;
      cursor = result.cursor;
    } else {
      const symbol = symbols[value] ?? value;

      next =
        current.slice(0, start) +
        symbol +
        current.slice(end);

      cursor = start + symbol.length;
    }

    target.value = next;
    target.setSelectionRange(cursor, cursor);
    dispatchInput(target);
    target.focus();
  }

  function showGroup(group) {
    if (!groups[group]) return;

    activeGroup = group;

    keysContainer.innerHTML = groups[group]
      .flat()
      .map(key => `
        <button
          type="button"
          class="math-key ${
            ["+", "−", "×", "÷", "="].includes(key)
              ? "operator"
              : ""
          } ${
            key === "AC" ? "clear" : ""
          } ${
            key === "±" ? "negative-key" : ""
          }"
          data-key="${key}"
        >${key}</button>
      `)
      .join("");

    keyboard
      .querySelectorAll(".math-keyboard-tab")
      .forEach(tab => {
        tab.classList.toggle(
          "active",
          tab.dataset.group === group
        );
      });
  }

  function handleClick(event) {
    const tab = event.target.closest(
      ".math-keyboard-tab"
    );

    const key = event.target.closest(".math-key");

    if (tab) {
      showGroup(tab.dataset.group);
      return;
    }

    if (key) {
      insert(key.dataset.key);
    }
  }

  function preserveSelection(event) {
    if (event.target.closest(".math-key")) {
      event.preventDefault();
    }
  }

  document.addEventListener("focusin", rememberTarget);
  keyboard.addEventListener("pointerdown", preserveSelection);
  keyboard.addEventListener("click", handleClick);

  function destroy() {
    document.removeEventListener("focusin", rememberTarget);
    keyboard.removeEventListener("pointerdown", preserveSelection);
    keyboard.removeEventListener("click", handleClick);
  }

  instances.set(keyboard, { destroy });

  showGroup(activeGroup);
}

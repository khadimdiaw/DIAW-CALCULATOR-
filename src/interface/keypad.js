const keyGroups = {
  basic: [
    ["(", ")", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["±", "0", ".", "="]
  ],
  scientific: [
    ["sin(", "cos(", "tan(", "sqrt("],
    ["asin(", "acos(", "atan(", "cbrt("],
    ["log(", "ln(", "exp(", "abs("],
    ["x²", "x³", "xʸ", "1/x"],
    ["(", ")", "π", "e"],
    ["!", "Ans", "x²", "x³"],
    ["sinh(", "cosh(", "tanh(", "round("]
  ]
};

export function renderKeypad() {
  return `
    <section class="keypad-section">
      <div class="keypad-heading">
        <span>CLAVIER SCIENTIFIQUE</span>
        <span class="muted">DIAW · 2.0</span>
      </div>

      <div class="keypad-tabs">
        <button class="keypad-tab active" data-group="basic">Principal</button>
        <button class="keypad-tab" data-group="scientific">Scientifique</button>
      </div>

      <div id="keypad" class="keypad"></div>
    </section>
  `;
}

export function initializeKeypad(onKey) {
  const keypad = document.querySelector("#keypad");
  const tabs = document.querySelectorAll(".keypad-tab");

  function showGroup(group) {
    keypad.innerHTML = keyGroups[group].flat().map(key => {
      const type = key === "="
        ? "equals"
        : ["÷", "×", "+", "−", "xʸ"].includes(key)
          ? "operator"
          : ["π", "e", "Ans", "!", "x²", "x³", "1/x"].includes(key)
            ? "function"
            : "number";

      return `<button class="calc-key ${type}" data-key="${key}">${key}</button>`;
    }).join("");

    keypad.querySelectorAll(".calc-key").forEach(button => {
      button.addEventListener("click", () => onKey(button.dataset.key));
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(item => item.classList.remove("active"));
      tab.classList.add("active");
      showGroup(tab.dataset.group);
    });
  });

  showGroup("basic");
}

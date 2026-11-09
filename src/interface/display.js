export function renderDisplay() {
  return `
    <section class="calculator-display panel">
      <div class="display-toolbar">
        <span class="display-label">SCIENTIFIC CALCULATOR</span>
        <div class="angle-controls">
          <button class="angle-button active" data-angle="DEG">DEG</button>
          <button class="angle-button" data-angle="RAD">RAD</button>
        </div>
      </div>

      <div class="display-expression" id="expression">0</div>
      <div class="display-divider"></div>
      <div class="display-result-label">RÉSULTAT</div>
      <div class="display-result" id="result">0</div>

      <div class="display-actions">
        <button id="clearButton">AC</button>
        <button id="deleteButton">⌫</button>
        <button id="historyButton">HISTORIQUE</button>
      </div>
    </section>
  `;
}

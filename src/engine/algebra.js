function formatNumber(value) {
  if (Object.is(value, -0)) return "0";
  return Number(value.toPrecision(10)).toString();
}

export function solveLinear(a, b) {
  if (![a, b].every(Number.isFinite)) {
    throw new Error("Coefficients invalides");
  }

  if (a === 0) {
    return b === 0
      ? {
          type: "infinite",
          message: "Une infinité de solutions",
          steps: ["0x + 0 = 0", "Tous les réels sont solutions."]
        }
      : {
          type: "none",
          message: "Aucune solution",
          steps: [`0x + ${formatNumber(b)} = 0`, "Cette égalité est impossible."]
        };
  }

  const solution = -b / a;

  return {
    type: "linear",
    solution,
    steps: [
      `${formatNumber(a)}x + (${formatNumber(b)}) = 0`,
      `${formatNumber(a)}x = ${formatNumber(-b)}`,
      `x = ${formatNumber(-b)} / ${formatNumber(a)}`,
      `x = ${formatNumber(solution)}`
    ]
  };
}

export function solveQuadratic(a, b, c) {
  if (![a, b, c].every(Number.isFinite)) {
    throw new Error("Coefficients invalides");
  }

  if (a === 0) return solveLinear(b, c);

  const delta = b * b - 4 * a * c;
  const steps = [
    `Équation : ${formatNumber(a)}x² + (${formatNumber(b)})x + (${formatNumber(c)}) = 0`,
    `a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`,
    `Δ = b² - 4ac`,
    `Δ = (${formatNumber(b)})² - 4 × ${formatNumber(a)} × (${formatNumber(c)})`,
    `Δ = ${formatNumber(delta)}`
  ];

  if (delta < 0) {
    return {
      type: "complex",
      delta,
      message: "Deux solutions complexes",
      steps: [
        ...steps,
        "Δ < 0 : aucune solution réelle.",
        "Les deux solutions sont complexes."
      ]
    };
  }

  if (delta === 0) {
    const solution = -b / (2 * a);

    return {
      type: "double",
      delta,
      solution,
      steps: [
        ...steps,
        "Δ = 0 : une racine double.",
        `x = -b / (2a)`,
        `x = ${formatNumber(-b)} / ${formatNumber(2 * a)}`,
        `x = ${formatNumber(solution)}`
      ]
    };
  }

  const sqrtDelta = Math.sqrt(delta);
  const x1 = (-b - sqrtDelta) / (2 * a);
  const x2 = (-b + sqrtDelta) / (2 * a);

  return {
    type: "quadratic",
    delta,
    solutions: [x1, x2],
    steps: [
      ...steps,
      "Δ > 0 : deux racines réelles distinctes.",
      `√Δ = ${formatNumber(sqrtDelta)}`,
      `x₁ = (-b - √Δ) / (2a)`,
      `x₁ = ${formatNumber(x1)}`,
      `x₂ = (-b + √Δ) / (2a)`,
      `x₂ = ${formatNumber(x2)}`
    ]
  };
}

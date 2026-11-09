function multiply(a, b) {
  const result = [0, 0, 0];

  for (let i = 0; i <= 2; i++) {
    for (let j = 0; j <= 2; j++) {
      if (i + j > 2 && a[i] * b[j] !== 0) {
        throw new Error("Le degré du polynôme dépasse 2.");
      }

      if (i + j <= 2) {
        result[i + j] += a[i] * b[j];
      }
    }
  }

  return result;
}

function tokenize(expression) {
  const normalized = expression
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/,/g, ".");

  const tokens = normalized.match(
    /(?:\d+(?:\.\d*)?|\.\d+)|[xX]|[()+\-*/^]/g
  );

  if (!tokens || tokens.join("") !== normalized) {
    throw new Error("Expression invalide.");
  }

  const expanded = [];

  for (const token of tokens) {
    const previous = expanded.at(-1);

    if (
      previous &&
      (
        /^\d/.test(previous) ||
        previous === "." ||
        previous.toLowerCase() === "x" ||
        previous === ")"
      ) &&
      (
        token.toLowerCase() === "x" ||
        token === "("
      )
    ) {
      expanded.push("*");
    }

    expanded.push(token);
  }

  return expanded;
}

function parsePolynomial(expression) {
  const tokens = tokenize(expression);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(expected) {
    if (peek() !== expected) {
      throw new Error(`Symbole attendu : ${expected}`);
    }
    position++;
  }

  function add(a, b, sign = 1) {
    return a.map((value, index) =>
      value + sign * b[index]
    );
  }

  function expressionNode() {
    let result = term();

    while (peek() === "+" || peek() === "-") {
      const operator = tokens[position++];
      result = add(result, term(), operator === "+" ? 1 : -1);
    }

    return result;
  }

  function term() {
    let result = unary();

    while (peek() === "*" || peek() === "/") {
      const operator = tokens[position++];

      if (operator === "*") {
        result = multiply(result, unary());
      } else {
        const divisor = unary();

        if (divisor[1] !== 0 || divisor[2] !== 0 || divisor[0] === 0) {
          throw new Error("Division uniquement par une constante non nulle.");
        }

        result = result.map(value => value / divisor[0]);
      }
    }

    return result;
  }

  function unary() {
    if (peek() === "+") {
      position++;
      return unary();
    }

    if (peek() === "-") {
      position++;
      return unary().map(value => -value);
    }

    return power();
  }

  function power() {
    let base = primary();

    if (peek() === "^") {
      position++;
      const exponent = Number(tokens[position++]);

      if (![0, 1, 2].includes(exponent)) {
        throw new Error("Exposant accepté : 0, 1 ou 2.");
      }

      if (exponent === 0) return [1, 0, 0];
      if (exponent === 1) return base;

      base = multiply(base, base);
    }

    return base;
  }

  function primary() {
    const token = peek();

    if (token === "(") {
      position++;
      const result = expressionNode();
      consume(")");
      return result;
    }

    if (token && token.toLowerCase() === "x") {
      position++;
      return [0, 1, 0];
    }

    if (token && /^(\d+\.?\d*|\.\d+)$/.test(token)) {
      position++;
      return [Number(token), 0, 0];
    }

    throw new Error(`Terme inattendu : ${token ?? "fin d'expression"}`);
  }

  const result = expressionNode();

  if (position !== tokens.length) {
    throw new Error(`Symbole inattendu : ${peek()}`);
  }

  return result;
}

export function parseQuadraticEquation(expression) {
  const parts = expression.split("=");

  if (parts.length > 2 || parts.some(part => !part.trim())) {
    throw new Error("Équation invalide.");
  }

  const left = parsePolynomial(parts[0]);
  const right = parts.length === 2
    ? parsePolynomial(parts[1])
    : [0, 0, 0];

  return {
    a: left[2] - right[2],
    b: left[1] - right[1],
    c: left[0] - right[0]
  };
}

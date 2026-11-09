const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E
};

class Parser {
  constructor(source, angleMode = "DEG") {
    const rawTokens = source.match(
      /(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-zA-Z]+|[()+\-*/^!,%]/gi
    ) || [];

    this.tokens = [];

    for (const token of rawTokens) {
      const previous = this.tokens.at(-1);

      const leftEndsOperand = previous && (
        /^\d/.test(previous) ||
        Object.hasOwn(CONSTANTS, previous.toLowerCase()) ||
        [")", "!", "%"].includes(previous)
      );

      const rightStartsOperand =
        /^\d/.test(token) ||
        Object.hasOwn(CONSTANTS, token.toLowerCase()) ||
        Object.hasOwn(FUNCTIONS, token.toLowerCase()) ||
        token === "(";

      const isFunctionCall =
        previous && Object.hasOwn(FUNCTIONS, previous.toLowerCase()) &&
        token === "(";

      if (leftEndsOperand && rightStartsOperand && !isFunctionCall) {
        this.tokens.push("*");
      }

      this.tokens.push(token);
    }

    this.index = 0;
    this.angleMode = angleMode;
  }

  peek() {
    return this.tokens[this.index];
  }

  take() {
    return this.tokens[this.index++];
  }

  parse() {
    const result = this.expression();

    if (this.index < this.tokens.length) {
      throw new Error("Expression invalide");
    }

    if (!Number.isFinite(result)) {
      throw new Error("Résultat non défini");
    }

    return result;
  }

  expression() {
    let value = this.term();

    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.take();
      const right = this.term();

      value = operator === "+" ? value + right : value - right;
    }

    return value;
  }

  term() {
    let value = this.unary();

    while (["*", "/", "%"].includes(this.peek())) {
      const operator = this.take();
      const right = this.unary();

      if ((operator === "/" || operator === "%") && right === 0) {
        throw new Error("Division par zéro");
      }

      if (operator === "*") value *= right;
      if (operator === "/") value /= right;
      if (operator === "%") value %= right;
    }

    return value;
  }

  unary() {
    if (this.peek() === "+") {
      this.take();
      return this.unary();
    }

    if (this.peek() === "-") {
      this.take();
      return -this.unary();
    }

    return this.power();
  }

  power() {
    let value = this.postfix();

    if (this.peek() === "^") {
      this.take();
      value = Math.pow(value, this.unary());
    }

    return value;
  }

  postfix() {
    let value = this.primary();

    while (true) {
      if (this.peek() === "!") {
        this.take();

        if (!Number.isInteger(value) || value < 0 || value > 170) {
          throw new Error("Factorielle invalide");
        }

        let result = 1;

        for (let i = 2; i <= value; i++) {
          result *= i;
        }

        value = result;
      } else if (this.peek() === "%") {
        this.take();
        value /= 100;
      } else {
        break;
      }
    }

    return value;
  }

  primary() {
    const token = this.take();

    if (!token) {
      throw new Error("Expression incomplète");
    }

    if (token === "(") {
      const value = this.expression();

      if (this.take() !== ")") {
        throw new Error("Parenthèse manquante");
      }

      return value;
    }

    if (/^(?:\d|\.)/.test(token)) {
      return Number(token);
    }

    const name = token.toLowerCase();

    if (Object.hasOwn(CONSTANTS, name)) {
      return CONSTANTS[name];
    }

    if (Object.hasOwn(FUNCTIONS, name)) {
      if (this.take() !== "(") {
        throw new Error("Parenthèse manquante après " + name);
      }

      const argument = this.expression();

      if (this.take() !== ")") {
        throw new Error("Parenthèse manquante");
      }

      const input = ["sin", "cos", "tan"].includes(name) &&
        this.angleMode === "DEG"
        ? argument * Math.PI / 180
        : argument;

      const result = FUNCTIONS[name](input);

      if (
        ["asin", "acos", "atan"].includes(name) &&
        this.angleMode === "DEG"
      ) {
        return result * 180 / Math.PI;
      }

      return result;
    }

    throw new Error("Élément inconnu : " + token);
  }
}

export function evaluateExpression(expression, angleMode = "DEG") {
  const source = String(expression)
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt")
    .replaceAll("∛", "cbrt")
    .replace(/\s+/g, "");

  if (!source || source.length > 250) {
    throw new Error("Expression vide ou trop longue");
  }

  if (!/^[0-9a-zA-Z.+\-*/^!,%()]*$/.test(source)) {
    throw new Error("Caractère non autorisé");
  }

  return new Parser(source, angleMode).parse();
}

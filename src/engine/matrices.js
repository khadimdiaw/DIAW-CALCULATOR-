function validateMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error("Matrice vide ou invalide.");
  }

  const columns = matrix[0].length;

  if (!columns || !matrix.every(row =>
    Array.isArray(row) &&
    row.length === columns &&
    row.every(value => Number.isFinite(Number(value)))
  )) {
    throw new Error("Les dimensions ou les valeurs de la matrice sont invalides.");
  }

  return { rows: matrix.length, columns };
}

function cloneMatrix(matrix) {
  validateMatrix(matrix);
  return matrix.map(row => row.map(Number));
}

export function addMatrices(A, B) {
  const a = validateMatrix(A);
  const b = validateMatrix(B);

  if (a.rows !== b.rows || a.columns !== b.columns) {
    throw new Error("Les matrices doivent avoir les mêmes dimensions.");
  }

  return A.map((row, i) =>
    row.map((value, j) => Number(value) + Number(B[i][j]))
  );
}

export function subtractMatrices(A, B) {
  const a = validateMatrix(A);
  const b = validateMatrix(B);

  if (a.rows !== b.rows || a.columns !== b.columns) {
    throw new Error("Les matrices doivent avoir les mêmes dimensions.");
  }

  return A.map((row, i) =>
    row.map((value, j) => Number(value) - Number(B[i][j]))
  );
}

export function multiplyMatrices(A, B) {
  const a = validateMatrix(A);
  const b = validateMatrix(B);

  if (a.columns !== b.rows) {
    throw new Error("Le nombre de colonnes de A doit égaler le nombre de lignes de B.");
  }

  return A.map(row =>
    B[0].map((_, j) =>
      row.reduce((sum, value, k) =>
        sum + Number(value) * Number(B[k][j]), 0
      )
    )
  );
}

export function determinant(matrix) {
  const A = cloneMatrix(matrix);
  const { rows, columns } = validateMatrix(A);

  if (rows !== columns) {
    throw new Error("Le déterminant exige une matrice carrée.");
  }

  let det = 1;

  for (let i = 0; i < rows; i++) {
    let pivot = i;

    for (let j = i + 1; j < rows; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[pivot][i])) {
        pivot = j;
      }
    }

    if (Math.abs(A[pivot][i]) < 1e-12) return 0;

    if (pivot !== i) {
      [A[i], A[pivot]] = [A[pivot], A[i]];
      det *= -1;
    }

    const pivotValue = A[i][i];
    det *= pivotValue;

    for (let j = i + 1; j < rows; j++) {
      const factor = A[j][i] / pivotValue;

      for (let k = i + 1; k < rows; k++) {
        A[j][k] -= factor * A[i][k];
      }
    }
  }

  return Math.abs(det) < 1e-10 ? 0 : det;
}

export function inverseMatrix(matrix) {
  const A = cloneMatrix(matrix);
  const { rows, columns } = validateMatrix(A);

  if (rows !== columns) {
    throw new Error("L'inverse exige une matrice carrée.");
  }

  const n = rows;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  );

  for (let i = 0; i < n; i++) {
    let pivot = i;

    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[pivot][i])) {
        pivot = j;
      }
    }

    if (Math.abs(A[pivot][i]) < 1e-12) {
      throw new Error("Cette matrice est singulière : elle n'a pas d'inverse.");
    }

    [A[i], A[pivot]] = [A[pivot], A[i]];
    [identity[i], identity[pivot]] = [identity[pivot], identity[i]];

    const divisor = A[i][i];

    for (let j = 0; j < n; j++) {
      A[i][j] /= divisor;
      identity[i][j] /= divisor;
    }

    for (let k = 0; k < n; k++) {
      if (k === i) continue;

      const factor = A[k][i];

      for (let j = 0; j < n; j++) {
        A[k][j] -= factor * A[i][j];
        identity[k][j] -= factor * identity[i][j];
      }
    }
  }

  return identity;
}

export function solveLinearSystem(A, b) {
  const matrix = cloneMatrix(A);
  const { rows, columns } = validateMatrix(matrix);

  if (rows !== columns || !Array.isArray(b) || b.length !== rows) {
    throw new Error("Dimensions incompatibles pour le système linéaire.");
  }

  if (!b.every(value => Number.isFinite(Number(value)))) {
    throw new Error("Le vecteur des constantes est invalide.");
  }

  const n = rows;
  const rhs = b.map(Number);

  for (let i = 0; i < n; i++) {
    let pivot = i;

    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivot][i])) {
        pivot = j;
      }
    }

    if (Math.abs(matrix[pivot][i]) < 1e-12) {
      throw new Error("Système singulier ou sans solution unique.");
    }

    [matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]];
    [rhs[i], rhs[pivot]] = [rhs[pivot], rhs[i]];

    for (let j = i + 1; j < n; j++) {
      const factor = matrix[j][i] / matrix[i][i];

      for (let k = i; k < n; k++) {
        matrix[j][k] -= factor * matrix[i][k];
      }

      rhs[j] -= factor * rhs[i];
    }
  }

  const solution = Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let sum = rhs[i];

    for (let j = i + 1; j < n; j++) {
      sum -= matrix[i][j] * solution[j];
    }

    solution[i] = sum / matrix[i][i];
  }

  return solution;
}

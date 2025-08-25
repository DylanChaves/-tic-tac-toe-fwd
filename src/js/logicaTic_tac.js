// ====== Referencias del DOM ======
const cellElements = Array.from(document.getElementsByClassName("casilla"));
const boardElement = document.getElementById("tablero");
const messageElement = document.getElementById("mensaje");
const resetButton = document.getElementById("reiniciarBtn");
const turnLabel = document.getElementById("turnoTexto");

const modeSelect = document.getElementById("modo");
const difficultySelect = document.getElementById("dificultad");
const firstPlayerSelect = document.getElementById("quienEmpieza");
const difficultyWrap = document.getElementById("wrapDificultad");
const firstPlayerWrap = document.getElementById("wrapQuienEmpieza");

// ====== Marcador ======
const scoreXElement = document.getElementById("puntosX");
const scoreOElement = document.getElementById("puntosO");
const scoreDrawElement = document.getElementById("puntosEmpate");
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// ====== Estado del juego ======
let currentPlayer = "X";
let isGameActive = true;
let gameMode = modeSelect ? modeSelect.value : "cpu";          // "cpu" | "pvp"
let difficulty = difficultySelect ? difficultySelect.value : "normal"; // "facil" | "normal"
let winningCombo = null;

// Todas las combinaciones posibles de victoria (índices de casillas)
const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8], // filas
  [0,3,6],[1,4,7],[2,5,8], // columnas
  [0,4,8],[2,4,6]          // diagonales
];

// ====== Listeners de UI ======
if (modeSelect) {
  modeSelect.addEventListener("change", () => {
    gameMode = modeSelect.value;

    // Mostrar u ocultar opciones de CPU
    difficultyWrap.style.display = gameMode === "cpu" ? "inline-flex" : "none";
    firstPlayerWrap.style.display = gameMode === "cpu" ? "inline-flex" : "none";

    // Reiniciar marcador cuando cambias de modo 
    resetScoreboard();

    // Reiniciar partida
    resetGame();
  });
}

if (difficultySelect) {
  difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
    resetGame();
  });
}

if (firstPlayerSelect) {
  firstPlayerSelect.addEventListener("change", resetGame);
}

// Click en casillas
cellElements.forEach(cellEl => {
  cellEl.addEventListener("click", () => {
    // Ignorar si terminó el juego o la casilla ya está ocupada
    if (!isGameActive || cellEl.classList.contains("ocupada")) return;

    if (gameMode === "cpu") {
      // En CPU solo juega el humano (X) con clicks
      if (currentPlayer !== "X") return;

      playTurn(cellEl, "X");

      // Si sigue activo, turno de la máquina
      if (isGameActive) setTimeout(cpuTurn, 500);
    } else {
      // PvP: alternan X y O
      playTurn(cellEl, currentPlayer);
    }
  });
});

// ====== Lógica de juego ======
function playTurn(cellEl, playerSymbol) {
  cellEl.textContent = playerSymbol;
  cellEl.classList.add("ocupada");

  if (checkWinner(playerSymbol)) {
    messageElement.textContent = `¡El jugador ${playerSymbol} ha ganado! 🎉`;
    isGameActive = false;
    highlightWinningLine();
    updateScore(playerSymbol);
    return;
  }
// utilize este metodo para validar los array para ver si todas las casillas estan llenas y no hay un ganador
  if (isDraw()) {
    messageElement.textContent = "¡Empate!";
    isGameActive = false;
    updateScore("Empate");
    return;
  }

  currentPlayer = playerSymbol === "X" ? "O" : "X";
  turnLabel.textContent = `Turno de: ${currentPlayer}`;
}

function cpuTurn() {
  if (!isGameActive) return;

  let targetIndex;
  if (difficulty === "facil") {
    const freeCells = getFreeCells();
    targetIndex = freeCells[Math.floor(Math.random() * freeCells.length)];
  } else {
    targetIndex = normalStrategy();
  }
  playTurn(cellElements[targetIndex], "O");
}

// Heurística “normal”: gana > bloquea > centro > esquinas > lados
function normalStrategy() {
  const winIndex = findWinningMove("O");
  if (winIndex !== -1) return winIndex;

  const blockIndex = findWinningMove("X");
  if (blockIndex !== -1) return blockIndex;

  // Centro
  if (!cellElements[4].classList.contains("ocupada")) return 4;

  // Esquinas
  const cornerIndices = [0, 2, 6, 8].filter(i => !cellElements[i].classList.contains("ocupada"));
  if (cornerIndices.length) return cornerIndices[Math.floor(Math.random() * cornerIndices.length)];

  // Lados
  const sideIndices = [1, 3, 5, 7].filter(i => !cellElements[i].classList.contains("ocupada"));
  return sideIndices[Math.floor(Math.random() * sideIndices.length)];
}

function findWinningMove(playerSymbol) {
  for (const [indexA, indexB, indexC] of winningCombos) {
    const values = [
      cellElements[indexA].textContent,
      cellElements[indexB].textContent,
      cellElements[indexC].textContent
    ];
    const occupied = [
      cellElements[indexA].classList.contains("ocupada"),
      cellElements[indexB].classList.contains("ocupada"),
      cellElements[indexC].classList.contains("ocupada")
    ];

    const playerCount = values.filter(v => v === playerSymbol).length;
    if (playerCount === 2) {
      const isAFreeAndRestPlayer = !occupied[0] && values[1] === playerSymbol && values[2] === playerSymbol;
      if (isAFreeAndRestPlayer) return indexA;

      const isBFreeAndRestPlayer = !occupied[1] && values[0] === playerSymbol && values[2] === playerSymbol;
      if (isBFreeAndRestPlayer) return indexB;

      const isCFreeAndRestPlayer = !occupied[2] && values[0] === playerSymbol && values[1] === playerSymbol;
      if (isCFreeAndRestPlayer) return indexC;
    }
  }
  return -1;
}

function getFreeCells() {
  const freeIndices = [];
  for (let i = 0; i < cellElements.length; i++) {
    if (!cellElements[i].classList.contains("ocupada")) freeIndices.push(i);
  }
  return freeIndices;
}

function checkWinner(playerSymbol) {
  for (const [indexA, indexB, indexC] of winningCombos) {
    const isLine =
      cellElements[indexA].textContent === playerSymbol &&
      cellElements[indexB].textContent === playerSymbol &&
      cellElements[indexC].textContent === playerSymbol;

    if (isLine) {
      winningCombo = [indexA, indexB, indexC];
      return true;
    }
  }
  return false;
}

function highlightWinningLine() {
  if (!winningCombo) return;
  const [indexA, indexB, indexC] = winningCombo;
  [indexA, indexB, indexC].forEach(idx => cellElements[idx].classList.add("ganadora"));
}

function isDraw() {
  return cellElements.every(cellEl => cellEl.textContent !== "");
}

function resetGame() {
  cellElements.forEach(cellEl => {
    cellEl.textContent = "";
    cellEl.classList.remove("ocupada", "ganadora");
  });

  messageElement.textContent = "";
  isGameActive = true;
  winningCombo = null;

  if (gameMode === "cpu") {
    currentPlayer = (firstPlayerSelect && firstPlayerSelect.value === "O") ? "O" : "X";
    turnLabel.textContent = `Turno de: ${currentPlayer}`;
    if (currentPlayer === "O") setTimeout(cpuTurn, 400);
  } else {
    currentPlayer = "X";
    turnLabel.textContent = `Turno de: ${currentPlayer}`;
  }
}

function updateScore(result) {
  if (result === "X") {
    scoreX++;
    scoreXElement.textContent = scoreX;
  } else if (result === "O") {
    scoreO++;
    scoreOElement.textContent = scoreO;
  } else if (result === "Empate") {
    scoreDraw++;
    scoreDrawElement.textContent = scoreDraw;
  }
}

function resetScoreboard() {
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  scoreXElement.textContent = 0;
  scoreOElement.textContent = 0;
  scoreDrawElement.textContent = 0;
}

// ====== Inicialización ======
resetButton.addEventListener("click", resetGame);
difficultyWrap.style.display = gameMode === "cpu" ? "inline-flex" : "none";
firstPlayerWrap.style.display = gameMode === "cpu" ? "inline-flex" : "none";
resetGame();
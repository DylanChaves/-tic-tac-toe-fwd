const casillas = Array.from(document.getElementsByClassName("casilla"));
const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const botonReiniciar = document.getElementById("reiniciarBtn");
const turnoTexto = document.getElementById("turnoTexto");

const modoSelect = document.getElementById("modo");
const dificultadSelect = document.getElementById("dificultad");
const quienEmpiezaSelect = document.getElementById("quienEmpieza");
const wrapDificultad = document.getElementById("wrapDificultad");
const wrapQuienEmpieza = document.getElementById("wrapQuienEmpieza");

// Marcador
const puntosXEl = document.getElementById("puntosX");
const puntosOEl = document.getElementById("puntosO");
const puntosEmpateEl = document.getElementById("puntosEmpate");
let puntosX = 0, puntosO = 0, puntosEmpate = 0;

let jugadorActual = "X";
let juegoActivo = true;
let modo = modoSelect ? modoSelect.value : "cpu";
let dificultad = dificultadSelect ? dificultadSelect.value : "normal";
let comboGanadora = null;

const combinacionesGanadoras = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Listeners de UI
if (modoSelect) {
  modoSelect.addEventListener("change", () => {
    modo = modoSelect.value;
    wrapDificultad.style.display = modo === "cpu" ? "inline-flex" : "none";
    wrapQuienEmpieza.style.display = modo === "cpu" ? "inline-flex" : "none";
    reiniciar();
  });
}
if (dificultadSelect) {
  dificultadSelect.addEventListener("change", () => {
    dificultad = dificultadSelect.value;
    reiniciar();
  });
}
if (quienEmpiezaSelect) {
  quienEmpiezaSelect.addEventListener("change", reiniciar);
}

// Click en casillas
casillas.forEach(casilla => {
  casilla.addEventListener("click", () => {
    if (!juegoActivo || casilla.classList.contains("ocupada")) return;

    if (modo === "cpu") {
      if (jugadorActual !== "X") return;
      jugarTurno(casilla, "X");
      if (juegoActivo) setTimeout(turnoMaquina, 500);
    } else {
      jugarTurno(casilla, jugadorActual);
    }
  });
});

function jugarTurno(casilla, jugador) {
  casilla.textContent = jugador;
  casilla.classList.add("ocupada");

  if (verificarGanador(jugador)) {
    mensaje.textContent = `¡El jugador ${jugador} ha ganado! 🎉`;
    juegoActivo = false;
    resaltarLineaGanadora();
    actualizarMarcador(jugador);
    return;
  }

  if (esEmpate()) {
    mensaje.textContent = "¡Empate!";
    juegoActivo = false;
    actualizarMarcador("Empate");
    return;
  }

  jugadorActual = jugador === "X" ? "O" : "X";
  turnoTexto.textContent = `Turno de: ${jugadorActual}`;
}

function turnoMaquina() {
  if (!juegoActivo) return;

  let indice;
  if (dificultad === "facil") {
    const libres = obtenerCasillasLibres();
    indice = libres[Math.floor(Math.random() * libres.length)];
  } else {
    indice = estrategiaNormal();
  }
  jugarTurno(casillas[indice], "O");
}

function estrategiaNormal() {
  const ganar = encontrarJugadaGanadora("O");
  if (ganar !== -1) return ganar;

  const bloquear = encontrarJugadaGanadora("X");
  if (bloquear !== -1) return bloquear;

  if (!casillas[4].classList.contains("ocupada")) return 4;

  const esquinas = [0,2,6,8].filter(i => !casillas[i].classList.contains("ocupada"));
  if (esquinas.length) return esquinas[Math.floor(Math.random() * esquinas.length)];

  const lados = [1,3,5,7].filter(i => !casillas[i].classList.contains("ocupada"));
  return lados[Math.floor(Math.random() * lados.length)];
}

function encontrarJugadaGanadora(jugador) {
  for (let combo of combinacionesGanadoras) {
    const [a,b,c] = combo;
    const v = [casillas[a].textContent, casillas[b].textContent, casillas[c].textContent];
    const o = [casillas[a], casillas[b], casillas[c]].map(el => el.classList.contains("ocupada"));
    const count = v.filter(x => x === jugador).length;
    if (count === 2) {
      if (!o[0] && v[1] === jugador && v[2] === jugador) return a;
      if (!o[1] && v[0] === jugador && v[2] === jugador) return b;
      if (!o[2] && v[0] === jugador && v[1] === jugador) return c;
    }
  }
  return -1;
}

function obtenerCasillasLibres() {
  const libres = [];
  for (let i = 0; i < casillas.length; i++) {
    if (!casillas[i].classList.contains("ocupada")) libres.push(i);
  }
  return libres;
}

function verificarGanador(jugador) {
  for (let [jugadaA,jugadaB,jugadaC] of combinacionesGanadoras) {
    if (
      casillas[jugadaA].textContent === jugador &&
      casillas[jugadaB].textContent === jugador &&
      casillas[jugadaC].textContent === jugador
    ) {
      comboGanadora = [jugadaA, jugadaB, jugadaC]; // <<< guardar aquí
      return true;
    }
  }
  return false;
}

function resaltarLineaGanadora() {
  if (!comboGanadora) return;
  const [a,b,c] = comboGanadora;
  [a,b,c].forEach(i => casillas[i].classList.add("ganadora"));
}

function esEmpate() {
  return casillas.every(c => c.textContent !== "");
}

function reiniciar() {
  casillas.forEach(casilla => {
    casilla.textContent = "";
    casilla.classList.remove("ocupada", "ganadora");
  });
  mensaje.textContent = "";
  juegoActivo = true;
  comboGanadora = null; // <<< importante

  if (modo === "cpu") {
    jugadorActual = (quienEmpiezaSelect && quienEmpiezaSelect.value === "O") ? "O" : "X";
    turnoTexto.textContent = `Turno de: ${jugadorActual}`;
    if (jugadorActual === "O") setTimeout(turnoMaquina, 400);
  } else {
    jugadorActual = "X";
    turnoTexto.textContent = `Turno de: ${jugadorActual}`;
  }
}

function actualizarMarcador(resultado) {
  if (resultado === "X") {
    puntosX++;
    puntosXEl.textContent = puntosX;
  } else if (resultado === "O") {
    puntosO++;
    puntosOEl.textContent = puntosO;
  } else if (resultado === "Empate") {
    puntosEmpate++;
    puntosEmpateEl.textContent = puntosEmpate;
  }
}

botonReiniciar.addEventListener("click", reiniciar);
function resetMarcador() {
  puntosX = puntosO = puntosEmpate = 0;
  puntosXEl.textContent = 0;
  puntosOEl.textContent = 0;
  puntosEmpateEl.textContent = 0;
}

// Si quieres resetear cuando cambie el modo:
modoSelect.addEventListener("change", () => {
  modo = modoSelect.value;
  wrapDificultad.style.display = modo === "cpu" ? "inline-flex" : "none";
  wrapQuienEmpieza.style.display = modo === "cpu" ? "inline-flex" : "none";
  resetMarcador(); // << reset aquí si lo deseas
  reiniciar();
});
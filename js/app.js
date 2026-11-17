// 1. ESTADO DEL JUEGO
let bancoPreguntas = {};
let mensajesPorNivel = {
  1: [
    "¡Toca practicar un poquito más! Por ahora el diseño te está diseñando a vos.",
    "Vas agarrando la onda, pero todavía hay varios conceptos que necesitan cariño.",
    "¡Muy bien! Ya tenés una buena base. Seguí practicando para pulir el ojo.",
    "¡Excelente! Tenés muy buen ojo para este nivel. ¡A seguir creando!"
  ],
  2: [
    "Hay que volver a los apuntes. La inspiración ayuda, pero no reemplaza estudiar.",
    "Se nota que has visto los temas, pero todavía te falta conectar la teoría con la práctica.",
    "Buen trabajo. Tenés una base sólida; ahora toca afinar criterio y ejecución.",
    "¡Impecable! Dominás muy bien estos fundamentos. Seguí subiendo el nivel."
  ],
  3: [
    "Eso no fue una evaluación de diseño, fue una solicitud de auxilio. Repasá lo básico antes de cobrar por esto.",
    "El entusiasmo está, el criterio todavía está en período de prueba. A estudiar y practicar.",
    "Buen resultado. Ya resolvés bastante, pero todavía hay detalles que separan lo correcto de lo profesional.",
    "¡Excelente trabajo! Tenés criterio y dominio para este nivel. Que se note también en tus entregas."
  ],
  4: [
    "¿Senior de qué, exactamente? Con ese resultado no dirigís ni el cursor. Bajate del pedestal y volvé a estudiar.",
    "Mucho título y poco fundamento. Antes de dar cátedra, asegurate de dominar lo que estás defendiendo.",
    "No está mal, pero para alguien que se hace llamar Senior, esos huecos de conocimiento no deberían estar ahí.",
    "Ahora sí. Criterio, dominio y consistencia. Te ganaste el título en esta prueba; no lo arruinés en la práctica."
  ]
};

let dificultadActual = "1";
let nivelSeleccionado = "Aficionado";
let preguntasActivas = [];
let indiceActual = 0;
let puntaje = 0;
let audioEnCurso = null;
let temporizadorAvance = null;

async function cargarQuizDesdeJson() {
  try {
    const respuesta = await fetch('./js/questions.json', { cache: 'no-store' });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const data = await respuesta.json();

    if (!data || !Array.isArray(data.niveles)) {
      throw new Error('Formato de JSON inválido');
    }

    bancoPreguntas = {};
    data.niveles.forEach((nivel) => {
      bancoPreguntas[String(nivel.id)] = nivel.preguntas;
    });

    mensajesPorNivel = data.mensajes || mensajesPorNivel;
    console.log('Quiz cargado desde JSON correctamente.');
  } catch (error) {
    console.error('No se pudo cargar questions.json:', error);
    alert('No se pudo cargar la base de preguntas. Verifica que el archivo js/questions.json exista y que la app se esté sirviendo por un servidor (GitHub Pages, Live Server, etc.).');
  }
}

// 2. NAVEGACIÓN ENTRE PANTALLAS
function mostrarPantalla(idPantalla) {
  detenerAudioActual();
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(idPantalla).classList.add('activa');
}

function detenerAudioActual() {
  if (temporizadorAvance) {
    clearTimeout(temporizadorAvance);
    temporizadorAvance = null;
  }

  if (audioEnCurso) {
    audioEnCurso.pause();
    audioEnCurso.currentTime = 0;
    audioEnCurso = null;
  }
  document.getElementById('estado-audio').classList.add('oculto');
}

// 3. SELECCIÓN DE DIFICULTAD E INICIO
document.getElementById('btn-iniciar').addEventListener('click', () => {
  mostrarPantalla('pantalla-nivel');
});

document.getElementById('btn-volver-desde-nivel').addEventListener('click', () => {
  mostrarPantalla('pantalla-menu');
});

document.querySelectorAll('.btn-nivel').forEach((boton) => {
  boton.addEventListener('click', async () => {
    dificultadActual = boton.getAttribute('data-dificultad');
    nivelSeleccionado = boton.getAttribute('data-nivel');
    await comenzarCuestionario();
  });
});

async function comenzarCuestionario() {
  if (!bancoPreguntas[dificultadActual]) {
    await cargarQuizDesdeJson();
  }

  if (!bancoPreguntas[dificultadActual]) {
    return;
  }

  indiceActual = 0;
  puntaje = 0;
  preguntasActivas = bancoPreguntas[dificultadActual];
  document.getElementById('etiqueta-nivel').textContent = `${nivelSeleccionado} (D${dificultadActual})`;
  mostrarPantalla('pantalla-juego');
  cargarPregunta();
}

// 4. CARGAR PREGUNTA Y OPCIONES
function cargarPregunta() {
  detenerAudioActual();

  if (!preguntasActivas || !preguntasActivas[indiceActual]) {
    return;
  }

  const actual = preguntasActivas[indiceActual];

  document.getElementById('contador-pregunta').textContent = `${indiceActual + 1} / ${preguntasActivas.length}`;
  document.getElementById('puntaje-actual').textContent = `Aciertos: ${puntaje}`;
  document.getElementById('texto-pregunta').textContent = actual.pregunta;

  const contenedor = document.getElementById('contenedor-opciones');
  contenedor.innerHTML = '';

  actual.opciones.forEach((opcion, index) => {
    const boton = document.createElement('button');
    boton.className = 'opcion-btn';
    boton.textContent = opcion;
    boton.addEventListener('click', () => verificarRespuesta(index, boton));
    contenedor.appendChild(boton);
  });
}

// 5. VERIFICAR RESPUESTA Y DISPARAR AUDIO
function verificarRespuesta(indiceSeleccionado, botonPresionado) {
  const actual = preguntasActivas[indiceActual];
  const todosLosBotones = document.querySelectorAll('.opcion-btn');
  todosLosBotones.forEach(btn => btn.disabled = true);

  const numPregunta = indiceActual + 1;
  const numOpcion = indiceSeleccionado + 1;
  const esCorrecta = indiceSeleccionado === actual.correcta;

  let rutaAudio = '';

  if (esCorrecta) {
    botonPresionado.classList.add('correcta');
    puntaje++;
    rutaAudio = `assets/audio/d${dificultadActual}_p${numPregunta}_v.mp3`;
  } else {
    botonPresionado.classList.add('incorrecta');
    todosLosBotones[actual.correcta].classList.add('correcta');
    rutaAudio = `assets/audio/d${dificultadActual}_p${numPregunta}_f${numOpcion}.mp3`;
  }

  reproducirYAvanzar(rutaAudio);
}

function reproducirYAvanzar(ruta) {
  const indicador = document.getElementById('estado-audio');
  const audio = new Audio(ruta);
  audioEnCurso = audio;
  let avanceCompletado = false;

  const avanzar = () => {
    if (avanceCompletado || audioEnCurso !== audio) {
      return;
    }

    avanceCompletado = true;
    if (temporizadorAvance) {
      clearTimeout(temporizadorAvance);
      temporizadorAvance = null;
    }

    indicador.classList.add('oculto');
    audioEnCurso = null;
    indiceActual++;

    if (indiceActual < preguntasActivas.length) {
      cargarPregunta();
    } else {
      finalizarJuego();
    }
  };

  const avanzarConRetraso = () => {
    if (avanceCompletado || audioEnCurso !== audio || temporizadorAvance) {
      return;
    }

    temporizadorAvance = setTimeout(avanzar, 1800);
  };

  audio.addEventListener('ended', avanzar);
  audio.addEventListener('error', avanzarConRetraso);

  audio.play()
    .then(() => {
      indicador.classList.remove('oculto');
    })
    .catch(avanzarConRetraso);
}

// 6. PANTALLA FINAL ADAPTADA A LA DIFICULTAD
function finalizarJuego() {
  mostrarPantalla('pantalla-final');
  document.getElementById('badge-final').textContent = `NIVEL: ${nivelSeleccionado.toUpperCase()}`;
  document.getElementById('puntaje-final').textContent = `${puntaje} / ${preguntasActivas.length}`;

  const mensajesPorRango = mensajesPorNivel[dificultadActual] || mensajesPorNivel[1];
  let mensaje = mensajesPorRango[0];

  const rangos = [
    { min: 0, max: 4 },
    { min: 5, max: 9 },
    { min: 10, max: 14 },
    { min: 15, max: 15 }
  ];

  for (let i = 0; i < rangos.length; i++) {
    const rango = rangos[i];
    if (puntaje >= rango.min && puntaje <= rango.max) {
      mensaje = mensajesPorRango[i] || mensajesPorRango[0];
      break;
    }
  }

  document.getElementById('mensaje-rango').textContent = mensaje;
}

// 7. BOTONES SECUNDARIOS Y MODAL
document.getElementById('btn-reiniciar').addEventListener('click', async () => {
  await comenzarCuestionario();
});

document.getElementById('btn-inicio-final').addEventListener('click', () => mostrarPantalla('pantalla-menu'));
document.getElementById('btn-volver-menu').addEventListener('click', () => mostrarPantalla('pantalla-menu'));
document.getElementById('btn-salir').addEventListener('click', () => mostrarPantalla('pantalla-salida'));
document.getElementById('btn-regresar-salida').addEventListener('click', () => mostrarPantalla('pantalla-menu'));

const modalDev = document.getElementById('modal-dev');
const formDev = document.getElementById('form-dev');
const textoExito = document.getElementById('confirmacion-envio');

document.getElementById('btn-dev').addEventListener('click', () => {
  textoExito.classList.add('oculto');
  formDev.reset();
  modalDev.classList.add('abierto');
});

document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
  modalDev.classList.remove('abierto');
});

formDev.addEventListener('submit', (e) => {
  e.preventDefault();
  textoExito.classList.remove('oculto');
  setTimeout(() => modalDev.classList.remove('abierto'), 1200);
});

// Carga inicial del JSON para GitHub Pages / hosting estático
cargarQuizDesdeJson();

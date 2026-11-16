// 1. BANCO DE PREGUNTAS POR DIFICULTAD (d1 = Aficionado ... d4 = Diseñador Sr)
const bancoPreguntas = {
  1: [ // d1: AFICIONADO (Conceptos básicos)
    {
      pregunta: "¿Qué combinación de colores forma el verde en pintura tradicional?",
      opciones: ["Rojo y Azul", "Amarillo y Azul", "Rojo y Amarillo", "Blanco y Negro"],
      correcta: 1 // d1_p1_v.mp3 | Falsas: d1_p1_f1.mp3, d1_p1_f3.mp3, d1_p1_f4.mp3
    },
    {
      pregunta: "¿Qué significan las siglas RGB?",
      opciones: ["Rojo, Gris, Blanco", "Red, Green, Blue", "Real Graphic Base", "Resolución General Básica"],
      correcta: 1 // d1_p2_v.mp3
    },
    {
      pregunta: "¿Qué herramienta básica sirve para recortar el encuadre de una imagen?",
      opciones: ["Cuentagotas", "Recortar (Crop)", "Tampón de clonar", "Pluma"],
      correcta: 1 // d1_p3_v.mp3
    }
  ],

  2: [ // d2: ESTUDIANTE (Fundamentos académicos y formatos)
    {
      pregunta: "¿Cuál es la resolución estándar mínima recomendada para impresión de alta calidad?",
      opciones: ["72 dpi", "96 dpi", "300 dpi", "150 dpi"],
      correcta: 2 // d2_p1_v.mp3
    },
    {
      pregunta: "¿Qué perfil de color debes configurar antes de mandar un archivo a imprenta offset?",
      opciones: ["sRGB", "CMYK", "HEX", "HSL"],
      correcta: 1 // d2_p2_v.mp3
    },
    {
      pregunta: "¿Cómo se llama el espacio entre líneas de texto en un párrafo?",
      opciones: ["Kerning", "Tracking", "Leading (Interlineado)", "Sangría"],
      correcta: 2 // d2_p3_v.mp3
    }
  ],

  3: [ // d3: DISEÑADOR JR (Producción, tipografía y criterio técnico)
    {
      pregunta: "¿Cuál es la diferencia técnica entre Kerning y Tracking?",
      opciones: [
        "Son exactamente lo mismo",
        "Kerning ajusta pares específicos; Tracking el bloque completo",
        "Tracking es vertical y Kerning es horizontal",
        "Kerning solo aplica a fuentes Serif"
      ],
      correcta: 1 // d3_p1_v.mp3
    },
    {
      pregunta: "¿Para qué sirve dejar 'sangrado' (bleed) de 3 a 5 mm en un arte para corte?",
      opciones: [
        "Para que pese menos el PDF",
        "Para evitar filos blancos si la guillotina se desplaza al cortar",
        "Para marcar dónde va el doblez",
        "Para calibrar la densidad de tinta negra"
      ],
      correcta: 1 // d3_p2_v.mp3
    },
    {
      pregunta: "¿Por qué nunca se debe entregar un logotipo principal únicamente en formato JPG?",
      opciones: [
        "Porque JPG no soporta colores CMYK",
        "Porque usa compresión con pérdida y no es escalable sin pixelarse",
        "Porque solo abre en Windows",
        "Porque pesa demasiado para enviarlo por correo"
      ],
      correcta: 1 // d3_p3_v.mp3
    }
  ],

  4: [ // d4: DISEÑADOR SR (Preprensa avanzada, teoría profunda y gestión)
    {
      pregunta: "En preprensa offset, ¿qué problema ocurre si usas negro enriquecido (C60 M50 Y50 K100) en textos pequeños de 7 pt?",
      opciones: [
        "El papel se rompe por exceso de humedad",
        "Un mínimo desregistro de planchas crea halos de color ilegibles alrededor de la letra",
        "El RIP convierte automáticamente el texto a escala de grises",
        "La tinta negra pierde brillo al secarse"
      ],
      correcta: 1 // d4_p1_v.mp3
    },
    {
      pregunta: "¿Qué es el 'Overprint' (Sobreimpresión) y cuál es el error fatal más común al dejarlo activo por accidente?",
      opciones: [
        "Imprimir dos veces la misma hoja; duplica el costo",
        "Mezclar tintas sin calar el fondo; un texto blanco en overprint desaparece al imprimirse",
        "Aumentar la lineatura de trama; empasta las sombras",
        "Forzar tintas Pantone a cuatricromía; altera el tono"
      ],
      correcta: 1 // d4_p2_v.mp3
    },
    {
      pregunta: "¿Cuál es el límite máximo habitual de cobertura total de tinta (TAC / Ink Limit) en papel estucado para evitar repinte?",
      opciones: ["100% - 150%", "200% - 220%", "300% - 320%", "400% exacto"],
      correcta: 2 // d4_p3_v.mp3
    }
  ]
};

// 2. ESTADO DEL JUEGO
let dificultadActual = "1";
let nivelSeleccionado = "Aficionado";
let preguntasActivas = [];
let indiceActual = 0;
let puntaje = 0;
let audioEnCurso = null;

// 3. NAVEGACIÓN ENTRE PANTALLAS
function mostrarPantalla(idPantalla) {
  detenerAudioActual();
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(idPantalla).classList.add('activa');
}

function detenerAudioActual() {
  if (audioEnCurso) {
    audioEnCurso.pause();
    audioEnCurso.currentTime = 0;
    audioEnCurso = null;
  }
  document.getElementById('estado-audio').classList.add('oculto');
}

// 4. SELECCIÓN DE DIFICULTAD E INICIO
document.getElementById('btn-iniciar').addEventListener('click', () => {
  mostrarPantalla('pantalla-nivel');
});

document.getElementById('btn-volver-desde-nivel').addEventListener('click', () => {
  mostrarPantalla('pantalla-menu');
});

document.querySelectorAll('.btn-nivel').forEach(boton => {
  boton.addEventListener('click', () => {
    dificultadActual = boton.getAttribute('data-dificultad'); // "1", "2", "3" o "4"
    nivelSeleccionado = boton.getAttribute('data-nivel');
    comenzarCuestionario();
  });
});

function comenzarCuestionario() {
  indiceActual = 0;
  puntaje = 0;
  preguntasActivas = bancoPreguntas[dificultadActual];
  document.getElementById('etiqueta-nivel').textContent = `${nivelSeleccionado} (D${dificultadActual})`;
  mostrarPantalla('pantalla-juego');
  cargarPregunta();
}

// 5. CARGAR PREGUNTA Y OPCIONES
function cargarPregunta() {
  detenerAudioActual();
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

// 6. VERIFICAR RESPUESTA Y DISPARAR AUDIO: d{D}_p{P}_f{O}.mp3 o d{D}_p{P}_v.mp3
function verificarRespuesta(indiceSeleccionado, botonPresionado) {
  const actual = preguntasActivas[indiceActual];
  const todosLosBotones = document.querySelectorAll('.opcion-btn');
  todosLosBotones.forEach(btn => btn.disabled = true);

  const numPregunta = indiceActual + 1;       // 1, 2, 3...
  const numOpcion = indiceSeleccionado + 1;   // 1, 2, 3, 4
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

// Reproduce el audio completo antes de pasar a la siguiente pregunta
function reproducirYAvanzar(ruta) {
  const indicador = document.getElementById('estado-audio');
  audioEnCurso = new Audio(ruta);

  const avanzar = () => {
    indicador.classList.add('oculto');
    indiceActual++;
    if (indiceActual < preguntasActivas.length) {
      cargarPregunta();
    } else {
      finalizarJuego();
    }
  };

  audioEnCurso.addEventListener('ended', avanzar);

  // Si aún no has grabado ese archivo específico, avanza tras 1.8s sin bloquear el juego
  audioEnCurso.addEventListener('error', () => {
    setTimeout(avanzar, 1800);
  });

  audioEnCurso.play()
    .then(() => {
      indicador.classList.remove('oculto');
    })
    .catch(() => {
      setTimeout(avanzar, 1800);
    });
}

// 7. PANTALLA FINAL ADAPTADA A LA DIFICULTAD
function finalizarJuego() {
  mostrarPantalla('pantalla-final');
  document.getElementById('badge-final').textContent = `NIVEL: ${nivelSeleccionado.toUpperCase()}`;
  document.getElementById('puntaje-final').textContent = `${puntaje} / ${preguntasActivas.length}`;

  const total = preguntasActivas.length;
  let mensaje = "";

  if (dificultadActual === "1") {
    mensaje = puntaje === total
      ? "¡Excelente comienzo! Tienes muy buen ojo para empezar."
      : "¡No te desanimes! Todos empezamos desde cero, sigue practicando.";
  } else if (dificultadActual === "2") {
    mensaje = puntaje === total
      ? "Pasaste la materia sin problemas. Vas por buen camino."
      : "Te faltó estudiar un poco más antes del examen.";
  } else if (dificultadActual === "3") {
    mensaje = puntaje === total
      ? "Bien hecho, ya no te regañan tanto en preprensa."
      : "Todavía cometes errores de novato, toca revisar archivos antes de enviar.";
  } else {
    mensaje = puntaje === total
      ? "Por fin alguien que sí merece cobrar como Senior."
      : "¿Y así te atreves a llamarte Diseñador Sr? Qué vergüenza ajena.";
  }

  document.getElementById('mensaje-rango').textContent = mensaje;
}

// 8. BOTONES SECUNDARIOS Y MODAL
document.getElementById('btn-reiniciar').addEventListener('click', comenzarCuestionario);
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
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================================
  //  GESTIÓN DE AUDIO (Instancias de Howler.js)
  // ==========================================================
  let errorSound = null;
  let successSound = null;

  if (typeof Howl !== "undefined") {
    errorSound = new Howl({
      src: ["../../assets/sonidos/error.mp3"],
      volume: 0.6,
    });

    successSound = new Howl({
      src: ["../../assets/sonidos/exito.mp3"],
      volume: 0.6,
    });
  } else {
    console.warn(
      "Howler.js no está cargado; el formulario de opiniones no reproducirá sonidos.",
    );
  }

  function playErrorSound() {
    if (errorSound) errorSound.play();
  }

  function playSuccessSound() {
    if (successSound) successSound.play();
  }

  // ==========================================================
  //  CONTROL DE PAGINACIÓN DINÁMICA (Manejo de Estado del DOM)
  // ==========================================================
  const loadMoreBtn = document.getElementById("loadMore");
  const showLessBtn = document.getElementById("showLess");
  let limiteVisible = 3; // Umbral de renderizado inicial

  function actualizarVisibilidadComentarios() {
    const tarjetas = document.querySelectorAll(".dinamica-opinion");

    // Evaluación de índices para conmutación de clases de visibilidad (Bootstrap Utilities)
    tarjetas.forEach((tarjeta, index) => {
      if (index < limiteVisible) {
        tarjeta.classList.remove("d-none");
      } else {
        tarjeta.classList.add("d-none");
      }
    });

    // Control de flujos visuales para el botón "Ver más"
    if (limiteVisible >= tarjetas.length) {
      if (loadMoreBtn) loadMoreBtn.classList.add("d-none");
    } else {
      if (loadMoreBtn) loadMoreBtn.classList.remove("d-none");
    }

    // Control de flujos visuales para el botón "Ver menos"
    if (limiteVisible > 3) {
      if (showLessBtn) showLessBtn.classList.remove("d-none");
    } else {
      if (showLessBtn) showLessBtn.classList.add("d-none");
    }
  }

  if (loadMoreBtn && showLessBtn) {
    loadMoreBtn.addEventListener("click", function () {
      limiteVisible += 3; // Incremento incremental del bloque de visualización
      actualizarVisibilidadComentarios();
    });

    showLessBtn.addEventListener("click", function () {
      limiteVisible = Math.max(3, limiteVisible - 3); // Decremento controlado respetando el umbral base
      actualizarVisibilidadComentarios();
    });
  }

  // ==========================================================
  //  PROCESAMIENTO Y VALIDACIÓN DEL FORMULARIO (Mapeo de UI)
  // ==========================================================
  const form = document.getElementById("opinionForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const commentInput = document.getElementById("comment");
  const ratingSelect = document.getElementById("rating");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Intercepción del evento síncrono por defecto

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const comment = commentInput.value.trim();
    const rating = ratingSelect.value;

    // Validaciones en capa de cliente (Sanitización básica)
    if (!name || !email || !comment || !rating) {
      playErrorSound();
      swal(
        "Campos incompletos",
        "Por favor completa todos los campos antes de enviar tu opinión.",
        "warning",
      );
      return;
    }

    if (comment.length < 20) {
      playErrorSound();
      swal(
        "Comentario muy corto",
        "Tu comentario debe tener al menos 20 caracteres para poder enviarse.",
        "info",
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      playErrorSound();
      swal(
        "Correo inválido",
        "Por favor ingresa un correo electrónico con un formato válido.",
        "warning",
      );
      return;
    }

    // Estructuración del Payload según el contrato definido en el Backend (Schemas DTO)
    const datosOpinion = {
      nombre: name,
      correo: email,
      comentario: comment,
      puntuacion: parseInt(rating),
    };

    // Petición HTTP POST Asíncrona (Fetch API)
    fetch("http://localhost:8000/api/opiniones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosOpinion),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en el servidor al guardar el comentario");
        }
        return response.json();
      })
      .then((data) => {
        playSuccessSound();
        swal(
          "¡Gracias por tu opinión!",
          "Apreciamos mucho que compartas tu experiencia con nosotros.",
          "success",
        );
        form.reset();
        cargarOpinionesDeBD(); // Actualización reactiva de la interfaz
      })
      .catch((error) => {
        console.error("Fetch POST Error:", error);
        playErrorSound();
        swal(
          "Error de conexión",
          "No se pudo guardar tu comentario en este momento. Inténtalo más tarde.",
          "error",
        );
      });
  });

  // ==========================================================
  //  CONSUMO DE API REST Y RENDERIZADO DINÁMICO (Inyección DOM)
  // ==========================================================
  function cargarOpinionesDeBD() {
    const contenedorOpiniones = document.querySelector(".opiniones");
    if (!contenedorOpiniones) return;

    // Petición HTTP GET Asíncrona hacia el servicio REST de FastAPI
    fetch("http://localhost:8000/api/opiniones")
      .then((response) => response.json())
      .then((opiniones) => {
        // Control preventivo de visibilidad de controles de paginación
        if (opiniones.length <= 3) {
          if (loadMoreBtn) loadMoreBtn.classList.add("d-none");
          if (showLessBtn) showLessBtn.classList.add("d-none");
        }

        // Purga de elementos dinámicos obsoletos para evitar redundancia de datos
        document
          .querySelectorAll(".dinamica-opinion")
          .forEach((el) => el.remove());

        const _botonesDiv = document.querySelector(
          ".d-flex.justify-content-between.mt-4",
        );

        // Iteración del arreglo JSON e inyección estructurada al árbol DOM
        opiniones.forEach((op) => {
          const estrellas =
            "⭐".repeat(op.puntuacion) + "☆".repeat(5 - op.puntuacion);

          const nuevaTarjeta = document.createElement("div");
          nuevaTarjeta.className =
            "row justify-content-center op-card dinamica-opinion ux-float mb-4 d-none";
          nuevaTarjeta.setAttribute("data-float-y", "20");
          nuevaTarjeta.setAttribute("data-float-duration", "3");

          nuevaTarjeta.innerHTML = `
                        <div class="col-12 col-md-8 col-lg-10">
                          <div class="card text-center card-op h-100 shadow-sm border-0">
                            <div class="card-header name-op bg-transparent border-0">
                              <h4 class="fw-bold mb-0">${op.nombre}</h4>
                            </div>
                            <div class="card-body px-4">
                              <p class="card-text fst-italic">
                                "${op.comentario}"
                              </p>
                            </div>
                            <div class="card-footer text-warning border-0">${estrellas}</div>
                          </div>
                        </div>
                    `;

          // Inserción ordenada relativa antes del contenedor de controles de paginación
          contenedorOpiniones.insertBefore(nuevaTarjeta, _botonesDiv);
        });

        // Revaluación del estado visual de los nodos dinámicos insertados
        actualizarVisibilidadComentarios();
      })
      .catch((err) => console.error("Fetch GET Error:", err));
  }

  // Inicialización del pipeline de datos en la carga inicial de la vista
  cargarOpinionesDeBD();
});

document.addEventListener("DOMContentLoaded", function () {
    // ==========================================================
    //  SONIDOS (Howler.js)
    // ==========================================================
    let errorSound = null;
    let successSound = null;

    if (typeof Howl !== "undefined") {
        // Ajusta las rutas de los audios a donde tengas tus archivos
        errorSound = new Howl({
            src: ["../../assets/sonidos/error.mp3"],
            volume: 0.6
        });

        successSound = new Howl({
            src: ["../../assets/sonidos/exito.mp3"],
            volume: 0.6
        });
    } else {
        console.warn("Howler.js no está cargado; el formulario de opiniones no reproducirá sonidos.");
    }

    function playErrorSound() {
        if (errorSound) {
            errorSound.play();
        }
    }

    function playSuccessSound() {
        if (successSound) {
            successSound.play();
        }
    }

    // ==========================================================
    //  BOTONES VER MÁS / VER MENOS
    // ==========================================================
    const loadMoreBtn = document.getElementById("loadMore");
    const showLessBtn = document.getElementById("showLess");
    const extraOpinions = document.querySelectorAll(".extra-opinion");
    let visibleExtras = 0;

    if (loadMoreBtn && showLessBtn && extraOpinions.length > 0) {
        loadMoreBtn.addEventListener("click", function () {
            // Mostrar 2 más
            for (let i = 0; i < 2 && visibleExtras < extraOpinions.length; i++) {
                extraOpinions[visibleExtras].classList.remove("d-none");
                visibleExtras++;
            }

            // Si ya no quedan ocultas, esconder "Ver más"
            if (visibleExtras === extraOpinions.length) {
                loadMoreBtn.classList.add("d-none");
            }

            // Activar "Ver menos"
            showLessBtn.classList.remove("d-none");
        });

        showLessBtn.addEventListener("click", function () {
            // Ocultar 2 de las últimas visibles
            for (let i = 0; i < 2 && visibleExtras > 0; i++) {
                visibleExtras--;
                extraOpinions[visibleExtras].classList.add("d-none");
            }

            // Si ya no hay extras visibles, esconder "Ver menos"
            if (visibleExtras === 0) {
                showLessBtn.classList.add("d-none");
            }

            // Reactivar "Ver más" si se ocultaron algunas
            loadMoreBtn.classList.remove("d-none");
        });
    }

    // ==========================================================
    //  FORMULARIO OPINIONES
    // ==========================================================
    const form = document.getElementById("opinionForm");
    if (!form) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const commentInput = document.getElementById("comment");
    const ratingSelect = document.getElementById("rating");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // evita recargar la página

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const comment = commentInput.value.trim();
        const rating = ratingSelect.value;

        // ================= VALIDACIONES =================

        // Campos vacíos
        if (!name || !email || !comment || !rating) {
            playErrorSound();
            swal(
                "Campos incompletos",
                "Por favor completa todos los campos antes de enviar tu opinión.",
                "warning"
            );
            return;
        }

        // Longitud mínima del comentario
        if (comment.length < 20) {
            playErrorSound();
            swal(
                "Comentario muy corto",
                "Tu comentario debe tener al menos 20 caracteres para poder enviarse.",
                "info"
            );
            return;
        }

        // (Opcional) Validar formato básico de correo
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            playErrorSound();
            swal(
                "Correo inválido",
                "Por favor ingresa un correo electrónico con un formato válido.",
                "warning"
            );
            return;
        }

        // ================= TODO CORRECTO =================
        playSuccessSound();
        swal(
            "¡Gracias por tu opinión!",
            "Apreciamos mucho que compartas tu experiencia con nosotros.",
            "success"
        );

        // Limpiar formulario
        form.reset();
    });
});

// contacto.js

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactoForm");
    if (!form) return;

    const nombreInput   = document.getElementById("contactoNombre");
    const telInput      = document.getElementById("contactoTelefono");
    const emailInput    = document.getElementById("contactoEmail");
    const servicioInput = document.getElementById("contactoServicio");
    const mensajeInput  = document.getElementById("contactoMensaje");

    // ==========================
    //   SONIDOS LOCALES
    // ==========================
    let errorSound, successSound;

    if (typeof Howl !== "undefined") {
        errorSound = new Howl({
            src: ["../../assets/sonidos/error.mp3"],
            volume: 0.7
        });

        successSound = new Howl({
            src: ["../../assets/sonidos/exito.mp3"],
            volume: 0.7
        });
    }

    // Reproducir error
    function playError() {
        if (errorSound) errorSound.play();
    }

    // Reproducir success
    function playSuccess() {
        if (successSound) successSound.play();
    }

    // ==========================
    //       RESTRICCIONES
    // ==========================
    nombreInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
    });

    telInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
    });

    // ==========================
    //      ALERTAS
    // ==========================
    function mostrarAlerta(tipo, titulo, mensaje) {
        if (typeof Swal !== "undefined" && typeof Swal.fire === "function") {
            Swal.fire({
                icon: tipo,
                title: titulo,
                html: mensaje.replace(/\n/g, "<br>"),
                confirmButtonText: "Cerrar"
            });
            return;
        }

        if (typeof swal !== "undefined") {
            swal(titulo, mensaje, tipo);
            return;
        }

        alert(titulo + "\n\n" + mensaje);
    }

    // ==========================
    //      VALIDACIÓN
    // ==========================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const errores = [];

        const nombre   = nombreInput.value.trim();
        const tel      = telInput.value.trim();
        const email    = emailInput.value.trim();
        const servicio = servicioInput.value;
        const mensaje  = mensajeInput.value.trim();

        // Campos vacíos
        if (!nombre || !tel || !email || !servicio || !mensaje) {
            errores.push("Todos los campos son obligatorios.");
        }

        if (nombre && nombre.length < 3) {
            errores.push("Por favor ingresa tu nombre completo.");
        }

        const telRegex = /^[0-9]{10}$/;
        if (tel && !telRegex.test(tel)) {
            errores.push("El número de teléfono debe tener exactamente 10 dígitos.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errores.push("Ingresa un correo electrónico válido.");
        }

        if (mensaje && mensaje.length < 10) {
            errores.push("Por favor escribe un mensaje más detallado.");
        }

        // -----------------------
        //     SI HAY ERRORES
        // -----------------------
        if (errores.length > 0) {
            playError();

            const mensajeError = errores.map(err => "- " + err).join("\n");
            mostrarAlerta("warning", "Revisa la información", mensajeError);
            return;
        }

        // -----------------------
        //     TODO CORRECTO
        // -----------------------
        playSuccess();

        mostrarAlerta(
            "success",
            "Mensaje enviado",
            "Gracias por contactarnos. Nos comunicaremos contigo lo antes posible."
        );

        form.reset();
        servicioInput.value = "";
    });
});

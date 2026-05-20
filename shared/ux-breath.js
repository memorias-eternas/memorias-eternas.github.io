// shared/ux-breath.js
document.addEventListener("DOMContentLoaded", function () {
    // Si no está GSAP, no hacemos nada
    if (typeof gsap === "undefined") {
        console.warn("ux-anim: GSAP no está cargado, se omiten las animaciones.");
        return;
    }

    // ====================================
    // 1) EFECTO DE RESPIRACIÓN: .ux-breath
    //    (escala + movimiento vertical)
    // ====================================
    const breathElements = document.querySelectorAll(".ux-breath");

    breathElements.forEach(function (el) {
        // Opciones por data-atributos (opcionales)
        const scaleIntensity = parseFloat(el.dataset.breathScale || "0.01");   // 0.01 = 1%
        const moveY = parseFloat(el.dataset.breathY || "6");                  // px
        const duration = parseFloat(el.dataset.breathDuration || "6");        // segundos

        gsap.to(el, {
            duration: duration,
            y: -moveY,
            scale: 1 + scaleIntensity,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });

    // ====================================
    // 2) EFECTO FLOTAR: .ux-float
    //    (solo subir y bajar)
    // ====================================
    const floatElements = document.querySelectorAll(".ux-float");

    floatElements.forEach(function (el) {
        const moveY = parseFloat(el.dataset.floatY || "10");            // cuánto sube (px)
        const duration = parseFloat(el.dataset.floatDuration || "4");   // segundos

        gsap.to(el, {
            duration: duration,
            y: -moveY,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    });
});

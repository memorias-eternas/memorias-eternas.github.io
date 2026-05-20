// ../../shared/catalogos.js
document.addEventListener("DOMContentLoaded", function () {
    const modalProductoEl = document.getElementById("productoModal");
    if (!modalProductoEl || typeof bootstrap === "undefined") return;

    const modalProducto = new bootstrap.Modal(modalProductoEl);

    const modalTitle       = document.getElementById("productoModalLabel");
    const modalImg         = document.getElementById("productoModalImg");
    const modalDescripcion = document.getElementById("productoModalDescripcion");
    const modalDetalle     = document.getElementById("productoModalDetalle");
    const modalPrecio      = document.getElementById("productoModalPrecio");
    const modalComprarBtn  = document.getElementById("productoModalComprarBtn");

    // Todas las cards de urnas y ataúdes
    const cards = document.querySelectorAll(".card-urna, .card-ataud");

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const imgEl   = card.querySelector("img");
            const headEl  = card.querySelector(".head");
            const descEl  = card.querySelector(".discription");
            const priceEl = card.querySelector(".price");

            // Detalle largo opcional (data-detalle en la card)
            const detalleLargo = card.getAttribute("data-detalle") || "";
            const productoId   = card.getAttribute("data-producto-id") || "";

            // Imagen
            if (modalImg && imgEl) {
                modalImg.src = imgEl.src;
                modalImg.alt = imgEl.alt || (headEl ? headEl.textContent.trim() : "");
            }

            // Título
            if (modalTitle && headEl) {
                modalTitle.textContent = headEl.textContent.trim();
            }

            // Descripción corta (la que ya tienes en la card)
            if (modalDescripcion && descEl) {
                modalDescripcion.textContent = descEl.textContent.trim();
            }

            // Descripción detallada (si no hay data-detalle, se oculta)
            if (modalDetalle) {
                if (detalleLargo.trim() !== "") {
                    modalDetalle.textContent = detalleLargo.trim();
                    modalDetalle.style.display = "";
                } else {
                    modalDetalle.textContent = "";
                    modalDetalle.style.display = "none";
                }
            }

            // Precio
            if (modalPrecio && priceEl) {
                modalPrecio.textContent = priceEl.textContent.trim();
            }

            // Guardar el ID del producto en el botón de comprar
            if (modalComprarBtn) {
                modalComprarBtn.dataset.productoId = productoId;
            }

            modalProducto.show();
        });
    });

    // Función para extraer número desde un texto tipo "$18,900 MXN"
    function obtenerPrecioNumerico(texto) {
        if (!texto) return 0;
        // Dejamos solo dígitos y punto, quitando comas y letras
        const limpio = texto.replace(/[^0-9.]/g, "");
        const numero = parseFloat(limpio);
        return isNaN(numero) ? 0 : numero;
    }

    // Acción del botón "Comprar este producto"
    if (modalComprarBtn) {
        modalComprarBtn.addEventListener("click", () => {
            const nombre = modalTitle ? modalTitle.textContent.trim() : "";
            const precioTexto = modalPrecio ? modalPrecio.textContent.trim() : "";
            const precioNumero = obtenerPrecioNumerico(precioTexto);

            // Usar la función global que ya tienes en contrato-pago.js
            if (typeof window.abrirSimulacionContrato === "function") {
                window.abrirSimulacionContrato(nombre, precioNumero);
            } else {
                console.warn("abrirSimulacionContrato no está definida aún.");
            }
        });
    }
});

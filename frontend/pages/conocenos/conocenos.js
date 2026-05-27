// conocenos.js

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".icon-content .link");
    const modalElement = document.getElementById("modalPago");
    const modalTitle = document.getElementById("modalPagoLabel");
    const modalSubtitle = document.getElementById("modalPagoSubtitle");
    const modalBody = document.getElementById("modalPagoTexto");

    if (!modalElement || !modalTitle || !modalSubtitle || !modalBody) return;

    const modalPago = new bootstrap.Modal(modalElement);

    links.forEach(link => {
        link.addEventListener("click", () => {
            const title = link.dataset.title || "Medio de pago";
            const subtitle = link.dataset.subtitle || "";
            const body = link.dataset.body || "";

            modalTitle.textContent = title;
            modalSubtitle.textContent = subtitle;
            modalBody.textContent = body;

            modalPago.show();
        });
    });
});

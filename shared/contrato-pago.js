document.addEventListener("DOMContentLoaded", function () {
    const modalEl = document.getElementById("modalContratoPago");
    if (!modalEl || typeof bootstrap === "undefined") return;

    const modalBootstrap = new bootstrap.Modal(modalEl);

    const planNombreEl = document.getElementById("contratoPlanNombre");
    const planPrecioEl = document.getElementById("contratoPlanPrecio");

    const nombreInput = document.getElementById("contratoNombre");
    const emailInput = document.getElementById("contratoEmail");
    const telInput = document.getElementById("contratoTelefono");
    const dirInput = document.getElementById("contratoDireccion");

    const pagoDetalle = document.getElementById("pagoDetalle");
    const contratoTextEl = document.getElementById("textoContrato");
    const btnConfirmar = document.getElementById("btnConfirmarPagoSimulado");

    let planActual = {
        nombre: "",
        precio: 0
    };

    // === Formato del teléfono: solo dígitos, máximo 10 ===
    if (telInput) {
        telInput.addEventListener("input", function () {
            let digits = telInput.value.replace(/\D/g, "");
            if (digits.length > 10) {
                digits = digits.slice(0, 10);
            }
            telInput.value = digits;
        });
    }

    // === Función global para abrir la simulación ===
    window.abrirSimulacionContrato = function (nombrePlan, precioPlan) {
        planActual.nombre = nombrePlan || "Plan personalizado";
        planActual.precio = parseFloat(precioPlan || 0) || 0;

        planNombreEl.textContent = planActual.nombre;
        planPrecioEl.textContent = planActual.precio.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        }) + " MXN";

        // Limpiar selección de método de pago y detalle
        document.querySelectorAll("input[name='metodo_pago']").forEach(r => r.checked = false);
        pagoDetalle.innerHTML = "";
        contratoTextEl.textContent = "Aún no se ha generado el contrato. Completa los datos y confirma el pago simulado.";

        modalBootstrap.show();
    };

    // === Inicializar formato de inputs de tarjeta (si existen) ===
    function inicializarInputsTarjeta() {
        const cardNumberInput = document.getElementById("cardNumberDemo");
        const cardExpiryInput = document.getElementById("cardExpiryDemo");
        const cardCvvInput = document.getElementById("cardCvvDemo");

        // Número de tarjeta: solo dígitos, máx 16, separado en grupos de 4
        if (cardNumberInput) {
            cardNumberInput.addEventListener("input", function () {
                let digits = cardNumberInput.value.replace(/\D/g, "");
                if (digits.length > 16) {
                    digits = digits.slice(0, 16);
                }
                const grupos = [];
                for (let i = 0; i < digits.length; i += 4) {
                    grupos.push(digits.slice(i, i + 4));
                }
                cardNumberInput.value = grupos.join(" ");
            });
        }

        // Vencimiento: MM/AA, autoinserta la barra al escribir el segundo dígito
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener("input", function () {
                let digits = cardExpiryInput.value.replace(/\D/g, "");
                if (digits.length > 4) {
                    digits = digits.slice(0, 4);
                }
                if (digits.length >= 3) {
                    cardExpiryInput.value = digits.slice(0, 2) + "/" + digits.slice(2);
                } else {
                    cardExpiryInput.value = digits;
                }
            });
        }

        // CVV: solo 3 dígitos
        if (cardCvvInput) {
            cardCvvInput.addEventListener("input", function () {
                let digits = cardCvvInput.value.replace(/\D/g, "");
                if (digits.length > 3) {
                    digits = digits.slice(0, 3);
                }
                cardCvvInput.value = digits;
            });
        }
    }

    // === Cambio de método de pago ===
    document.querySelectorAll("input[name='metodo_pago']").forEach(radio => {
        radio.addEventListener("change", function (e) {
            const metodo = e.target.value;
            const montoTexto = planActual.precio.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 2
            });

            let html = "";
            const ref = "SFME-" + Math.floor(Math.random() * 90000000 + 10000000);

            switch (metodo) {
                case "tarjeta":
                    html = `
                        <p class="mb-2"><strong>Pago con tarjeta (simulado)</strong></p>
                        <div class="row g-2">
                            <div class="col-md-6">
                                <label class="form-label small mb-1">Número de tarjeta (demo)</label>
                                <input type="text" class="form-control form-control-sm" id="cardNumberDemo" placeholder="1111 2222 3333 4444">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small mb-1">Vencimiento</label>
                                <input type="text" class="form-control form-control-sm" id="cardExpiryDemo" placeholder="MM/AA">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small mb-1">CVV</label>
                                <input type="text" class="form-control form-control-sm" id="cardCvvDemo" placeholder="123">
                            </div>
                        </div>
                        <p class="mt-2 small text-muted mb-0">
                            Este formulario es solo una simulación, no se procesan pagos reales.
                        </p>
                        <p class="mb-0">Monto a pagar: <strong>${montoTexto}</strong></p>
                    `;
                    break;

                case "efectivo":
                    html = `
                        <p class="mb-2"><strong>Pago en efectivo en sucursal</strong></p>
                        <p class="small mb-1">Presenta este recibo simulado en la sucursal para realizar el pago:</p>
                        <ul class="small mb-1">
                            <li><strong>Referencia:</strong> ${ref}</li>
                            <li><strong>Monto:</strong> ${montoTexto}</li>
                        </ul>
                        <p class="small text-muted mb-0">
                            Este recibo es solo para fines de demostración dentro del proyecto escolar.
                        </p>
                    `;
                    break;

                case "tienda":
                    html = `
                        <p class="mb-2"><strong>Pago en tiendas de autoservicio</strong></p>
                        <p class="small mb-1">Con esta referencia simulada puedes "pagar" en tiendas participantes:</p>
                        <ul class="small mb-1">
                            <li><strong>Referencia de pago:</strong> ${ref}</li>
                            <li><strong>Monto:</strong> ${montoTexto}</li>
                        </ul>
                        <p class="small text-muted mb-0">
                            Este flujo es simulado, no genera cargos reales.
                        </p>
                    `;
                    break;

                case "paypal":
                    html = `
                        <p class="mb-2"><strong>Pago con PayPal (simulado)</strong></p>
                        <p class="small mb-1">En un entorno real, aquí se redirigiría a PayPal.</p>
                        <ul class="small mb-1">
                            <li><strong>Cuenta demo:</strong> pagos-demo@sfme.com</li>
                            <li><strong>Monto:</strong> ${montoTexto}</li>
                        </ul>
                        <p class="small text-muted mb-0">
                            No se realiza ningún cargo real; es solo una demostración académica.
                        </p>
                    `;
                    break;

                case "transferencia":
                    html = `
                        <p class="mb-2"><strong>Transferencia bancaria</strong></p>
                        <p class="small mb-1">Datos de depósito simulados:</p>
                        <ul class="small mb-1">
                            <li><strong>Banco:</strong> Banco Demo</li>
                            <li><strong>Cuenta:</strong> 0000 0000 0000</li>
                            <li><strong>CLABE:</strong> 000000000000000000</li>
                            <li><strong>Beneficiario:</strong> Servicios Funerarios ME (demo)</li>
                            <li><strong>Referencia:</strong> ${ref}</li>
                            <li><strong>Monto:</strong> ${montoTexto}</li>
                        </ul>
                        <p class="small text-muted mb-0">
                            Información ficticia para simulación en proyecto escolar.
                        </p>
                    `;
                    break;

                case "binance":
                    html = `
                        <p class="mb-2"><strong>Pago con Binance / Cripto (simulado)</strong></p>
                        <p class="small mb-1">En una implementación real, aquí se mostraría un QR o dirección de wallet.</p>
                        <ul class="small mb-1">
                            <li><strong>Wallet demo:</strong> 0x0000000000000000000000000000000000000000</li>
                            <li><strong>Concepto:</strong> ${planActual.nombre}</li>
                            <li><strong>Monto de referencia:</strong> ${montoTexto}</li>
                        </ul>
                        <p class="small text-muted mb-0">
                            Esta sección es solo una ilustración, no acepta pagos reales.
                        </p>
                    `;
                    break;
            }

            pagoDetalle.innerHTML = html;

            // Si el método es tarjeta, aplicar formateo a sus inputs
            if (metodo === "tarjeta") {
                inicializarInputsTarjeta();
            }
        });
    });

    // === Confirmar pago simulado y generar contrato ===
    btnConfirmar.addEventListener("click", function () {
        const nombre = nombreInput.value.trim();
        const email = emailInput.value.trim();
        const telefono = telInput.value.trim();

        const metodoRadio = document.querySelector("input[name='metodo_pago']:checked");
        const metodo = metodoRadio ? metodoRadio.value : null;

        // Validación de datos básicos
        if (!nombre || !email || !telefono) {
            swal({
                title: "Datos incompletos",
                text: "Por favor llena al menos nombre, correo y teléfono.",
                icon: "warning",
                button: "Entendido"
            });
            return;
        }

        // Validar email con un formato sencillo
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            swal({
                title: "Correo inválido",
                text: "Por favor ingresa un correo electrónico con formato válido.",
                icon: "warning",
                button: "Entendido"
            });
            return;
        }

        // Validar teléfono: exactamente 10 dígitos
        const telDigits = telefono.replace(/\D/g, "");
        if (telDigits.length !== 10) {
            swal({
                title: "Teléfono inválido",
                text: "El número de teléfono debe contener exactamente 10 dígitos.",
                icon: "warning",
                button: "Entendido"
            });
            return;
        }

        if (!metodo) {
            swal({
                title: "Método de pago",
                text: "Selecciona un método de pago para continuar con la simulación.",
                icon: "warning",
                button: "Entendido"
            });
            return;
        }

        // Validaciones extra si el método es tarjeta
        if (metodo === "tarjeta") {
            const cardNumberInput = document.getElementById("cardNumberDemo");
            const cardExpiryInput = document.getElementById("cardExpiryDemo");
            const cardCvvInput = document.getElementById("cardCvvDemo");

            const cardDigits = cardNumberInput
                ? cardNumberInput.value.replace(/\D/g, "")
                : "";
            const expiryValue = cardExpiryInput ? cardExpiryInput.value.trim() : "";
            const cvvDigits = cardCvvInput
                ? cardCvvInput.value.replace(/\D/g, "")
                : "";

            if (cardDigits.length !== 16) {
                swal({
                    title: "Tarjeta inválida",
                    text: "El número de tarjeta debe contener 16 dígitos.",
                    icon: "warning",
                    button: "Entendido"
                });
                return;
            }

            const expiryPattern = /^\d{2}\/\d{2}$/;
            if (!expiryPattern.test(expiryValue)) {
                swal({
                    title: "Fecha de vencimiento inválida",
                    text: "El formato de vencimiento debe ser MM/AA.",
                    icon: "warning",
                    button: "Entendido"
                });
                return;
            }

            if (cvvDigits.length !== 3) {
                swal({
                    title: "CVV inválido",
                    text: "El CVV debe contener 3 dígitos.",
                    icon: "warning",
                    button: "Entendido"
                });
                return;
            }
        }

        const fecha = new Date();
        const fechaTexto = fecha.toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const precioTexto = planActual.precio.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        });

        const metodoLabel = {
            tarjeta: "Tarjeta de crédito / débito (simulado)",
            efectivo: "Efectivo en sucursal (recibo simulado)",
            tienda: "Pago en tiendas de autoservicio (simulado)",
            paypal: "PayPal (simulado)",
            transferencia: "Transferencia bancaria (simulada)",
            binance: "Binance / Cripto (simulado)"
        }[metodo] || "Método simulado";

        const contratoHTML = `
            <div class="contrato-documento">
                <!-- ENCABEZADO / MEMBRETE -->
                <div class="contrato-header d-flex justify-content-between align-items-center mb-4">
                    <div class="contrato-logo">
                        <img src="../../assets/img/logotipo.svg" alt="Servicios Funerarios ME" style="height: 60px;">
                    </div>
                    <div class="contrato-datos text-end small">
                        <strong>Servicios Funerarios ME</strong><br>
                        Av. Paseo Norte, Col. Las Rosas, C.P. 79100<br>
                        Ciudad Valles, San Luis Potosí, México<br>
                        Tel. 481-132-7854 / 444-152-9091<br>
                        Correo: serviciosfunerarios.me@gmail.com
                    </div>
                </div>

                <hr class="mb-4">

                <!-- TÍTULO -->
                <p class="text-center mb-4">
                    <strong>CONTRATO DE PRESTACIÓN DE SERVICIOS FUNERARIOS (SIMULADO)</strong>
                </p>

                <!-- CUERPO DEL CONTRATO -->
                <p>
                    En la ciudad de Ciudad Valles, San Luis Potosí, a los ${fechaTexto}, comparecen por una parte
                    <strong>${nombre}</strong>, a quien en lo sucesivo se le denominará <strong>"EL CONTRATANTE"</strong>, y por la otra
                    <strong>Servicios Funerarios ME</strong>, a quien en lo sucesivo se le denominará <strong>"LA FUNERARIA"</strong>, con el fin
                    de celebrar el presente contrato simulado de prestación de servicios funerarios, conforme a las siguientes declaraciones
                    y cláusulas:
                </p>

                <p><strong>DECLARACIONES</strong></p>

                <p>
                    I. Declara <strong>EL CONTRATANTE</strong> ser mayor de edad, contar con capacidad legal para obligarse en términos
                    del presente contrato simulado y proporcionar de manera voluntaria sus datos de contacto: correo electrónico
                    <strong>${email}</strong> y número telefónico <strong>${telefono}</strong>.
                </p>

                <p>
                    II. Declara <strong>LA FUNERARIA</strong> ser una entidad dedicada —dentro del contexto académico de este proyecto— a la
                    orientación y simulación de servicios funerarios, careciendo este documento de validez jurídica y sin que implique
                    obligación real de prestación de servicios o pago alguno.
                </p>

                <p><strong>CLÁUSULAS</strong></p>

                <p>
                    <strong>PRIMERA. Objeto.</strong> EL CONTRATANTE manifiesta su interés en adquirir de manera simulada el servicio
                    denominado <strong>"${planActual.nombre}"</strong>, cuyo monto referencial asciende a
                    <strong>${precioTexto} MXN</strong>. Ambas partes reconocen que dicho servicio no será prestado en la realidad y
                    que forma parte únicamente del desarrollo escolar del estudiante creador de este sitio.
                </p>

                <p>
                    <strong>SEGUNDA. Forma de pago.</strong> EL CONTRATANTE elige como método de pago simulado
                    <strong>${metodoLabel}</strong>. La información mostrada, cantidades, referencias o datos bancarios no corresponden
                    a servicios reales y no generan cargos de ningún tipo.
                </p>

                <p>
                    <strong>TERCERA. Naturaleza del documento.</strong> Las partes acuerdan que el presente contrato carece de efectos
                    legales y no constituye obligación mercantil, civil o de prestación de servicios. Su elaboración tiene como único fin
                    la simulación, estructura y práctica académica.
                </p>

                <p>
                    <strong>CUARTA. Confidencialidad y uso de datos.</strong> Los datos proporcionados por EL CONTRATANTE son utilizados
                    exclusivamente dentro del entorno simulado del proyecto escolar y no serán usados para fines comerciales, divulgación
                    o almacenamiento externo.
                </p>

                <p>
                    <strong>QUINTA. Aceptación.</strong> EL CONTRATANTE declara haber leído el presente documento, comprendiendo que se
                    trata de un ejercicio académico sin validez jurídica, aceptando su contenido y la naturaleza ficticia de todos los procesos,
                    montos y métodos de pago aquí descritos.
                </p>

                <p>
                    Leído que fue el presente contrato simulado, las partes manifiestan su conformidad, firmando al calce de manera representativa.
                </p>

                <!-- FIRMAS -->
                <div class="row mt-5">
                    <div class="col-6 text-center">
                        <p class="mb-1"><strong>EL CONTRATANTE</strong></p>
                        <p class="mb-5">_______________________________</p>
                        <p class="mb-0">${nombre}</p>
                    </div>
                    <div class="col-6 text-center">
                        <p class="mb-1"><strong>LA FUNERARIA</strong></p>
                        <p class="mb-5">_______________________________</p>
                        <p class="mb-0">Servicios Funerarios ME</p>
                    </div>
                </div>

                <!-- PIE DE PÁGINA LEGAL -->
                <p class="contrato-footer small text-muted mt-4">
                    Este contrato es un documento simulado con fines exclusivamente académicos. No genera derechos ni obligaciones legales
                    para ninguna de las partes y no representa una oferta real de servicios funerarios ni un comprobante de pago.
                </p>
            </div>
        `;

        contratoTextEl.innerHTML = contratoHTML;

        swal({
            title: "Pago simulado registrado",
            text: "Se ha generado el contrato simulado para este servicio.",
            icon: "success",
            button: "Aceptar"
        });
    });
});

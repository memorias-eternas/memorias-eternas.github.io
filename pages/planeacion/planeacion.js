document.addEventListener("DOMContentLoaded", function () {
    const summaryList = document.getElementById("planSummary");
    const totalElement = document.getElementById("planTotal");
    const steps = Array.from(document.querySelectorAll(".plan-step"));
    const nextButtons = document.querySelectorAll(".btn-next-step");

    // Todos los inputs del plan
    const allInputs = document.querySelectorAll(
        "#planAccordion input[type='radio'], #planAccordion input[type='checkbox']"
    );

    // ===== RESET INICIAL (cuando entro a la página) =====
    allInputs.forEach(input => {
        input.checked = false;
    });

    let currentDisposition = null; // 'inhumacion' o 'cremacion'
    let currentPlanTotal = 0; 

    // ===== UTILIDADES =====
    function formatCurrency(value) {
        return value.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        });
    }

    function updateStepButtonState(stepElement) {
        const btn = stepElement.querySelector(".btn-next-step");
        if (!btn) return;

        const hasSelection = !!stepElement.querySelector("input[type='radio']:checked");
        btn.disabled = !hasSelection;
    }

    function recalculateTotal() {
        let total = 0;
        const summaryByStep = {};

        const checkedInputs = document.querySelectorAll(
            "#planAccordion input[type='radio']:checked, #planAccordion input[type='checkbox']:checked"
        );

        checkedInputs.forEach(input => {
            const price = parseFloat(input.dataset.price || "0");
            total += price;

            const step = input.closest(".plan-step");
            if (!step) return;

            const stepLabel = step.dataset.stepLabel || "Otros";
            const labelEl = document.querySelector("label[for='" + input.id + "']");
            const labelText = labelEl ? labelEl.textContent.trim() : input.id;

            if (!summaryByStep[stepLabel]) {
                summaryByStep[stepLabel] = [];
            }
            summaryByStep[stepLabel].push(labelText);
        });

        if (Object.keys(summaryByStep).length === 0) {
            summaryList.innerHTML = '<li class="text-muted">Aún no has seleccionado opciones.</li>';
        } else {
            const items = Object.entries(summaryByStep).map(([stepLabel, values]) => {
                return `<li class="mb-2"><strong>${stepLabel}:</strong> ${values.join(", ")}</li>`;
            });
            summaryList.innerHTML = items.join("");
        }

        totalElement.textContent = formatCurrency(total);
        currentPlanTotal = total;
    }

    function goToNextStep(currentStepElement) {
        const nextContentId = currentStepElement.getAttribute("data-next-step");
        if (!nextContentId) return;

        const nextCollapse = document.getElementById(nextContentId);
        if (!nextCollapse) return;

        if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
            new bootstrap.Collapse(nextCollapse, {
                toggle: true
            });
        }
    }

    function isStepCompleted(stepElement) {
        const hasRadios = !!stepElement.querySelector("input[type='radio']");
        if (!hasRadios) {
            // Si no tiene radios (por ejemplo, solo checkboxes), no lo usamos para bloquear navegación
            return true;
        }
        return !!stepElement.querySelector("input[type='radio']:checked");
    }

    // ===== PASO 1: entierro / cremación =====
    const disposicionRadios = document.querySelectorAll("input[name='disposicion']");
    const optionGroupsByDisposition = document.querySelectorAll(".option-group[data-for]");

    disposicionRadios.forEach(radio => {
        radio.addEventListener("change", function (e) {
            currentDisposition = e.target.value; // 'inhumacion' o 'cremacion'

            optionGroupsByDisposition.forEach(group => {
                const groupFor = group.getAttribute("data-for");
                const match = groupFor === currentDisposition;

                group.classList.toggle("d-none", !match);

                // Limpiar radios del grupo que no corresponde
                if (!match) {
                    group.querySelectorAll("input[type='radio']").forEach(r => {
                        r.checked = false;
                    });
                }
            });

            const step = e.target.closest(".plan-step");
            if (step) {
                updateStepButtonState(step);
            }

            // Al cambiar disposición, limpiamos todos los pasos siguientes
            const currentIndex = steps.indexOf(step);
            if (currentIndex >= 0) {
                for (let i = currentIndex + 1; i < steps.length; i++) {
                    const laterInputs = steps[i].querySelectorAll("input[type='radio'], input[type='checkbox']");
                    laterInputs.forEach(inp => inp.checked = false);
                    updateStepButtonState(steps[i]);
                }
            }

            recalculateTotal();
        });
    });

    // ===== LISTENERS GENERALES (todos los inputs) =====
    allInputs.forEach(input => {
        input.addEventListener("change", function (e) {
            const step = e.target.closest(".plan-step");
            if (step) {
                updateStepButtonState(step);

                // Si cambia algo en este paso, limpiamos selecciones de TODOS los pasos siguientes
                const currentIndex = steps.indexOf(step);
                if (currentIndex >= 0) {
                    for (let i = currentIndex + 1; i < steps.length; i++) {
                        const laterInputs = steps[i].querySelectorAll("input[type='radio'], input[type='checkbox']");
                        laterInputs.forEach(inp => {
                            inp.checked = false;
                        });
                        updateStepButtonState(steps[i]);
                    }
                }
            }
            recalculateTotal();
        });
    });

    // ===== BLOQUEAR QUE SE ABRAN PASOS SIGUIENTES SI LOS ANTERIORES NO ESTÁN COMPLETOS =====
    const collapses = document.querySelectorAll(".plan-step .accordion-collapse");

    collapses.forEach(collapseEl => {
        collapseEl.addEventListener("show.bs.collapse", function (e) {
            const step = collapseEl.closest(".plan-step");
            if (!step) return;

            const index = steps.indexOf(step);
            if (index <= 0) {
                // El primer paso siempre se puede abrir
                return;
            }

            // Verificar que TODOS los pasos anteriores estén completos
            for (let i = 0; i < index; i++) {
                if (!isStepCompleted(steps[i])) {
                    // Cancelar la apertura de este acordeón
                    e.preventDefault();

                    if (typeof swal === "function") {
                        swal({
                            title: "Paso pendiente",
                            text: "Por favor completa el paso " + (i + 1) + " antes de continuar.",
                            icon: "info",
                            button: "Entendido"
                        });
                    }

                    // Opcional: abrir el paso que falta
                    const prevCollapse = steps[i].querySelector(".accordion-collapse");
                    if (prevCollapse && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                        new bootstrap.Collapse(prevCollapse, { toggle: true });
                    }
                    break;
                }
            }
        });
    });


    // ===== BOTONES "Continuar" POR PASO =====
    nextButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const step = btn.closest(".plan-step");
            if (!step) return;

            // No avanza si el paso requiere radio y no hay uno seleccionado
            if (step.querySelector("input[type='radio']") &&
                !step.querySelector("input[type='radio']:checked")) {
                return;
            }

            goToNextStep(step);
        });
    });

    // ===== VER MÁS / VER MENOS EN OPCIONES PERSONALIZADAS (3 EN 3) =====
    const groupsWithExtras = document.querySelectorAll(".option-group");

    groupsWithExtras.forEach(group => {
        const extraOptions = group.querySelectorAll(".extra-opcion");

        // Si este grupo no tiene extras, no hacemos nada
        if (extraOptions.length === 0) return;

        const controlsContainer = document.createElement("div");
        controlsContainer.className = "mt-2";

        const btnMore = document.createElement("button");
        btnMore.type = "button";
        btnMore.className = "btn btn-sm btn-outline-light me-2 ver-mas-opciones";
        btnMore.textContent = "Ver más opciones";

        const btnLess = document.createElement("button");
        btnLess.type = "button";
        btnLess.className = "btn btn-sm btn-outline-secondary ver-menos-opciones d-none";
        btnLess.textContent = "Ver menos";

        controlsContainer.appendChild(btnMore);
        controlsContainer.appendChild(btnLess);
        group.appendChild(controlsContainer);

        let visibleExtras = 0;
        const pageSize = 3;

        btnMore.addEventListener("click", function () {
            for (let i = 0; i < pageSize && visibleExtras < extraOptions.length; i++) {
                extraOptions[visibleExtras].classList.remove("d-none");
                visibleExtras++;
            }

            if (visibleExtras >= extraOptions.length) {
                btnMore.classList.add("d-none");
            }

            if (visibleExtras > 0) {
                btnLess.classList.remove("d-none");
            }
        });

        btnLess.addEventListener("click", function () {
            for (let i = 0; i < pageSize && visibleExtras > 0; i++) {
                visibleExtras--;
                const opt = extraOptions[visibleExtras];

                // Si estamos ocultando una opción que estaba seleccionada, la desmarcamos
                const input = opt.querySelector("input[type='radio']");
                if (input && input.checked) {
                    input.checked = false;
                }

                opt.classList.add("d-none");
            }

            // Recalcular total por si se desmarcó algo oculto
            recalculateTotal();

            if (visibleExtras <= 0) {
                btnLess.classList.add("d-none");
            }

            if (visibleExtras < extraOptions.length) {
                btnMore.classList.remove("d-none");
            }
        });
    });

    // ===== BOTÓN "Continuar a contacto" (validación + reset) =====
    const contactBtn = document.getElementById("btnPlanPersonalizado");
    if (contactBtn) {
        contactBtn.addEventListener("click", function (e) {
            // Validar que los primeros 5 pasos estén completos
            const stepSelectors = [
                "input[name='disposicion']:checked",                        // Paso 1
                ".option-group:not(.d-none) input[type='radio']:checked",  // Paso 2
                "input[name='traslado']:checked",                           // Paso 3
                "input[name='musica']:checked",                             // Paso 4
                "input[name='flores']:checked"                              // Paso 5
            ];

            let missing = false;

            stepSelectors.forEach(sel => {
                if (!document.querySelector(sel)) {
                    missing = true;
                }
            });

            if (missing) {
                swal({
                    title: "Información incompleta",
                    text: "Por favor completa los primeros 5 pasos para continuar.",
                    icon: "warning",
                    button: "Entendido"
                });
                return;
            }

            // Si todo está completo, abrir simulación con el total del plan personalizado
            abrirSimulacionContrato("Plan personalizado SF ME", currentPlanTotal);
        });
    }

        // ===== ESTADO INICIAL =====
        steps.forEach(step => updateStepButtonState(step));
        recalculateTotal();
    });

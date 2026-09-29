document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // FUNCIONES GENERALES
    // =========================================================

    const $ = (id) => document.getElementById(id);

    const guardar = (clave, datos) => {
        localStorage.setItem(clave, JSON.stringify(datos));
    };

    const cargar = (clave, valor = []) => {
        try {
            const datos = localStorage.getItem(clave);
            return datos ? JSON.parse(datos) : valor;
        } catch {
            return valor;
        }
    };

    const dinero = (numero) => {
        return "$" + Number(numero || 0).toLocaleString("es-AR");
    };

    const hoy = () => {
        const fecha = new Date();
        fecha.setHours(0, 0, 0, 0);
        return fecha;
    };

    const iso = (fecha) => {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${año}-${mes}-${dia}`;
    };

    const escapar = (texto) => {
        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    // =========================================================
    // FECHA
    // =========================================================

    function mostrarFecha() {

        const elemento = $("fecha");

        if (!elemento) return;

        elemento.textContent =
            new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });
    }


    // =========================================================
    // PIN
    // =========================================================

    const pantallaBloqueo = $("pantallaBloqueo");
    const app = $("app");
    const pinInput = $("pinInput");
    const btnIngresar = $("btnIngresar");
    const mensajePin = $("mensajePin");

    let pin = localStorage.getItem("vir_pin");
    const pinActivado = localStorage.getItem("vir_pin_activado");

    function mostrarApp() {
        pantallaBloqueo?.classList.add("oculto");
        app?.classList.remove("oculto");
    }

    if (!pin || pinActivado !== "true") {
        mostrarApp();
    } else {
        pantallaBloqueo?.classList.remove("oculto");
        app?.classList.add("oculto");
    }

    btnIngresar?.addEventListener("click", () => {

        const valor = pinInput?.value.trim();

        if (!valor) {
            if (mensajePin) {
                mensajePin.textContent = "Ingresá tu PIN 💗";
            }
            return;
        }

        if (!pin) {

            localStorage.setItem("vir_pin", valor);
            localStorage.setItem("vir_pin_activado", "true");

            pin = valor;

            mostrarApp();
            return;
        }

        if (valor === pin) {

            if (mensajePin) {
                mensajePin.textContent = "";
            }

            mostrarApp();

        } else {

            if (mensajePin) {
                mensajePin.textContent = "PIN incorrecto 💗";
            }
        }
    });


    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    $("btnConfiguracion")?.addEventListener("click", () => {
        $("panelConfiguracion")?.classList.remove("oculto");
    });

    $("cerrarConfiguracion")?.addEventListener("click", () => {
        $("panelConfiguracion")?.classList.add("oculto");
    });

    $("bloquearApp")?.addEventListener("click", () => {

        $("panelConfiguracion")?.classList.add("oculto");

        pantallaBloqueo?.classList.remove("oculto");
        app?.classList.add("oculto");

        if (pinInput) {
            pinInput.value = "";
        }
    });


    // =========================================================
    // AGENDA
    // =========================================================

    let eventos = cargar("vir_eventos", []);

    let fechaSeleccionada = iso(hoy());

    const categoriasEventos = {
        personal: "💗 Personal",
        trabajo: "💼 Trabajo",
        taekwondo: "🥋 Taekwondo",
        estudio: "📚 Estudio",
        salud: "❤️ Salud",
        otro: "📦 Otro"
    };

    function mostrarAgenda() {

        const lista = $("listaAgenda");

        if (!lista) return;

        const delDia = eventos
            .filter(evento => evento.fecha === fechaSeleccionada)
            .sort((a, b) =>
                (a.hora || "").localeCompare(b.hora || "")
            );

        lista.innerHTML = "";

        if (!delDia.length) {

            lista.innerHTML = `
                <p class="agenda-vacia">
                    No tenés actividades para este día 💗
                </p>
            `;

            return;
        }

        delDia.forEach(evento => {

            const elemento = document.createElement("div");

            elemento.className = "evento-agenda";

            elemento.innerHTML = `
                <div class="hora-evento">
                    ${escapar(evento.hora || "--:--")}
                </div>

                <div class="info-evento">

                    <strong>
                        ${escapar(evento.nombre)}
                    </strong>

                    <span>
                        ${
                            categoriasEventos[evento.categoria]
                            || "📦 Otro"
                        }

                        ${
                            evento.repeticion !== "ninguna"
                            ? " · 🔁 " + escapar(evento.repeticion)
                            : ""
                        }
                    </span>

                </div>

                <button
                    class="eliminar-evento"
                    data-id="${evento.id}"
                >
                    🗑️
                </button>
            `;

            lista.appendChild(elemento);
        });

        document.querySelectorAll(".eliminar-evento")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id = Number(boton.dataset.id);

                    eventos = eventos.filter(
                        evento => evento.id !== id
                    );

                    guardar("vir_eventos", eventos);

                    actualizarTodo();
                });
            });
    }


    $("agregarEvento")?.addEventListener("click", () => {

        $("modalEvento")?.classList.remove("oculto");

        if ($("fechaEvento")) {
            $("fechaEvento").value = fechaSeleccionada;
        }

        if ($("nombreEvento")) {
            $("nombreEvento").value = "";
        }

        if ($("horaEvento")) {
            $("horaEvento").value = "";
        }

        if ($("repeticionEvento")) {
            $("repeticionEvento").value = "ninguna";
        }

        if ($("recordatorioEvento")) {
            $("recordatorioEvento").value = "0";
        }
    });


    $("cerrarEvento")?.addEventListener("click", () => {
        $("modalEvento")?.classList.add("oculto");
    });


    $("guardarEvento")?.addEventListener("click", () => {

        const nombre = $("nombreEvento")?.value.trim();
        const fecha = $("fechaEvento")?.value;
        const hora = $("horaEvento")?.value;

        if (!nombre || !fecha || !hora) {
            alert("Completá nombre, fecha y hora 💗");
            return;
        }

        const evento = {

            id: Date.now(),

            nombre,
            fecha,
            hora,

            categoria:
                $("categoriaEvento")?.value || "otro",

            repeticion:
                $("repeticionEvento")?.value || "ninguna",

            recordatorio:
                Number($("recordatorioEvento")?.value || 0)
        };

        eventos.push(evento);

        const repeticion = evento.repeticion;

        if (repeticion !== "ninguna") {

            const base = new Date(`${fecha}T12:00:00`);

            for (let i = 1; i <= 8; i++) {

                const nueva = new Date(base);

                if (repeticion === "diaria") {
                    nueva.setDate(nueva.getDate() + i);
                }

                if (repeticion === "semanal") {
                    nueva.setDate(nueva.getDate() + i * 7);
                }

                if (repeticion === "laborables") {

                    nueva.setDate(nueva.getDate() + i);

                    if (
                        nueva.getDay() === 0 ||
                        nueva.getDay() === 6
                    ) {
                        continue;
                    }
                }

                eventos.push({
                    ...evento,
                    id: Date.now() + i,
                    fecha: iso(nueva)
                });
            }
        }

        guardar("vir_eventos", eventos);

        fechaSeleccionada = fecha;

        if ($("fechaAgenda")) {
            $("fechaAgenda").value = fecha;
        }

        $("modalEvento")?.classList.add("oculto");

        actualizarTodo();
    });


    $("fechaAgenda")?.addEventListener("change", () => {

        fechaSeleccionada = $("fechaAgenda").value;

        actualizarTodo();
    });


    $("diaAnterior")?.addEventListener("click", () => {

        const fecha =
            new Date(`${fechaSeleccionada}T12:00:00`);

        fecha.setDate(fecha.getDate() - 1);

        fechaSeleccionada = iso(fecha);

        $("fechaAgenda").value = fechaSeleccionada;

        actualizarTodo();
    });


    $("diaSiguiente")?.addEventListener("click", () => {

        const fecha =
            new Date(`${fechaSeleccionada}T12:00:00`);

        fecha.setDate(fecha.getDate() + 1);

        fechaSeleccionada = iso(fecha);

        $("fechaAgenda").value = fechaSeleccionada;

        actualizarTodo();
    });


    // =========================================================
    // SEMANA
    // =========================================================

    function mostrarSemana() {

        const vistaSemana = $("vistaSemana");

        if (!vistaSemana) return;

        const base =
            new Date(`${fechaSeleccionada}T12:00:00`);

        const dia = base.getDay();

        const diferencia =
            dia === 0 ? -6 : 1 - dia;

        const lunes = new Date(base);

        lunes.setDate(
            base.getDate() + diferencia
        );

        vistaSemana.innerHTML = "";

        for (let i = 0; i < 7; i++) {

            const fecha = new Date(lunes);

            fecha.setDate(lunes.getDate() + i);

            const fechaIso = iso(fecha);

            const delDia = eventos
                .filter(evento => evento.fecha === fechaIso)
                .sort((a, b) =>
                    (a.hora || "").localeCompare(b.hora || "")
                );

            const bloque =
                document.createElement("div");

            bloque.className = "dia-semana";

            if (fechaIso === iso(hoy())) {
                bloque.classList.add("dia-semana-hoy");
            }

            const nombre =
                fecha.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                });

            bloque.innerHTML = `
                <h3>${escapar(nombre)}</h3>
            `;

            if (!delDia.length) {

                bloque.innerHTML += `
                    <span style="color:#888;font-size:13px;">
                        Sin actividades
                    </span>
                `;

            } else {

                delDia.forEach(evento => {

                    bloque.innerHTML += `
                        <div class="actividad-semana">

                            <div class="actividad-semana-hora">
                                ${escapar(evento.hora || "--:--")}
                            </div>

                            <div class="actividad-semana-info">

                                <strong>
                                    ${escapar(evento.nombre)}
                                </strong>

                                <span>
                                    ${
                                        categoriasEventos[evento.categoria]
                                        || "📦 Otro"
                                    }
                                </span>

                            </div>

                        </div>
                    `;
                });
            }

            vistaSemana.appendChild(bloque);
        }
    }


    $("btnVistaDia")?.addEventListener("click", () => {

        $("vistaDia")?.classList.remove("oculto");
        $("vistaSemana")?.classList.add("oculto");

        $("btnVistaDia")?.classList.add("vista-activa");
        $("btnVistaSemana")?.classList.remove("vista-activa");
    });


    $("btnVistaSemana")?.addEventListener("click", () => {

        $("vistaDia")?.classList.add("oculto");
        $("vistaSemana")?.classList.remove("oculto");

        $("btnVistaSemana")?.classList.add("vista-activa");
        $("btnVistaDia")?.classList.remove("vista-activa");

        mostrarSemana();
    });


    // =========================================================
    // TAREAS
    // =========================================================

    let tareas = cargar("vir_tareas", []);

    function mostrarTareas() {

        const lista = $("listaTareas");

        if (!lista) return;

        lista.innerHTML = "";

        if (!tareas.length) {

            lista.innerHTML = `
                <p class="tarea-vacia">
                    No tenés tareas pendientes 🎉
                </p>
            `;

            return;
        }

        tareas.forEach(tarea => {

            const elemento =
                document.createElement("div");

            elemento.className = "tarea-item";

            if (tarea.completada) {
                elemento.classList.add("completada");
            }

            elemento.innerHTML = `

                <button
                    class="checkbox-tarea"
                    data-id="${tarea.id}"
                >
                    ${tarea.completada ? "✓" : ""}
                </button>

                <div class="tarea-info">

                    <strong class="tarea-nombre">
                        ${escapar(tarea.nombre)}
                    </strong>

                    <div class="tarea-meta">

                        <span>
                            ${
                                tarea.prioridad === "urgente"
                                ? "🔴 Urgente"
                                : tarea.prioridad === "alta"
                                ? "🟠 Alta"
                                : "🟢 Normal"
                            }
                        </span>

                        ${
                            tarea.fecha
                            ? `<span>📅 ${escapar(tarea.fecha)}</span>`
                            : ""
                        }

                        ${
                            tarea.hora
                            ? `<span>⏰ ${escapar(tarea.hora)}</span>`
                            : ""
                        }

                    </div>

                </div>

                <button
                    class="eliminar-tarea"
                    data-id="${tarea.id}"
                >
                    🗑️
                </button>
            `;

            lista.appendChild(elemento);
        });


        document.querySelectorAll(".checkbox-tarea")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id = Number(boton.dataset.id);

                    const tarea =
                        tareas.find(item => item.id === id);

                    if (tarea) {
                        tarea.completada =
                            !tarea.completada;
                    }

                    guardar("vir_tareas", tareas);

                    actualizarTodo();
                });
            });


        document.querySelectorAll(".eliminar-tarea")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id = Number(boton.dataset.id);

                    tareas =
                        tareas.filter(
                            tarea => tarea.id !== id
                        );

                    guardar("vir_tareas", tareas);

                    actualizarTodo();
                });
            });
    }


    $("agregarTarea")?.addEventListener("click", () => {

        $("modalTarea")?.classList.remove("oculto");

        $("nombreTarea").value = "";
        $("fechaTarea").value = "";
        $("horaTarea").value = "";
    });


    $("cerrarTarea")?.addEventListener("click", () => {
        $("modalTarea")?.classList.add("oculto");
    });


    $("guardarTarea")?.addEventListener("click", () => {

        const nombre =
            $("nombreTarea")?.value.trim();

        if (!nombre) {
            alert("Escribí qué tarea querés hacer 💗");
            return;
        }

        tareas.push({

            id: Date.now(),

            nombre,

            prioridad:
                $("prioridadTarea")?.value || "normal",

            fecha:
                $("fechaTarea")?.value || "",

            hora:
                $("horaTarea")?.value || "",

            completada: false
        });

        guardar("vir_tareas", tareas);

        $("modalTarea")?.classList.add("oculto");

        actualizarTodo();
    });


    // =========================================================
    // FINANZAS
    // =========================================================

    let movimientos = cargar("vir_movimientos", []);

    const nombresCategorias = {

        trabajo: "💼 Trabajo",
        taekwondo: "🥋 Taekwondo",
        ventas: "🛍️ Ventas",
        regalo: "🎁 Regalo",

        comida: "🍔 Comida",
        transporte: "🚌 Transporte",
        estudio: "📚 Estudio",
        compras: "🛍️ Compras",
        casa: "🏠 Casa",
        ocio: "🎮 Ocio",

        otro: "📦 Otro"
    };


    function calcularFinanzas() {

        let ingresos = 0;
        let gastos = 0;

        movimientos.forEach(movimiento => {

            const monto =
                Number(movimiento.monto) || 0;

            if (movimiento.tipo === "ingreso") {
                ingresos += monto;
            }

            if (movimiento.tipo === "gasto") {
                gastos += monto;
            }
        });

        return {
            ingresos,
            gastos,
            disponible: ingresos - gastos
        };
    }


    function mostrarFinanzas() {

        const datos = calcularFinanzas();

        if ($("totalIngresos")) {
            $("totalIngresos").textContent =
                dinero(datos.ingresos);
        }

        if ($("totalGastos")) {
            $("totalGastos").textContent =
                dinero(datos.gastos);
        }

        if ($("dineroDisponible")) {
            $("dineroDisponible").textContent =
                dinero(datos.disponible);
        }

        mostrarMovimientos();
        mostrarCategorias();
        mostrarLimites();
    }


    function mostrarMovimientos() {

        const lista = $("listaMovimientos");

        if (!lista) return;

        lista.innerHTML = "";

        if (!movimientos.length) {

            lista.innerHTML = `
                <p class="vacio">
                    Todavía no tenés movimientos 💸
                </p>
            `;

            return;
        }

        [...movimientos]
            .reverse()
            .forEach(movimiento => {

                const elemento =
                    document.createElement("div");

                elemento.className =
                    "movimiento-item";

                const ingreso =
                    movimiento.tipo === "ingreso";

                elemento.innerHTML = `

                    <div class="movimiento-info">

                        <strong>
                            ${escapar(movimiento.descripcion)}
                        </strong>

                        <span>
                            ${
                                nombresCategorias[
                                    movimiento.categoria
                                ] || "📦 Otro"
                            }
                        </span>

                    </div>

                    <strong
                        class="
                        movimiento-monto
                        ${
                            ingreso
                            ? "movimiento-ingreso"
                            : "movimiento-gasto"
                        }
                        "
                    >
                        ${ingreso ? "+" : "-"}${dinero(movimiento.monto)}
                    </strong>

                    <button
                        class="eliminar-movimiento"
                        data-id="${movimiento.id}"
                    >
                        🗑️
                    </button>
                `;

                lista.appendChild(elemento);
            });


        document.querySelectorAll(".eliminar-movimiento")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id = Number(boton.dataset.id);

                    movimientos =
                        movimientos.filter(
                            movimiento =>
                                movimiento.id !== id
                        );

                    guardar(
                        "vir_movimientos",
                        movimientos
                    );

                    actualizarTodo();
                });
            });
    }


    function mostrarCategorias() {

        const lista = $("listaCategorias");

        if (!lista) return;

        const categorias = {};

        movimientos
            .filter(
                movimiento =>
                    movimiento.tipo === "gasto"
            )
            .forEach(movimiento => {

                const categoria =
                    movimiento.categoria || "otro";

                categorias[categoria] =
                    (categorias[categoria] || 0) +
                    Number(movimiento.monto);
            });

        const datos =
            Object.entries(categorias)
                .sort((a, b) => b[1] - a[1]);

        lista.innerHTML = "";

        if (!datos.length) {

            lista.innerHTML = `
                <p class="vacio">
                    Todavía no hay gastos para mostrar 📊
                </p>
            `;

            return;
        }

        const total =
            datos.reduce(
                (suma, item) => suma + item[1],
                0
            );

        datos.forEach(([categoria, monto]) => {

            const porcentaje =
                total > 0
                ? Math.round((monto / total) * 100)
                : 0;

            const elemento =
                document.createElement("div");

            elemento.className =
                "categoria-item";

            elemento.innerHTML = `

                <div class="categoria-header">

                    <span>
                        ${
                            nombresCategorias[categoria]
                            || "📦 Otro"
                        }
                    </span>

                    <strong>
                        ${dinero(monto)}
                    </strong>

                </div>

                <div class="categoria-barra">

                    <div
                        class="categoria-progreso"
                        style="width:${porcentaje}%"
                    ></div>

                </div>

                <small>
                    ${porcentaje}% de tus gastos
                </small>

            `;

            lista.appendChild(elemento);
        });
    }


    // =========================================================
    // INGRESOS Y GASTOS
    // =========================================================

    $("agregarIngreso")?.addEventListener("click", () => {

        $("modalIngreso")?.classList.remove("oculto");

        $("montoIngreso").value = "";
        $("descripcionIngreso").value = "";
    });


    $("agregarGasto")?.addEventListener("click", () => {

        $("modalGasto")?.classList.remove("oculto");

        $("montoGasto").value = "";
        $("descripcionGasto").value = "";
    });


    $("cerrarIngreso")?.addEventListener("click", () => {
        $("modalIngreso")?.classList.add("oculto");
    });


    $("cerrarGasto")?.addEventListener("click", () => {
        $("modalGasto")?.classList.add("oculto");
    });


    $("guardarIngreso")?.addEventListener("click", () => {

        const monto =
            Number($("montoIngreso")?.value);

        const descripcion =
            $("descripcionIngreso")?.value.trim()
            || "Ingreso";

        if (monto <= 0) {
            alert("Ingresá un monto válido 💗");
            return;
        }

        movimientos.push({

            id: Date.now(),

            tipo: "ingreso",

            monto,

            descripcion,

            categoria:
                $("categoriaIngreso")?.value || "otro",

            fecha: iso(hoy())
        });

        guardar("vir_movimientos", movimientos);

        $("modalIngreso")?.classList.add("oculto");

        actualizarTodo();
    });


    $("guardarGasto")?.addEventListener("click", () => {

        const monto =
            Number($("montoGasto")?.value);

        const descripcion =
            $("descripcionGasto")?.value.trim()
            || "Gasto";

        const categoria =
            $("categoriaGasto")?.value || "otro";

        if (monto <= 0) {
            alert("Ingresá un monto válido 💗");
            return;
        }


        // ================================================
        // FRENO INTELIGENTE
        // ================================================

        const datos = calcularFinanzas();

        const disponibleAntes =
            datos.disponible;

        let advertencia = "";

        if (monto > disponibleAntes && disponibleAntes >= 0) {

            advertencia =
                `Este gasto de ${dinero(monto)} ` +
                `superaría tu dinero disponible ` +
                `(${dinero(disponibleAntes)}).`;

        } else if (
            disponibleAntes > 0 &&
            monto >= disponibleAntes * 0.5
        ) {

            advertencia =
                `Este gasto representa una parte importante ` +
                `de tu dinero disponible (${dinero(disponibleAntes)}).`;
        }


        // Revisar límites de categoría

        const limitesGuardados =
            cargar("vir_limites", []);

        const limiteCategoria =
            limitesGuardados.find(
                limite =>
                    limite.tipo === categoria
            );

        if (limiteCategoria) {

            const gastoCategoria =
                movimientos
                    .filter(
                        movimiento =>
                            movimiento.tipo === "gasto" &&
                            movimiento.categoria === categoria
                    )
                    .reduce(
                        (suma, movimiento) =>
                            suma + Number(movimiento.monto),
                        0
                    );

            const nuevoTotal =
                gastoCategoria + monto;

            if (nuevoTotal > Number(limiteCategoria.monto)) {

                advertencia =
                    `Este gasto superaría tu límite de ` +
                    `${nombresCategorias[categoria] || categoria}.`;
            }
        }


        if (advertencia) {

            const continuar =
                confirm(
                    `⚠️ Ojo con este gasto\n\n` +
                    `${advertencia}\n\n` +
                    `¿Querés registrarlo igualmente?`
                );

            if (!continuar) {
                return;
            }
        }


        movimientos.push({

            id: Date.now(),

            tipo: "gasto",

            monto,

            descripcion,

            categoria,

            fecha: iso(hoy())
        });

        guardar("vir_movimientos", movimientos);

        $("modalGasto")?.classList.add("oculto");

        actualizarTodo();
    });


    // =========================================================
    // METAS
    // =========================================================

    let metas = cargar("vir_metas", []);

    function mostrarMetas() {

        const lista = $("listaMetas");

        if (!lista) return;

        const activas =
            metas.filter(meta => !meta.completada).length;

        if ($("metasActivas")) {

            $("metasActivas").textContent =
                `${activas} activa${activas === 1 ? "" : "s"}`;
        }

        lista.innerHTML = "";

        if (!metas.length) {

            lista.innerHTML = `
                <p class="vacio">
                    Todavía no tenés metas 🎯
                </p>
            `;

            return;
        }

        metas.forEach(meta => {

            const objetivo =
                Number(meta.objetivo) || 0;

            const ahorrado =
                Number(meta.ahorrado) || 0;

            let porcentaje =
                objetivo > 0
                ? Math.round((ahorrado / objetivo) * 100)
                : 0;

            porcentaje =
                Math.max(
                    0,
                    Math.min(100, porcentaje)
                );

            const falta =
                Math.max(
                    objetivo - ahorrado,
                    0
                );

            const elemento =
                document.createElement("div");

            elemento.className = "meta-item";

            elemento.innerHTML = `

                <div class="meta-header">

                    <span class="meta-nombre">
                        🎯 ${escapar(meta.nombre)}
                    </span>

                    <span class="meta-porcentaje">
                        ${porcentaje}%
                    </span>

                </div>

                <div class="meta-barra">

                    <div
                        class="meta-progreso"
                        style="width:${porcentaje}%"
                    ></div>

                </div>

                <div class="meta-datos">

                    <span>
                        ${dinero(ahorrado)}
                    </span>

                    <span>
                        ${dinero(objetivo)}
                    </span>

                </div>

                <div
                    class="meta-datos"
                    style="margin-top:6px;"
                >

                    <span>
                        ${
                            falta > 0
                            ? "Faltan " + dinero(falta)
                            : "¡Meta cumplida! 🎉"
                        }
                    </span>

                </div>

                <div class="meta-acciones">

                    <button
                        class="eliminar-meta"
                        data-id="${meta.id}"
                    >
                        🗑️
                    </button>

                </div>
            `;

            lista.appendChild(elemento);
        });


        document.querySelectorAll(".eliminar-meta")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id = Number(boton.dataset.id);

                    metas =
                        metas.filter(
                            meta => meta.id !== id
                        );

                    guardar("vir_metas", metas);

                    actualizarTodo();
                });
            });
    }


    $("agregarMeta")?.addEventListener("click", () => {

        $("modalMeta")?.classList.remove("oculto");

        $("nombreMeta").value = "";
        $("objetivoMeta").value = "";
        $("ahorradoMeta").value = "";
    });


    $("cerrarMeta")?.addEventListener("click", () => {
        $("modalMeta")?.classList.add("oculto");
    });


    $("guardarMeta")?.addEventListener("click", () => {

        const nombre =
            $("nombreMeta")?.value.trim();

        const objetivo =
            Number($("objetivoMeta")?.value);

        const ahorrado =
            Number($("ahorradoMeta")?.value) || 0;

        if (!nombre) {
            alert("Poné un nombre para tu meta 🎯");
            return;
        }

        if (objetivo <= 0) {
            alert("Ingresá cuánto necesitás 💗");
            return;
        }

        metas.push({

            id: Date.now(),

            nombre,

            objetivo,

            ahorrado: Math.max(0, ahorrado),

            completada:
                ahorrado >= objetivo
        });

        guardar("vir_metas", metas);

        $("modalMeta")?.classList.add("oculto");

        actualizarTodo();
    });


    // =========================================================
    // 🚦 LÍMITES
    // =========================================================

    let limites = cargar("vir_limites", []);


    function calcularGastoLimite(limite) {

        return movimientos
            .filter(movimiento => {

                if (movimiento.tipo !== "gasto") {
                    return false;
                }

                if (limite.tipo === "general") {
                    return true;
                }

                return movimiento.categoria === limite.tipo;
            })
            .reduce(
                (suma, movimiento) =>
                    suma + Number(movimiento.monto),
                0
            );
    }


    function mostrarLimites() {

        const lista =
            $("alertasFinancieras");

        if (!lista) return;

        lista.innerHTML = "";

        if (!limites.length) {

            lista.innerHTML = `
                <p class="vacio">
                    Todavía no configuraste límites 💗
                </p>
            `;

            return;
        }


        limites.forEach(limite => {

            const montoLimite =
                Number(limite.monto) || 0;

            const gastado =
                calcularGastoLimite(limite);

            const porcentaje =
                montoLimite > 0
                ? Math.round(
                    (gastado / montoLimite) * 100
                )
                : 0;

            const porcentajeBarra =
                Math.min(100, porcentaje);

            const restante =
                montoLimite - gastado;


            let alerta = "";

            if (gastado > montoLimite) {

                alerta = `
                    <div class="limite-alerta limite-excedido">
                        🚨 Superaste este límite por
                        ${dinero(Math.abs(restante))}
                    </div>
                `;

            } else if (porcentaje >= 90) {

                alerta = `
                    <div class="limite-alerta">
                        ⚠️ Estás muy cerca del límite.
                    </div>
                `;

            } else if (porcentaje >= 70) {

                alerta = `
                    <div class="limite-alerta">
                        👀 Ya usaste el ${porcentaje}% del límite.
                    </div>
                `;

            }


            const elemento =
                document.createElement("div");

            elemento.className =
                "limite-item";

            elemento.innerHTML = `

                <div class="limite-header">

                    <span class="limite-nombre">
                        ${escapar(limite.nombre)}
                    </span>

                    <strong>
                        ${porcentaje}%
                    </strong>

                </div>

                <div class="limite-barra">

                    <div
                        class="limite-progreso"
                        style="width:${porcentajeBarra}%"
                    ></div>

                </div>

                <div class="limite-datos">

                    <span>
                        Gastaste ${dinero(gastado)}
                    </span>

                    <span>
                        Límite ${dinero(montoLimite)}
                    </span>

                </div>

                <div class="limite-datos">

                    <span>
                        ${
                            restante >= 0
                            ? "Te quedan " + dinero(restante)
                            : "Excedido"
                        }
                    </span>

                    <span>
                        ${
                            limite.tipo === "general"
                            ? "Todos los gastos"
                            : nombresCategorias[limite.tipo]
                              || limite.tipo
                        }
                    </span>

                </div>

                ${alerta}

                <div class="limite-acciones">

                    <button
                        class="eliminar-limite"
                        data-id="${limite.id}"
                    >
                        🗑️
                    </button>

                </div>
            `;

            lista.appendChild(elemento);
        });


        document.querySelectorAll(".eliminar-limite")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const id =
                        Number(boton.dataset.id);

                    limites =
                        limites.filter(
                            limite =>
                                limite.id !== id
                        );

                    guardar(
                        "vir_limites",
                        limites
                    );

                    actualizarTodo();
                });
            });
    }


    $("agregarLimite")?.addEventListener("click", () => {

        $("modalLimite")?.classList.remove("oculto");

        $("nombreLimite").value = "";
        $("montoLimite").value = "";
        $("tipoLimite").value = "general";
    });


    $("cerrarLimite")?.addEventListener("click", () => {

        $("modalLimite")?.classList.add("oculto");
    });


    $("guardarLimite")?.addEventListener("click", () => {

        const nombre =
            $("nombreLimite")?.value.trim();

        const monto =
            Number($("montoLimite")?.value);

        const tipo =
            $("tipoLimite")?.value || "general";

        if (!nombre) {

            alert("Poné un nombre para el límite 💗");
            return;
        }

        if (monto <= 0) {

            alert("Ingresá un límite válido 💗");
            return;
        }

        limites.push({

            id: Date.now(),

            nombre,

            monto,

            tipo
        });

        guardar(
            "vir_limites",
            limites
        );

        $("modalLimite")?.classList.add("oculto");

        actualizarTodo();
    });


    // =========================================================
    // 🧠 RESUMEN INTELIGENTE
    // =========================================================

    function mostrarResumenInteligente() {

        const resumen =
            $("resumenInteligente");

        if (!resumen) return;

        const fechaHoy = iso(hoy());

        const tareasHoy =
            tareas.filter(
                tarea =>
                    !tarea.completada &&
                    tarea.fecha === fechaHoy
            );

        const tareasSinFecha =
            tareas.filter(
                tarea =>
                    !tarea.completada &&
                    !tarea.fecha
            );

        const tareasAtrasadas =
            tareas.filter(
                tarea =>
                    !tarea.completada &&
                    tarea.fecha &&
                    tarea.fecha < fechaHoy
            );

        const eventosHoy =
            eventos.filter(
                evento =>
                    evento.fecha === fechaHoy
            );

        const finanzas =
            calcularFinanzas();

        const metasActivas =
            metas.filter(
                meta =>
                    !meta.completada
            );

        resumen.innerHTML = "";

        const mensajes = [];


        // TAREAS

        if (tareasAtrasadas.length > 0) {

            mensajes.push({

                icono: "⚠️",

                titulo:
                    `${tareasAtrasadas.length} tarea${
                        tareasAtrasadas.length === 1
                        ? ""
                        : "s"
                    } atrasada${
                        tareasAtrasadas.length === 1
                        ? ""
                        : "s"
                    }`,

                texto:
                    "Tenés tareas de días anteriores que todavía están pendientes."
            });

        } else if (tareasHoy.length > 0) {

            mensajes.push({

                icono: "✅",

                titulo:
                    `${tareasHoy.length} tarea${
                        tareasHoy.length === 1
                        ? ""
                        : "s"
                    } para hoy`,

                texto:
                    "Podés empezar por la que tenga mayor prioridad."
            });

        } else if (tareasSinFecha.length > 0) {

            mensajes.push({

                icono: "📝",

                titulo:
                    `${tareasSinFecha.length} tarea${
                        tareasSinFecha.length === 1
                        ? ""
                        : "s"
                    } sin fecha`,

                texto:
                    "Podés ponerles una fecha para organizar mejor tu día."
            });

        } else {

            mensajes.push({

                icono: "🎉",

                titulo: "Día tranquilo",

                texto:
                    "No tenés tareas pendientes para hoy."
            });
        }


        // AGENDA

        if (eventosHoy.length > 0) {

            const eventosOrdenados =
                [...eventosHoy].sort(
                    (a, b) =>
                        (a.hora || "")
                            .localeCompare(
                                b.hora || ""
                            )
                );

            const proximo =
                eventosOrdenados[0];

            mensajes.push({

                icono: "📅",

                titulo:
                    `${eventosHoy.length} actividad${
                        eventosHoy.length === 1
                        ? ""
                        : "es"
                    } hoy`,

                texto:
                    `La primera es ${
                        proximo.nombre
                    } a las ${
                        proximo.hora || "--:--"
                    }.`
            });

        } else {

            mensajes.push({

                icono: "📅",

                titulo: "Agenda libre",

                texto:
                    "No tenés actividades agendadas para hoy."
            });
        }


        // DINERO

        if (finanzas.disponible < 0) {

            mensajes.push({

                icono: "🚨",

                titulo:
                    `Disponible: ${dinero(
                        finanzas.disponible
                    )}`,

                texto:
                    "Tus gastos registrados son mayores que tus ingresos registrados."
            });

        } else if (
            finanzas.ingresos > 0 &&
            finanzas.gastos >
            finanzas.ingresos * 0.7
        ) {

            mensajes.push({

                icono: "⚠️",

                titulo:
                    `Ya gastaste ${Math.round(
                        (
                            finanzas.gastos /
                            finanzas.ingresos
                        ) * 100
                    )}% de tus ingresos`,

                texto:
                    `Te quedan ${dinero(
                        finanzas.disponible
                    )} registrados como disponibles.`
            });

        } else {

            mensajes.push({

                icono: "💰",

                titulo:
                    `Disponible: ${dinero(
                        finanzas.disponible
                    )}`,

                texto:
                    `Ingresos: ${dinero(
                        finanzas.ingresos
                    )} · Gastos: ${dinero(
                        finanzas.gastos
                    )}`
            });
        }


        // LÍMITES

        limites.forEach(limite => {

            const limiteMonto =
                Number(limite.monto) || 0;

            const gastado =
                calcularGastoLimite(limite);

            const porcentaje =
                limiteMonto > 0
                ? Math.round(
                    (gastado / limiteMonto) * 100
                )
                : 0;

            if (porcentaje >= 90) {

                mensajes.push({

                    icono: "🚨",

                    titulo:
                        `Límite: ${limite.nombre}`,

                    texto:
                        `Ya usaste el ${porcentaje}% del límite.`
                });

            } else if (porcentaje >= 70) {

                mensajes.push({

                    icono: "👀",

                    titulo:
                        `Límite: ${limite.nombre}`,

                    texto:
                        `Ya usaste el ${porcentaje}% del límite.`
                });
            }
        });


        // METAS

        if (metasActivas.length > 0) {

            const metaCercana =
                [...metasActivas].sort(
                    (a, b) => {

                        const porcentajeA =
                            Number(a.objetivo) > 0
                            ? Number(a.ahorrado) /
                              Number(a.objetivo)
                            : 0;

                        const porcentajeB =
                            Number(b.objetivo) > 0
                            ? Number(b.ahorrado) /
                              Number(b.objetivo)
                            : 0;

                        return porcentajeB - porcentajeA;
                    }
                )[0];

            const falta =
                Math.max(
                    Number(metaCercana.objetivo) -
                    Number(metaCercana.ahorrado),
                    0
                );

            mensajes.push({

                icono: "🎯",

                titulo:
                    `Meta: ${metaCercana.nombre}`,

                texto:
                    falta > 0
                    ? `Te faltan ${dinero(falta)} para llegar.`
                    : "¡Esta meta está cumplida! 🎉"
            });

        } else {

            mensajes.push({

                icono: "🎯",

                titulo: "No tenés metas activas",

                texto:
                    "Podés crear una desde la sección Mis metas."
            });
        }


        // CONSEJO FINAL

        if (
            tareasAtrasadas.length === 0 &&
            tareasHoy.length === 0 &&
            eventosHoy.length === 0
        ) {

            mensajes.push({

                icono: "💗",

                titulo: "Hoy para vos",

                texto:
                    "Tenés un día bastante libre. Aprovechalo para adelantar algo pendiente."
            });

        } else if (
            tareasAtrasadas.length > 0
        ) {

            mensajes.push({

                icono: "⭐",

                titulo: "Hoy para vos",

                texto:
                    "Empezá por resolver una tarea atrasada y después seguí con lo demás."
            });

        } else {

            mensajes.push({

                icono: "🌷",

                titulo: "Hoy para vos",

                texto:
                    "No hace falta hacer todo de golpe. Andá una cosa a la vez."
            });
        }


        mensajes.forEach(mensaje => {

            const elemento =
                document.createElement("div");

            elemento.className =
                "resumen-inteligente-item";

            elemento.innerHTML = `

                <div class="resumen-inteligente-icono">
                    ${mensaje.icono}
                </div>

                <div class="resumen-inteligente-texto">

                    <strong>
                        ${escapar(mensaje.titulo)}
                    </strong>

                    <span>
                        ${escapar(mensaje.texto)}
                    </span>

                </div>
            `;

            resumen.appendChild(elemento);
        });
    }


    // =========================================================
    // ⭐ PRIORIDADES
    // =========================================================

    function mostrarPrioridades() {

        const lista =
            $("listaPrioridades");

        if (!lista) return;

        lista.innerHTML = "";

        const fechaHoy =
            iso(hoy());

        const prioridadValor = {
            urgente: 1,
            alta: 2,
            normal: 3
        };


        const tareasHoy =
            tareas
                .filter(
                    tarea =>
                        !tarea.completada &&
                        tarea.fecha === fechaHoy
                )
                .sort((a, b) => {

                    const prioridadA =
                        prioridadValor[a.prioridad] || 3;

                    const prioridadB =
                        prioridadValor[b.prioridad] || 3;

                    if (
                        prioridadA !==
                        prioridadB
                    ) {
                        return prioridadA - prioridadB;
                    }

                    return (a.hora || "")
                        .localeCompare(
                            b.hora || ""
                        );
                });


        const tareasAtrasadas =
            tareas
                .filter(
                    tarea =>
                        !tarea.completada &&
                        tarea.fecha &&
                        tarea.fecha < fechaHoy
                )
                .sort((a, b) => {

                    const prioridadA =
                        prioridadValor[a.prioridad] || 3;

                    const prioridadB =
                        prioridadValor[b.prioridad] || 3;

                    return prioridadA - prioridadB;
                });


        const eventosHoy =
            eventos
                .filter(
                    evento =>
                        evento.fecha === fechaHoy
                )
                .sort(
                    (a, b) =>
                        (a.hora || "")
                            .localeCompare(
                                b.hora || ""
                            )
                );


        const elementos = [];


        tareasAtrasadas
            .slice(0, 2)
            .forEach(tarea => {

                elementos.push({

                    prioridad: "urgente",

                    icono: "⚠️",

                    titulo:
                        tarea.nombre,

                    detalle:
                        tarea.hora
                        ? `Atrasada · ${tarea.hora}`
                        : "Tarea atrasada"
                });
            });


        tareasHoy
            .slice(0, 3)
            .forEach(tarea => {

                elementos.push({

                    prioridad:
                        tarea.prioridad,

                    icono:
                        tarea.prioridad === "urgente"
                        ? "🔴"
                        : tarea.prioridad === "alta"
                        ? "🟠"
                        : "🟢",

                    titulo:
                        tarea.nombre,

                    detalle:
                        tarea.hora
                        ? `Hoy · ${tarea.hora}`
                        : "Tarea para hoy"
                });
            });


        eventosHoy
            .slice(0, 3)
            .forEach(evento => {

                elementos.push({

                    prioridad: "normal",

                    icono: "📅",

                    titulo:
                        evento.nombre,

                    detalle:
                        `Hoy · ${evento.hora || "--:--"}`
                });
            });


        if (!elementos.length) {

            lista.innerHTML = `
                <p class="vacio">
                    🎉 No tenés nada urgente.
                    Disfrutá el día.
                </p>
            `;

            return;
        }


        elementos
            .slice(0, 6)
            .forEach(item => {

                const elemento =
                    document.createElement("div");

                elemento.className =
                    "prioridad-item " +
                    (
                        item.prioridad === "urgente"
                        ? "urgente"
                        : item.prioridad === "alta"
                        ? "alta"
                        : ""
                    );

                elemento.innerHTML = `

                    <div class="prioridad-icono">
                        ${item.icono}
                    </div>

                    <div class="prioridad-info">

                        <strong>
                            ${escapar(item.titulo)}
                        </strong>

                        <span>
                            ${escapar(item.detalle)}
                        </span>

                    </div>
                `;

                lista.appendChild(elemento);
            });
    }


    // =========================================================
    // NOTIFICACIONES
    // =========================================================

    function pedirPermisoNotificaciones() {

        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "default") {

            Notification
                .requestPermission()
                .catch(() => {});
        }
    }


    function revisarRecordatorios() {

        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission !== "granted") {
            return;
        }

        const ahora = new Date();

        eventos.forEach(evento => {

            if (!evento.fecha || !evento.hora) {
                return;
            }

            const fechaEvento =
                new Date(
                    `${evento.fecha}T${evento.hora}:00`
                );

            const minutos =
                Number(evento.recordatorio) || 0;

            if (minutos === 0) {
                return;
            }

            const diferencia =
                Math.floor(
                    (fechaEvento - ahora) / 60000
                );

            if (diferencia === minutos) {

                const clave =
                    `notificacion_${evento.id}_${evento.fecha}`;

                if (localStorage.getItem(clave)) {
                    return;
                }

                new Notification(
                    "Recordatorio 💗",
                    {
                        body:
                            `${evento.nombre} a las ${evento.hora}`
                    }
                );

                localStorage.setItem(
                    clave,
                    "true"
                );
            }
        });
    }


    pedirPermisoNotificaciones();

    setInterval(
        revisarRecordatorios,
        60000
    );


    // =========================================================
    // CERRAR MODALES
    // =========================================================

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener("click", evento => {

                if (evento.target === modal) {
                    modal.classList.add("oculto");
                }
            });
        });


    // =========================================================
    // NAVEGACIÓN
    // =========================================================

    document
        .querySelectorAll("[data-scroll]")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                const destino =
                    boton.dataset.scroll;

                const elemento =
                    $(destino);

                elemento?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
        });


    // =========================================================
    // ACTUALIZAR TODO
    // =========================================================

    function actualizarTodo() {

        mostrarTareas();
        mostrarAgenda();
        mostrarSemana();

        mostrarFinanzas();
        mostrarMetas();

        mostrarLimites();

        mostrarResumenInteligente();
        mostrarPrioridades();
    }


    // =========================================================
    // INICIO
    // =========================================================

    mostrarFecha();

    if ($("fechaAgenda")) {
        $("fechaAgenda").value =
            fechaSeleccionada;
    }

    actualizarTodo();

});
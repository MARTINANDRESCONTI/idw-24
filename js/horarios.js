// horarios.js (Refactorizado a Generador de Turnos Masivos Diarios)

import { getTurnos, addTurno, deleteTurno, generarId } from "./utils/turnosStorage.js";

document.addEventListener("DOMContentLoaded", () => {
    // ================== VARIABLES GLOBALES & DOM ==================
    const formGeneracion = document.getElementById("formTurnoGeneracion");
    const btnGenerarTurnos = document.getElementById("btnGenerarTurnos");
    const tablaTurnos = document.getElementById("tablaHorarios"); // Reutilizamos la tabla
    const modalGenerar = new bootstrap.Modal(document.getElementById("modalAgregarHorario"));
    const modalVerDetalles = new bootstrap.Modal(document.getElementById("modalVerDetalles"));
    const modalConfirmarEliminar = new bootstrap.Modal(document.getElementById("modalConfirmarEliminar"));
    const toastContainer = document.getElementById("toastContainer");

    // Elementos del formulario
    const profesionalSelect = document.getElementById("profesionalSelect");
    const fechaTurnoInput = document.getElementById("fechaTurno");
    const horaEntrada = document.getElementById("horaEntrada");
    const horaSalida = document.getElementById("horaSalida");
    const intervaloSelect = document.getElementById("intervalo");
    const notas = document.getElementById("notas");
    const filterProfesional = document.getElementById("filterProfesional");
    const filterEstado = document.getElementById("filterEstado");
    const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

    // Datos maestros
    let turnosDisponibles = []; // Corresponde a TURNOS_INICIALES
    let profesionales = [];
    let especialidades = [];
    
    // Configuración general
    const HORA_ALMUERZO_INICIO = "12:00";
    const HORA_ALMUERZO_FIN = "13:00";

    // ================== FUNCIONES DE UTILIDAD ==================
    
    function showToast(message, type = "success") {
        // [Función showToast se mantiene igual]
        const toastEl = document.createElement("div");
        const bgClass = type === "success" ? "bg-success" : type === "error" ? "bg-danger" : "bg-info";
        toastEl.className = `toast align-items-center text-white ${bgClass} border-0`;
        toastEl.setAttribute("role", "alert");
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    }

    function horaAMinutos(hora) {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    }

    function minutosAHora(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    function getEspecialidadDesc(profesionalId) {
        const prof = profesionales.find(p => p.id === profesionalId);
        if (!prof || !prof.especialidadId) return "Sin especialidad";
        const esp = especialidades.find(e => e.especialidadId === prof.especialidadId);
        return esp ? esp.descripcion : "Sin especialidad";
    }

    // ================== GENERACIÓN DE TURNOS ==================

    function generarTurnosMasivos(profesionalId, fecha, horaInicio, horaFin, intervaloMinutos) {
        const nuevosTurnos = [];
        let minutoActual = horaAMinutos(horaInicio);
        const minutoFin = horaAMinutos(horaFin);
        const minutoAlmuerzoInicio = horaAMinutos(HORA_ALMUERZO_INICIO);
        const minutoAlmuerzoFin = horaAMinutos(HORA_ALMUERZO_FIN);
        
        while (minutoActual < minutoFin) {
            const horaTurnoFin = minutoActual + intervaloMinutos;
            
            // Si el turno termina después del límite, lo saltamos
            if (horaTurnoFin > minutoFin) break;

            // 1. Manejar el almuerzo/bloqueo de horario
            // Si el turno comienza dentro del almuerzo, saltamos al final del almuerzo
            if (minutoActual >= minutoAlmuerzoInicio && minutoActual < minutoAlmuerzoFin) {
                minutoActual = minutoAlmuerzoFin;
                continue;
            }
            // Si el turno abarca el almuerzo, saltamos al final del almuerzo
            if (horaTurnoFin > minutoAlmuerzoInicio && minutoActual < minutoAlmuerzoInicio) {
                minutoActual = minutoAlmuerzoFin;
                continue;
            }

            const horaTurnoInicio = minutosAHora(minutoActual);
            const horaTurnoFinStr = minutosAHora(horaTurnoFin);

            // 2. Verificar duplicados (Si ya existe un turno para esa fecha y hora)
            const yaExiste = turnosDisponibles.some(t => 
                t.medicoId === profesionalId && 
                t.fecha === fecha && 
                t.hora === horaTurnoInicio
            );

            if (!yaExiste) {
                const turno = {
                    id: generarId(), // Usa la función de turnosStorage
                    medicoId: profesionalId,
                    fecha: fecha,
                    hora: horaTurnoInicio, // Usamos hora de inicio como clave de hora
                    intervalo: intervaloMinutos,
                    disponible: true,
                    estado: "disponible", // Estado para el ABM
                    pacienteDocumento: null,
                    pacienteNombre: null,
                    // notasJornada: notas.value (Opcional, si quieres guardar la nota por turno)
                };
                nuevosTurnos.push(turno);
            }
            
            minutoActual += intervaloMinutos;
        }
        return nuevosTurnos;
    }
    
    // ================== CARGA DE DATOS & RENDER ==================

    function cargarDatos() {
        turnosDisponibles = getTurnos(); // Lee de TURNOS_INICIALES
        profesionales = JSON.parse(localStorage.getItem("medicos")) || [];
        especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
    }
    
    function llenarSelectProfesionales() {
        profesionalSelect.innerHTML = '<option value="">Seleccionar profesional</option>';
        profesionales.forEach(prof => {
            const option = document.createElement("option");
            option.value = prof.id;
            const especialidadDesc = getEspecialidadDesc(prof.id);
            option.textContent = `${prof.nombre} ${prof.apellido} (${especialidadDesc})`;
            profesionalSelect.appendChild(option);
        });
    }

    function llenarFiltrosProfesionales() {
        filterProfesional.innerHTML = '<option value="">Todos los profesionales</option>';
        profesionales.forEach(prof => {
            const option = document.createElement("option");
            option.value = prof.id;
            option.textContent = `${prof.nombre} ${prof.apellido}`;
            filterProfesional.appendChild(option);
        });
    }

    // Mostrar especialidad al seleccionar profesional
    profesionalSelect.addEventListener("change", () => {
        const profesionalId = parseInt(profesionalSelect.value);
        const especialidad = getEspecialidadDesc(profesionalId);
        document.getElementById("especialidadMuestra").textContent = especialidad ? `Especialidad: ${especialidad}` : "";
    });

    // Renderizar la tabla con los turnos disponibles (TURNOS_INICIALES)
    function renderizarTabla() {
        let turnosFiltrados = turnosDisponibles;

        const filterProfId = filterProfesional.value ? parseInt(filterProfesional.value) : null;
        const filterEst = filterEstado.value;
        
        // 1. Filtrar por Profesional
        if (filterProfId) {
            turnosFiltrados = turnosFiltrados.filter(t => t.medicoId === filterProfId);
        }
        // 2. Filtrar por Estado (disponible/reservado)
        if (filterEst) {
            // El estado del turno se maneja por 'disponible' en el objeto, pero usamos 'estado' para el filtro ABM
            if (filterEst === 'disponible') {
                turnosFiltrados = turnosFiltrados.filter(t => t.disponible === true);
            } else if (filterEst === 'reservado') {
                turnosFiltrados = turnosFiltrados.filter(t => t.disponible === false);
            }
        }
        
        // Ordenar por fecha y hora
        turnosFiltrados.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateA - dateB;
        });


        if (turnosFiltrados.length === 0) {
            tablaTurnos.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox"></i> No se encontraron turnos disponibles que coincidan con los filtros.
                    </td>
                </tr>
            `;
            return;
        }

        tablaTurnos.innerHTML = turnosFiltrados.map(turno => {
            const profesional = profesionales.find(p => p.id === turno.medicoId);
            const nombreProf = profesional ? `${profesional.nombre} ${profesional.apellido}` : "Desconocido";
            const especialidad = getEspecialidadDesc(turno.medicoId);
            
            const estado = turno.disponible ? "Disponible" : "Reservado";
            const estadoBadge = turno.disponible ? 
                '<span class="badge bg-success">Disponible</span>' : 
                `<span class="badge bg-danger">Reservado (${turno.pacienteNombre || 'N/A'})</span>`;
            
            // Usamos turno.hora y calculamos hora fin si es necesario, o usamos el intervalo
            const horaFinStr = turno.intervalo ? minutosAHora(horaAMinutos(turno.hora) + turno.intervalo) : 'N/A';
            
            return `
                <tr>
                    <td>${turno.fecha}</td>
                    <td><strong>${nombreProf}</strong></td>
                    <td>${especialidad}</td>
                    <td>${turno.hora} - ${horaFinStr}</td>
                    <td>${estadoBadge}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-info btn-action" onclick="verDetalles('${turno.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminar('${turno.id}')" ${!turno.disponible ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ================== EVENTOS CRUD & GENERACIÓN ==================
    
    function validarGeneracion() {
        const profesionalId = profesionalSelect.value;
        const fecha = fechaTurnoInput.value;
        const entrada = horaEntrada.value;
        const salida = horaSalida.value;
        const intervalo = intervaloSelect.value;

        if (!profesionalId || !fecha || !entrada || !salida || !intervalo) {
            showToast("Completa todos los campos requeridos.", "error");
            return false;
        }
        if (entrada >= salida) {
            showToast("La hora de fin debe ser posterior a la hora de inicio.", "error");
            return false;
        }
        if (new Date(fecha) < new Date(new Date().toDateString())) {
            showToast("La fecha no puede ser anterior a hoy.", "error");
            return false;
        }
        return true;
    }

    btnGenerarTurnos.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (!validarGeneracion()) return;

        const profesionalId = parseInt(profesionalSelect.value);
        const fecha = fechaTurnoInput.value;
        const horaIni = horaEntrada.value;
        const horaFin = horaSalida.value;
        const intervaloMinutos = parseInt(intervaloSelect.value);
        
        const nuevosTurnos = generarTurnosMasivos(profesionalId, fecha, horaIni, horaFin, intervaloMinutos);

        if (nuevosTurnos.length === 0) {
            showToast("⚠️ No se generó ningún turno (revisa duplicados o el rango de horas).", "error");
            modalGenerar.hide();
            return;
        }
        
        // Guardar los nuevos turnos en TURNOS_INICIALES
        addTurno(nuevosTurnos);
        
        // Recargar los datos globales y la tabla
        cargarDatos();
        renderizarTabla();
        
        showToast(`✅ Se generaron ${nuevosTurnos.length} turnos para el ${fecha}.`, "success");
        
        formGeneracion.reset();
        modalGenerar.hide();
    });

    // Funciones globales (para botones de la tabla)
    window.confirmarEliminar = function(id) {
        const turno = turnosDisponibles.find(t => t.id === id);
        if (!turno) return;

        const profesional = profesionales.find(p => p.id === turno.medicoId);
        const nombreProf = profesional ? `${profesional.nombre} ${profesional.apellido}` : "Desconocido";

        document.getElementById("textoConfirmar").textContent =
            `${nombreProf} - ${turno.fecha} ${turno.hora}`;

        window.idParaEliminar = id;
        modalConfirmarEliminar.show();
    };

    document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
        const id = window.idParaEliminar;
        deleteTurno(id); // Usa la función importada de turnosStorage
        cargarDatos();
        showToast("✓ Turno eliminado correctamente", "success");
        modalConfirmarEliminar.hide();
        renderizarTabla();
    });

    // El resto de la inicialización y limpieza
    document.getElementById("modalAgregarHorario").addEventListener("hidden.bs.modal", () => {
        formGeneracion.reset();
        document.getElementById("especialidadMuestra").textContent = "";
    });

    filterProfesional.addEventListener("change", renderizarTabla);
    filterEstado.addEventListener("change", renderizarTabla);
    btnLimpiarFiltros.addEventListener("click", () => {
        filterProfesional.value = "";
        filterEstado.value = "";
        renderizarTabla();
    });

    function inicializar() {
        cargarDatos();
        llenarSelectProfesionales();
        llenarFiltrosProfesionales();
        
        // Establecer fecha mínima (hoy)
        const hoy = new Date().toISOString().split("T")[0];
        fechaTurnoInput.setAttribute("min", hoy);
        
        renderizarTabla();
    }

    inicializar();
});
// Archivo: js/reportes.js (FINAL - Con depuración de DOM)

import { getTurnos } from "./utils/turnosStorage.js"; 

// Data is retrieved once at module load time.
const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
const todasLasReservas = JSON.parse(localStorage.getItem("RESERVAS")) || []; 

// === DEBUG: Confirmación de carga de datos ===
console.log("DEBUG: Médicos cargados desde localStorage:", medicos.length); 


document.addEventListener("DOMContentLoaded", () => {
    // === Elementos DOM: Búsqueda de SELECT ===
    const filterMedicoReporte = document.getElementById("filterMedicoReporte");
    const tablaTurnosReservados = document.getElementById("tablaTurnosReservados");
    const btnLimpiarReporte = document.getElementById("btnLimpiarReporte");
    const noTurnosDiv = document.getElementById("noTurnos");

    // === VERIFICACIÓN CRÍTICA DEL SELECT ===
    if (!filterMedicoReporte) {
        console.error("ERROR CRÍTICO: No se encontró el SELECT con ID 'filterMedicoReporte'. El filtro no se puede cargar.");
        return; 
    }
    // =======================================

    // === Funciones Auxiliares ===

    function getMedico(id) {
        return medicos.find(m => m.id.toString() === id.toString());
    }

    function getMedicoNombre(id) {
        const medico = getMedico(id);
        return medico ? `${medico.nombre} ${medico.apellido}` : 'Médico Desconocido';
    }

    function getEspecialidadDesc(medicoId) {
        const medico = getMedico(medicoId);
        if (!medico) return 'N/A';
        const esp = especialidades.find(e => e.especialidadId.toString() === medico.especialidadId.toString());
        return esp ? esp.descripcion : 'N/A';
    }

    // --- 1. Llenar Filtro de Médicos ---
    function llenarFiltroMedicos() {
        
        filterMedicoReporte.innerHTML = '<option value="">Todos los Médicos</option>';
        
        if (medicos.length === 0) {
            console.warn("No hay médicos para cargar en el filtro (array de médicos vacío).");
            return;
        }

        medicos.forEach(medico => {
            const option = document.createElement("option");
            option.value = medico.id;
            option.textContent = getMedicoNombre(medico.id);
            filterMedicoReporte.appendChild(option);
        });
        console.log(`DEBUG: Filtro de Médicos cargado con ${medicos.length} opciones.`);
    }

    // --- 2. Renderizar Reporte de Turnos ---
    function renderizarTurnosReservados() {
        const turnos = getTurnos() || []; 
        const filtroMedicoId = filterMedicoReporte.value ? parseInt(filterMedicoReporte.value) : null;

        let turnosFiltrados = turnos.filter(t => 
            !filtroMedicoId || t.medicoId.toString() === filtroMedicoId.toString()
        );

        turnosFiltrados.sort((a, b) => {
            const dateA = new Date(`${a.fecha} ${a.hora}`);
            const dateB = new Date(`${b.fecha} ${b.hora}`);
            return dateA - dateB;
        });

        if (turnosFiltrados.length === 0) {
            tablaTurnosReservados.innerHTML = '';
            if (noTurnosDiv) noTurnosDiv.classList.remove('d-none');
            return;
        }

        if (noTurnosDiv) noTurnosDiv.classList.add('d-none');

        tablaTurnosReservados.innerHTML = turnosFiltrados.map(turno => {
            const nombreMedico = getMedicoNombre(turno.medicoId);
            const especialidad = getEspecialidadDesc(turno.medicoId);
            
            let pacienteInfo, costoPaciente, estadoBadge, estadoTexto;

            if (turno.disponible === false) {
                const reserva = todasLasReservas.find(r => r.Turno.toString() === turno.id.toString());
                
                pacienteInfo = reserva ? `Paciente: ${reserva["Apellido y nombre del paciente"]}` : 'Reservado (Datos no encontrados)';
                costoPaciente = reserva ? `$${parseFloat(reserva["Valor total"]).toFixed(2)}` : 'N/A';
                
                const estado = turno.estado || (reserva ? 'Confirmado' : 'Reservado');
                estadoTexto = estado;
                estadoBadge = estado === 'Confirmado' ? 'bg-success' : 'bg-danger';

            } else {
                pacienteInfo = '---';
                costoPaciente = '---';
                estadoTexto = 'Disponible';
                estadoBadge = 'bg-primary'; 
            }

            return `
                <tr>
                    <td>${turno.fecha} ${turno.hora}</td>
                    <td>${nombreMedico}</td>
                    <td>${especialidad}</td>
                    <td>${pacienteInfo}</td>
                    <td>${costoPaciente}</td>
                    <td><span class="badge ${estadoBadge}">${estadoTexto}</span></td>
                </tr>
            `;
        }).join('');
    }

    // === 3. Eventos ===
    if (filterMedicoReporte) {
        filterMedicoReporte.addEventListener('change', renderizarTurnosReservados);
    }
    
    if (btnLimpiarReporte) {
        btnLimpiarReporte.addEventListener('click', () => {
            if (filterMedicoReporte) filterMedicoReporte.value = '';
            renderizarTurnosReservados();
        });
    }

    // === Inicialización del Módulo ===
    llenarFiltroMedicos();
    renderizarTurnosReservados();
});
// Archivo turnosAbm.js (ABM de Turnos para el Administrador)

import { getTurnos, updateTurno, deleteTurno, generarId } from "./utils/turnosStorage.js";

// Variables globales
let turnos = [];
let turnoEditando = null;
let turnoAEliminar = null;

// Elementos del DOM
const turnosTableBody = document.getElementById("turnosTableBody");
const searchInput = document.getElementById("searchInput");
const filterEstado = document.getElementById("filterEstado");
const noResults = document.getElementById("noResults");
const turnoModal = new bootstrap.Modal(document.getElementById("turnoModal"));
const verTurnoModal = new bootstrap.Modal(document.getElementById("verTurnoModal"));
const confirmarEliminarModal = new bootstrap.Modal(document.getElementById("confirmarEliminarModal"));

// Formulario
const turnoForm = document.getElementById("turnoForm");
const btnGuardarTurno = document.getElementById("btnGuardarTurno");
const btnNuevoTurno = document.getElementById("btnNuevoTurno");
const turnoModalLabel = document.getElementById("turnoModalLabel");
const selectMedico = document.getElementById("medico");
const selectEstado = document.getElementById("estado"); // Asegurarse de que este select exista en el modal

// Datos auxiliares (asumiendo que existen)
const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];

// ================== FUNCIONES AUXILIARES ==================

// Función para obtener el nombre completo del médico por ID
function getMedicoNombre(id) {
    const medico = medicos.find(m => m.id === id);
    return medico ? `${medico.nombre} ${medico.apellido}` : 'Médico Desconocido';
}

// Función para obtener el nombre de la especialidad por ID
function getEspecialidadNombre(id) {
    const especialidad = especialidades.find(e => e.id === id);
    return especialidad ? especialidad.descripcion : 'N/A';
}

// Función para simular un Toast (se mantiene la función original)
function showToast(message, color = "success") {
  const toastContainer = document.getElementById("toastContainer");
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${color} border-0`;
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

// ================== CARGA Y ALMACENAMIENTO ==================

// Cargar turnos desde LocalStorage (usando la función importada)
function cargarTurnos() {
  // Los turnos del admin usarán la clave "TURNOS_INICIALES" para centralizar la fuente de verdad.
  // Es importante que este ABM trabaje sobre los turnos generados.
  turnos = getTurnos(); 
  
  // Asignar un estado a los turnos si no lo tienen. Un turno reservado es "Confirmado", uno disponible es "Disponible/Libre"
  turnos.forEach(t => {
      // Si el turno tiene pacienteDocumento (es reservado), se considera Confirmado o Pendiente.
      if (t.pacienteDocumento) {
          t.estado = t.estado || "Confirmado"; // O se podría tomar de la Reserva
      } else {
          t.estado = t.estado || "Disponible"; // Nuevo estado para turnos libres
      }
      
      // Mapear los campos de la entidad Turno a los campos de la tabla ABM
      t.medico = getMedicoNombre(t.medicoId);
      t.especialidad = getEspecialidadNombre(t.especialidadId);
      t.paciente = t.pacienteNombre || t.pacienteDocumento || 'Libre';
  });
  
  // Ordenar por fecha y hora
  turnos.sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateA - dateB;
  });
  
  renderizarTabla(turnos);
}

// Cargar médicos para el select
function cargarMedicos() {
  selectMedico.innerHTML = '<option value="">Seleccionar médico...</option>';
  medicos.forEach(medico => {
    const especialidadNombre = getEspecialidadNombre(medico.especialidadId);
    const option = document.createElement("option");
    option.value = medico.id; // Usar el ID del médico como valor
    option.textContent = `${medico.nombre} ${medico.apellido} (${especialidadNombre})`;
    option.dataset.especialidadId = medico.especialidadId;
    selectMedico.appendChild(option);
  });
}

// ================== FUNCIONES DE TABLA ==================

// Renderizar tabla
function renderizarTabla(turnosAMostrar) {
  if (turnosAMostrar.length === 0) {
    turnosTableBody.innerHTML = "";
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  turnosTableBody.innerHTML = turnosAMostrar.map(turno => {
    const estado = turno.disponible ? "Disponible" : turno.estado || "Confirmado";
    const estadoBadge = estado === "Confirmado" ? "success" : 
                        estado === "Pendiente" ? "warning" : 
                        estado === "Cancelado" ? "danger" : 
                        "info"; // Disponible

    return `
      <tr>
        <td>${turno.id}</td>
        <td>${turno.paciente}</td>
        <td>${turno.medico}</td>
        <td><span class="badge bg-secondary">${turno.especialidad || 'N/A'}</span></td>
        <td>${turno.fecha}</td>
        <td>${turno.hora}</td>
        <td><span class="badge bg-${estadoBadge}">${estado}</span></td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-info" onclick="verTurno('${turno.id}')" title="Ver"><i class="bi bi-eye"></i></button>
            <button class="btn btn-warning" onclick="editarTurno('${turno.id}')" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-danger" onclick="confirmarEliminar('${turno.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ================== FUNCIONES DE BÚSQUEDA Y FILTRADO ==================

// Buscar y filtrar turnos
searchInput.addEventListener("input", () => {
  filtrarYRenderizar();
});

filterEstado.addEventListener("change", () => {
  filtrarYRenderizar();
});

function filtrarYRenderizar() {
  const termino = searchInput.value.toLowerCase();
  const estado = filterEstado.value;
  
  const turnosFiltrados = turnos.filter(turno => {
    const pacienteStr = turno.pacienteNombre || turno.pacienteDocumento || 'Libre';
    const estadoActual = turno.disponible ? "Disponible" : turno.estado || "Confirmado";
    
    const coincideTexto = pacienteStr.toLowerCase().includes(termino) ||
                          turno.medico.toLowerCase().includes(termino) ||
                          turno.fecha.includes(termino);
                          
    const coincideEstado = estado === "" || estadoActual === estado;
    
    return coincideTexto && coincideEstado;
  });
  
  renderizarTabla(turnosFiltrados);
}

// ================== FUNCIONES CRUD ==================

// Abrir modal para nuevo turno (para agregar turnos individuales)
btnNuevoTurno.addEventListener("click", () => {
  turnoEditando = null;
  turnoForm.reset();
  turnoModalLabel.innerHTML = '<i class="bi bi-calendar-plus"></i> Nuevo Turno Individual';
  selectEstado.value = "Disponible";
});

// Guardar turno (Actualiza un turno existente o crea uno nuevo)
btnGuardarTurno.addEventListener("click", () => {
  if (!turnoForm.checkValidity()) {
    turnoForm.reportValidity();
    return;
  }

  const medicoId = parseInt(document.getElementById("medico").value);
  const medicoSeleccionado = medicos.find(m => m.id === medicoId);

  // Mapeo de los campos del formulario a la estructura del Turno
  const cambios = {
    // Si se crea un nuevo turno, se usan estos campos. Si se edita, se actualizan.
    // Solo se permite editar los campos básicos y el estado en el ABM
    pacienteNombre: document.getElementById("paciente").value.trim(),
    medicoId: medicoId,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    estado: document.getElementById("estado").value, // Se mantiene el estado personalizado del ABM
    // Otros campos que podrían editarse:
    pacienteDocumento: document.getElementById("documento").value.trim() || null,
    especialidadId: medicoSeleccionado?.especialidadId || null,
    disponible: document.getElementById("estado").value === "Disponible" // Si es "Disponible", el flag es true
  };

  if (turnoEditando) {
    updateTurno(turnoEditando.id, cambios);
    showToast(`✔ Turno de ${cambios.pacienteNombre || "Libre"} actualizado`, "success");
  } else {
    // Crear un nuevo turno individual
    const nuevoTurno = {
      id: generarId(),
      ...cambios
    };
    addTurno(nuevoTurno);
    showToast(`✔ Turno de ${cambios.pacienteNombre || "Libre"} creado`, "success");
  }

  cargarTurnos();
  turnoModal.hide();
});


// Ver turno
window.verTurno = function(id) {
  const turno = turnos.find(t => t.id.toString() === id.toString());
  if (!turno) return;

  const estado = turno.disponible ? "Disponible" : turno.estado || "Confirmado";
  const estadoBadge = estado === "Confirmado" ? "success" : 
                      estado === "Pendiente" ? "warning" : 
                      estado === "Cancelado" ? "danger" : 
                      "info"; // Disponible
  
  // Se requiere tener los campos de teléfono y email en la entidad de Turno si se usa este modal.
  // Por ahora, se usan campos del turno o se dejan vacíos.
  
  document.getElementById("verPaciente").textContent = turno.pacienteNombre || turno.pacienteDocumento || 'Libre';
  document.getElementById("verMedico").textContent = turno.medico;
  document.getElementById("verEspecialidad").textContent = turno.especialidad || "N/A";
  document.getElementById("verFechaHora").textContent = `${turno.fecha} - ${turno.hora}`;
  document.getElementById("verTelefono").textContent = turno.telefono || "N/A"; // Asumiendo que se agregó al crear la reserva
  document.getElementById("verEmail").textContent = turno.email || "N/A"; // Asumiendo que se agregó al crear la reserva
  document.getElementById("verEstado").innerHTML = `<span class="badge bg-${estadoBadge}">${estado}</span>`;

  verTurnoModal.show();
};

// Editar turno
window.editarTurno = function(id) {
  const turno = turnos.find(t => t.id.toString() === id.toString());
  if (!turno) return;

  turnoEditando = turno;
  
  // Llenar campos del modal
  document.getElementById("paciente").value = turno.pacienteNombre || turno.pacienteDocumento || '';
  document.getElementById("medico").value = turno.medicoId; // Se usa el ID en el select
  document.getElementById("fecha").value = turno.fecha;
  document.getElementById("hora").value = turno.hora;
  document.getElementById("telefono").value = turno.telefono || "";
  document.getElementById("email").value = turno.email || "";
  document.getElementById("documento").value = turno.pacienteDocumento || ""; // Nuevo input de documento
  
  // Establecer el estado: si está disponible, usar "Disponible" o el estado personalizado
  selectEstado.value = turno.disponible ? "Disponible" : turno.estado || "Confirmado"; 

  turnoModalLabel.innerHTML = '<i class="bi bi-calendar-check"></i> Editar Turno';
  turnoModal.show();
};

// Confirmar eliminación
window.confirmarEliminar = function(id) {
  const turno = turnos.find(t => t.id.toString() === id.toString());
  if (!turno) return;
  turnoAEliminar = turno;
  document.getElementById("pacienteEliminar").textContent = turno.pacienteNombre || turno.pacienteDocumento || 'Libre';
  confirmarEliminarModal.show();
};

// Eliminar turno
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!turnoAEliminar) return;
  
  deleteTurno(turnoAEliminar.id); // Usar la función importada
  
  showToast(`✔ Turno de ${turnoAEliminar.pacienteNombre || turnoAEliminar.pacienteDocumento || 'Libre'} eliminado`, "danger");
  confirmarEliminarModal.hide();
  turnoAEliminar = null;
  cargarTurnos(); // Recargar la tabla
});

// ================== INICIALIZACIÓN ==================

document.addEventListener("DOMContentLoaded", () => {
  cargarMedicos();
  cargarTurnos();
});
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

// ================== FUNCIONES AUXILIARES ==================

// Función para mostrar toast
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

// Cargar turnos desde LocalStorage
function cargarTurnos() {
  const turnosJSON = localStorage.getItem("turnos");
  turnos = turnosJSON ? JSON.parse(turnosJSON) : [];
  renderizarTabla(turnos);
}

// Guardar turnos en LocalStorage
function guardarTurnos() {
  localStorage.setItem("turnos", JSON.stringify(turnos));
}

// Cargar médicos para el select
function cargarMedicos() {
  const medicosJSON = localStorage.getItem("medicos");
  const medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
  
  selectMedico.innerHTML = '<option value="">Seleccionar médico...</option>';
  medicos.forEach(medico => {
    const option = document.createElement("option");
    option.value = `${medico.nombre} ${medico.apellido}`;
    option.textContent = `${medico.nombre} ${medico.apellido} (${medico.especialidad || 'Sin especialidad'})`;
    option.dataset.especialidad = medico.especialidad || '';
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
    const estadoBadge = turno.estado === "Confirmado" ? "success" : 
                       turno.estado === "Pendiente" ? "warning" : "danger";
    
    return `
      <tr>
        <td>${turno.id}</td>
        <td>${turno.paciente}</td>
        <td>${turno.medico}</td>
        <td><span class="badge bg-info">${turno.especialidad || 'N/A'}</span></td>
        <td>${turno.fecha}</td>
        <td>${turno.hora}</td>
        <td><span class="badge bg-${estadoBadge}">${turno.estado}</span></td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-info" onclick="verTurno(${turno.id})" title="Ver"><i class="bi bi-eye"></i></button>
            <button class="btn btn-warning" onclick="editarTurno(${turno.id})" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-danger" onclick="confirmarEliminar(${turno.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ================== FUNCIONES DE BÚSQUEDA Y FILTRADO ==================

// Buscar y filtrar turnos
searchInput.addEventListener("input", (e) => {
  const termino = e.target.value.toLowerCase();
  const estado = filterEstado.value;
  
  const turnosFiltrados = turnos.filter(turno => {
    const coincideTexto = turno.paciente.toLowerCase().includes(termino) ||
                         turno.medico.toLowerCase().includes(termino) ||
                         turno.fecha.includes(termino);
    const coincideEstado = estado === "" || turno.estado === estado;
    return coincideTexto && coincideEstado;
  });
  
  renderizarTabla(turnosFiltrados);
});

filterEstado.addEventListener("change", () => {
  searchInput.dispatchEvent(new Event("input"));
});

// ================== FUNCIONES CRUD ==================

// Abrir modal para nuevo turno
btnNuevoTurno.addEventListener("click", () => {
  turnoEditando = null;
  turnoForm.reset();
  document.getElementById("turnoId").value = "";
  turnoModalLabel.innerHTML = '<i class="bi bi-calendar-plus"></i> Nuevo Turno';
});

// Guardar turno
btnGuardarTurno.addEventListener("click", () => {
  if (!turnoForm.checkValidity()) {
    turnoForm.reportValidity();
    return;
  }

  const turno = {
    id: turnoEditando ? turnoEditando.id : generarId(),
    paciente: document.getElementById("paciente").value.trim(),
    medico: document.getElementById("medico").value.trim(),
    especialidad: selectMedico.options[selectMedico.selectedIndex].dataset.especialidad || "",
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    estado: document.getElementById("estado").value
  };

  if (turnoEditando) {
    const index = turnos.findIndex(t => t.id === turnoEditando.id);
    turnos[index] = turno;
    showToast(`✔ Turno de ${turno.paciente} actualizado`, "success");
  } else {
    turnos.push(turno);
    showToast(`✔ Turno de ${turno.paciente} creado`, "success");
  }

  guardarTurnos();
  cargarTurnos();
  turnoModal.hide();
});

// Ver turno
window.verTurno = function(id) {
  const turno = turnos.find(t => t.id === id);
  if (!turno) return;

  document.getElementById("verPaciente").textContent = turno.paciente;
  document.getElementById("verMedico").textContent = turno.medico;
  document.getElementById("verEspecialidad").textContent = turno.especialidad || "N/A";
  document.getElementById("verFechaHora").textContent = `${turno.fecha} - ${turno.hora}`;
  document.getElementById("verTelefono").textContent = turno.telefono;
  document.getElementById("verEmail").textContent = turno.email;
  
  const estadoBadge = turno.estado === "Confirmado" ? "success" : 
                     turno.estado === "Pendiente" ? "warning" : "danger";
  document.getElementById("verEstado").innerHTML = `<span class="badge bg-${estadoBadge}">${turno.estado}</span>`;

  verTurnoModal.show();
};

// Editar turno
window.editarTurno = function(id) {
  const turno = turnos.find(t => t.id === id);
  if (!turno) return;

  turnoEditando = turno;

  document.getElementById("paciente").value = turno.paciente;
  document.getElementById("medico").value = turno.medico;
  document.getElementById("fecha").value = turno.fecha;
  document.getElementById("hora").value = turno.hora;
  document.getElementById("telefono").value = turno.telefono;
  document.getElementById("email").value = turno.email;
  document.getElementById("estado").value = turno.estado;

  turnoModalLabel.innerHTML = '<i class="bi bi-calendar-check"></i> Editar Turno';
  turnoModal.show();
};

// Confirmar eliminación
window.confirmarEliminar = function(id) {
  const turno = turnos.find(t => t.id === id);
  if (!turno) return;
  turnoAEliminar = turno;
  document.getElementById("pacienteEliminar").textContent = turno.paciente;
  confirmarEliminarModal.show();
};

// Eliminar turno
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!turnoAEliminar) return;
  turnos = turnos.filter(t => t.id !== turnoAEliminar.id);
  guardarTurnos();
  cargarTurnos();
  showToast(`✔ Turno de ${turnoAEliminar.paciente} eliminado`, "danger");
  confirmarEliminarModal.hide();
  turnoAEliminar = null;
});

// ================== FUNCIONES DE UTILIDAD ==================

// Generar ID único
function generarId() {
  return turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
}

// ================== INICIALIZACIÓN ==================
// La protección de rutas la maneja auth.js, no duplicar aquí
document.addEventListener("DOMContentLoaded", () => {
  cargarMedicos();
  cargarTurnos();
});
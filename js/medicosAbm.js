// Variables globales
let medicos = [];
let medicoEditando = null;
let medicoAEliminar = null;

// Elementos del DOM
const medicosTableBody = document.getElementById("medicosTableBody");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const medicoModal = new bootstrap.Modal(document.getElementById("medicoModal"));
const verMedicoModal = new bootstrap.Modal(document.getElementById("verMedicoModal"));
const confirmarEliminarModal = new bootstrap.Modal(document.getElementById("confirmarEliminarModal"));

// Formulario
const medicoForm = document.getElementById("medicoForm");
const btnGuardarMedico = document.getElementById("btnGuardarMedico");
const btnNuevoMedico = document.getElementById("btnNuevoMedico");
const medicoModalLabel = document.getElementById("medicoModalLabel");

// Función para mostrar toast
function showToast(message, color = "success") {
  const toastContainer = document.getElementById("toastContainer");
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${color} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");
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

// Cargar médicos desde LocalStorage
function cargarMedicos() {
  const medicosJSON = localStorage.getItem("medicos");
  medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
  renderizarTabla(medicos);
}

// Guardar médicos en LocalStorage
function guardarMedicos() {
  localStorage.setItem("medicos", JSON.stringify(medicos));
}

// Renderizar tabla
function renderizarTabla(medicosAMostrar) {
  if (medicosAMostrar.length === 0) {
    medicosTableBody.innerHTML = "";
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");
  
  medicosTableBody.innerHTML = medicosAMostrar.map(medico => `
    <tr>
      <td>${medico.id}</td>
      <td>${medico.nombre}</td>
      <td>${medico.apellido}</td>
      <td><span class="badge bg-info">${medico.especialidad}</span></td>
      <td>${medico.matricula}</td>
      <td>${medico.telefono}</td>
      <td>${medico.email}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-info" onclick="verMedico(${medico.id})" title="Ver">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-warning" onclick="editarMedico(${medico.id})" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger" onclick="confirmarEliminar(${medico.id})" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Buscar médicos
searchInput.addEventListener("input", (e) => {
  const termino = e.target.value.toLowerCase();
  const medicosFiltrados = medicos.filter(medico => 
    medico.nombre.toLowerCase().includes(termino) ||
    medico.apellido.toLowerCase().includes(termino) ||
    medico.especialidad.toLowerCase().includes(termino)
  );
  renderizarTabla(medicosFiltrados);
});

// Abrir modal para nuevo médico
btnNuevoMedico.addEventListener("click", () => {
  medicoEditando = null;
  medicoForm.reset();
  document.getElementById("medicoId").value = "";
  medicoModalLabel.innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Médico';
});

// Guardar médico (crear o editar)
btnGuardarMedico.addEventListener("click", () => {
  // Validar formulario
  if (!medicoForm.checkValidity()) {
    medicoForm.reportValidity();
    return;
  }

  const medico = {
    id: medicoEditando ? medicoEditando.id : generarId(),
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    especialidad: document.getElementById("especialidad").value.trim(),
    matricula: document.getElementById("matricula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    horario: document.getElementById("horario").value.trim() || "No especificado"
  };

  if (medicoEditando) {
    // Editar
    const index = medicos.findIndex(m => m.id === medicoEditando.id);
    medicos[index] = medico;
    showToast(`✔ Médico ${medico.nombre} ${medico.apellido} actualizado correctamente`, "success");
  } else {
    // Crear
    medicos.push(medico);
    showToast(`✔ Médico ${medico.nombre} ${medico.apellido} agregado correctamente`, "success");
  }

  guardarMedicos();
  cargarMedicos();
  medicoModal.hide();
  medicoForm.reset();
});

// Ver médico
function verMedico(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  document.getElementById("verNombre").textContent = medico.nombre;
  document.getElementById("verApellido").textContent = medico.apellido;
  document.getElementById("verEspecialidad").textContent = medico.especialidad;
  document.getElementById("verMatricula").textContent = medico.matricula;
  document.getElementById("verTelefono").textContent = medico.telefono;
  document.getElementById("verEmail").textContent = medico.email;
  document.getElementById("verHorario").textContent = medico.horario;

  verMedicoModal.show();
}

// Editar médico
function editarMedico(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  medicoEditando = medico;
  
  document.getElementById("medicoId").value = medico.id;
  document.getElementById("nombre").value = medico.nombre;
  document.getElementById("apellido").value = medico.apellido;
  document.getElementById("especialidad").value = medico.especialidad;
  document.getElementById("matricula").value = medico.matricula;
  document.getElementById("telefono").value = medico.telefono;
  document.getElementById("email").value = medico.email;
  document.getElementById("horario").value = medico.horario;

  medicoModalLabel.innerHTML = '<i class="bi bi-pencil"></i> Editar Médico';
  medicoModal.show();
}

// Confirmar eliminación
function confirmarEliminar(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  medicoAEliminar = medico;
  document.getElementById("nombreEliminar").textContent = `${medico.nombre} ${medico.apellido}`;
  confirmarEliminarModal.show();
}

// Eliminar médico
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!medicoAEliminar) return;

  medicos = medicos.filter(m => m.id !== medicoAEliminar.id);
  guardarMedicos();
  cargarMedicos();
  
  showToast(`✔ Médico ${medicoAEliminar.nombre} ${medicoAEliminar.apellido} eliminado correctamente`, "danger");
  
  confirmarEliminarModal.hide();
  medicoAEliminar = null;
});

// Generar ID único
function generarId() {
  return medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;
}

// Control de acceso
function verificarAcceso() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "admin.html";
  }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  cargarMedicos();
});

// Exponer funciones al scope global para los onclick
window.verMedico = verMedico;
window.editarMedico = editarMedico;
window.confirmarEliminar = confirmarEliminar;
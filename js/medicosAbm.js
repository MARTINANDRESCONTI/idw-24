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
const fotoInput = document.getElementById("foto");
const previewImg = document.getElementById("previewImg");

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
      <td>
        <img src="${medico.foto || 'assets/default.png'}" 
             class="rounded-circle border" 
             width="50" height="50" 
             alt="Foto del médico">
      </td>
      <td>${medico.id}</td>
      <td>${medico.nombre}</td>
      <td>${medico.apellido}</td>
      <td><span class="badge bg-info">${medico.especialidad}</span></td>
      <td>${medico.matricula}</td>
      <td>${medico.telefono}</td>
      <td>${medico.email}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-info" onclick="verMedico(${medico.id})" title="Ver"><i class="bi bi-eye"></i></button>
          <button class="btn btn-warning" onclick="editarMedico(${medico.id})" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-danger" onclick="confirmarEliminar(${medico.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Convertir imagen a Base64
function convertirABase64(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

// ✅ Preview de imagen (con validación de tipo y fallback a default)
if (fotoInput) {
  fotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) {
      previewImg.src = "assets/default.png";
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("⚠ Solo se permiten archivos JPG o PNG", "warning");
      fotoInput.value = "";
      previewImg.src = "assets/default.png";
      return;
    }
    convertirABase64(file, (base64) => {
      previewImg.src = base64;
    });
  });
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
  previewImg.src = "assets/default.png"; // 👈 imagen por defecto
  medicoModalLabel.innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Médico';
});

// Guardar médico
btnGuardarMedico.addEventListener("click", () => {
  if (!medicoForm.checkValidity()) {
    medicoForm.reportValidity();
    return;
  }

  const baseFoto = previewImg.src && previewImg.src !== window.location.origin + "/undefined"
    ? previewImg.src
    : "assets/default.png";

  const medico = {
    id: medicoEditando ? medicoEditando.id : generarId(),
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    especialidad: document.getElementById("especialidad").value.trim(),
    matricula: document.getElementById("matricula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    horario: document.getElementById("horario").value.trim() || "No especificado",
    foto: baseFoto
  };

  if (medicoEditando) {
    const index = medicos.findIndex(m => m.id === medicoEditando.id);
    medicos[index] = medico;
    showToast(`✔ Médico ${medico.nombre} actualizado`, "success");
  } else {
    medicos.push(medico);
    showToast(`✔ Médico ${medico.nombre} agregado`, "success");
  }

  guardarMedicos();
  cargarMedicos();
  medicoModal.hide();
});

// Ver médico
function verMedico(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  document.getElementById("verFoto").src = medico.foto || "assets/default.png";
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

  document.getElementById("nombre").value = medico.nombre;
  document.getElementById("apellido").value = medico.apellido;
  document.getElementById("especialidad").value = medico.especialidad;
  document.getElementById("matricula").value = medico.matricula;
  document.getElementById("telefono").value = medico.telefono;
  document.getElementById("email").value = medico.email;
  document.getElementById("horario").value = medico.horario;
  previewImg.src = medico.foto || "assets/default.png";

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
  showToast(`✔ Médico ${medicoAEliminar.nombre} eliminado`, "danger");
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

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  cargarMedicos();
});

window.verMedico = verMedico;
window.editarMedico = editarMedico;
window.confirmarEliminar = confirmarEliminar;

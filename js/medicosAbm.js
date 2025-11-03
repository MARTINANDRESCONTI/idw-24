// ================== VARIABLES GLOBALES ==================
let medicos = [];
let especialidades = [];
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

// Cargar especialidades desde LocalStorage
function cargarEspecialidades() {
  const especialidadesJSON = localStorage.getItem("especialidades");
  especialidades = especialidadesJSON ? JSON.parse(especialidadesJSON) : [];
  llenarSelectEspecialidades();
}

// Llenar el select de especialidades
function llenarSelectEspecialidades() {
  const selectEspecialidad = document.getElementById("especialidad");
  
  // Guardar valor actual si está editando
  const valorActual = selectEspecialidad.value;
  
  selectEspecialidad.innerHTML = '<option value="">Seleccionar especialidad</option>';
  
  especialidades.forEach(esp => {
    const option = document.createElement("option");
    option.value = esp.especialidadId;
    option.textContent = esp.descripcion;
    selectEspecialidad.appendChild(option);
  });
  
  // Restaurar valor actual
  if (valorActual) {
    selectEspecialidad.value = valorActual;
  }
}

// ================== FUNCIONES DE TABLA ==================

// Renderizar tabla de médicos
function renderizarTabla(medicosAMostrar) {
  if (medicosAMostrar.length === 0) {
    medicosTableBody.innerHTML = "";
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  medicosTableBody.innerHTML = medicosAMostrar.map(medico => {
    const esp = especialidades.find(e => e.especialidadId === medico.especialidadId);
    const nombreEsp = esp ? esp.descripcion : "Sin especialidad";

    return `
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
        <td><span class="badge bg-info">${nombreEsp}</span></td>
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
    `;
  }).join("");
}

// ================== FUNCIONES CRUD ==================

// Convertir imagen a Base64
function convertirABase64(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

// Preview de imagen
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
  previewImg.src = "assets/default.png";
  medicoModalLabel.innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Médico';
  document.getElementById("especialidad").value = "";
});

// Guardar médico
btnGuardarMedico.addEventListener("click", () => {
  if (!medicoForm.checkValidity()) {
    medicoForm.reportValidity();
    return;
  }

  const especialidadId = parseInt(document.getElementById("especialidad").value);
  
  if (!especialidad) {
    showToast("Selecciona una especialidad", "warning");
    return;
  }

  const baseFoto = previewImg.src && previewImg.src !== window.location.origin + "/undefined"
    ? previewImg.src
    : "assets/default.png";

  const medico = {
    id: medicoEditando ? medicoEditando.id : generarId(),
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    especialidadId: especialidadId, 
    especialidadDescripcion: esp.descripcion,
    matricula: document.getElementById("matricula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
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
window.verMedico = function(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  
  document.getElementById("verApellido").textContent = medico.apellido;
  document.getElementById("verEspecialidad").textContent = medico.especialidad;
  document.getElementById("verMatricula").textContent = medico.matricula;
  document.getElementById("verTelefono").textContent = medico.telefono;
  document.getElementById("verEmail").textContent = medico.email;

  verMedicoModal.show();
};

// Editar médico
window.editarMedico = function(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;

  medicoEditando = medico;

  document.getElementById("nombre").value = medico.nombre;
  document.getElementById("apellido").value = medico.apellido;
  document.getElementById("especialidad").value = medico.especialidad;
  document.getElementById("matricula").value = medico.matricula;
  document.getElementById("telefono").value = medico.telefono;
  document.getElementById("email").value = medico.email;
  previewImg.src = medico.foto || "assets/default.png";

  medicoModalLabel.innerHTML = '<i class="bi bi-pencil"></i> Editar Médico';
  medicoModal.show();
};

// Confirmar eliminación
window.confirmarEliminar = function(id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  medicoAEliminar = medico;
  document.getElementById("nombreEliminar").textContent = `${medico.nombre} ${medico.apellido}`;
  confirmarEliminarModal.show();
};

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

// ================== FUNCIONES DE UTILIDAD ==================

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

// ================== INICIALIZACIÓN ==================
document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  cargarEspecialidades();  // Cargar especialidades primero
  cargarMedicos();          // Luego cargar médicos
});

// Hacer funciones globales accesibles desde HTML
window.verMedico = window.verMedico;
window.editarMedico = window.editarMedico;
window.confirmarEliminar = window.confirmarEliminar;
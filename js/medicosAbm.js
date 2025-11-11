// ================== VARIABLES GLOBALES ==================
let medicos = [];
let especialidades = [];
let obrasSociales = [];
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
function showToast(message, color = "success") {
  const toastContainer = document.getElementById("toastContainer");
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${color} border-0`;
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// ================== CARGA Y ALMACENAMIENTO ==================
function cargarMedicos() {
  const medicosJSON = localStorage.getItem("medicos");
  medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
  renderizarTabla(medicos);
}

function guardarMedicos() {
  localStorage.setItem("medicos", JSON.stringify(medicos));
}

function cargarEspecialidades() {
  const especialidadesJSON = localStorage.getItem("especialidades");
  especialidades = especialidadesJSON ? JSON.parse(especialidadesJSON) : [];
  llenarSelectEspecialidades();
}

function llenarSelectEspecialidades() {
  const select = document.getElementById("especialidad");
  select.innerHTML = '<option value="">Seleccionar especialidad</option>';
  especialidades.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.especialidadId;
    opt.textContent = e.descripcion;
    select.appendChild(opt);
  });
}

// ====== NUEVO: CARGA DE OBRAS SOCIALES ======
function cargarObrasSociales() {
  const obrasJSON = localStorage.getItem("obrasSociales");
  obrasSociales = obrasJSON ? JSON.parse(obrasJSON) : [];
  llenarSelectObras();
}

function llenarSelectObras() {
  const select = document.getElementById("obrasSociales");
  if (!select) return;
  select.innerHTML = "";
  obrasSociales.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = o.nombre;
    select.appendChild(opt);
  });
}

// ================== TABLA ==================
function renderizarTabla(lista) {
  if (!lista || lista.length === 0) {
    medicosTableBody.innerHTML = "";
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  medicosTableBody.innerHTML = lista.map(medico => {
    const esp = especialidades.find(e => e.especialidadId === medico.especialidadId);
    const nombreEsp = esp ? esp.descripcion : "Sin especialidad";
    const obrasAtendidas = medico.obrasSociales?.length
      ? medico.obrasSociales.map(id => {
          const o = obrasSociales.find(os => os.id === id);
          return o ? o.nombre : "";
        }).join(", ")
      : "Particular";
    return `
      <tr>
        <td><img src="${medico.foto || 'assets/default.png'}" class="rounded-circle border" width="50" height="50"></td>
        <td>${medico.id}</td>
        <td>${medico.nombre}</td>
        <td>${medico.apellido}</td>
        <td><span class="badge bg-info">${nombreEsp}</span></td>
        <td>${medico.matricula}</td>
        <td>${medico.telefono}</td>
        <td>${medico.email}</td>
        <td>${obrasAtendidas}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-info" onclick="verMedico(${medico.id})"><i class="bi bi-eye"></i></button>
            <button class="btn btn-warning" onclick="editarMedico(${medico.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-danger" onclick="confirmarEliminar(${medico.id})"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

// ================== CRUD ==================
if (fotoInput) {
  fotoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) {
      previewImg.src = "assets/default.png";
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("⚠ Solo se permiten imágenes JPG o PNG", "warning");
      fotoInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => (previewImg.src = reader.result);
    reader.readAsDataURL(file);
  });
}

// Buscar
searchInput.addEventListener("input", e => {
  const termino = e.target.value.toLowerCase();
  const filtrados = medicos.filter(m => {
    const esp = especialidades.find(e => e.especialidadId === m.especialidadId);
    const nombreEsp = esp ? esp.descripcion.toLowerCase() : "";
    return (
      m.nombre.toLowerCase().includes(termino) ||
      m.apellido.toLowerCase().includes(termino) ||
      nombreEsp.includes(termino)
    );
  });
  renderizarTabla(filtrados);
});

// Nuevo médico
btnNuevoMedico.addEventListener("click", () => {
  medicoEditando = null;
  medicoForm.reset();
  previewImg.src = "assets/default.png";
  medicoModalLabel.innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Médico';
});

// Guardar
btnGuardarMedico.addEventListener("click", () => {
  if (!medicoForm.checkValidity()) {
    medicoForm.reportValidity();
    return;
  }

  const especialidadId = parseInt(document.getElementById("especialidad").value);
  if (!especialidadId) {
    showToast("Selecciona una especialidad", "warning");
    return;
  }

  const esp = especialidades.find(e => e.especialidadId === especialidadId);
  const baseFoto = previewImg.src || "assets/default.png";

  const obrasSeleccionadas = Array.from(
    document.getElementById("obrasSociales").selectedOptions
  ).map(opt => opt.value);

  const medico = {
    id: medicoEditando ? medicoEditando.id : generarId(),
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    especialidadId,
    matricula: document.getElementById("matricula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    foto: baseFoto,
    obrasSociales: obrasSeleccionadas
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
window.verMedico = function (id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  const esp = especialidades.find(e => e.especialidadId === medico.especialidadId);

  document.getElementById("verNombre").textContent = medico.nombre;
  document.getElementById("verApellido").textContent = medico.apellido;
  document.getElementById("verEspecialidad").textContent = esp ? esp.descripcion : "Sin especialidad";
  document.getElementById("verMatricula").textContent = medico.matricula;
  document.getElementById("verTelefono").textContent = medico.telefono;
  document.getElementById("verEmail").textContent = medico.email;

  const obrasAtendidas = medico.obrasSociales?.length
    ? medico.obrasSociales.map(id => {
        const o = obrasSociales.find(os => os.id === id);
        return o ? o.nombre : "";
      }).join(", ")
    : "Solo consultas particulares";

  document.getElementById("verObrasSociales").textContent = obrasAtendidas;

  verMedicoModal.show();
};

// Editar médico
window.editarMedico = function (id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  medicoEditando = medico;

  document.getElementById("nombre").value = medico.nombre;
  document.getElementById("apellido").value = medico.apellido;
  document.getElementById("especialidad").value = medico.especialidadId;
  document.getElementById("matricula").value = medico.matricula;
  document.getElementById("telefono").value = medico.telefono;
  document.getElementById("email").value = medico.email;
  previewImg.src = medico.foto || "assets/default.png";

  const selectObras = document.getElementById("obrasSociales");
  Array.from(selectObras.options).forEach(opt => {
    opt.selected = medico.obrasSociales?.includes(opt.value);
  });

  medicoModalLabel.innerHTML = '<i class="bi bi-pencil"></i> Editar Médico';
  medicoModal.show();
};

// Confirmar eliminación
window.confirmarEliminar = function (id) {
  const medico = medicos.find(m => m.id === id);
  if (!medico) return;
  medicoAEliminar = medico;
  document.getElementById("nombreEliminar").textContent = `${medico.nombre} ${medico.apellido}`;
  confirmarEliminarModal.show();
};

// Eliminar
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!medicoAEliminar) return;
  medicos = medicos.filter(m => m.id !== medicoAEliminar.id);
  guardarMedicos();
  cargarMedicos();
  showToast(`✔ Médico ${medicoAEliminar.nombre} eliminado`, "danger");
  confirmarEliminarModal.hide();
});

// ================== UTILIDAD ==================
function generarId() {
  return medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;
}

// ================== INICIO ==================
document.addEventListener("DOMContentLoaded", () => {
  cargarEspecialidades();
  cargarObrasSociales(); // nuevo
  cargarMedicos();
});

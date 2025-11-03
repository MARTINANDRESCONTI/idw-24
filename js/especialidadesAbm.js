// ================== VARIABLES GLOBALES ==================
let especialidades = [];
let medicos = [];
let especialidadEditando = null;
let especialidadAEliminar = null;

// Elementos del DOM
const especialidadesTableBody = document.getElementById("especialidadesTableBody");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const especialidadModal = new bootstrap.Modal(document.getElementById("especialidadModal"));
const verEspecialidadModal = new bootstrap.Modal(document.getElementById("verEspecialidadModal"));
const confirmarEliminarModal = new bootstrap.Modal(document.getElementById("confirmarEliminarModal"));

// Formulario
const especialidadForm = document.getElementById("especialidadForm");
const btnGuardarEspecialidad = document.getElementById("btnGuardarEspecialidad");
const btnNuevaEspecialidad = document.getElementById("btnNuevaEspecialidad");
const especialidadModalLabel = document.getElementById("especialidadModalLabel");

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

// Cargar especialidades desde LocalStorage
function cargarEspecialidades() {
  const especialidadesJSON = localStorage.getItem("especialidades");
  especialidades = especialidadesJSON ? JSON.parse(especialidadesJSON) : [];
  renderizarTabla(especialidades);
}

// Guardar especialidades en LocalStorage
function guardarEspecialidades() {
  localStorage.setItem("especialidades", JSON.stringify(especialidades));
}

// Cargar médicos desde LocalStorage
function cargarMedicos() {
  const medicosJSON = localStorage.getItem("medicos");
  medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
}

// ================== FUNCIONES DE TABLA ==================

// Renderizar tabla de especialidades
function renderizarTabla(especialidadesAMostrar) {
  if (especialidadesAMostrar.length === 0) {
    especialidadesTableBody.innerHTML = "";
    noResults.classList.remove("d-none");
    return;
  }

  noResults.classList.add("d-none");

  especialidadesTableBody.innerHTML = especialidadesAMostrar.map(especialidad => {
    // Contar médicos asociados
    const medicosAsociados = medicos.filter(m => m.especialidadId === especialidad.especialidadId);
    const cantidadMedicos = medicosAsociados.length;

    // Formatear fecha
    const fecha = new Date(especialidad.fechaCreacion);
    const fechaFormato = fecha.toLocaleDateString("es-AR");

    return `
      <tr>
        <td><strong>#${especialidad.especialidadId}</strong></td>
        <td>
          <span class="badge bg-primary">${especialidad.descripcion}</span>
        </td>
        <td>
          <span class="badge bg-info">${cantidadMedicos} médicos</span>
        </td>
        <td><small>${fechaFormato}</small></td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-info" onclick="verEspecialidad(${especialidad.especialidadId})" title="Ver" data-bs-toggle="tooltip">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-warning" onclick="editarEspecialidad(${especialidad.especialidadId})" title="Editar" data-bs-toggle="tooltip">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger" onclick="confirmarEliminar(${especialidad.especialidadId})" title="Eliminar" data-bs-toggle="tooltip">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Inicializar tooltips
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltips.forEach(el => new bootstrap.Tooltip(el));
}

// ================== FUNCIONES CRUD ==================

// Guardar especialidad (nueva o editada)
btnGuardarEspecialidad.addEventListener("click", () => {
  if (!especialidadForm.checkValidity()) {
    especialidadForm.reportValidity();
    return;
  }

  const descripcion = document.getElementById("descripcion").value.trim();
  const detalles = document.getElementById("detalles").value.trim();

  // Validar que no exista otra especialidad con la misma descripción
  const existe = especialidades.some(e => 
    e.descripcion.toLowerCase() === descripcion.toLowerCase() && 
    (!especialidadEditando || e.especialidadId !== especialidadEditando.especialidadId)
  );

  if (existe) {
    showToast("⚠ Esta especialidad ya existe", "warning");
    return;
  }

    const especialidad = {
    especialidadId: especialidadEditando ? especialidadEditando.especialidadId : generarId(),
    descripcion: descripcion,
    detalles: detalles,
    fechaCreacion: especialidadEditando ? especialidadEditando.fechaCreacion : new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };


  if (especialidadEditando) {
    // Actualizar especialidad existente
    const index = especialidades.findIndex(e => e.especialidadId === especialidadEditando.especialidadId);
    if (index !== -1) {
      especialidades[index] = especialidad;
      showToast(`✔ Especialidad ${especialidad.descripcion} actualizada`, "success");
    }
  } else {
    // Crear nueva especialidad
    especialidades.push(especialidad);
    showToast(`✔ Especialidad ${especialidad.descripcion} agregada`, "success");
  }

  guardarEspecialidades();
  cargarEspecialidades();
  especialidadModal.hide();
  limpiarFormulario();
});

// Ver especialidad
window.verEspecialidad = function(id) {
  const especialidad = especialidades.find(e => e.especialidadId === id);
  if (!especialidad) return;

  // Contar médicos asociados
  const medicosAsociados = medicos.filter(m => m.especialidadId === especialidad.especialidadId);

  document.getElementById("verDescripcion").textContent = especialidad.especialidadId;
  document.getElementById("verDetalles").textContent = especialidad.detalles || "No especificado";
  
  // Mostrar médicos asociados
  const divMedicos = document.getElementById("verMedicos");
  if (medicosAsociados.length > 0) {
    divMedicos.innerHTML = `
      <ul class="list-group">
        ${medicosAsociados.map(m => `
          <li class="list-group-item">
            <i class="bi bi-person-badge"></i> ${m.nombre} ${m.apellido}
          </li>
        `).join("")}
      </ul>
    `;
  } else {
    divMedicos.innerHTML = '<p class="text-muted">No hay médicos asociados</p>';
  }

  const fecha = new Date(especialidad.fechaCreacion);
  document.getElementById("verFechaCreacion").textContent = fecha.toLocaleDateString("es-AR") + " " + fecha.toLocaleTimeString("es-AR");

  verEspecialidadModal.show();
};

// Editar especialidad
window.editarEspecialidad = function(id) {
  const especialidad = especialidades.find(e => e.especialidadId === id);
  if (!especialidad) return;

  especialidadEditando = especialidad;

  document.getElementById("descripcion").value = especialidad.descripcion;
  document.getElementById("detalles").value = especialidad.detalles || "";

  especialidadModalLabel.innerHTML = '<i class="bi bi-pencil"></i> Editar Especialidad';
  especialidadModal.show();
};

// Confirmar eliminación
window.confirmarEliminar = function(id) {
  const especialidad = especialidades.find(e => e.especialidadId === id);
  if (!especialidad) return;

  especialidadAEliminar = especialidad;

  const medicosAsociados = medicos.filter(m => m.especialidad === especialidad.descripcion);
  const cantidadMedicos = medicosAsociados.length;

  document.getElementById("nombreEspecialidadEliminar").textContent = especialidad.descripcion;

  // Mostrar advertencia si hay médicos asociados
  const divAdvertencia = document.getElementById("advertenciaEliminar");
  if (cantidadMedicos > 0) {
    divAdvertencia.innerHTML = `
      <strong>⚠ Advertencia:</strong> Esta especialidad está asociada a ${cantidadMedicos} médico(s).
      Considere cambiar la especialidad de los médicos antes de eliminar.
    `;
  } else {
    divAdvertencia.textContent = "Esta acción no se puede deshacer.";
  }

  confirmarEliminarModal.show();
};

// Eliminar especialidad
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!especialidadAEliminar) return;

  const medicosAsociados = medicos.filter(m => m.especialidad === especialidadAEliminar.descripcion);

  if (medicosAsociados.length > 0) {
    showToast(`⚠ No se puede eliminar. Hay ${medicosAsociados.length} médico(s) con esta especialidad`, "warning");
    confirmarEliminarModal.hide();
    return;
  }

  especialidades = especialidades.filter(e => e.especialidadId !== especialidadAEliminar.especialidadId);
  guardarEspecialidades();
  cargarEspecialidades();
  showToast(`✔ Especialidad ${especialidadAEliminar.descripcion} eliminada`, "danger");
  confirmarEliminarModal.hide();
  especialidadAEliminar = null;
});

// ================== FUNCIONES DE BÚSQUEDA Y FILTRADO ==================

// Buscar especialidades
searchInput.addEventListener("input", (e) => {
  const termino = e.target.value.toLowerCase();
  const especialidadesFiltradas = especialidades.filter(especialidad =>
    especialidad.descripcion.toLowerCase().includes(termino) ||
    especialidad.detalles.toLowerCase().includes(termino)
  );
  renderizarTabla(especialidadesFiltradas);
});

// ================== FUNCIONES DE FORMULARIO ==================

// Limpiar formulario
function limpiarFormulario() {
  especialidadForm.reset();
  especialidadEditando = null;
  especialidadModalLabel.innerHTML = '<i class="bi bi-plus-circle"></i> Nueva Especialidad';
  document.getElementById("especialidadId").value = "";
}

// Abrir modal para nueva especialidad
btnNuevaEspecialidad.addEventListener("click", () => {
  limpiarFormulario();
});

// Limpiar formulario al cerrar modal
document.getElementById("especialidadModal").addEventListener("hidden.bs.modal", () => {
  limpiarFormulario();
});

// ================== FUNCIONES DE UTILIDAD ==================

// Generar ID único
function generarId() {
  return especialidades.length > 0
    ? Math.max(...especialidades.map(e => e.especialidadId)) + 1
    : 1;
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
  cargarMedicos();
  cargarEspecialidades();
});

// Hacer funciones globales accesibles desde HTML
window.verEspecialidad = window.verEspecialidad;
window.editarEspecialidad = window.editarEspecialidad;
window.confirmarEliminar = window.confirmarEliminar;
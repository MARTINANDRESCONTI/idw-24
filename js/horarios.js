document.addEventListener("DOMContentLoaded", () => {
  // ================== VARIABLES GLOBALES ==================
  const formHorario = document.getElementById("formHorario");
  const btnGuardarHorario = document.getElementById("btnGuardarHorario");
  const tablaHorarios = document.getElementById("tablaHorarios");
  const modalAgregarHorario = new bootstrap.Modal(document.getElementById("modalAgregarHorario"));
  const modalVerDetalles = new bootstrap.Modal(document.getElementById("modalVerDetalles"));
  const modalConfirmarEliminar = new bootstrap.Modal(document.getElementById("modalConfirmarEliminar"));
  const toastContainer = document.getElementById("toastContainer");

  // Elementos del formulario
  const profesionalSelect = document.getElementById("profesionalSelect");
  const diasSelection = document.getElementById("diasSelection");
  const horaEntrada = document.getElementById("horaEntrada");
  const horaSalida = document.getElementById("horaSalida");
  const intervalo = document.getElementById("intervalo");
  const estadoActivo = document.getElementById("estadoActivo");
  const notas = document.getElementById("notas");
  const filterProfesional = document.getElementById("filterProfesional");
  const filterEstado = document.getElementById("filterEstado");
  const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

  // Estado de la aplicación
  let horarios = [];
  let profesionales = [];
  let hoarioEnEdicion = null;
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // ================== FUNCIONES AUXILIARES ==================

  // Toast para notificaciones
  function showToast(message, type = "success") {
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

  // Cargar profesionales (simulado o desde localStorage)
  function cargarProfesionales() {
    const stored = localStorage.getItem("profesionales");
    if (stored) {
      profesionales = JSON.parse(stored);
    } else {
      // Datos de ejemplo
      profesionales = [
        { id: 1, nombre: "Dr. Juan García", especialidad: "Cardiología" },
        { id: 2, nombre: "Dra. María López", especialidad: "Pediatría" },
        { id: 3, nombre: "Dr. Carlos Rodríguez", especialidad: "Traumatología" },
        { id: 4, nombre: "Dra. Ana Martínez", especialidad: "Dermatología" },
        { id: 5, nombre: "Dr. Roberto Díaz", especialidad: "Neurología" }
      ];
      localStorage.setItem("profesionales", JSON.stringify(profesionales));
    }
  }

  // Cargar horarios desde localStorage
  function cargarHorarios() {
    const stored = localStorage.getItem("horarios");
    horarios = stored ? JSON.parse(stored) : [];
  }

  // Guardar horarios en localStorage
  function guardarHorarios() {
    localStorage.setItem("horarios", JSON.stringify(horarios));
  }

  // Generar selector de días
  function generarSelectorDias() {
    diasSelection.innerHTML = "";
    dias.forEach((dia, index) => {
      const badge = document.createElement("button");
      badge.type = "button";
      badge.className = "day-badge";
      badge.textContent = dia;
      badge.dataset.day = dia;
      badge.dataset.index = index;
      badge.addEventListener("click", (e) => {
        e.preventDefault();
        badge.classList.toggle("selected");
      });
      diasSelection.appendChild(badge);
    });
  }

  // Obtener días seleccionados
  function getDiasSeleccionados() {
    return Array.from(diasSelection.querySelectorAll(".day-badge.selected")).map(b => b.dataset.day);
  }

  // Establecer días seleccionados (para edición)
  function setDiasSeleccionados(diasArray) {
    diasSelection.querySelectorAll(".day-badge").forEach(badge => {
      badge.classList.remove("selected");
      if (diasArray.includes(badge.dataset.day)) {
        badge.classList.add("selected");
      }
    });
  }

  // Llenar select de profesionales
  function llenarSelectProfesionales() {
    profesionalSelect.innerHTML = '<option value="">Seleccionar profesional</option>';
    profesionales.forEach(prof => {
      const option = document.createElement("option");
      option.value = prof.id;
      option.textContent = prof.nombre;
      option.dataset.especialidad = prof.especialidad;
      profesionalSelect.appendChild(option);
    });
  }

  // Llenar filtro de profesionales
  function llenarFiltrosProfesionales() {
    filterProfesional.innerHTML = '<option value="">Todos los profesionales</option>';
    profesionales.forEach(prof => {
      const option = document.createElement("option");
      option.value = prof.id;
      option.textContent = prof.nombre;
      filterProfesional.appendChild(option);
    });
  }

  // Mostrar especialidad al seleccionar profesional
  profesionalSelect.addEventListener("change", () => {
    const selectedOption = profesionalSelect.options[profesionalSelect.selectedIndex];
    const especialidad = selectedOption.dataset.especialidad || "";
    document.getElementById("especialidadMuestra").textContent = especialidad ? `Especialidad: ${especialidad}` : "";
  });

  // Renderizar tabla de horarios
  function renderizarTabla() {
    if (horarios.length === 0) {
      tablaHorarios.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-inbox"></i> No hay horarios registrados
          </td>
        </tr>
      `;
      return;
    }

    tablaHorarios.innerHTML = horarios.map(horario => {
      const profesor = profesionales.find(p => p.id === horario.profesionalId);
      const nombreProf = profesor ? profesor.nombre : "Desconocido";
      const especialidad = profesor ? profesor.especialidad : "N/A";
      const diasTexto = horario.dias.join(", ");
      const estadoBadge = horario.estado === "activo"
        ? '<span class="badge badge-estado-activo">Activo</span>'
        : '<span class="badge badge-estado-inactivo">Inactivo</span>';

      return `
        <tr>
          <td><strong>${nombreProf}</strong></td>
          <td>${especialidad}</td>
          <td><small>${diasTexto}</small></td>
          <td>${horario.horaEntrada}</td>
          <td>${horario.horaSalida}</td>
          <td>${horario.intervalo} min</td>
          <td>${estadoBadge}</td>
          <td>
            <button class="btn btn-sm btn-info btn-action" onclick="verDetalles(${horario.id})">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning btn-action" onclick="editarHorario(${horario.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminar(${horario.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Aplicar filtros
  function aplicarFiltros() {
    const profesionalIdFiltro = filterProfesional.value;
    const estadoFiltro = filterEstado.value;

    let horariosFiltrados = horarios;

    if (profesionalIdFiltro) {
      horariosFiltrados = horariosFiltrados.filter(h => h.profesionalId == profesionalIdFiltro);
    }

    if (estadoFiltro) {
      horariosFiltrados = horariosFiltrados.filter(h => h.estado === estadoFiltro);
    }

    tablaHorarios.innerHTML = horariosFiltrados.length === 0
      ? `
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-search"></i> No hay horarios que coincidan con los filtros
          </td>
        </tr>
      `
      : horariosFiltrados.map(horario => {
        const profesor = profesionales.find(p => p.id === horario.profesionalId);
        const nombreProf = profesor ? profesor.nombre : "Desconocido";
        const especialidad = profesor ? profesor.especialidad : "N/A";
        const diasTexto = horario.dias.join(", ");
        const estadoBadge = horario.estado === "activo"
          ? '<span class="badge badge-estado-activo">Activo</span>'
          : '<span class="badge badge-estado-inactivo">Inactivo</span>';

        return `
          <tr>
            <td><strong>${nombreProf}</strong></td>
            <td>${especialidad}</td>
            <td><small>${diasTexto}</small></td>
            <td>${horario.horaEntrada}</td>
            <td>${horario.horaSalida}</td>
            <td>${horario.intervalo} min</td>
            <td>${estadoBadge}</td>
            <td>
              <button class="btn btn-sm btn-info btn-action" onclick="verDetalles(${horario.id})">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-warning btn-action" onclick="editarHorario(${horario.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger btn-action" onclick="confirmarEliminar(${horario.id})">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join("");
  }

  // Limpiar formulario
  function limpiarFormulario() {
    formHorario.reset();
    diasSelection.querySelectorAll(".day-badge").forEach(b => b.classList.remove("selected"));
    estadoActivo.checked = true;
    notas.value = "";
    hoarioEnEdicion = null;
    document.getElementById("modalLabel").textContent = "Nuevo Horario";
  }

  // Validar horario
  function validarHorario() {
    const profesionalId = profesionalSelect.value;
    const dias = getDiasSeleccionados();
    const entrada = horaEntrada.value;
    const salida = horaSalida.value;

    if (!profesionalId) {
      showToast("Selecciona un profesional", "error");
      return false;
    }

    if (dias.length === 0) {
      showToast("Selecciona al menos un día", "error");
      return false;
    }

    if (!entrada || !salida) {
      showToast("Completa los horarios de entrada y salida", "error");
      return false;
    }

    if (entrada >= salida) {
      showToast("La hora de salida debe ser posterior a la hora de entrada", "error");
      return false;
    }

    return true;
  }

  // Guardar nuevo horario o actualizar existente
  function guardarHorario(e) {
    e.preventDefault();

    if (!validarHorario()) return;

    const nuevoHorario = {
      id: hoarioEnEdicion ? hoarioEnEdicion.id : Date.now(),
      profesionalId: parseInt(profesionalSelect.value),
      dias: getDiasSeleccionados(),
      horaEntrada: horaEntrada.value,
      horaSalida: horaSalida.value,
      intervalo: parseInt(intervalo.value),
      estado: estadoActivo.checked ? "activo" : "inactivo",
      notas: notas.value,
      fechaCreacion: hoarioEnEdicion ? hoarioEnEdicion.fechaCreacion : new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    if (hoarioEnEdicion) {
      // Actualizar horario existente
      const index = horarios.findIndex(h => h.id === hoarioEnEdicion.id);
      if (index !== -1) {
        horarios[index] = nuevoHorario;
        showToast("✓ Horario actualizado correctamente", "success");
      }
    } else {
      // Agregar nuevo horario
      horarios.push(nuevoHorario);
      showToast("✓ Horario agregado correctamente", "success");
    }

    guardarHorarios();
    limpiarFormulario();
    modalAgregarHorario.hide();
    renderizarTabla();
  }

  // ================== FUNCIONES GLOBALES ==================
  window.verDetalles = function(id) {
    const horario = horarios.find(h => h.id === id);
    if (!horario) return;

    const profesor = profesionales.find(p => p.id === horario.profesionalId);
    const nombreProf = profesor ? profesor.nombre : "Desconocido";
    const especialidad = profesor ? profesor.especialidad : "N/A";
    const diasTexto = horario.dias.join(", ");

    const html = `
      <div class="card border-0">
        <div class="card-body">
          <h6 class="card-title text-primary mb-3">
            <i class="bi bi-person-badge"></i> ${nombreProf}
          </h6>
          <div class="row g-3">
            <div class="col-6">
              <small class="text-muted d-block">Especialidad</small>
              <strong>${especialidad}</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Estado</small>
              <span class="badge ${horario.estado === 'activo' ? 'badge-estado-activo' : 'badge-estado-inactivo'}">
                ${horario.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div class="col-12">
              <small class="text-muted d-block">Días Laborales</small>
              <strong>${diasTexto}</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Hora Entrada</small>
              <strong>${horario.horaEntrada}</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Hora Salida</small>
              <strong>${horario.horaSalida}</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Intervalo Citas</small>
              <strong>${horario.intervalo} minutos</strong>
            </div>
            <div class="col-6">
              <small class="text-muted d-block">Citas Diarias</small>
              <strong>${Math.floor((convertirAMinutos(horario.horaSalida) - convertirAMinutos(horario.horaEntrada)) / horario.intervalo)} citas</strong>
            </div>
            ${horario.notas ? `
              <div class="col-12">
                <small class="text-muted d-block">Notas</small>
                <strong>${horario.notas}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.getElementById("detallesHorario").innerHTML = html;
    modalVerDetalles.show();
  };

  window.editarHorario = function(id) {
    hoarioEnEdicion = horarios.find(h => h.id === id);
    if (!hoarioEnEdicion) return;

    profesionalSelect.value = hoarioEnEdicion.profesionalId;
    horaEntrada.value = hoarioEnEdicion.horaEntrada;
    horaSalida.value = hoarioEnEdicion.horaSalida;
    intervalo.value = hoarioEnEdicion.intervalo;
    estadoActivo.checked = hoarioEnEdicion.estado === "activo";
    notas.value = hoarioEnEdicion.notas || "";
    setDiasSeleccionados(hoarioEnEdicion.dias);

    document.getElementById("modalLabel").textContent = "Editar Horario";
    modalAgregarHorario.show();

    // Trigger change event para mostrar especialidad
    profesionalSelect.dispatchEvent(new Event("change"));
  };

  window.confirmarEliminar = function(id) {
    const horario = horarios.find(h => h.id === id);
    if (!horario) return;

    const profesor = profesionales.find(p => p.id === horario.profesionalId);
    const nombreProf = profesor ? profesor.nombre : "Desconocido";

    document.getElementById("textoConfirmar").textContent = `${nombreProf} - ${horario.dias.join(", ")} (${horario.horaEntrada} - ${horario.horaSalida})`;

    window.idParaEliminar = id;
    modalConfirmarEliminar.show();
  };

  window.eliminarHorario = function() {
    const id = window.idParaEliminar;
    horarios = horarios.filter(h => h.id !== id);
    guardarHorarios();
    showToast("✓ Horario eliminado correctamente", "success");
    modalConfirmarEliminar.hide();
    renderizarTabla();
  };

  // Convertir hora a minutos (auxiliar para cálculos)
  function convertirAMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  // ================== EVENT LISTENERS ==================
  btnGuardarHorario.addEventListener("click", guardarHorario);

  filterProfesional.addEventListener("change", aplicarFiltros);
  filterEstado.addEventListener("change", aplicarFiltros);

  btnLimpiarFiltros.addEventListener("click", () => {
    filterProfesional.value = "";
    filterEstado.value = "";
    renderizarTabla();
  });

  document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    eliminarHorario();
  });

  // Modal: limpiar formulario al cerrar
  document.getElementById("modalAgregarHorario").addEventListener("hidden.bs.modal", () => {
    limpiarFormulario();
  });

  // ================== INICIALIZACIÓN ==================
  function inicializar() {
    cargarProfesionales();
    cargarHorarios();
    generarSelectorDias();
    llenarSelectProfesionales();
    llenarFiltrosProfesionales();
    renderizarTabla();
  }

  inicializar();
});

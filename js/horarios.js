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
  let turnos = [];
  let profesionales = [];
  let especialidades = [];
  let hoarioEnEdicion = null;
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  
  // Configuración de turnos
  const DURACION_TURNO = 30; // minutos
  const HORA_ALMUERZO_INICIO = "12:00";
  const HORA_ALMUERZO_FIN = "13:00";

  // ================== FUNCIONES DE TURNOS ==================

  function horaAMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  function minutosAHora(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function generarTurnosDelHorario(profesionalId, dia, horaInicio, horaFin) {
    const nuevosTurnos = [];
    let minutoActual = horaAMinutos(horaInicio);
    const minutoFin = horaAMinutos(horaFin);
    const minutoAlmuerzoInicio = horaAMinutos(HORA_ALMUERZO_INICIO);
    const minutoAlmuerzoFin = horaAMinutos(HORA_ALMUERZO_FIN);
    
    while (minutoActual < minutoFin) {
      const horaTurnoInicio = minutoActual;
      const horaTurnoFin = minutoActual + DURACION_TURNO;
      
      if (horaTurnoInicio >= minutoAlmuerzoInicio && horaTurnoInicio < minutoAlmuerzoFin) {
        minutoActual = minutoAlmuerzoFin;
        continue;
      }
      if (horaTurnoFin > minutoAlmuerzoInicio && horaTurnoInicio < minutoAlmuerzoInicio) {
        minutoActual = minutoAlmuerzoFin;
        continue;
      }
      
      const turno = {
        id: Date.now() + Math.random(),
        profesionalId: profesionalId,
        dia: dia,
        horaInicio: minutosAHora(horaTurnoInicio),
        horaFin: minutosAHora(horaTurnoFin),
        estado: "disponible",
        reservadoPor: null,
        emailPaciente: null,
        fechaReserva: null
      };
      
      nuevosTurnos.push(turno);
      minutoActual += DURACION_TURNO;
    }
    return nuevosTurnos;
  }

  function cargarTurnos() {
    const stored = localStorage.getItem("turnos");
    turnos = stored ? JSON.parse(stored) : [];
    console.log("✓ Turnos cargados:", turnos.length);
  }

  function guardarTurnos() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
    console.log("✓ Turnos guardados:", turnos.length);
  }

  // ================== FUNCIONES AUXILIARES ==================

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

  function cargarProfesionales() {
    const stored = localStorage.getItem("medicos");
    profesionales = stored ? JSON.parse(stored) : [];
  }

  function cargarEspecialidades() {
    const stored = localStorage.getItem("especialidades");
    especialidades = stored ? JSON.parse(stored) : [];
  }

  function cargarHorarios() {
    const stored = localStorage.getItem("horarios");
    horarios = stored ? JSON.parse(stored) : [];
  }

  function guardarHorarios() {
    localStorage.setItem("horarios", JSON.stringify(horarios));
  }

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

  function getDiasSeleccionados() {
    return Array.from(diasSelection.querySelectorAll(".day-badge.selected")).map(b => b.dataset.day);
  }

  function setDiasSeleccionados(diasArray) {
    diasSelection.querySelectorAll(".day-badge").forEach(badge => {
      badge.classList.remove("selected");
      if (diasArray.includes(badge.dataset.day)) {
        badge.classList.add("selected");
      }
    });
  }

  function llenarSelectProfesionales(soloSinHorarios = false) {
    profesionalSelect.innerHTML = '<option value="">Seleccionar profesional</option>';
    
    profesionales.forEach(prof => {
      // Si soloSinHorarios es true, filtrar profesionales que ya tienen horarios
      if (soloSinHorarios) {
        const tieneHorario = horarios.some(h => h.profesionalId === prof.id);
        if (tieneHorario) return; // Saltar este profesional
      }
      
      const option = document.createElement("option");
      option.value = prof.id;
      const especialidadObj = especialidades.find(e => e.especialidadId === prof.especialidadId);
      const especialidadDesc = especialidadObj ? especialidadObj.descripcion : "Sin especialidad";
      option.textContent = `${prof.nombre} ${prof.apellido} (${especialidadDesc})`;
      option.dataset.especialidadId = prof.especialidadId;
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
    const selectedOption = profesionalSelect.options[profesionalSelect.selectedIndex];
    const especialidadId = parseInt(selectedOption.dataset.especialidadId);
    const especialidadObj = especialidades.find(e => e.especialidadId === especialidadId);
    const especialidad = especialidadObj ? especialidadObj.descripcion : "";
    document.getElementById("especialidadMuestra").textContent = especialidad ? `Especialidad: ${especialidad}` : "";
  });

  // ================== RENDERIZAR TABLA ==================
  function renderizarTabla() {
    // Aplicar filtros
    let horariosFiltrados = horarios;

    const filterProfId = filterProfesional.value;
    const filterEst = filterEstado.value;

    if (filterProfId) {
      horariosFiltrados = horariosFiltrados.filter(h => h.profesionalId === parseInt(filterProfId));
    }
    if (filterEst) {
      horariosFiltrados = horariosFiltrados.filter(h => h.estado === filterEst);
    }

    if (horariosFiltrados.length === 0) {
      tablaHorarios.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-5 text-muted">
            <i class="bi bi-inbox"></i> No hay horarios registrados
          </td>
        </tr>
      `;
      return;
    }

    tablaHorarios.innerHTML = horariosFiltrados.map(horario => {
      const profesional = profesionales.find(p => p.id === horario.profesionalId);
      const nombreProf = profesional ? `${profesional.nombre} ${profesional.apellido}` : "Desconocido";
      let especialidad = "Sin especialidad";
      if (profesional && profesional.especialidadId) {
        const espObj = especialidades.find(e => e.especialidadId === profesional.especialidadId);
        especialidad = espObj ? espObj.descripcion : "Sin especialidad";
      }

      const diasTexto = horario.dias.join(", ");
      // Contar TODOS los turnos disponibles del horario para TODOS los días
      const turnosDelHorario = turnos.filter(t =>
        t.profesionalId === horario.profesionalId && 
        horario.dias.includes(t.dia) &&
        t.estado === "disponible" &&
        t.horaInicio >= horario.horaEntrada &&
        t.horaFin <= horario.horaSalida
      );
      const cantidadTurnos = turnosDelHorario.length;

      const estadoBadge = horario.estado === "activo"
        ? '<span class="badge badge-estado-activo text-dark">Activo</span>'
        : '<span class="badge badge-estado-inactivo text-dark">Inactivo</span>';

      return `
        <tr>
          <td><strong>${nombreProf}</strong></td>
          <td>${especialidad}</td>
          <td><small>${diasTexto}</small></td>
          <td>${horario.horaEntrada}</td>
          <td>${horario.horaSalida}</td>
          <td>${horario.intervalo} min</td>
          <td><span class="badge badge-turnos text-dark">${cantidadTurnos} disponibles</span></td>
          <td>${estadoBadge}</td>
          <td class="text-center">
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

  // ================== OTRAS FUNCIONES ==================
  function limpiarFormulario() {
    formHorario.reset();
    diasSelection.querySelectorAll(".day-badge").forEach(b => b.classList.remove("selected"));
    estadoActivo.checked = true;
    notas.value = "";
    
    // Si no estamos editando, mostrar solo profesionales sin horarios
    if (!hoarioEnEdicion) {
      llenarSelectProfesionales(true);
    }
    
    hoarioEnEdicion = null;
    document.getElementById("modalLabel").textContent = "Nuevo Horario";
  }

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

  function guardarHorario(e) {
    e.preventDefault();
    if (!validarHorario()) return;

    const profesionalId = parseInt(profesionalSelect.value);
    const diasSeleccionados = getDiasSeleccionados();
    const horaIni = horaEntrada.value;
    const horaFin = horaSalida.value;

    const nuevoHorario = {
      id: hoarioEnEdicion ? hoarioEnEdicion.id : Date.now(),
      profesionalId: profesionalId,
      dias: diasSeleccionados,
      horaEntrada: horaIni,
      horaSalida: horaFin,
      intervalo: parseInt(intervalo.value),
      estado: estadoActivo.checked ? "activo" : "inactivo",
      notas: notas.value,
      fechaCreacion: hoarioEnEdicion ? hoarioEnEdicion.fechaCreacion : new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    let cantidadTurnosGenerados = 0;

    if (hoarioEnEdicion) {
      const index = horarios.findIndex(h => h.id === hoarioEnEdicion.id);
      if (index !== -1) {
        // Eliminar turnos antiguos del horario editado
        turnos = turnos.filter(t => !(t.profesionalId === profesionalId && hoarioEnEdicion.dias.includes(t.dia)));
        
        horarios[index] = nuevoHorario;
        
        // Generar nuevos turnos
        diasSeleccionados.forEach(dia => {
          const nuevosTurnos = generarTurnosDelHorario(profesionalId, dia, horaIni, horaFin);
          turnos = turnos.concat(nuevosTurnos);
          cantidadTurnosGenerados += nuevosTurnos.length;
        });
        
        console.log(`Horario actualizado - Turnos generados: ${cantidadTurnosGenerados}`);
        showToast(`✓ Horario actualizado correctamente - ${cantidadTurnosGenerados} turnos generados`, "success");
      }
    } else {
      horarios.push(nuevoHorario);
      
      // Generar turnos para cada día seleccionado
      diasSeleccionados.forEach(dia => {
        const nuevosTurnos = generarTurnosDelHorario(profesionalId, dia, horaIni, horaFin);
        console.log(`Día ${dia}: ${nuevosTurnos.length} turnos generados`);
        turnos = turnos.concat(nuevosTurnos);
        cantidadTurnosGenerados += nuevosTurnos.length;
      });
      
      console.log(`Horario nuevo - Turnos totales generados: ${cantidadTurnosGenerados}`);
      showToast(`✓ Horario agregado correctamente - ${cantidadTurnosGenerados} turnos generados`, "success");
    }

    console.log("Total de turnos en el sistema:", turnos.length);
    guardarHorarios();
    guardarTurnos();
    limpiarFormulario();
    modalAgregarHorario.hide();
    renderizarTabla();
  }

  // ================== FUNCIONES GLOBALES ==================
  window.verDetalles = function(id) {
    const horario = horarios.find(h => h.id === id);
    if (!horario) return;

    const profesor = profesionales.find(p => p.id === horario.profesionalId);
    const nombreProf = profesor ? `${profesor.nombre} ${profesor.apellido}` : "Desconocido";

    let especialidad = "Sin especialidad";
    if (profesor && profesor.especialidadId) {
      const espObj = especialidades.find(e => e.especialidadId === profesor.especialidadId);
      especialidad = espObj ? espObj.descripcion : "Sin especialidad";
    }

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

    // Mostrar todos los profesionales cuando estamos editando
    llenarSelectProfesionales(false);
    
    profesionalSelect.value = hoarioEnEdicion.profesionalId;
    horaEntrada.value = hoarioEnEdicion.horaEntrada;
    horaSalida.value = hoarioEnEdicion.horaSalida;
    intervalo.value = hoarioEnEdicion.intervalo;
    estadoActivo.checked = hoarioEnEdicion.estado === "activo";
    notas.value = hoarioEnEdicion.notas || "";
    setDiasSeleccionados(hoarioEnEdicion.dias);

    document.getElementById("modalLabel").textContent = "Editar Horario";
    modalAgregarHorario.show();
    profesionalSelect.dispatchEvent(new Event("change"));
  };

  window.confirmarEliminar = function(id) {
    const horario = horarios.find(h => h.id === id);
    if (!horario) return;

    const profesor = profesionales.find(p => p.id === horario.profesionalId);
    const nombreProf = profesor ? `${profesor.nombre} ${profesor.apellido}` : "Desconocido";
    document.getElementById("textoConfirmar").textContent =
      `${nombreProf} - ${horario.dias.join(", ")} (${horario.horaEntrada} - ${horario.horaSalida})`;

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

  // ================== EVENT LISTENERS ==================
  btnGuardarHorario.addEventListener("click", guardarHorario);
  filterProfesional.addEventListener("change", renderizarTabla);
  filterEstado.addEventListener("change", renderizarTabla);
  btnLimpiarFiltros.addEventListener("click", () => {
    filterProfesional.value = "";
    filterEstado.value = "";
    renderizarTabla();
  });
  document.getElementById("btnConfirmarEliminar").addEventListener("click", () => eliminarHorario());
  document.getElementById("modalAgregarHorario").addEventListener("hidden.bs.modal", limpiarFormulario);

  // ================== INICIALIZACIÓN ==================
  function inicializar() {
    cargarProfesionales();
    cargarEspecialidades();
    cargarHorarios();
    cargarTurnos();
    generarSelectorDias();
    llenarSelectProfesionales();
    llenarFiltrosProfesionales();
    renderizarTabla();
  }

  inicializar();
});
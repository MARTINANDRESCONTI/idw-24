document.addEventListener("DOMContentLoaded", () => {
  // Selects e inputs
  const selectEspecialidad = document.getElementById("especialidad");
  const selectMedico = document.getElementById("medico");
  const selectObraSocial = document.getElementById("obraSocial");
  const selectFecha = document.getElementById("fecha");
  const selectHora = document.getElementById("hora");
  const valorConsultaInput = document.getElementById("valorConsulta");
  const aCargoObraSocialInput = document.getElementById("aCargoObraSocial");
  const aCargoPacienteInput = document.getElementById("aCargoPaciente");

  // Datos desde localStorage
  const turnos = JSON.parse(localStorage.getItem("TURNOS_INICIALES")) || [];
  const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  const obrasSociales = JSON.parse(localStorage.getItem("obrasSociales")) || [];

  // Obtener usuario actual
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || {};
  const usuarioEmail = currentUser.email || "";

  // 1️⃣ Llenar select de especialidades
  selectEspecialidad.innerHTML =
    `<option value="">Seleccione una especialidad</option>` +
    especialidades.map(e => `<option value="${e.especialidadId}">${e.descripcion}</option>`).join("");

  // 2️⃣ Cuando cambie especialidad, filtrar médicos
  selectEspecialidad.addEventListener("change", () => {
    const espId = parseInt(selectEspecialidad.value);
    const medicosFiltrados = medicos.filter(m => m.especialidadId === espId);

    selectMedico.innerHTML =
      medicosFiltrados.length > 0
        ? `<option value="">Seleccione un médico</option>` +
          medicosFiltrados.map(m => `<option value="${m.id}">${m.nombre} ${m.apellido}</option>`).join("")
        : `<option value="">No hay médicos disponibles</option>`;

    // Limpiar valores relacionados
    selectObraSocial.innerHTML = `<option value="particular">Consulta Particular</option>`;
    valorConsultaInput.value = "";
    aCargoObraSocialInput.value = "";
    aCargoPacienteInput.value = "";
  });

  // 3️⃣ Cuando cambie médico, cargar obras sociales del médico
  selectMedico.addEventListener("change", () => {
    const medicoId = parseInt(selectMedico.value);
    const medico = medicos.find(m => m.id === medicoId);

    if (!medico) return;

    // Llenar obras sociales del médico + particular
    let opcionesObras = `<option value="particular">Consulta Particular</option>`;
    if (medico.obrasSociales && medico.obrasSociales.length > 0) {
      medico.obrasSociales.forEach(osId => {
        const os = obrasSociales.find(o => o.id === osId);
        if (os) {
          opcionesObras += `<option value="${os.id}">${os.nombre}</option>`;
        }
      });
    }
    selectObraSocial.innerHTML = opcionesObras;

    // Asignar valor de consulta (ejemplo fijo 500, se puede cambiar)
    valorConsultaInput.value = 500;

    // Actualizar montos
    actualizarMontos();
  });

  // 4️⃣ Cuando cambie obra social
  selectObraSocial.addEventListener("change", actualizarMontos);

  function actualizarMontos() {
    const medicoId = parseInt(selectMedico.value);
    const medico = medicos.find(m => m.id === medicoId);
    if (!medico) return;

    const valorConsulta = parseFloat(valorConsultaInput.value) || 0;
    let porcentaje = 0;

    const obraId = selectObraSocial.value;
    if (obraId !== "particular") {
      const obra = obrasSociales.find(o => o.id === obraId);
      porcentaje = obra ? obra.porcentaje : 0;
    }

    const descuento = (valorConsulta * porcentaje) / 100;
    aCargoObraSocialInput.value = descuento.toFixed(2);
    aCargoPacienteInput.value = (valorConsulta - descuento).toFixed(2);
  }

  // 5️⃣ Fechas próximas (14 días) y horarios libres
  function generarFechas() {
    const fechas = [];
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const f = new Date(hoy);
      f.setDate(hoy.getDate() + i);
      fechas.push(f.toISOString().split("T")[0]);
    }
    return fechas;
  }

  function generarHorarios() {
    return ["08:00","09:00","10:00","11:00","16:00","17:00","18:00"];
  }

  function actualizarFechas() {
    selectFecha.innerHTML = `<option value="">Seleccione una fecha</option>` +
      generarFechas().map(f => `<option value="${f}">${f}</option>`).join("");
  }

  function actualizarHorarios() {
    const fechaSel = selectFecha.value;
    const medicoId = parseInt(selectMedico.value);
    if (!fechaSel || !medicoId) {
      selectHora.innerHTML = `<option value="">Seleccione primero fecha y médico</option>`;
      return;
    }

    const horarios = generarHorarios();
    const horariosLibres = horarios.filter(h => !turnos.some(t => t.fecha === fechaSel && t.hora === h && t.medicoId === medicoId));

    selectHora.innerHTML =
      `<option value="">Seleccione un horario</option>` +
      horariosLibres.map(h => `<option value="${h}">${h}</option>`).join("");
  }

  selectFecha.addEventListener("change", actualizarHorarios);
  selectMedico.addEventListener("change", actualizarHorarios);

  actualizarFechas();

  // 6️⃣ Guardar turno
  const form = document.getElementById("formTurno");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const espId = parseInt(selectEspecialidad.value);
    const medicoId = parseInt(selectMedico.value);
    const obraId = selectObraSocial.value;
    const fecha = selectFecha.value;
    const hora = selectHora.value;
    const valor = parseFloat(valorConsultaInput.value) || 0;
    const aCargoOS = parseFloat(aCargoObraSocialInput.value) || 0;
    const aCargoPaciente = parseFloat(aCargoPacienteInput.value) || 0;

    if (!espId || !medicoId || !fecha || !hora) {
      alert("Complete todos los campos requeridos.");
      return;
    }

    // Guardar turno
    const nuevoTurno = {
      id: Date.now(),
      especialidadId: espId,
      medicoId: medicoId,
      pacienteEmail: usuarioEmail,
      fecha,
      hora,
      obraSocialId: obraId,
      valorConsulta: valor,
      aCargoObraSocial: aCargoOS,
      aCargoPaciente
    };

    turnos.push(nuevoTurno);
    localStorage.setItem("TURNOS_INICIALES", JSON.stringify(turnos));

    alert("Turno reservado correctamente ✅");

    // Resetear formulario
    form.reset();
    selectMedico.innerHTML = `<option value="">Seleccione primero una especialidad</option>`;
    selectObraSocial.innerHTML = `<option value="particular">Consulta Particular</option>`;
    valorConsultaInput.value = "";
    aCargoObraSocialInput.value = "";
    aCargoPacienteInput.value = "";
    actualizarFechas();
  });
});

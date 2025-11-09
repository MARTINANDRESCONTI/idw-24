import { getTurnos, addTurno } from "./utils/turnosStorage.js";
import "./especialidadesData.js";
import "./medicosData.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTurno");
  const tablaTurnos = document.getElementById("tablaTurnos");
  const selectEspecialidad = document.getElementById("especialidad");
  const selectMedico = document.getElementById("medico");
  const pacienteInput = document.getElementById("paciente");
  const fechaInput = document.getElementById("fecha");
  const horaInput = document.getElementById("hora");

  const horariosDisponibles = ["08:00", "10:00", "16:00", "18:00"];

  // Obtener usuario actual de sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
  const usuarioEmail = currentUser?.email || "";

  // Cargar datos desde localStorage
  const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];

  // Cargar especialidades en el select
  if (selectEspecialidad) {
    selectEspecialidad.innerHTML =
      `<option value="">Seleccione una especialidad</option>` +
      especialidades
        .map(e => `<option value="${e.descripcion}">${e.descripcion}</option>`)
        .join("");
  }

  // Cargar horarios
  if (horaInput) {
    horaInput.innerHTML =
      `<option value="">Seleccione un horario</option>` +
      horariosDisponibles.map(h => `<option value="${h}">${h}</option>`).join("");
  }

  // Configurar fecha mínima (hoy)
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.setAttribute("min", hoy);

  // Actualizar médicos según especialidad
  selectEspecialidad.addEventListener("change", () => {
    const especialidadSeleccionada = selectEspecialidad.value;
    const medicosFiltrados = medicos.filter(m => m.especialidad === especialidadSeleccionada);
    selectMedico.innerHTML =
      medicosFiltrados.length > 0
        ? medicosFiltrados
          .map(m => `<option value="${m.nombre}">${m.nombre}</option>`)
          .join("")
        : `<option value="">No hay médicos disponibles</option>`;
  });

  // Generar fechas próximas
  function generarFechasProximas() {
    const fechas = [];
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      fechas.push(fecha.toISOString().split("T")[0]);
    }
    return fechas;
  }

  const fechasProximas = generarFechasProximas();

  // Renderizar tabla de turnos
  function renderTurnos() {
    const turnos = getTurnos();
    tablaTurnos.innerHTML = "";

    let filas = "";

    fechasProximas.forEach(fecha => {
      horariosDisponibles.forEach(hora => {
        especialidades.forEach(especialidad => {
          const turnoOcupado = turnos.find(
            t =>
              t.fecha === fecha &&
              t.hora === hora &&
              t.especialidad === especialidad.descripcion
          );

          filas += `
            <tr>
              <td>${fecha}</td>
              <td>${hora}</td>
              <td>${especialidad.descripcion}</td>
              <td>${turnoOcupado ? turnoOcupado.paciente : "Libre"}</td>
              <td>${turnoOcupado ? turnoOcupado.medico : "-"}</td>
              <td>
                ${!turnoOcupado
              ? `<button class="btn btn-sm btn-primary btn-reservar"
                       data-fecha="${fecha}"
                       data-hora="${hora}"
                       data-especialidad="${especialidad.descripcion}">
                       Reservar
                     </button>`
              : `<button class="btn btn-sm btn-secondary" disabled>Ocupado</button>`}
              </td>
            </tr>`;
        });
      });
    });

    tablaTurnos.innerHTML = filas;

    document.querySelectorAll(".btn-reservar").forEach(btn => {
      btn.addEventListener("click", () => {
        pacienteInput.value = usuarioEmail;
        fechaInput.value = btn.dataset.fecha;
        horaInput.value = btn.dataset.hora;
        selectEspecialidad.value = btn.dataset.especialidad;
        selectEspecialidad.dispatchEvent(new Event("change"));
      });
    });
  }

  // Guardar turno
  form.addEventListener("submit", e => {
    e.preventDefault();

    const paciente = pacienteInput.value.trim();
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const especialidad = selectEspecialidad.value;
    const medico = selectMedico.value;

    if (!paciente || !fecha || !hora || !especialidad || !medico) {
      alert("Complete todos los campos antes de guardar el turno.");
      return;
    }

    const turnos = getTurnos();
    const ocupado = turnos.find(
      t => t.fecha === fecha && t.hora === hora && t.especialidad === especialidad
    );

    if (ocupado) {
      alert("⚠ Este turno ya está ocupado.");
      return;
    }

    const nuevoTurno = {
      id: Date.now().toString(),
      paciente,
      fecha,
      hora,
      especialidad,
      medico
    };

    // Guardar en TURNOS_INICIALES
    addTurno(nuevoTurno);

    // Guardar en el usuario actual
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioIndex = usuarios.findIndex(u => u.email?.toLowerCase() === usuarioEmail.toLowerCase());

    if (usuarioIndex !== -1) {
      if (!Array.isArray(usuarios[usuarioIndex].turnos)) {
        usuarios[usuarioIndex].turnos = [];
      }
      usuarios[usuarioIndex].turnos.push(nuevoTurno);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    } else {
      console.warn("⚠ No se encontró el usuario actual en localStorage.");
    }

    form.reset();
    selectMedico.innerHTML = `<option value="">Seleccione primero una especialidad</option>`;
    renderTurnos();
  });

  renderTurnos();
});

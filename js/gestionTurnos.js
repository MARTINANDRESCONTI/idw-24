// Archivo gestionTurnos.js (Lógica para Generación Masiva de Turnos)

import { addTurno, getTurnos } from "./utils/turnosStorage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formTurno");
  const tablaTurnos = document.getElementById("tablaTurnos"); // Se mantiene para mostrar los turnos generados (opcional)
  const selectEspecialidad = document.getElementById("especialidad");
  const selectMedico = document.getElementById("medico");
  const fechaInput = document.getElementById("fecha");
  const horaInicioInput = document.getElementById("horaInicio"); // Nuevo input para hora de inicio
  const horaFinInput = document.getElementById("horaFin"); // Nuevo input para hora de fin
  const intervaloInput = document.getElementById("intervalo"); // Nuevo input para intervalo

  // Cargar datos desde localStorage
  const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];

  // Función auxiliar para obtener el ID de especialidad a partir de su nombre (se asume que existe)
  function getEspecialidadIdByName(name) {
    const especialidad = especialidades.find(e => e.descripcion === name);
    return especialidad ? especialidad.id : null;
  }

  // Cargar especialidades en el select
  if (selectEspecialidad) {
    selectEspecialidad.innerHTML =
      `<option value="">Seleccione una especialidad</option>` +
      especialidades
        .map(e => `<option value="${e.id}">${e.descripcion}</option>`)
        .join("");
  }

  // Configurar fecha mínima (hoy)
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.setAttribute("min", hoy);

  // Actualizar médicos según especialidad
  selectEspecialidad.addEventListener("change", () => {
    const especialidadId = parseInt(selectEspecialidad.value);
    
    // Opción para todos los médicos de la especialidad
    let opcionesMedico = `<option value="TODOS">Todos los médicos de la especialidad</option>`;
    
    if (especialidadId) {
      const medicosFiltrados = medicos.filter(m => m.especialidadId === especialidadId);
      opcionesMedico += medicosFiltrados.map(m => `<option value="${m.id}">${m.nombre} ${m.apellido}</option>`).join("");
    }
    
    selectMedico.innerHTML = opcionesMedico;
  });

  // Generar Horarios (función auxiliar para la lógica de generación)
  function generarHorarios(inicio, fin, intervaloMinutos) {
    const horarios = [];
    let [hI, mI] = inicio.split(":").map(Number);
    let [hF, mF] = fin.split(":").map(Number);

    let tiempoActual = hI * 60 + mI;
    const tiempoFin = hF * 60 + mF;

    while (tiempoActual <= tiempoFin) {
      const hora = Math.floor(tiempoActual / 60) % 24;
      const minutos = tiempoActual % 60;
      horarios.push(`${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
      tiempoActual += intervaloMinutos;
    }
    // Asegura que el último horario (el de fin) no se agregue si el intervalo no cae justo
    if (horarios.length > 0 && horarios[horarios.length - 1] === fin && intervaloMinutos > 0) {
        // Si el último es el fin y no es intervalo 0, lo quito para evitar crear un turno a la hora de fin
        // La gente no reserva a la hora que termina el horario.
        // Pero si se quiere que se pueda reservar a la hora de fin, se puede quitar esta lógica.
    }
    
    return horarios.filter(h => h !== fin); // Evita el último horario como fin de intervalo
  }

  // Manejar el submit del formulario para generar turnos
  form.addEventListener("submit", e => {
    e.preventDefault();

    const especialidadId = parseInt(selectEspecialidad.value);
    const medicoId = selectMedico.value;
    const fecha = fechaInput.value;
    const horaInicio = horaInicioInput.value;
    const horaFin = horaFinInput.value;
    const intervalo = parseInt(intervaloInput.value) || 60; // Por defecto 60 min

    if (!especialidadId || !fecha || !horaInicio || !horaFin || !intervalo || !medicoId) {
      alert("Complete todos los campos para la generación de turnos.");
      return;
    }
    
    const turnosDisponibles = generarHorarios(horaInicio, horaFin, intervalo);
    let turnosAgregados = 0;
    
    // Lista de médicos a generar
    let medicosGenerar = [];
    if (medicoId === "TODOS") {
      medicosGenerar = medicos.filter(m => m.especialidadId === especialidadId);
    } else {
      const medicoUnico = medicos.find(m => m.id === parseInt(medicoId));
      if (medicoUnico) medicosGenerar.push(medicoUnico);
    }
    
    if (medicosGenerar.length === 0) {
        alert("No se encontraron médicos para generar turnos.");
        return;
    }
    
    const turnosExistentes = getTurnos();

    medicosGenerar.forEach(medico => {
        turnosDisponibles.forEach(hora => {
            // Verificar si el turno ya existe para evitar duplicados
            const yaExiste = turnosExistentes.some(t => 
                t.fecha === fecha && 
                t.hora === hora && 
                t.medicoId === medico.id
            );
            
            if (!yaExiste) {
                const nuevoTurno = {
                    id: Date.now() + Math.random(), // Usar una forma más robusta o Date.now() y manejar duplicados en el ABM
                    medicoId: medico.id,
                    fecha: fecha,
                    hora: hora,
                    especialidadId: especialidadId,
                    disponible: true, // Indica que está libre para ser reservado
                    pacienteId: null // Se llena al reservar
                };
                addTurno(nuevoTurno);
                turnosAgregados++;
            }
        });
    });

    alert(`✅ Se generaron ${turnosAgregados} turnos disponibles para el ${fecha}.`);
    form.reset();
  });

  // Nota: La función renderTurnos() ya no es necesaria para la generación,
  // se enfoca en la creación masiva. El ABM (turnosAbm.js) se encarga de listar y gestionar.
});
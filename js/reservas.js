// Archivo reservas.js (Rol Visitante: Creación de Reservas - FINAL)

import { getTurnos, updateTurno } from "./utils/turnosStorage.js"; 

document.addEventListener("DOMContentLoaded", () => {
  // Selects e inputs del formulario
  const selectEspecialidad = document.getElementById("especialidad");
  const selectMedico = document.getElementById("medico");
  const selectObraSocial = document.getElementById("obraSocial");
  const selectFecha = document.getElementById("fecha");
  const selectHora = document.getElementById("hora");

  // Campos de paciente (Añadidos al HTML y leídos aquí)
  const documentoInput = document.getElementById("documento");
  const apellidoNombreInput = document.getElementById("apellidoNombre");
  
  const valorConsultaInput = document.getElementById("valorConsulta"); 
  const aCargoObraSocialInput = document.getElementById("aCargoObraSocial");
  const aCargoPacienteInput = document.getElementById("aCargoPaciente");
  const resultadoFinal = document.getElementById("resultadoFinal");
  const form = document.getElementById("formTurno");

  // CLAVE ASUMIDA: 'currentUser' es la clave común en sessionStorage para el usuario logueado.
  const SESSION_KEY = "currentUser"; 

  // Datos desde localStorage
  let turnosDisponibles = getTurnos(); 
  const especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  const medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  const obrasSociales = JSON.parse(localStorage.getItem("obrasSociales")) || [];

  // Función auxiliar para obtener el objeto completo (ajustada a tus claves: especialidadId y id)
  const getEspecialidad = (id) => especialidades.find(e => e.especialidadId === id);
  const getMedico = (id) => medicos.find(m => m.id === id);

  // 🎯 FUNCIÓN: Cargar datos del usuario logueado (desde sessionStorage)
  function cargarDatosUsuarioLogueado() {
      const usuarioJson = sessionStorage.getItem(SESSION_KEY);
      
      if (usuarioJson) {
          try {
              const usuario = JSON.parse(usuarioJson);
              
              // Usamos 'email' o 'user' del login para autocompletar el campo Documento/Identificador
              const identificador = usuario.email || usuario.user || "";

              if (documentoInput) {
                  documentoInput.value = identificador;
              }
              // Nota: Apellido y Nombre quedan editables para que el paciente los complete.
              
          } catch (e) {
              console.error("Error al parsear datos de sessionStorage:", e);
          }
      } 
  }

  // Generar Fechas Próximas (14 días)
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
  const fechasProximas = generarFechas();

  // 1️⃣ Llenar select de especialidades
  function inicializarEspecialidades() {
    selectEspecialidad.innerHTML =
      `<option value="">Seleccione una especialidad</option>` +
      especialidades.map(e => `<option value="${e.especialidadId}">${e.descripcion}</option>`).join("");
  }

  // 2️⃣ Filtrar médicos según especialidad
  selectEspecialidad.addEventListener("change", () => {
    const espId = parseInt(selectEspecialidad.value);
    
    // Filtro por la clave correcta en Medicos (especialidadId)
    const medicosFiltrados = medicos.filter(m => m.especialidadId === espId);

    selectMedico.innerHTML =
      medicosFiltrados.length > 0
        ? `<option value="">Seleccione un médico</option>` +
          medicosFiltrados.map(m => `<option value="${m.id}">${m.nombre} ${m.apellido}</option>`).join("")
        : `<option value="">No hay médicos disponibles</option>`;

    // Resetear siguientes campos
    selectObraSocial.innerHTML = `<option value="particular">Consulta Particular</option>`;
    selectFecha.innerHTML = `<option value="">Seleccione primero médico</option>`;
    selectHora.innerHTML = `<option value="">Seleccione primero fecha</option>`;
    valorConsultaInput.value = "";
    actualizarMontos();
  });

  // 3️⃣ Cargar obras sociales del médico y actualizar fechas
  selectMedico.addEventListener("change", () => {
    const medicoId = parseInt(selectMedico.value);
    const medico = getMedico(medicoId);

    if (!medico) {
      selectObraSocial.innerHTML = `<option value="particular">Consulta Particular</option>`;
      selectFecha.innerHTML = `<option value="">Seleccione primero médico</option>`;
      selectHora.innerHTML = `<option value="">Seleccione primero fecha</option>`;
      valorConsultaInput.value = "";
      actualizarMontos();
      return;
    }

    // Llenar obras sociales (usa osId como string para la búsqueda)
    let opcionesObras = `<option value="particular">Consulta Particular</option>`;
    
    if (medico.obrasSociales && medico.obrasSociales.length > 0) {
      medico.obrasSociales.forEach(osId => {
        // Busca Obra Social por su ID string (ej: "OS001")
        const os = obrasSociales.find(o => o.id === osId); 
        
        if (os) {
          opcionesObras += `<option value="${os.id}">${os.nombre}</option>`;
        }
      });
    }
    selectObraSocial.innerHTML = opcionesObras;

    // Asignar valor de consulta del médico 
    valorConsultaInput.value = medico.valorConsulta || 500; 

    actualizarMontos();
    actualizarFechasDisponibles();
  });

  // 4️⃣ Cuando cambie obra social o médico, actualizar montos
  selectObraSocial.addEventListener("change", actualizarMontos);

  function actualizarMontos() {
    const medicoId = parseInt(selectMedico.value);
    const medico = getMedico(medicoId);
    
    const valorConsulta = parseFloat(valorConsultaInput.value) || 0;
    let porcentajeCobertura = 0; 

    const obraId = selectObraSocial.value;
    if (obraId !== "particular") {
      const obra = obrasSociales.find(o => o.id === obraId); 
      porcentajeCobertura = obra ? obra.porcentaje : 0; 
    }

    // ✅ CÁLCULO CORREGIDO: MONTO DE COBERTURA
    const montoObraSocial = (valorConsulta * porcentajeCobertura) / 100;
    
    // Monto a cargo del paciente (la diferencia)
    const montoPaciente = valorConsulta - montoObraSocial;

    // ASIGNACIÓN CORREGIDA: Se asignan los MONTOS (no los porcentajes)
    aCargoObraSocialInput.value = montoObraSocial.toFixed(2);
    aCargoPacienteInput.value = montoPaciente.toFixed(2);
  }

  // 5️⃣ Actualizar fechas y horarios disponibles
  function actualizarFechasDisponibles() {
    const medicoId = parseInt(selectMedico.value);
    selectFecha.innerHTML = `<option value="">Seleccione una fecha</option>`;

    if (!medicoId) return;

    const fechasDisponibles = fechasProximas.filter(fecha =>
      turnosDisponibles.some(t =>
        t.medicoId === medicoId &&
        t.fecha === fecha &&
        t.disponible
      )
    );
    
    const fechasUnicas = [...new Set(fechasDisponibles)];

    selectFecha.innerHTML =
      `<option value="">Seleccione una fecha</option>` +
      fechasUnicas.map(f => `<option value="${f}">${f}</option>`).join("");
      
    selectHora.innerHTML = `<option value="">Seleccione primero fecha</option>`;
  }
  
  selectFecha.addEventListener("change", actualizarHorariosDisponibles);
  selectMedico.addEventListener("change", actualizarHorariosDisponibles);
  
  function actualizarHorariosDisponibles() {
    const fechaSel = selectFecha.value;
    const medicoId = parseInt(selectMedico.value);
    selectHora.innerHTML = `<option value="">Seleccione un horario</option>`;

    if (!fechaSel || !medicoId) return;

    const turnosLibres = turnosDisponibles.filter(t => 
      t.fecha === fechaSel && 
      t.medicoId === medicoId && 
      t.disponible
    );
    
    selectHora.innerHTML =
      `<option value="">Seleccione un horario</option>` +
      turnosLibres.map(t => 
        `<option value="${t.id}">${t.hora}</option>` 
      ).join("");
  }

  // 6️⃣ Guardar reserva (actualizando el turno disponible)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const espId = parseInt(selectEspecialidad.value);
    const medicoId = parseInt(selectMedico.value);
    const obraId = selectObraSocial.value;
    const turnoId = selectHora.value; 
    
    const documento = documentoInput.value.trim(); 
    const pacienteNombre = apellidoNombreInput.value.trim(); 
    
    const valorTotal = parseFloat(aCargoPacienteInput.value) || 0; // Monto a pagar por el paciente

    if (!espId || !medicoId || !turnoId || !documento || !pacienteNombre) {
      alert("Complete todos los campos requeridos para la reserva.");
      return;
    }
    
    const turnoSeleccionado = getTurnos().find(t => t.id.toString() === turnoId);
    
    if (!turnoSeleccionado) {
        alert("Error: El turno no está disponible o ya fue reservado.");
        return;
    }
    
    // --- 1. Crear el objeto RESERVA (según PDF) ---
    const nuevaReserva = {
        id: Date.now().toString(),
        Documento: documento,
        "Apellido y nombre del paciente": pacienteNombre,
        Turno: turnoId, 
        Especialidad: espId,
        "Obra social": obraId === "particular" ? null : obraId, 
        "Valor total": valorTotal, 
    };

    const reservas = JSON.parse(localStorage.getItem("RESERVAS")) || [];
    reservas.push(nuevaReserva);
    localStorage.setItem("RESERVAS", JSON.stringify(reservas));
    
    // --- 2. Actualizar el Turno a "reservado" ---
    const cambiosTurno = {
        disponible: false,
        pacienteDocumento: documento,
        pacienteNombre: pacienteNombre,
        reservaId: nuevaReserva.id, 
        estado: "Confirmado" 
    };
    
    updateTurno(turnoId, cambiosTurno); 
    
    // --- 3. Mostrar Resultado Final ---
    const medicoObj = getMedico(medicoId);
    const especialidadObj = getEspecialidad(espId);
    const obraSocialNombre = obraId === "particular" ? "Consulta Particular" : obrasSociales.find(o => o.id === obraId)?.nombre || "N/A";
    const fechaTurno = turnoSeleccionado.fecha;
    const horaTurno = turnoSeleccionado.hora;

    const mensaje = `
        <div class="alert alert-success mt-4" id="resultadoFinal">
            <h4>✅ Reserva Exitosa</h4>
            <hr>
            <p><strong>Médico:</strong> ${medicoObj.nombre} ${medicoObj.apellido}</p>
            <p><strong>Especialidad:</strong> ${especialidadObj.descripcion}</p>
            <p><strong>Obra Social:</strong> ${obraSocialNombre}</p>
            <p><strong>Fecha y Hora:</strong> ${fechaTurno} a las ${horaTurno}</p>
            <p><strong>Costo Total (a cargo del paciente):</strong> $${valorTotal.toFixed(2)}</p>
        </div>
    `;
    resultadoFinal.innerHTML = mensaje; 
    
    // Resetear formulario y recargar turnos
    form.reset();
    selectMedico.innerHTML = `<option value="">Seleccione primero una especialidad</option>`;
    selectObraSocial.innerHTML = `<option value="particular">Consulta Particular</option>`;
    valorConsultaInput.value = "";
    aCargoObraSocialInput.value = "";
    aCargoPacienteInput.value = "";
    turnosDisponibles = getTurnos(); 
    cargarDatosUsuarioLogueado(); 
    actualizarFechasDisponibles(); 
  });

  // Inicialización
  cargarDatosUsuarioLogueado(); 
  inicializarEspecialidades();
  actualizarMontos(); 
});
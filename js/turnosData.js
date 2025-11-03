// Constante exportada con datos iniciales de turnos
const TURNOS_INICIALES = [
  {
    id: 1,
    paciente: "Juan López",
    medico: "Juan Carlos Pérez",
    especialidad: "Cardiología",
    fecha: "2025-11-10",
    hora: "09:00",
    estado: "Confirmado",
    telefono: "341-1234567",
    email: "juan@example.com"
  },
  {
    id: 2,
    paciente: "María García",
    medico: "María Laura González",
    especialidad: "Pediatría",
    fecha: "2025-11-11",
    hora: "10:30",
    estado: "Confirmado",
    telefono: "341-2345678",
    email: "maria@example.com"
  },
  {
    id: 3,
    paciente: "Pedro Martínez",
    medico: "Roberto Martínez",
    especialidad: "Traumatología",
    fecha: "2025-11-12",
    hora: "14:00",
    estado: "Pendiente",
    telefono: "341-3456789",
    email: "pedro@example.com"
  },
  {
    id: 4,
    paciente: "Ana Rodríguez",
    medico: "Ana Rodríguez",
    especialidad: "Ginecología",
    fecha: "2025-11-13",
    hora: "11:00",
    estado: "Confirmado",
    telefono: "341-4567890",
    email: "ana@example.com"
  },
  {
    id: 5,
    paciente: "Carlos López",
    medico: "Carlos López",
    especialidad: "Clínica Médica",
    fecha: "2025-11-14",
    hora: "15:30",
    estado: "Cancelado",
    telefono: "341-5678901",
    email: "carlos@example.com"
  }
];

// Inicializar LocalStorage - SIEMPRE actualiza con datos nuevos
function inicializarTurnos() {
  const turnosEnStorage = localStorage.getItem("turnos");
  
  if (!turnosEnStorage) {
    // Primera carga: inicializa con datos nuevos
    localStorage.setItem("turnos", JSON.stringify(TURNOS_INICIALES));
    console.log("✅ Turnos inicializados en LocalStorage");
  } else {
    // Ya hay datos: FUSIONA con nuevos datos (mantiene ediciones del usuario)
    const turnosGuardados = JSON.parse(turnosEnStorage);
    const turnosActualizados = [];
    
    // Mantener turnos existentes (para preservar cambios del usuario)
    turnosGuardados.forEach(turno => {
      const turnoActualizado = TURNOS_INICIALES.find(t => t.id === turno.id);
      if (turnoActualizado) {
        turnosActualizados.push(turno);
      }
    });
    
    // Agregar turnos nuevos (que no están en storage)
    TURNOS_INICIALES.forEach(turno => {
      if (!turnosGuardados.find(t => t.id === turno.id)) {
        turnosActualizados.push(turno);
      }
    });
    
    // Actualizar localStorage con la fusión
    localStorage.setItem("turnos", JSON.stringify(turnosActualizados));
    console.log("✅ Turnos actualizados en LocalStorage");
  }
}

// Ejecutar al cargar el script
inicializarTurnos();

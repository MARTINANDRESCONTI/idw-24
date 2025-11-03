// ================== horariosData.js ==================
// Datos iniciales para horarios, profesionales y turnos

// PROFESIONALES INICIALES
const PROFESIONALES_INICIALES = [
  {
    id: 1,
    nombre: "Dr. Juan García",
    especialidad: "Cardiología"
  },
  {
    id: 2,
    nombre: "Dra. María López",
    especialidad: "Pediatría"
  },
  {
    id: 3,
    nombre: "Dr. Carlos Rodríguez",
    especialidad: "Traumatología"
  },
  {
    id: 4,
    nombre: "Dra. Ana Martínez",
    especialidad: "Dermatología"
  },
  {
    id: 5,
    nombre: "Dr. Roberto Díaz",
    especialidad: "Neurología"
  }
];

// HORARIOS INICIALES (vacíos, se crean manualmente)
const HORARIOS_INICIALES = [];

// TURNOS INICIALES (vacíos, se generan desde horarios)
const TURNOS_INICIALES = [];

// ================== INICIALIZACIÓN ==================

/**
 * Sincronizar médicos con profesionales
 * Si hay médicos en localStorage['medicos'], agregarlos a profesionales
 */
function sincronizarMedicosConProfesionales() {
  try {
    const medicos = JSON.parse(localStorage.getItem("medicos") || "[]");
    let profesionales = JSON.parse(localStorage.getItem("profesionales") || "[]");
    
    if (medicos.length > 0) {
      // Para cada médico, verificar si existe profesional
      medicos.forEach(medico => {
        const existe = profesionales.find(p => p.id === medico.id);
        
        if (!existe) {
          // Crear profesional desde médico
          profesionales.push({
            id: medico.id,
            nombre: `${medico.nombre} ${medico.apellido}`,
            especialidad: medico.especialidad
          });
        } else {
          // Actualizar si cambió especialidad
          const index = profesionales.findIndex(p => p.id === medico.id);
          profesionales[index] = {
            id: medico.id,
            nombre: `${medico.nombre} ${medico.apellido}`,
            especialidad: medico.especialidad
          };
        }
      });
      
      localStorage.setItem("profesionales", JSON.stringify(profesionales));
      console.log("✓ Sincronización: médicos → profesionales completada");
    }
  } catch (e) {
    console.error("Error en sincronización de médicos:", e);
  }
}

/**
 * Inicializar localStorage para horarios
 */
function inicializarHorarios() {
  try {
    // 1. Inicializar profesionales
    if (!localStorage.getItem("profesionales")) {
      localStorage.setItem("profesionales", JSON.stringify(PROFESIONALES_INICIALES));
      console.log("✓ Profesionales inicializados desde horariosData.js");
    }
    
    // 2. Sincronizar médicos con profesionales (si existen)
    sincronizarMedicosConProfesionales();
    
    // 3. Inicializar horarios
    if (!localStorage.getItem("horarios")) {
      localStorage.setItem("horarios", JSON.stringify(HORARIOS_INICIALES));
      console.log("✓ Horarios inicializados (vacíos)");
    }
    
    // 4. Inicializar turnos
    if (!localStorage.getItem("turnos")) {
      localStorage.setItem("turnos", JSON.stringify(TURNOS_INICIALES));
      console.log("✓ Turnos inicializados (vacíos)");
    }
    
    console.log("✓ Inicialización de horarios completada");
    
  } catch (e) {
    console.error("Error inicializando horarios:", e);
  }
}

// ================== EJECUCIÓN ==================

// Ejecutar al cargar el script
inicializarHorarios();

// ================== NOTAS ==================
/*
 * Este archivo:
 * 
 * 1. Define profesionales iniciales
 * 2. Se carga ANTES de horarios.js en abm-horarios.html
 * 3. Inicializa localStorage si no existen datos
 * 4. Sincroniza médicos (ABM Médicos) con profesionales
 * 
 * Flujo:
 * - horariosData.js se carga
 * - Crea profesionales iniciales (si no existen)
 * - Lee médicos de localStorage['medicos']
 * - Si hay médicos nuevos, los agrega a profesionales
 * - horarios.js se carga y puede leer profesionales
 * 
 * Ventajas:
 * ✓ Código separado y limpio
 * ✓ Inicialización automática
 * ✓ Sincronización automática (médicos → profesionales)
 * ✓ Patrón consistente (como especialidadesData.js)
 * ✓ Fácil de mantener
 */
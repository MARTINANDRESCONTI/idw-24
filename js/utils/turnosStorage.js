// Archivo turnosStorage.js

const LS_KEY = 'TURNOS_INICIALES'; 

// 🎯 TURNOS DISPONIBLES INICIALES (Mismos datos generados para el testeo)
const TURNOS_INICIALES_DISPONIBLES = [
    { 
        id: '20', 
        medicoId: 1, // Dr. Juan Carlos Pérez (Cardiología)
        fecha: '2025-11-15', 
        hora: '10:00', 
        disponible: true, 
        pacienteDocumento: null, 
        pacienteNombre: null, 
        reservaId: null, 
        estado: 'Disponible' 
    },
    { 
        id: '21', 
        medicoId: 2, // Dra. María Laura González (Pediatría)
        fecha: '2025-11-15', 
        hora: '11:30', 
        disponible: true, 
        pacienteDocumento: null, 
        pacienteNombre: null, 
        reservaId: null, 
        estado: 'Disponible' 
    },
];

/**
 * Genera un nuevo ID único.
 */
export function generarId() {
  return (Date.now() + Math.random()).toString();
}

// 1. Lógica de Inicialización (garantiza que haya turnos disponibles)
function inicializarTurnos() {
    if (!localStorage.getItem(LS_KEY) || JSON.parse(localStorage.getItem(LS_KEY)).length === 0) {
        // Si no existe la clave, o si está vacía, la inicializa con turnos disponibles.
        localStorage.setItem(LS_KEY, JSON.stringify(TURNOS_INICIALES_DISPONIBLES));
    }
}

inicializarTurnos(); 

/**
 * Obtiene todos los turnos del LocalStorage.
 * @returns {Array} Array de turnos.
 */
export function getTurnos() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}

/**
 * Agrega uno o más turnos nuevos al LocalStorage.
 */
export function addTurno(turnoOrTurnos) {
  const turnos = getTurnos();
  const aAgregar = Array.isArray(turnoOrTurnos) ? turnoOrTurnos : [turnoOrTurnos];
  
  turnos.push(...aAgregar);
  localStorage.setItem(LS_KEY, JSON.stringify(turnos));
}

/**
 * Actualiza un turno existente por su ID.
 */
export function updateTurno(id, changes) {
  const turnos = getTurnos();
  const idStr = id.toString();
  const index = turnos.findIndex(t => t.id.toString() === idStr); 

  if (index !== -1) {
    turnos[index] = { ...turnos[index], ...changes }; 
    localStorage.setItem(LS_KEY, JSON.stringify(turnos));
    return true;
  }
  return false;
}

/**
 * Elimina un turno por su ID.
 */
export function deleteTurno(id) {
  let turnos = getTurnos();
  const idStr = id.toString();
  turnos = turnos.filter(t => t.id.toString() !== idStr);
  localStorage.setItem(LS_KEY, JSON.stringify(turnos));
}
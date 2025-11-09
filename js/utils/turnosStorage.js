const TURNOS_KEY = "TURNOS_INICIALES";

if (!localStorage.getItem(TURNOS_KEY)) localStorage.setItem(TURNOS_KEY, JSON.stringify([]));

export function getTurnos() {
  return JSON.parse(localStorage.getItem(TURNOS_KEY)) || [];
}

export function addTurno(turno) {
  const turnos = getTurnos();
  turnos.push(turno);
  localStorage.setItem(TURNOS_KEY, JSON.stringify(turnos));
}

export function updateTurno(id, cambios) {
  const turnos = getTurnos();
  const idx = turnos.findIndex(t => t.id === id);
  if (idx !== -1) {
    turnos[idx] = { ...turnos[idx], ...cambios };
    localStorage.setItem(TURNOS_KEY, JSON.stringify(turnos));
  }
}

export function deleteTurno(id) {
  let turnos = getTurnos();
  turnos = turnos.filter(t => t.id !== id);
  localStorage.setItem(TURNOS_KEY, JSON.stringify(turnos));
}

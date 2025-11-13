// catalogo.js - Consume datos de medicosData.js, especialidadesData.js y obraSocAbm.js desde localStorage
document.addEventListener("DOMContentLoaded", () => {
  const medicosContainer = document.getElementById("medicosContainer");

  function loadMedicosGrid() {
    if (!medicosContainer) return;

    // Obtener datos del localStorage
    const medicosJSON = localStorage.getItem("medicos");
    const especialidadesJSON = localStorage.getItem("especialidades");
    const obrasSocialesJSON = localStorage.getItem("obrasSociales");

    const medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
    const especialidades = especialidadesJSON ? JSON.parse(especialidadesJSON) : [];
    const obrasSociales = obrasSocialesJSON ? JSON.parse(obrasSocialesJSON) : [];

    if (medicos.length === 0) {
      medicosContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted fs-5">No hay médicos disponibles en este momento</p></div>';
      return;
    }

    // Crear mapeo de obras sociales
    const obrasMap = {};
    obrasSociales.forEach(obra => {
      obrasMap[obra.id] = obra.nombre;
    });

    // Generar HTML
    const medicosHTML = medicos.map(medico => {
      const especialidad = especialidades.find(
        e => e.especialidadId === medico.especialidadId
      )?.descripcion || "Especialidad no definida";

      let obrasSocialesText = "";
      if (medico.obrasSociales && medico.obrasSociales.length > 0) {
        const nombreObrasSociales = medico.obrasSociales
          .map(codigoObra => obrasMap[codigoObra])
          .filter(nombre => nombre !== undefined);
        if (nombreObrasSociales.length > 0) {
          obrasSocialesText = nombreObrasSociales.join(", ");
        }
      }

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card medico-card">
            <div class="medico-foto-container">
              <img src="${medico.foto}" alt="${medico.nombre} ${medico.apellido}" 
                class="medico-foto" onerror="this.src='https://via.placeholder.com/350x250?text=Sin+foto'">
            </div>

            <div class="medico-info">
              <div class="medico-header">
                <div class="medico-nombre">${medico.nombre} ${medico.apellido}</div>
                <div class="medico-matricula">Mat: ${medico.matricula || "N/A"}</div>
              </div>

              <ul class="medico-datos-lista">
                <li><span class="medico-datos-label">Especialidad:</span> ${especialidad}</li>
                <li><span class="medico-datos-label">Obras sociales:</span> ${obrasSocialesText || "Solo particular"}</li>
                <li><span class="medico-datos-label">Valor consulta:</span> $${(medico.valorConsulta || 0).toFixed(2)}</li>
              </ul>

              ${medico.descripcion ? `<div class="medico-descripcion">${medico.descripcion}</div>` : ""}

              <div class="medico-footer">
                <button class="btn-agendar" onclick="agendarTurno(${medico.id})">
                  Agendar turno
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    medicosContainer.innerHTML = medicosHTML;
  }

  loadMedicosGrid();

  window.addEventListener("storage", () => {
    loadMedicosGrid();
  });
});

// ✅ Redirige al formulario en gestionTurnos.html con el ID del médico
function agendarTurno(medicoId) {
  window.location.href = `gestionTurnos.html#form-turno?medicoId=${medicoId}`;
}

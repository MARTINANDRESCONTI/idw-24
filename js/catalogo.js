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

    // Crear mapeo de obras sociales para búsqueda rápida
    const obrasMap = {};
    obrasSociales.forEach(obra => {
      obrasMap[obra.id] = obra.nombre;
    });

    // Generar HTML para cada médico
    const medicosHTML = medicos.map(medico => {
      // Buscar especialidad
      const especialidad = especialidades.find(
        e => e.especialidadId === medico.especialidadId
      )?.descripcion || "Especialidad no definida";

      // Mapear obras sociales del médico a sus nombres
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
            <!-- Foto del médico -->
            <div class="medico-foto-container">
              <img src="${medico.foto}" alt="${medico.nombre} ${medico.apellido}" 
                class="medico-foto" onerror="this.src='https://via.placeholder.com/350x250?text=Sin+foto'">
            </div>

            <!-- Información del médico -->
            <div class="medico-info">
              <!-- Header con nombre y matrícula -->
              <div class="medico-header">
                <div class="medico-nombre">${medico.nombre} ${medico.apellido}</div>
                <div class="medico-matricula">Mat: ${medico.matricula || "N/A"}</div>
              </div>

              <!-- Lista de datos con viñetas -->
              <ul class="medico-datos-lista">
                <li>
                  <span class="medico-datos-label">Especialidad:</span> ${especialidad}
                </li>
                <li>
                  <span class="medico-datos-label">Obras sociales:</span> ${obrasSocialesText || "Solo particular"}
                </li>
                <li>
                  <span class="medico-datos-label">Valor consulta:</span> $${(medico.valorConsulta || 0).toFixed(2)}
                </li>
              </ul>

              <!-- Descripción (si existe) -->
              ${medico.descripcion ? `<div class="medico-descripcion">${medico.descripcion}</div>` : ""}

              <!-- Botón -->
              <div class="medico-footer">
                <button class="btn-agendar" onclick="agendarTurno(${medico.id})">Agendar turno</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    medicosContainer.innerHTML = medicosHTML;
  }

  // Cargar el grid al iniciar
  loadMedicosGrid();

  // Opcional: recargar si hay cambios en localStorage
  window.addEventListener("storage", () => {
    loadMedicosGrid();
  });
});

// Función para agendar turno (puedes adaptarla según necesites)
function agendarTurno(medicosId) {
  console.log(`Agendar turno con el médico ID: ${medicosId}`);
  // Aquí puedes redirigir a otra página o abrir un modal
  // Por ejemplo: window.location.href = `gestionTurnos.html?medicoId=${medicosId}`;
}
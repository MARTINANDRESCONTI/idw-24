// institucional.js - Consume datos de medicosData.js desde localStorage
document.addEventListener("DOMContentLoaded", () => {
  const equipoContainer = document.getElementById("equipoContainer");

  // Función para crear una tarjeta de profesional (más pequeña, sin foto grande)
  function createProfessionalCard(medico) {
    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-2">
        <div class="card h-100 shadow-sm border-0 text-center">
          <div class="card-body d-flex flex-column align-items-center p-2">
            <img 
              src="${medico.foto || 'assets/default.png'}" 
              alt="${medico.nombre} ${medico.apellido}" 
              class="img-fluid rounded mb-2" 
              style="width: 100%; height: auto; max-height: 150px; object-fit: contain;" 
            />
            <h6 class="card-title fw-bold text-primary mb-1" style="font-size: 0.9rem;">
              ${medico.nombre} ${medico.apellido}
            </h6>
            <p class="card-text text-muted flex-grow-1 mb-0" style="font-size: 0.8rem;">
              ${medico.especialidad}
            </p>
            <small class="text-muted d-block mt-1" style="font-size: 0.7rem;">
              ${medico.matricula || 'Sin matrícula'}
            </small>
          </div>
        </div>
      </div>
    `;
  }

<<<<<<< HEAD
  function loadStaffCarousel() {
  if (!carouselInner) return;

  const medicosJSON = localStorage.getItem("medicos");
  const especialidadesJSON = localStorage.getItem("especialidades");

  const medicos = medicosJSON ? JSON.parse(medicosJSON) : [];
  const especialidades = especialidadesJSON ? JSON.parse(especialidadesJSON) : [];

  if (medicos.length === 0) return;

  const itemsPerSlide = 4;
  let carouselHTML = "";

  for (let i = 0; i < medicos.length; i += itemsPerSlide) {
    const slice = medicos.slice(i, i + itemsPerSlide);

    // 🔹 Genera las cards con la descripción real de la especialidad
    const cardsHTML = slice.map(medico => {
      const especialidad = especialidades.find(
        e => e.especialidadId === medico.especialidadId
      )?.descripcion || "Especialidad no definida";

      return `
        <div class="col-6 col-md-3 text-center mb-4">
          <img src="${medico.foto}" alt="${medico.nombre} ${medico.apellido}" 
            class="img-fluid rounded shadow-sm" style="max-height: 180px; width: auto">
          <p class="mt-2 mb-0 fw-bold">${medico.nombre} ${medico.apellido}</p>
          <small class="text-muted">${especialidad}</small>
        </div>
      `;
    }).join("");

    carouselHTML += `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <div class="row justify-content-center">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  carouselInner.innerHTML = carouselHTML;
}

  loadStaffCarousel();
=======
  function loadEquipo() {
    if (!equipoContainer) return;

    // Obtener médicos desde LocalStorage (inicializado por medicosData.js)
    const medicosJSON = localStorage.getItem("medicos");
    const medicos = medicosJSON ? JSON.parse(medicosJSON) : [];

    if (medicos.length === 0) {
      equipoContainer.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted">No hay médicos registrados</p>
        </div>
      `;
      return;
    }

    // Renderizar todas las tarjetas de profesionales
    const cardsHTML = medicos.map(createProfessionalCard).join("");
    equipoContainer.innerHTML = cardsHTML;
  }

  // Cargar el equipo cuando el DOM esté listo
  loadEquipo();
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
});

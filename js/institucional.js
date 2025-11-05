// institucional.js - Consume datos de medicosData.js desde localStorage
document.addEventListener("DOMContentLoaded", () => {
  const carouselInner = document.getElementById("carouselMedicosInner");

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

      const cardsHTML = slice.map(medico => {
        const especialidad = especialidades.find(
          e => e.id === medico.especialidadId
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
});

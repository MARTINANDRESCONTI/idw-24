document.addEventListener("DOMContentLoaded", () => {
  // ARRAY DE CARDS
  const services = [
    {
      id: 1,
      image: "img/Consultas.png",
      description:
        "Consultas médicas especializadas con profesionales altamente capacitados para brindar el mejor diagnóstico y tratamiento.",
    },
    {
      id: 2,
      image: "img/Laboratorio.jpg",
      description:
        "Análisis clínicos completos con tecnología de última generación para resultados precisos y confiables.",
    },
    {
      id: 3,
      image: "img/Imagenes.png",
      description:
        "Radiografías, ecografías y tomografías con equipos modernos para diagnósticos precisos y detallados.",
    },
    {
      id: 4,
      image: "img/Preventivos.png",
      description:
        "Chequeos médicos preventivos para detectar tempranamente cualquier condición y mantener tu salud óptima.",
    },
    {
      id: 5,
      image: "img/centroMujer.jpg",
      description:
        "Atención ginecológica integral con enfoque en la salud reproductiva y bienestar femenino en todas las etapas.",
    },
    {
      id: 6,
      image: "img/aptosFisicos.jpg",
      description:
        "Certificados médicos para actividades deportivas, laborales y educativas con evaluación completa del estado físico.",
    },
  ]

  // ARMADOR DE CARDS
  function createServiceCard(service) {
    return `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card service-card shadow-sm h-100">
                    <div class="card-img-container">
                        <img src="${service.image}" class="card-img-top" alt="${service.title}">
                        <div class="card-overlay">
                            <p class="overlay-text ">${service.description}</p>
                        </div>
                    </div>
                  
                </div>
            </div>
        `
  }

  // CARGAS DE CARDS EN HTML
  function loadServices() {
    const container = document.getElementById("servicesContainer")
    if (container) {
      const servicesHTML = services.map((service) => createServiceCard(service)).join("")
      container.innerHTML = servicesHTML
    }
  }

  
  loadServices()
})

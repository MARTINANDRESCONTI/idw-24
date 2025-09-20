document.addEventListener("DOMContentLoaded", () => {
  const services = [
    { id:1, image:"img/Consultas.png", description:"Consultas médicas especializadas..." },
    { id:2, image:"img/Laboratorio.jpg", description:"Análisis clínicos completos..." },
    { id:3, image:"img/Imagenes.png", description:"Radiografías, ecografías y tomografías..." },
    { id:4, image:"img/Preventivos.png", description:"Chequeos médicos preventivos..." },
    { id:5, image:"img/centroMujer.jpg", description:"Atención ginecológica integral..." },
    { id:6, image:"img/aptosFisicos.jpg", description:"Certificados médicos para actividades..." },
  ];

  const container = document.getElementById("servicesContainer");

  function createServiceCard(service){
    // Reemplazado por diseño Bootstrap
    /*
    return `
      <div class="col-12">
        <div class="service-card">
          <img src="${service.image}" alt="">
          <p>${service.description}</p>
        </div>
      </div>
    `;
    */

    // Nueva versión 100% Bootstrap con 3 cortes responsive
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-img-container position-relative overflow-hidden" style="height:200px;">
            <div class="ratio ratio-16x9">
               <img src="${service.image}" class="card-img-top" alt="${service.title}">
            </div>
            <div class="card-overlay d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); opacity:0; transition:opacity 0.3s;">
              <p class="text-light text-center">${service.description}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function loadServices() {
    container.innerHTML = services.map(createServiceCard).join("");
    // Hover overlay
    container.querySelectorAll(".card-img-container").forEach(el=>{
      el.addEventListener("mouseenter", ()=> el.querySelector(".card-overlay").style.opacity = 1);
      el.addEventListener("mouseleave", ()=> el.querySelector(".card-overlay").style.opacity = 0);
    });
  }

  loadServices();
});

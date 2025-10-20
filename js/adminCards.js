document.addEventListener("DOMContentLoaded", () => {
  const adminModules = [
    { 
      id: 1, 
      image: "assets/staff.jpg", 
      title: "Staff Médico",
      description: "Administrar médicos: Listar, Crear, Visualizar, Modificar y Eliminar profesionales de la salud.",
      link: "abm-medicos.html",
      icon: "bi-person-badge"
    },
    { 
      id: 2, 
      image: "assets/especialidades.jpg", 
      title: "Especialidades",
      description: "Gestionar especialidades médicas disponibles en la clínica.",
      link: "abm-especialidades.html",
      icon: "bi-clipboard2-pulse"
    },
    { 
      id: 3, 
      image: "assets/turnos.png", 
      title: "Turnos",
      description: "Administrar turnos y citas médicas del sistema.",
      link: "abm-turnos.html",
      icon: "bi-calendar-check"
    },
    { 
      id: 4, 
      image: "assets/pacientes.jpg", 
      title: "Pacientes",
      description: "Gestionar información de pacientes registrados.",
      link: "abm-pacientes.html",
      icon: "bi-people"
    },
    { 
      id: 5, 
      image: "assets/horarios.jpg", 
      title: "Horarios",
      description: "Configurar horarios de atención de los profesionales.",
      link: "abm-horarios.html",
      icon: "bi-clock"
    },
    { 
      id: 6, 
      image: "assets/reportes.png", 
      title: "Reportes",
      description: "Visualizar reportes y estadísticas del sistema.",
      link: "abm-reportes.html",
      icon: "bi-graph-up"
    },
  ];

  const container = document.getElementById("adminCardsContainer");

function createAdminCard(module) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 border-0">
        <div class="card-img-container position-relative overflow-hidden" style="height:200px;">
          <img src="${module.image}" 
           class="card-img-top w-100 h-100" 
           style="object-fit: contain; object-position: top;" 
           alt="${module.title}" 
            onerror="this.src='https://via.placeholder.com/400x225/667eea/ffffff?text=${module.title}'">

            <div class="card-overlay d-flex align-items-center justify-content-center p-3" 
               style="position:absolute; top:0; left:0; right:0; bottom:0; background: rgba(102, 126, 234, 0.9); opacity:0; transition:opacity 0.3s;">
              <p class="text-light text-center fw-bold">${module.description}</p>
            </div>
          </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-primary">
            <i class="${module.icon}"></i> ${module.title}
          </h5>
          <p class="card-text text-muted small flex-grow-1">${module.description}</p>
          <a href="${module.link}" class="btn btn-primary w-100">
            <i class="bi bi-box-arrow-in-right"></i> Acceder
          </a>
        </div>
      </div>
    </div>
  `;
}


  function loadAdminCards() {
    // Verificar si hay un usuario admin logueado
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser || currentUser.role !== "admin") {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = adminModules.map(createAdminCard).join("");
    
    // Hover overlay effect
    container.querySelectorAll(".card-img-container").forEach(el => {
      el.addEventListener("mouseenter", () => {
        el.querySelector(".card-overlay").style.opacity = 1;
      });
      el.addEventListener("mouseleave", () => {
        el.querySelector(".card-overlay").style.opacity = 0;
      });
    });
  }

  loadAdminCards();
});
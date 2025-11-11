document.addEventListener("DOMContentLoaded", () => {
  const turnosLinks = document.querySelectorAll('a[href="gestionTurnos.html"]');

  // Modal de advertencia
  const loginWarningModalEl = document.createElement("div");
  loginWarningModalEl.innerHTML = `
    <div class="modal fade" id="loginWarningModal" tabindex="-1" aria-labelledby="loginWarningModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-light">
            <h5 class="modal-title" id="loginWarningModalLabel">Atención</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            Debes iniciar sesión primero para gestionar turnos.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="goToLoginBtn">Iniciar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(loginWarningModalEl);

  const loginWarningModal = new bootstrap.Modal(document.getElementById("loginWarningModal"));
  const goToLoginBtn = document.getElementById("goToLoginBtn");

  // Click en "Iniciar Sesión" abre tu modal de login
  goToLoginBtn.addEventListener("click", () => {
    loginWarningModal.hide();
    const loginModalEl = document.getElementById("loginModal");
    const loginModal = new bootstrap.Modal(loginModalEl);
    loginModal.show();

    // Guardamos que el usuario quería ir a reservas
    sessionStorage.setItem("redirectAfterLogin", "gestionTurnos.html");
  });

  // Manejo de enlaces a gestión de turnos
  turnosLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      const currentUserStr = sessionStorage.getItem("currentUser");
      if (currentUserStr) {
        // Usuario logueado: redirigir directo
        window.location.href = "gestionTurnos.html";
      } else {
        // Usuario no logueado: mostrar modal
        loginWarningModal.show();
      }
    });
  });

  // Detectar login exitoso y redirigir si estaba intentando acceder
  const loginBtn = document.getElementById("loginBtn");
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    // Aquí tu código de login real...
    // Supongamos que luego de loguear se guarda currentUser en sessionStorage
    // Después de login:
    const redirect = sessionStorage.getItem("redirectAfterLogin");
    if (redirect) {
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirect;
    } else {
      // Otra acción tras login si no venía de reservas
      location.reload();
    }
  });
});

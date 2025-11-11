document.addEventListener("DOMContentLoaded", () => {
  const turnosLinks = document.querySelectorAll('a[href="gestionTurnos.html"]');
  const modalEl = document.getElementById("checkUserModal");
  const modal = new bootstrap.Modal(modalEl);
  const emailInput = document.getElementById("checkUserEmail");
  const btnCheck = document.getElementById("btnCheckUser");
  const errorMsg = document.getElementById("checkUserError");
  const registerContainer = document.getElementById("registerLinkContainer");

  // Aseguramos que el contenedor exista y agregamos el enlace
  if (registerContainer) {
    registerContainer.innerHTML = `<a href="usuarioRegistrado.html" class="btn btn-link w-100 text-center">Registrar nuevo usuario</a>`;
    registerContainer.classList.remove("d-none"); // se asegura que se vea siempre
  }

  function checkEmail(email) {
    // const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    // return usuarios.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    return true
  }

  function resetModal() {
    emailInput.value = "";
    errorMsg.classList.add("d-none");
    // registerContainer siempre visible, no lo tocamos
  }

  // Abrir modal al hacer clic en el enlace
  turnosLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      resetModal();
      modal.show();
    });
  });

  btnCheck.addEventListener("click", () => {
    // const email = emailInput.value.trim();
    // if (!email) return;

    // const usuario = checkEmail(email);

    // if (usuario) {
    //   sessionStorage.setItem("currentUserEmail", email);
    //   modal.hide();
    window.location.href = "gestionTurnos.html";
    // } else {
    //   errorMsg.classList.remove("d-none");
    // }
  });
});

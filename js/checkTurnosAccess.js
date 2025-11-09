document.addEventListener("DOMContentLoaded", () => {
  const turnosLinks = document.querySelectorAll('a[href="gestionTurnos.html"]');
  const modalEl = document.getElementById("checkUserModal");
  const modal = new bootstrap.Modal(modalEl);
  const emailInput = document.getElementById("checkUserEmail");
  const btnCheck = document.getElementById("btnCheckUser");
  const btnRegister = document.getElementById("btnRegister");
  const errorMsg = document.getElementById("checkUserError");
  const registerContainer = document.getElementById("registerLinkContainer");


  function checkEmail(email) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function resetModal() {
    emailInput.value = "";
    errorMsg.classList.add("d-none");
    registerContainer.classList.add("d-none");
  }

  turnosLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      resetModal();
      modal.show();
    });
  });

  btnCheck.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!email) return;

    const usuario = checkEmail(email);
    if (usuario) {
      modal.hide();
      window.location.href = "gestionTurnos.html";
    } else {
      errorMsg.classList.remove("d-none");
      registerContainer.classList.remove("d-none");
    }
  });
  btnRegister.addEventListener("click", () => {
    modal.hide();
    window.location.href = "usuarioRegistrado.html";
  });
});

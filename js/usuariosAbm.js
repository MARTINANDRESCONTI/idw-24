// Variables globales
let usuarios = [];
let usuarioEditando = null;
let usuarioAEliminar = null;

// Elementos del DOM
const usuariosTableBody = document.getElementById("usuariosTableBody");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const usuarioModal = new bootstrap.Modal(document.getElementById("usuarioModal"));
const verUsuarioModal = new bootstrap.Modal(document.getElementById("verUsuarioModal"));
const confirmarEliminarModal = new bootstrap.Modal(document.getElementById("confirmarEliminarModal"));

// Formulario
const usuarioForm = document.getElementById("usuarioForm");
const btnGuardarUsuario = document.getElementById("btnGuardarUsuario");
const btnNuevoUsuario = document.getElementById("btnNuevoUsuario");
const usuarioModalLabel = document.getElementById("usuarioModalLabel");

// Función para mostrar toast
function showToast(message, color = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-white bg-${color} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// Cargar usuarios desde LocalStorage
function cargarUsuarios() {
    const storedUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios = storedUsuarios;
    renderizarTabla(usuarios);
    console.log("Usuarios cargados:", usuarios);
}

// Renderizar tabla
function renderizarTabla(usuariosAMostrar) {
    if (usuariosAMostrar.length === 0) {
        usuariosTableBody.innerHTML = "";
        noResults.classList.remove("d-none");
        return;
    }

    noResults.classList.add("d-none");
    usuariosTableBody.innerHTML = usuariosAMostrar.map(usuario => `
        <tr>
            <td>${usuario.id}</td>
            <td>${usuario.firstName}</td>
            <td>${usuario.email}</td>
            <td>${usuario.turnos.length > 0 ? usuario.turnos.join(", ") : "Sin turnos"}</td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="verUsuario(${usuario.id})" title="Ver"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-warning" onclick="editarUsuario(${usuario.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-danger" onclick="confirmarEliminar(${usuario.id}, '${usuario.firstName}')" title="Eliminar"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Agregar turno
function agregarTurno() {
    const especialidad = prompt("Especialidad del turno:");
    if (especialidad) {
        let turnos = Array.from(document.getElementById("turnosBody").querySelectorAll("tr")).map(tr => tr.cells[0].textContent) || [];
        turnos.push(especialidad);
        actualizarTurnosTabla(turnos);
    }
}

// Actualizar tabla de turnos
function actualizarTurnosTabla(turnos) {
    const tbody = document.getElementById("turnosBody");
    tbody.innerHTML = turnos.map((turno, index) => `
        <tr>
            <td>${turno}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarTurno(${index})">Eliminar</button></td>
        </tr>
    `).join("");
}

// Eliminar turno
function eliminarTurno(index) {
    let turnos = Array.from(document.getElementById("turnosBody").querySelectorAll("tr")).map(tr => tr.cells[0].textContent);
    turnos.splice(index, 1);
    actualizarTurnosTabla(turnos);
}

// Ver usuario
function verUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    document.getElementById("verNombre").textContent = usuario.firstName;
    document.getElementById("verEmail").textContent = usuario.email;
    document.getElementById("verTurnos").textContent = usuario.turnos.length > 0 ? usuario.turnos.join(", ") : "Sin turnos";
    verUsuarioModal.show();
}

// Editar usuario
function editarUsuario(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    usuarioEditando = usuario;
    document.getElementById("usuarioId").value = id;
    document.getElementById("nombre").value = usuario.firstName;
    document.getElementById("email").value = usuario.email;
    usuarioModalLabel.innerHTML = '<i class="bi bi-pencil"></i> Editar Usuario';
    actualizarTurnosTabla(usuario.turnos || []);
    usuarioModal.show();
}

// Guardar usuario
btnGuardarUsuario.addEventListener("click", () => {
    if (!usuarioForm.checkValidity()) {
        usuarioForm.reportValidity();
        return;
    }

    const id = usuarioEditando ? usuarioEditando.id : generarId();
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const turnos = Array.from(document.getElementById("turnosBody").querySelectorAll("tr")).map(tr => tr.cells[0].textContent);

    const usuarioExistente = usuarios.find(u => u.id === id);
    if (usuarioExistente) {
        usuarioExistente.firstName = nombre;
        usuarioExistente.email = email;
        usuarioExistente.turnos = turnos;
    } else {
        usuarios.push({ id, firstName: nombre, email, turnos });
    }
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    showToast(usuarioExistente ? "Usuario actualizado" : "Usuario creado", "success");
    usuarioModal.hide();
    cargarUsuarios();
});

// Confirmar eliminación
function confirmarEliminar(id, nombre) {
    usuarioAEliminar = { id, nombre };
    document.getElementById("nombreEliminar").textContent = nombre;
    confirmarEliminarModal.show();
}

// Eliminar usuario
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    if (!usuarioAEliminar) return;

    usuarios = usuarios.filter(u => u.id !== usuarioAEliminar.id);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    showToast(`Usuario ${usuarioAEliminar.nombre} eliminado, "danger"`);
    confirmarEliminarModal.hide();
    cargarUsuarios();
    usuarioAEliminar = null;
});

// Buscar usuarios
searchInput.addEventListener("input", (e) => {
    const termino = e.target.value.toLowerCase();
    const usuariosFiltrados = usuarios.filter(usuario =>
        usuario.firstName.toLowerCase().includes(termino) ||
        usuario.email.toLowerCase().includes(termino)
    );
    renderizarTabla(usuariosFiltrados);
});

// Abrir modal para nuevo usuario
btnNuevoUsuario.addEventListener("click", () => {
    usuarioEditando = null;
    usuarioForm.reset();
    usuarioModalLabel.innerHTML = '<i class="bi bi-person-plus"></i> Nuevo Usuario';
    actualizarTurnosTabla([]);
    usuarioModal.show();
});

// Verificar acceso y cargar datos
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser")); // ← sessionStorage
        if (!currentUser || currentUser.role !== "admin") {
            showToast("Acceso restringido. Solo para administradores.", "danger");
            setTimeout(() => location.href = "index.html", 1500); // ← redirección
            return;
        }
        cargarUsuarios();
    }, 100); // ← espera a usuariosData.js
});

// Generar ID único
function generarId() {
    return usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
}

// Exponer funciones globalmente
window.verUsuario = verUsuario;
window.editarUsuario = editarUsuario;
window.confirmarEliminar = confirmarEliminar;
window.agregarTurno = agregarTurno;
window.eliminarTurno = eliminarTurno;
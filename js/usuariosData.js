// Datos iniciales de usuarios y inicialización
const USUARIOS_INICIALES = [
    {
        id: 1,
        firstName: "Juan Pérez",
        email: "juan.perez@clinicaidw.com",
        turnos: ["Cardiología", "Consulta General"]
    },
    {
        id: 2,
        firstName: "María Gómez",
        email: "maria.gomez@clinicaidw.com",
        turnos: ["Pediatría"]
    },
    {
        id: 3,
        firstName: "Carlos López",
        email: "carlos.lopez@clinicaidw.com",
        turnos: ["Traumatología"]
    },
    {
        id: 4,
        firstName: "Ana Martínez",
        email: "ana.martinez@clinicaidw.com",
        turnos: []
    },
    {
        id: 5,
        firstName: "Luis Rodríguez",
        email: "luis.rodriguez@clinicaidw.com",
        turnos: ["Oftalmología", "Dermatología"]
    }
];

// Función para inicializar LocalStorage - Fusión con datos existentes
function inicializarUsuarios() {
    const usuariosEnStorage = localStorage.getItem("usuarios");

    if (!usuariosEnStorage) {
        // Primera carga: inicializa con datos nuevos
        localStorage.setItem("usuarios", JSON.stringify(USUARIOS_INICIALES));
        console.log("Usuarios inicializados en LocalStorage:", USUARIOS_INICIALES);
    } else {
        // Ya hay datos: FUSIONA con nuevos datos 
        const usuariosGuardados = JSON.parse(usuariosEnStorage);
        const usuariosActualizados = [];

        // Mantener usuarios existentes 
        usuariosGuardados.forEach(usuario => {
            const usuarioActualizado = USUARIOS_INICIALES.find(u => u.id === usuario.id);
            if (usuarioActualizado) {
                usuariosActualizados.push(usuario); // Preserva el usuario guardado
            } else {
                usuariosActualizados.push(usuario); // Mantiene usuarios no iniciales 
            }
        });

        // Agregar usuarios nuevos 
        USUARIOS_INICIALES.forEach(usuario => {
            if (!usuariosGuardados.find(u => u.id === usuario.id)) {
                usuariosActualizados.push(usuario);
            }
        });

        // Actualizar localStorage con la fusión
        localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));
        console.log("Usuarios actualizados en LocalStorage:", usuariosActualizados);
    }
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    inicializarUsuarios();
});
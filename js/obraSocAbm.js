// Archivo obraSocAbm.js

const OBRAS_INICIALES = [
  { id: "OS001", nombre: "OSDE", porcentaje: 20, descripcion: "Descuento fijo 20%" },
  { id: "OS002", nombre: "IOMA", porcentaje: 30, descripcion: "Descuento fijo 30%" },
  { id: "OS003", nombre: "Swiss Medical", porcentaje: 15, descripcion: "Descuento fijo 15%" }
];

// 1. LÓGICA DE INICIALIZACIÓN (Garantiza que el LS tenga datos)
function inicializarObrasSociales() {
    const LS_KEY = "obrasSociales"; 
    
    // Solo inicializa si la clave NO existe
    if (!localStorage.getItem(LS_KEY)) {
        localStorage.setItem(LS_KEY, JSON.stringify(OBRAS_INICIALES));
        console.log(`✅ Obras Sociales inicializadas en LocalStorage.`);
    }
}
inicializarObrasSociales();


// 2. LÓGICA DE ABM (Lee los datos una vez que están garantizados en LS)

// Cargar obras sociales desde localStorage (Ahora garantizado)
let obras = JSON.parse(localStorage.getItem("obrasSociales")) || [];

// Guardar en localStorage
function guardar() {
 localStorage.setItem("obrasSociales", JSON.stringify(obras));
}

// ID 
function generarId() {
 // Usamos una estructura OSXXX para que coincida con la inicial
 const nuevoId = Math.max(...obras.map(o => parseInt(o.id.replace('OS', '')) || 0)) + 1;
 return "OS" + String(nuevoId).padStart(3, '0');
}


// Descuentos predeterminados

const descuentosFijos = {
 "OSDE": 20,
 "IOMA": 30,
 "Swiss Medical": 15,
 "Galeno": 25,
 "Sancor Salud": 18
};

// Agregar nueva obra social

function agregarObra(nombre, porcentaje) { 
  nombre = nombre.trim();

// Validación: nombre vacío

  if (!nombre) {
  alert("Debe ingresar un nombre de obra social.");
    return;
  }

// Validación: evitar nombres repetidos.

const existe = obras.some(o => o.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
  alert("Esa obra social ya está registrada.");
    return;
}
  const porcentajeNum = parseFloat(porcentaje) || 0;

const nueva = {
id: generarId(),
nombre: nombre,
porcentaje: porcentajeNum 
};

obras.push(nueva);
guardar();
// Asegúrate de que renderTabla() solo se llama si la tabla existe en el DOM
// renderTabla(); 
alert(`Obra social "${nombre}" agregada correctamente.`);
}

// Modificar obra social 

function modificarObra(id, nuevoNombre, nuevoPorcentaje) {
const obra = obras.find(o => o.id === id);
if (obra) {
obra.nombre = nuevoNombre.trim();
    
  obra.porcentaje = parseFloat(nuevoPorcentaje) || 0; 
  guardar();
  }
}

// Eliminar obra social

function eliminarObra(id) {
obras = obras.filter(o => o.id !== id);
guardar();
// Asegúrate de que renderTabla() solo se llama si la tabla existe en el DOM
// renderTabla(); 
}

// NOTA: Se comenta renderTabla y funciones relacionadas con el DOM del ABM
// ya que esta lógica no se debe ejecutar en la página de Reservas.
// Si tu archivo obraSocAbm.js está siendo usado tanto para ABM como para inicialización,
// debes asegurarte que las funciones DOM (como renderTabla, editarObra, etc.)
// están disponibles globalmente (window.) si el ABM las necesita.

/*
function renderTabla() {
    const tabla = document.getElementById("tablaObras");
    if (!tabla) return; // Evita error si no está en el DOM
    // ...
}
*/

// EL RESTO DEL CÓDIGO DEL ABM DEBE ESTAR AJUSTADO PARA EVITAR ERRORES
// si se carga en una página sin los elementos del formulario (formObraSocial, tablaObras).

// Si el script se carga en la página de Reservas, el código de abajo fallará
// porque no existen los elementos DOM del ABM. Para evitarlo, usa comprobaciones:

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formObraSocial");
    if (!form) return; // Salir si no es la página de ABM

    // Solo si estamos en la página del ABM:
    form.addEventListener("submit", e => {
        e.preventDefault();
        const id = document.getElementById("obraId").value;
        const nombre = document.getElementById("nombre").value;
        const descuento = document.getElementById("descuento").value;

        if (id) {
            modificarObra(id, nombre, descuento); 
        } else {
            agregarObra(nombre, descuento);
        }

        e.target.reset();
        document.getElementById("obraId").value = "";
        // renderTabla(); // Descomentar si la función existe y se usa en el ABM
    });

    const nombreInput = document.getElementById("nombre");
    if (nombreInput) {
        nombreInput.addEventListener("change", () => {
            const nombre = nombreInput.value;
            document.getElementById("descuento").value = descuentosFijos[nombre] || 0;
        });
    }

    // renderTabla(); // Descomentar si la función existe y se usa en el ABM
});

// Hacemos que estas funciones sean globales para que el HTML pueda llamarlas directamente
window.eliminarObra = eliminarObra;
window.modificarObra = modificarObra;
window.agregarObra = agregarObra;
// etc. (solo si las necesitas globalmente)
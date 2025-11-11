// ================== DATOS INICIALES DE MÉDICOS ==================

const MEDICOS_INICIALES = [
  {
    id: 1,
    nombre: "Juan Carlos",
    apellido: "Pérez",
    especialidadId: 1,
    matricula: "MP-12345",
    telefono: "341-4567890",
    email: "jperez@clinica.com",
    valorConsulta: 500,
    foto: "assets/medico1.png",
    obrasSociales: ["OS001", "OS002"]
  },
  {
    id: 2,
    nombre: "María Laura",
    apellido: "González",
    especialidadId: 2,
    matricula: "MP-23456",
    telefono: "341-4567891",
    email: "mgonzalez@clinica.com",
    valorConsulta: 450,
    foto: "assets/medico3.png",
    obrasSociales: ["OS001"]
  },
  {
    id: 3,
    nombre: "Roberto",
    apellido: "Martínez", 
    especialidadId: 3,
    matricula: "MP-34567",
    telefono: "341-4567892",
    email: "rmartinez@clinica.com",
    valorConsulta: 550,
    foto: "assets/medico2.png",
    obrasSociales: ["OS001", "OS002", "OS003"]
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Rodríguez",
    especialidadId: 4,
    matricula: "MP-45678",
    telefono: "341-4567893",
    email: "arodriguez@clinica.com",
    valorConsulta: 600,
    foto: "assets/medico5.png",
    obrasSociales: ["OS001", "OS002"]
  },
  {
    id: 5,
    nombre: "Carlos",
    apellido: "López",
    especialidadId: 5,
    matricula: "MP-56789",
    telefono: "341-4567894",
    email: "clopez@clinica.com",
    valorConsulta: 480,
    foto: "assets/medico4.png",
    obrasSociales: ["OS001", "OS002", "OS003"]
  }
];


// ================== INICIALIZACIÓN ==================

// Inicializar LocalStorage si no existe
function inicializarMedicos() {
  if (!localStorage.getItem("medicos")) {
    localStorage.setItem("medicos", JSON.stringify(MEDICOS_INICIALES));
    console.log("✓ Médicos inicializados en LocalStorage con valores de consulta");
  }
}

// Ejecutar al cargar el script
inicializarMedicos();
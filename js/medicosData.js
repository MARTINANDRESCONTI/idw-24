// Constante exportada con datos iniciales de médicos
const MEDICOS_INICIALES = [
  {
    id: 1,
    nombre: "Juan Carlos",
    apellido: "Pérez",
    especialidad: "Cardiología",
    matricula: "MP-12345",
    telefono: "341-4567890",
    email: "jperez@clinica.com",
    horario: "Lunes a Viernes 9:00-17:00",
    foto: "/assets/medico1.png"
  },
  {
    id: 2,
    nombre: "María Laura",
    apellido: "González",
    especialidad: "Pediatría",
    matricula: "MP-23456",
    telefono: "341-4567891",
    email: "mgonzalez@clinica.com",
    horario: "Lunes a Viernes 8:00-14:00",
    foto: "/assets/medico2.png"
  },
  {
    id: 3,
    nombre: "Roberto",
    apellido: "Martínez",
    especialidad: "Traumatología",
    matricula: "MP-34567",
    telefono: "341-4567892",
    email: "rmartinez@clinica.com",
    horario: "Martes y Jueves 14:00-20:00",
    foto: "/assets/medico3.png"
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Rodríguez",
    especialidad: "Ginecología",
    matricula: "MP-45678",
    telefono: "341-4567893",
    email: "arodriguez@clinica.com",
    horario: "Lunes, Miércoles y Viernes 10:00-16:00",
    foto: "/assets/medico4.png"
  },
  {
    id: 5,
    nombre: "Carlos",
    apellido: "López",
    especialidad: "Clínica Médica",
    matricula: "MP-56789",
    telefono: "341-4567894",
    email: "clopez@clinica.com",
    horario: "Lunes a Viernes 8:00-12:00",
    foto: "/assets/medico5.png"
  },
  {
    id: 6,
    nombre: "Sofía",
    apellido: "Sánchez",
    especialidad: "Gastroenterología",
    matricula: "MP-67890",
    telefono: "341-4567895",
    email: "ssanchez@clinica.com",
    horario: "Martes y Jueves 9:00-13:00",
    foto: "assets/medico6.png"
  }
];


// Inicializar LocalStorage si no existe
function inicializarMedicos() {
  if (!localStorage.getItem("medicos")) {
    localStorage.setItem("medicos", JSON.stringify(MEDICOS_INICIALES));
    console.log("Médicos inicializados en LocalStorage con imágenes");
  }
}

// Ejecutar al cargar el script
inicializarMedicos();


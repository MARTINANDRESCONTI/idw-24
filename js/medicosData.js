// Constante exportada con datos iniciales de médicos
const MEDICOS_INICIALES = [
  {
    id: 1,
    nombre: "Juan Carlos",
    apellido: "Pérez",
    especialidadId: 1,
    matricula: "MP-12345",
    telefono: "341-4567890",
    email: "jperez@clinica.com",
<<<<<<< HEAD
    foto: "assets/medico1.png"
=======
    horario: "Lunes a Viernes 9:00-17:00",
    foto: "/assets/medico1.png"
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
  },
  {
    id: 2,
    nombre: "María Laura",
    apellido: "González",
    especialidadId: 2,
    matricula: "MP-23456",
    telefono: "341-4567891",
    email: "mgonzalez@clinica.com",
<<<<<<< HEAD
    foto: "assets/medico3.png"
=======
    horario: "Lunes a Viernes 8:00-14:00",
    foto: "/assets/medico2.png"
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
  },
  {
    id: 3,
    nombre: "Roberto",
    apellido: "Martínez", 
    especialidadId: 3,
    matricula: "MP-34567",
    telefono: "341-4567892",
    email: "rmartinez@clinica.com",
<<<<<<< HEAD
    foto: "assets/medico2.png"
=======
    horario: "Martes y Jueves 14:00-20:00",
    foto: "/assets/medico3.png"
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Rodríguez",
    especialidadId: 4,
    matricula: "MP-45678",
    telefono: "341-4567893",
    email: "arodriguez@clinica.com",
<<<<<<< HEAD
    foto: "assets/medico5.png"
=======
    horario: "Lunes, Miércoles y Viernes 10:00-16:00",
    foto: "/assets/medico4.png"
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
  },
  {
    id: 5,
    nombre: "Carlos",
    apellido: "López",
    especialidadId: 5,
    matricula: "MP-56789",
    telefono: "341-4567894",
    email: "clopez@clinica.com",
<<<<<<< HEAD
    foto: "assets/medico4.png"
=======
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
>>>>>>> d2d69052b312fc8bc4c4da163ce50e57e96fe91a
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


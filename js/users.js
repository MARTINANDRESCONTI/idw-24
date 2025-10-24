document.addEventListener('DOMContentLoaded', async () => {
  const tablaUsuariosBody = document.querySelector('#tablaUsuarios tbody')

  try {
    const res = await fetch('https://dummyjson.com/users');
    if (!res.ok) {
      console.log('No users');
      return false;
    }
    const data = await res.json();
    const usuarios = data.users;

    usuarios.forEach(element => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${element.firstName}</td>
        <td>${element.username}</td>
        <td>${element.email}</td>
        <td>${element.phone}</td>
        <td>${element.role}</td>
      `
      tablaUsuariosBody.appendChild(fila);
    });

  } catch (error) {
    console.log('Server error');
    return false;
  }
})

// adminAccess.js - Verificar permisos en página admin
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const accessDenied = document.getElementById('accessDenied');
    const adminCardsContainer = document.getElementById('adminCardsContainer');
    
    if (!currentUser || currentUser.role !== 'admin') {
        // Mostrar mensaje de acceso denegado
        if (accessDenied) accessDenied.classList.remove('d-none');
        if (adminCardsContainer) adminCardsContainer.classList.add('d-none');
        
        // Opcional: redirigir después de unos segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } else {
        // Usuario es admin, mostrar contenido
        if (accessDenied) accessDenied.classList.add('d-none');
        if (adminCardsContainer) adminCardsContainer.classList.remove('d-none');
    }
});

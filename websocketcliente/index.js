document.addEventListener('DOMContentLoaded', () => {
    const btnEntrar = document.getElementById('btnEntrar');

    btnEntrar.addEventListener('click', () => {
        let usuario = document.getElementById('txtUsuario').value.trim();
        if (usuario) {
            localStorage.setItem('usuario', usuario);
            window.location.href = 'chat.html';
        } else {
            alert('Por favor, ingresa tu nombre.');
        }
    });
});

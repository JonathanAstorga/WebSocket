let stompClient = null;
let usuario = localStorage.getItem("usuario"); // Recupera el usuario

if (!usuario) {
    window.location.href = "login.html"; // Redirigir al login si no hay usuario
}

const conectarWS = () => {
    if (stompClient !== null) {
        stompClient.deactivate();
    }

    stompClient = new StompJs.Client({
        webSocketFactory: () => new WebSocket("ws://localhost:8080/websocket"),
    });

    stompClient.onConnect = () => {
        console.log("Conectado al WebSocket");

        // Suscripción al canal de usuarios conectados
        stompClient.subscribe("/tema/usuarios", (mensaje) => {
            const usuarios = JSON.parse(mensaje.body);
            actualizarListaUsuarios(usuarios);
        });

        // Suscripción al canal de mensajes globales
        stompClient.subscribe("/tema/mensajes", (mensaje) => {
            mostrarMensaje(JSON.parse(mensaje.body));
        });

        // Suscripción a mensajes privados
        stompClient.subscribe(`/tema/mensajes/${usuario}`, (mensaje) => {
            mostrarMensaje(JSON.parse(mensaje.body), true);
        });

        // Publicar la conexión del usuario
        stompClient.publish({
            destination: "/app/usuario/conectar",
            body: usuario,
        });
    };

    stompClient.onError = (error) => {
        console.error("Error en la conexión WebSocket:", error);
        alert("Hubo un problema al conectar con el servidor WebSocket.");
    };

    stompClient.activate();
};

const enviarMensaje = () => {
    const txtMensaje = document.getElementById("txtMensaje").value;
    stompClient.publish({
        destination: "/app/envio",  // Ruta para mensajes globales
        body: JSON.stringify({ nombre: usuario, contenido: txtMensaje }),
    });
};

// Enviar mensaje privado
const enviarMensajePrivado = (destinatario) => {
    const txtMensaje = document.getElementById("txtMensaje").value;
    stompClient.publish({
        destination: `/app/envio/${destinatario}`, // Ruta para mensaje privado
        body: JSON.stringify({ nombre: usuario, contenido: txtMensaje }),
    });
};

// Mostrar mensajes en la interfaz
const mostrarMensaje = (mensaje, esPrivado = false) => {
    const ulMensajes = document.getElementById("ULMensajes");
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = `<strong>${mensaje.nombre}</strong>: ${mensaje.contenido} ${esPrivado ? "(Privado)" : ""}`;
    ulMensajes.appendChild(li);
};

// Actualizar la lista de usuarios conectados
const actualizarListaUsuarios = (usuarios) => {
    const listaUsuarios = document.getElementById("listaUsuarios");
    listaUsuarios.innerHTML = ""; // Limpiar la lista antes de actualizarla
    usuarios.forEach((user) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `${user} <button onclick="enviarMensajePrivado('${user}')">Mensaje Privado</button>`;
        listaUsuarios.appendChild(li);
    });
};

// Función para desconectar el usuario y redirigir al login
const cerrarSesion = () => {
    localStorage.removeItem("usuario"); // Eliminar usuario
    stompClient.publish({
        destination: "/app/usuario/desconectar", // Desconectar al usuario
        body: usuario,
    });
    window.location.href = "login.html"; // Redirigir al login
};

// Llamada cuando la página esté completamente cargada
document.addEventListener("DOMContentLoaded", conectarWS);



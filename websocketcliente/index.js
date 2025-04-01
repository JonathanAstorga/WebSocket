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

        stompClient.subscribe("/tema/usuarios", (mensaje) => {
            const usuarios = JSON.parse(mensaje.body);
            actualizarListaUsuarios(usuarios);
        });

        stompClient.subscribe("/tema/mensajes", (mensaje) => {
            mostrarMensaje(JSON.parse(mensaje.body));
        });

        stompClient.subscribe(`/tema/mensajes/${usuario}`, (mensaje) => {
            mostrarMensaje(JSON.parse(mensaje.body), true);
        });

        stompClient.subscribe("/tema/productos", (mensaje) => {
            agregarProductoATabla(JSON.parse(mensaje.body));
        });

        stompClient.publish({
            destination: "/app/usuario/conectar",
            body: usuario,
        });
    };

    stompClient.activate();
};

const enviarMensaje = () => {
    const txtMensaje = document.getElementById("txtMensaje").value;
    stompClient.publish({
        destination: "/app/envio",
        body: JSON.stringify({ nombre: usuario, contenido: txtMensaje }),
    });
};

const enviarMensajePrivado = (destinatario) => {
    const txtMensaje = document.getElementById("txtMensaje").value;
    stompClient.publish({
        destination: `/app/envio/${destinatario}`,
        body: JSON.stringify({ nombre: usuario, contenido: txtMensaje }),
    });
};

// Función para mostrar mensaje
const mostrarMensaje = (mensaje, esPrivado = false) => {
    const ulMensajes = document.getElementById("ULMensajes");
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.innerHTML = `<strong>${mensaje.nombre}</strong>: ${mensaje.contenido} ${
        esPrivado ? "(Privado)" : ""
    }`;
    ulMensajes.appendChild(li);
};

// Actualizar lista de usuarios conectados
const actualizarListaUsuarios = (usuarios) => {
    const listaUsuarios = document.getElementById("listaUsuarios");
    listaUsuarios.innerHTML = "";
    usuarios.forEach((user) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.innerHTML = `${user} <button onclick="enviarMensajePrivado('${user}')">Mensaje Privado</button>`;
        listaUsuarios.appendChild(li);
    });
};

document.addEventListener("DOMContentLoaded", conectarWS);



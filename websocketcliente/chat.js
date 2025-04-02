let stompCliente = null;
let usuarioActual = localStorage.getItem('usuario');

const actualizarUsuariosConectados = (usuarios) => {
    const listaUsuarios = document.getElementById('listaUsuarios');
    const selectDestinatario = document.getElementById('selectDestinatario');

    listaUsuarios.innerHTML = '';
    for (let i = selectDestinatario.options.length - 1; i >= 0; i--) {
        if (selectDestinatario.options[i].value !== 'todos') {
            selectDestinatario.remove(i);
        }
    }

    if (Array.isArray(usuarios)) {
        usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.textContent = usuario;
            listaUsuarios.appendChild(li);

            if (usuario !== usuarioActual) {
                const option = document.createElement('option');
                option.value = usuario;
                option.textContent = usuario;
                selectDestinatario.appendChild(option);
            }
        });
    } else {
        console.error("[CLIENTE] Error: El formato de la lista de usuarios no es un array:", usuarios);
    }
};

const conectarWS = () => {
    if (stompCliente !== null) {
        stompCliente.deactivate();
        stompCliente = null;
    }

    stompCliente = new StompJs.Client({
        webSocketFactory: () => new WebSocket('ws://localhost:8080/websocket')
    });

        stompCliente.onConnect = () => {
        console.log("[CLIENTE] ✅ Conectado al WebSocket.");
        document.getElementById('lblUsuario').textContent = usuarioActual;

        stompCliente.subscribe('/tema/mensajes', (mensaje) => {
            console.log("[CLIENTE] Mensaje público recibido:", mensaje);
            mostrarMensaje(JSON.parse(mensaje.body));
        });

        stompCliente.subscribe('/tema/usuarios', (mensaje) => {
            console.log("[CLIENTE] Mensaje recibido en /tema/usuarios:", mensaje);
            try {
                const usuarios = JSON.parse(mensaje.body);
                actualizarUsuariosConectados(usuarios);
            } catch (error) {
                console.error("[CLIENTE] Error al parsear la lista de usuarios:", error, mensaje.body);
            }
        });

        // Suscribirse a la cola privada del usuario actual
        const privateQueue = '/usuario/' + usuarioActual + '/cola/privada';
        console.log("[CLIENTE] Suscribiéndose a la cola privada:", privateQueue);
        stompCliente.subscribe(privateQueue, (mensaje) => {
    		console.log("[CLIENTE] Mensaje privado recibido:", mensaje);
		mostrarMensajePrivado(JSON.parse(mensaje.body));
	}, (error) => {
 	   console.error("[CLIENTE] Error al suscribirse a la cola privada:", error);
	});

        if (usuarioActual) {
            stompCliente.publish({
                destination: '/app/usuario/conectar',
                body: usuarioActual
            });
        }
    };

    const mostrarMensajePrivado = (mensaje) => {
    console.log("[CLIENTE] Mostrar mensaje privado:", mensaje);
    const ULMensajes = document.getElementById('ULMensajes');
    const mensajeLI = document.createElement('li');
    mensajeLI.classList.add('list-group-item', 'text-info');
    mensajeLI.innerHTML = `<strong>(Privado de ${mensaje.remitente})</strong>: ${mensaje.contenido}`;
    ULMensajes.appendChild(mensajeLI);
};

    stompCliente.onDisconnect = () => {
        console.log("[CLIENTE] ❌ Desconectado del WebSocket.");
    };

    stompCliente.onStompError = (frame) => {
        console.error("[CLIENTE] Error STOMP:", frame);
    };

    stompCliente.onWebSocketClose = () => {
        console.log("[CLIENTE] WebSocket cerrado.");
    };

    stompCliente.activate();
};

const enviarMensaje = () => {
    const txtMensaje = document.getElementById('txtMensaje');
    const selectDestinatario = document.getElementById('selectDestinatario');
    const destinatario = selectDestinatario.value;

    if (txtMensaje.value.trim()) {
        if (destinatario === 'todos') {
            console.log("[CLIENTE] Enviar mensaje público a /app/envio:", txtMensaje.value);
            stompCliente.publish({
                destination: '/app/envio',
                body: JSON.stringify({
                    nombre: usuarioActual,
                    contenido: txtMensaje.value
                })
            });
        } else {
            const payloadPrivado = JSON.stringify({
                remitente: usuarioActual,
                contenido: txtMensaje.value,
                destinatario: destinatario
            });
            console.log("[CLIENTE] Enviar mensaje privado a /app/mensajePrivado:", payloadPrivado);
            stompCliente.publish({
                destination: '/app/mensajePrivado',
                body: payloadPrivado
            });
        }
        txtMensaje.value = '';
    }
};

const mostrarMensaje = (mensaje) => {
    console.log("[CLIENTE] Mostrar mensaje público:", mensaje);
    const ULMensajes = document.getElementById('ULMensajes');
    const mensajeLI = document.createElement('li');
    mensajeLI.classList.add('list-group-item');
    mensajeLI.innerHTML = `<strong>${mensaje.nombre}</strong>: ${mensaje.contenido}`;
    ULMensajes.appendChild(mensajeLI);
};

document.addEventListener('DOMContentLoaded', () => {
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('lblUsuario').textContent = usuarioActual;

    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.addEventListener('click', enviarMensaje);

    const btnSalir = document.getElementById('btnSalir');
    btnSalir.addEventListener('click', () => {
        if (usuarioActual && stompCliente && stompCliente.connected) {
            stompCliente.publish({
                destination: '/app/usuario/desconectar',
                body: usuarioActual
            });
        }
        localStorage.removeItem('usuario');
        stompCliente.deactivate();
        window.location.href = 'index.html';
    });

    conectarWS();
});

package com.demo.WebsocketServer.controller;

import com.demo.websocketserver.model.MensajePrivado;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MensajePrivadoController {

    private final SimpMessagingTemplate messagingTemplate;

    public MensajePrivadoController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/mensajePrivado")
    public void enviarMensajePrivado(@Payload MensajePrivado mensajePrivado) {
        String destinatario = mensajePrivado.destinatario();
        String remitente = mensajePrivado.remitente();
        String contenido = mensajePrivado.contenido();

        System.out.println("[SERVIDOR] Recibido mensaje privado de " + remitente + " a " + destinatario + ": " + contenido);

        if (destinatario != null && !destinatario.equals("todos")) {
            // Enviar el mensaje directamente al destinatario
            String destinoDestinatario = "/usuario/" + destinatario + "/cola/privada";
            System.out.println("[SERVIDOR] Enviando mensaje privado a " + destinoDestinatario + ": " + contenido);
            messagingTemplate.convertAndSend(destinoDestinatario,
                                             new MensajePrivado(remitente, contenido, destinatario));

            // Opcional: Enviar una copia al remitente (para confirmación visual)
            String destinoRemitente = "/usuario/" + remitente + "/cola/privada";
            System.out.println("[SERVIDOR] Enviando copia del mensaje privado al remitente " + destinoRemitente + ": " + contenido);
            messagingTemplate.convertAndSend(destinoRemitente,
                                             new MensajePrivado(remitente, "(Privado a " + destinatario + ") " + contenido, destinatario));
        } else {
            // Si el destinatario es "todos", enviar el mensaje a todos
            System.out.println("[SERVIDOR] Enviando mensaje público a /tema/mensajes: " + contenido);
            messagingTemplate.convertAndSend("/tema/mensajes",
                                             new com.demo.websocketserver.model.Mensaje(remitente, contenido));
        }
    }
}
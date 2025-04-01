package com.demo.websocketserver.controller;

import com.demo.websocketserver.model.Mensaje;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MensajeController {
    private final SimpMessagingTemplate messagingTemplate;

    public MensajeController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/envio")
    @SendTo("/tema/mensajes")
    public Mensaje envio(@Payload Mensaje mensaje){
        return new Mensaje(mensaje.nombre(), mensaje.contenido());
    }

    @MessageMapping("/envio/{destinatario}")
    public void envioPrivado(@Payload Mensaje mensaje, @DestinationVariable String destinatario) {
        messagingTemplate.convertAndSend("/tema/mensajes/" + destinatario, mensaje);
    }
}

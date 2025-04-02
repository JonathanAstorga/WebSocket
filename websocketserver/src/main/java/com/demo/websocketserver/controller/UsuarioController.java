package com.demo.websocketserver.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class UsuarioController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> usuariosConectados = ConcurrentHashMap.newKeySet();

    public UsuarioController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/usuario/conectar")
    public void conectar(String usuario) {
        if (usuario != null && !usuario.trim().isEmpty() && !usuariosConectados.contains(usuario)) {
            usuariosConectados.add(usuario);
            enviarListaUsuarios();
        }
    }

    @MessageMapping("/usuario/desconectar")
    public void desconectar(String usuario) {
        if (usuario != null && usuariosConectados.contains(usuario)) {
            usuariosConectados.remove(usuario);
            enviarListaUsuarios();
        }
    }

    private void enviarListaUsuarios() {
        System.out.println("Enviando lista de usuarios: " + usuariosConectados);
        messagingTemplate.convertAndSend("/tema/usuarios", usuariosConectados);
    }
}
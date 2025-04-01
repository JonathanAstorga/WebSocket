package com.demo.websocketserver.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.HashSet;
import java.util.Set;

@Controller
public class UsuarioController {
    private static final Set<String> usuariosConectados = new HashSet<>();

    @MessageMapping("/usuario/conectar")
    @SendTo("/tema/usuarios")
    public Set<String> conectarUsuario(String usuario) {
        usuariosConectados.add(usuario);
        return usuariosConectados;
    }

    @MessageMapping("/usuario/desconectar")
    @SendTo("/tema/usuarios")
    public Set<String> desconectarUsuario(String usuario) {
        usuariosConectados.remove(usuario);
        return usuariosConectados;
    }

    public Set<String> obtenerUsuarios() {
        return usuariosConectados;
    }
}

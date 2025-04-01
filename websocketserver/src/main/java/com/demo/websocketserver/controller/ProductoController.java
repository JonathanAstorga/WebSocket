package com.demo.websocketserver.controller;

import com.demo.websocketserver.model.Producto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ProductoController {
    @MessageMapping("/producto")
    @SendTo("/tema/productos")
    public Producto recibirProducto(@Payload Producto producto) {
        return producto;
    }
}

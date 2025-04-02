package com.demo.websocketserver.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Este método se implementa de la interfaz WebSocketMessageBrokerConfigurer.
     * Se utiliza para configurar el message broker que gestionará los mensajes WebSocket.
     *
     * @param registry Objeto MessageBrokerRegistry que permite configurar las opciones del broker.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Habilita un broker de mensajes simple en memoria para los destinos que comienzan con "/tema".
        // Los clientes se pueden suscribir a estos destinos para recibir mensajes.
        registry.enableSimpleBroker("/tema");

        // Establece los prefijos para los destinos de los mensajes que están destinados a los métodos
        // manejadores de mensajes en la aplicación (controladores con @MessageMapping).
        // Cuando un cliente envía un mensaje a un destino que comienza con "/app", Spring lo enrutará
        // a los métodos anotados con @MessageMapping que coincidan con la parte restante del destino.
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Este método se implementa de la interfaz WebSocketMessageBrokerConfigurer.
     * Se utiliza para registrar los "endpoints" STOMP sobre WebSocket.
     * Estos endpoints son las URLs a las que los clientes WebSocket se conectarán para establecer la comunicación.
     *
     * @param registry Objeto StompEndpointRegistry que permite registrar los endpoints.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra un endpoint WebSocket en la ruta "/websocket".
        // Los clientes WebSocket se conectarán a esta URL para iniciar la comunicación STOMP.
        registry.addEndpoint("websocket")
                // Configura los orígenes permitidos para las conexiones a este endpoint.
                // "*" significa que se permiten conexiones desde cualquier origen (esto puede ser inseguro en producción).
                .setAllowedOrigins("*");

        // También se podría habilitar SockJS como una opción de fallback para navegadores que no soportan WebSocket nativamente.
        // registry.addEndpoint("/websocket").withSockJS();
    }
}
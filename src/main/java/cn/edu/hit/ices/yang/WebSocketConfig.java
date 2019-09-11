package cn.edu.hit.ices.yang;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 新建WebSocketConfig类，使用它来加载咱们的拦截器和处理器，使能建立websocket连接
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){
        String websocket_url = "/websocket/socketServer.do";
        registry.addHandler(new MyWebSocketHandler(), websocket_url).addInterceptors(new MyHandshakeInterceptor());

        // 这里sockjs方式主要是为了支持有些不支持ws连接方式的浏览器
        String sockjs_url = "/sockjs/socketServer.do";
        registry.addHandler(new MyWebSocketHandler(), sockjs_url).addInterceptors(new MyHandshakeInterceptor()).withSockJS();
    }
}

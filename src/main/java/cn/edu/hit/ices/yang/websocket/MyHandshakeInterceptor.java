package cn.edu.hit.ices.yang.websocket;

import cn.edu.hit.ices.yang.model.Test;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 创建Websocket拦截器
 * 用他来处理建立Tcp握手之前和之后要干的事情
 */
public class MyHandshakeInterceptor implements HandshakeInterceptor {
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> map) throws Exception{
        System.out.println("beforeHandshake");
        if(request instanceof ServletServerHttpRequest){
            HttpServletRequest servletRequest = ((ServletServerHttpRequest)request).getServletRequest();
            Test user = (Test)servletRequest.getSession().getAttribute("user");
            String userName = user.getName();
            int userId = user.getId();

            // 存入数据，方便在handler中获取，这里只是在方便在webSocket中存储了数据，并不是在正常的httpSession中存储
            // 想要在平时使用的session中获得这里的数据，需要使用session
            // 来存储一下
            map.put("WEBSOCKET_USERNAME", userName);
            map.put("WEBSOCKET_USERID", String.valueOf(userId));
            servletRequest.getSession().setAttribute("WEBSOCKET_USERNAME", userName);
            servletRequest.getSession().setAttribute("WEBSOCKET_USERID", String.valueOf(userId));
        }
        return true;
    }

    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception ex){
        System.out.println("afterHandshake");
    }
}

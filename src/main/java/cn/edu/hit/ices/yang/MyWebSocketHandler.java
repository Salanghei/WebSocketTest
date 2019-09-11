package cn.edu.hit.ices.yang;

import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * 建立处理器来处理连接之后的事情，用来处理消息的接收和发送
 */
public class MyWebSocketHandler implements WebSocketHandler {

    private static final List<WebSocketSession> users = new ArrayList<>();

    // 初次连接成功
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("================== 连接成功 ==================");
        users.add(session);
        String userName = (String)session.getAttributes().get("WEBSOCKET_USERNAME");
        if(userName != null){
            // 查询未读消息
            int count = 5;
            session.sendMessage(new TextMessage(String.valueOf(count)));
        }
    }

    // 接受处理消息
    @Override
    public void handleMessage(WebSocketSession webSocketSession, WebSocketMessage<?> webSocketMessage)
            throws Exception{
        sendMessageToUsers(new TextMessage(webSocketMessage.getPayload() + ""));
    }

    @Override
    public void handleTransportError(WebSocketSession webSocketSession, Throwable throwable) throws Exception {
        if(webSocketSession.isOpen()){
            webSocketSession.close();
        }
        System.out.println("============= 连接出错，关闭连接 =============");
        users.remove(webSocketSession);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession webSocketSession, CloseStatus status) throws Exception {
        System.out.println("================== 连接关闭 ==================");
        System.out.println(status.toString());
        users.remove(webSocketSession);
    }

    @Override
    public boolean supportsPartialMessages(){
        return false;
    }

    /**
     * 给所有在线用户发消息
     */
    public void sendMessageToUsers(TextMessage message){
        for(WebSocketSession user : users){
            try {
                if(user.isOpen()){
                    user.sendMessage(message);
                }
            }catch (IOException e){
                e.printStackTrace();
            }
        }
    }

    /**
     * 给某个用户发送消息
     */
    public void sendMessageToUser(String userName, TextMessage message){
        for(WebSocketSession user : users){
            if(user.getAttributes().get("WEBSOCKET_USERNAME").equals(userName)){
                try {
                    if(user.isOpen()){
                        user.sendMessage(message);
                    }
                }catch (IOException e){
                    e.printStackTrace();
                }
            }
        }
    }
}

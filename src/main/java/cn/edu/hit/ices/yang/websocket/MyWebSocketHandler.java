package cn.edu.hit.ices.yang.websocket;

import com.alibaba.fastjson.JSON;
import net.sf.json.JSONObject;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 建立处理器来处理连接之后的事情，用来处理消息的接收和发送
 */
public class MyWebSocketHandler extends AbstractWebSocketHandler {

    private static final List<WebSocketSession> users = new ArrayList<>();

    private FileOutputStream output;

    // 初次连接成功
    @Override
    public void afterConnectionEstablished(WebSocketSession session){
        System.out.println("================== 连接成功 ==================");
        users.add(session);
//        String userName = (String)session.getAttributes().get("WEBSOCKET_USERNAME");
//        if(userName != null){
//            // 查询未读消息
//            int count = 5;
//            session.sendMessage(new TextMessage(String.valueOf(count)));
//        }
    }

    // 接受处理文本消息
    @Override
    public void handleTextMessage(WebSocketSession webSocketSession, TextMessage webSocketMessage){
        // 解析json字符串
        String messageStr = webSocketMessage.getPayload();
        System.out.println(messageStr);
        if(messageStr.charAt(0) == '{' && messageStr.charAt(messageStr.length() - 1) == '}') {
            JSONObject jsonObject = JSONObject.fromObject(messageStr);
            String toUser = (String) jsonObject.get("to");
            String flag = (String) jsonObject.get("flag");
            String message = (String) jsonObject.get("message");
            String isImg = (String) jsonObject.get("isImg");
            System.out.println("user = " + toUser + "; message = " + message);

            // 获取当前用户名
            String username = (String) webSocketSession.getAttributes().get("WEBSOCKET_USERNAME");
            // 获取当前用户id
            String userid = (String) webSocketSession.getAttributes().get("WEBSOCKET_USERID");
            // 获取当前时间
            Date date = new Date();
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");

            Map<String, String> map = new HashMap<>();
            map.put("username", username);                         // 发消息的用户名
            map.put("userID", userid);                             // 发消息的用户id
            map.put("time", dateFormat.format(date));              // 发消息的时间
            map.put("toUsername", toUser);                         // 收消息的用户名

            if(isImg.equals("false")) {  // 发送文字消息的处理方式
                map.put("message", message);                           // 消息内容
                map.put("isImage", "False");
                String jsonStr = JSON.toJSONString(map);
                System.out.println("Send message to " + toUser);
                if (flag.equals("group")) {  // 群发
                    sendMessageToUsers(new TextMessage(jsonStr));
                } else if (flag.equals("user")) {  // 单发
                    sendMessageToUser(username, toUser, new TextMessage(jsonStr));
                }
            }else{  // 发送图片的处理方式
                System.out.println("Send picture to " + toUser);
                handlePicture(username, toUser, flag, message, map);
            }
        }
    }

    // 处理二进制消息
    @Override
    public void handleBinaryMessage(WebSocketSession session, BinaryMessage message){
        ByteBuffer buffer= message.getPayload();
        try {
            output.write(buffer.array());
        } catch (IOException e) {
            e.printStackTrace();
        }
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
    public void afterConnectionClosed(WebSocketSession webSocketSession, CloseStatus status){
        System.out.println("================== 连接关闭 ==================");
        System.out.println(status.toString());
        users.remove(webSocketSession);
    }

    @Override
    public boolean supportsPartialMessages(){
        return true;
    }

    /**
     * 处理图片消息
     */
    private void handlePicture(String fromUser, String toUser, String flag, String message, Map<String, String> map){
        try{
            if(message.endsWith(":pictureStart")){
                File newPicture = new File("D:\\images\\" + message.split(":")[0]);
                if(!newPicture.exists()){
                    newPicture.createNewFile();
                }
                output = new FileOutputStream(newPicture);
            }else if(message.endsWith(":pictureEnd")){
                String fileName = message.split(":")[0];
                output.close();
                map.put("message", fileName);
                map.put("isImage", "True");
                String jsonStr = JSON.toJSONString(map);
                if(flag.equals("group")){  // 群发
                    sendPictureToUsers(fileName, jsonStr);
                }else if(flag.equals("user")){
                    sendPictureToUser(fromUser, toUser, fileName, jsonStr);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 给群组内用户发消息
     */
    private void sendMessageToUsers(TextMessage message){
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
    private void sendMessageToUser(String fromUser, String toUser, TextMessage message){
        for(WebSocketSession user : users){
            // 发消息用户和接收消息用户都显示消息内容
            if(user.getAttributes().get("WEBSOCKET_USERNAME").equals(toUser) ||
                    user.getAttributes().get("WEBSOCKET_USERNAME").equals(fromUser)){
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

    /**
     * 给所有在线用户发送图片
     */
    private void sendPictureToUsers(String fileName, String jsonStr){
        for(WebSocketSession user : users){
            if(user.isOpen()){
                sendPicture(user, fileName, jsonStr);
            }
        }
    }

    /**
     * 给某个用户发送图片
     */
    private void sendPictureToUser(String fromUser, String toUser, String fileName, String jsonStr){
        for(WebSocketSession user : users){
            // 发消息用户和接收消息用户都显示消息内容
            if(user.getAttributes().get("WEBSOCKET_USERNAME").equals(toUser) ||
                    user.getAttributes().get("WEBSOCKET_USERNAME").equals(fromUser)){
                if(user.isOpen()){
                    sendPicture(user, fileName, jsonStr);
                }
            }
        }
    }

    /**
     * 发送图片
     */
    private void sendPicture(WebSocketSession session,String fileName, String jsonStr){
        FileInputStream input;
        try {
            File file = new File("D:\\images\\" + fileName);
            input = new FileInputStream(file);
            byte bytes[] = new byte[(int) file.length()];
            input.read(bytes);
            BinaryMessage byteMessage = new BinaryMessage(bytes);
            session.sendMessage(new TextMessage(jsonStr));   // 先发送相关消息，包括时间、接收人等
            session.sendMessage(byteMessage);                // 再发送图片
            input.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

# WebSocketTest
springMVC+websocket 简单的即时通讯小Demo

### Demo修改日志
- 2019-9-16：目前已完成基本即时通讯功能，但存在问题：
   - 接收到来自不同用户的信息，都可以显示在当前的聊天窗口中
   - 接收到来自当前通讯用户之外的用户的信息时，需要有消息通知
   - 聊天记录没有保存
   - 仅支持文字通讯，需要添加图片、文件（语音？）
- 2019-9-18：
   - 将聊天记录临时存储在local storage中，解决在当前聊天窗口会接收到其他用户消息的问题
   - 完成群组的聊天记录的保存
   - 新问题：同一浏览器登录不同用户时，消息的左右显示发生混乱

### 准备
运行前，请先向数据库中导入.sql文件，同时修改/src/main/resources/jdbc.properties文件中数据库的用户名和密码

### 功能
- 用户与用户之间即时通讯
- 群组内的即时通讯
- 没有添加好友等功能（简单的增删查改操作，很容易实现）

### 效果

请使用两个不同的浏览器，分别登陆不同的用户进行通讯测试

#### 登录
![](https://raw.githubusercontent.com/Salanghei/WebSocketTest/master/images/login.jpg)

#### 用户间通讯
![](https://raw.githubusercontent.com/Salanghei/WebSocketTest/master/images/user1.jpg)

#### 群组内通讯
![](https://raw.githubusercontent.com/Salanghei/WebSocketTest/master/images/group.jpg)

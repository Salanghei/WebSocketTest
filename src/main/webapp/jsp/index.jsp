<%--
  Created by IntelliJ IDEA.
  User: ZhaoYang
  Date: 2019/9/11
  Time: 11:03
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Websocket Demo</title>
    <meta charset="UTF-8">
    <!-- 新 Bootstrap 核心 CSS 文件 -->
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <!-- 可选的Bootstrap主题文件（一般不用引入） -->
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">
</head>
<body>
    <h1>Websocket Demo</h1>
    <hr>
    <div class="page-header" id="tou"></div>
    <div class="well" id="msg"></div>
    <div class="col-lg">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="发送信息..."
                   id="message"> <span class="input-group-btn">
				<button class="btn btn-default" type="button" id="send">发送</button>
			</span>
        </div>
        <!-- /input-group -->
    </div>
    <!-- /.col-lg-6 -->
    </div>
    <!-- /.row -->
</body>
<script type="text/javascript" src="../js/jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="../js/sockjs-1.1.0.min.js"></script>
<!-- 最新的 Bootstrap 核心 JavaScript 文件 -->
<script src="//cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
<script type="text/javascript">
    $(function () {
        var websocket;
        if ('WebSocket' in window) {
            //var url = 'ws://' + window.location.host + '/websocket/socketServer.do';
            websocket = new WebSocket("ws://localhost:8080/websocket/socketServer.do");
        } else if ('MozWebSocket' in window) {
            websocket = new MozWebSocket("ws://websocket/socketServer.do");
        } else {
            websocket = new SockJS("http://localhost:8080/sockjs/socketServer.do");
        }
        websocket.onopen = function(evnt) {
            $("#tou").html("链接服务器成功!")
        };
        websocket.onmessage = function(evnt) {
            $("#msg").html($("#msg").html() + "<br/>" + evnt.data);
        };
        websocket.onerror = function(evnt) {
        };
        websocket.onclose = function(evnt) {
            $("#tou").html("与服务器断开了链接!")
        }
        $('#send').bind('click', function() {
            send();
        });
        function send() {
            if (websocket != null) {
                var message = document.getElementById('message').value;
                websocket.send(message);
            } else {
                alert('未与服务器链接.');
            }
        }
    });

</script>
</html>

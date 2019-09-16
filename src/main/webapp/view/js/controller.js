app.controller("loginCtrl", function($scope, $cookies, homeService){
    // 页面跳转
    $scope.goto = function(where){
        window.location.href = where;
    };

    $scope.username = "";
    $scope.password = "";
    $scope.remember = "";

    // 获取cookies内容
    $scope.getInfo = function() {
        $scope.username = $cookies.get("username");
        $scope.password = $cookies.get("password");
        $scope.remember = $cookies.get("remember") === "true";
        console.log("$scope.username", $scope.username);
        console.log("$scope.password", $scope.password);
        console.log("$scope.remember", $scope.remember);
    };

    $scope.getInfo();

    // 用户登录
    $scope.login = function(){
        var params = {
            "username" : $scope.username,
            "password" : $scope.password,
            "remember" : $scope.remember
        };
        console.log("params", params);
        //设置cookies
        if($scope.remember) {
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 7);
            $cookies.put("username",$scope.username,{'expires': expireDate});
            $cookies.put("password",$scope.password,{'expires': expireDate});
            $cookies.put("remember",$scope.remember,{'expires': expireDate});
        } else {
            $cookies.remove("username");
            $cookies.remove("password");
            $cookies.remove("remember");
        }
        homeService.login(params, function (data) {
            console.log("data",data);
            if(data === "success") {
                /*var param={};
                 $loginService.getUser(param,function(user) {
                 alert(user.name);
                 })*/
                window.location.href="../../view/test.html";
            } else if(data === "wrongPassword") {
                alert("密码错误，请重新登陆！")
                //window.location.href="http://localhost:8080/login/login.html";
            } else if(data === "userDoesNotExist") {
                alert("用户名不存在，请重新登陆！")
                //window.location.href="http://localhost:8080/login/login.html";
            } else {

            }
        });
    }
}).controller("testCtrl", function($scope, $cookies, homeService){
    // $scope.messageList = [];
    $scope.messageToSend = "";    // 要发送的信息
    $scope.userList = [];         // 所有用户列表
    $scope.myUser = {};           // 当前用户
    $scope.userChatTo = {};       // 正在对话的用户

    $scope.isUser = true;        // 是否是用户间会话
    $scope.isGroup = false;      // 是否是群组会话

    $scope.getUserChatWindow = function(user){
        $scope.isUser = true;
        $scope.isGroup = false;
        $scope.userChatTo = user;
        document.getElementById("chat-window").innerHTML = "";
    };

    $scope.getGroupChatWindow = function(){
        $scope.isUser = false;
        $scope.isGroup = true;
        $scope.userChatTo = {
            "id": "group",
            "name": "Group"
        };
        document.getElementById("chat-window").innerHTML = "";
    };

    var params = [];

    homeService.getAllUsers(params, function(userList, myUser){
        //console.log(userList);
        //console.log(myUser);
        $scope.userList = userList;
        $scope.myUser = myUser;
        $scope.userChatTo = userList[0];
    });

    var websocket;
    if ('WebSocket' in window) {
        //var url = 'ws://' + window.location.host + '/websocket/socketServer.do';
        websocket = new WebSocket("ws://localhost:8080/websocket/socketServer.do");
    } else if ('MozWebSocket' in window) {
        websocket = new MozWebSocket("ws://websocket/socketServer.do");
    } else {
        websocket = new SockJS("http://localhost:8080/sockjs/socketServer.do");
    }
    websocket.onopen = function(event) {
        alert("链接服务器成功!")
    };
    websocket.onmessage = function(event) {
        var message = jQuery.parseJSON(event.data);
        console.log(message);
        var html = "";
        if(message.username === $scope.myUser.name){
            // var messageCell = {
            //     "user": true,
            //     "other": false,
            //     "details": message.message
            // };
            // $scope.messageList.push(messageCell);
            html = "<div class=\"chat-me\">\n" +
                "    <div class=\"media-left\">\n" +
                "        <img src=\"../img/profile-photos/" + message.userID + ".png\" class=\"img-circle img-sm\" alt=\"Profile Picture\">\n" +
                "    </div>\n" +
                "    <div class=\"media-body\">\n" +
                "        <div>\n" +
                "            <p>" + message.message + "<small>" + message.time + "</small></p>\n" +
                "         </div>\n" +
                "    </div>\n" +
                "</div>";
        }else{
            // var messageCell = {
            //     "user": false,
            //     "other": true,
            //     "details": message.message
            // };
            // $scope.messageList.push(messageCell);
            html = "<div class=\"chat-user\">\n" +
                "    <div class=\"media-left\">\n" +
                "        <img src=\"../img/profile-photos/" + message.userID + ".png\" class=\"img-circle img-sm\" alt=\"Profile Picture\">\n" +
                "    </div>\n" +
                "    <div class=\"media-body\">\n" +
                "        <div>\n" +
                "            <p>" + message.message + "<small>" + message.time + "</small></p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</div>";
        }
        var chatWindow = document.getElementById("chat-window");
        chatWindow.innerHTML = chatWindow.innerHTML + html;
        // $("#chat-window").html($("#chat-window").html() + html);
        //设置滚动条始终在最下方
        // $("#scroll-window").scrollTop($("#scroll-window").scrollHeight);
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    };
    websocket.onerror = function(event) {
    };
    websocket.onclose = function(event) {
        alert("与服务器断开了链接!")
    };

    $scope.sendMessageToGroup = function(){
        if (websocket != null) {
            var data = "{\"to\":\"\",\"message\":\"" + $scope.messageToSend + "\"}";
            websocket.send(data);
            $scope.messageToSend = "";
        } else {
            alert('未与服务器链接.');
        }
    };

    $scope.sendMessageToUser = function(username){
        if (websocket != null) {
            var data = "{\"to\":\"" + username + "\",\"message\":\"" + $scope.messageToSend + "\"}";
            websocket.send(data);
            $scope.messageToSend = "";
        } else {
            alert('未与服务器链接.');
        }
    }
});
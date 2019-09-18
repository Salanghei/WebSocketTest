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

        // 登录
        homeService.login(params, function (data) {
            console.log("data",data);
            if(data === "success") {
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
    $scope.messageList = [];      // 当前消息列表
    $scope.messageToSend = "";    // 要发送的信息
    $scope.userList = [];         // 所有用户列表
    $scope.myUser = {};           // 当前用户
    $scope.userChatTo = {};       // 正在对话的用户

    $scope.isUser = true;        // 是否是用户间会话
    $scope.isGroup = false;      // 是否是群组会话

    // 在local storage中存储通讯消息
    $scope.setMessageRecord = function(data){
        if(typeof(Storage) !== "undefined") {
            var messageToRecord = [];
            if(localStorage.getItem("messageRecord") != null){
                messageToRecord = JSON.parse(localStorage.getItem("messageRecord"));
            }
            messageToRecord.push(data);
            localStorage.setItem("messageRecord", JSON.stringify(messageToRecord));
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    // 获取local storage中存储的通讯消息
    $scope.getMessageRecord = function(username){
        if(typeof(Storage) !== "undefined") {
            var messageFromRecord = [];
            if(localStorage.getItem("messageRecord") != null){
                messageFromRecord = JSON.parse(localStorage.getItem("messageRecord"));
                for(var i = 0; i < messageFromRecord.length; i++){
                    // 获取正在通讯的用户与当前登录用户间的消息
                    if((messageFromRecord[i]["username"] === username && messageFromRecord[i]["toUsername"] === $scope.myUser.name)
                        || (messageFromRecord[i]["username"] === $scope.myUser.name && messageFromRecord[i]["toUsername"] === username)){
                        $scope.messageList.push(messageFromRecord[i]);
                    }
                }
            }
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    // 获取用户间的通讯窗口
    $scope.getUserChatWindow = function(user){
        $scope.isUser = true;
        $scope.isGroup = false;
        $scope.userChatTo = user;
        $scope.messageList = [];
        $scope.getMessageRecord(user.name);              // 获取当前窗口的消息记录
    };

    // 获取群组的通讯窗口
    $scope.getGroupChatWindow = function(){
        $scope.isUser = false;
        $scope.isGroup = true;
        $scope.userChatTo = {
            "id": "group",
            "name": "Group"
        };
        $scope.messageList = [];
    };

    var params = [];

    // 获取所有用户信息
    homeService.getAllUsers(params, function(userList, myUser){
        $scope.userList = userList;
        $scope.myUser = myUser;
        $scope.userChatTo = userList[0];
    });

    // ------*-*------*-*------*-*------*-*------*-*------*-*------*-*------*-*------*-*------*-*------
    // websocket即时通讯功能的核心部分
    var websocket;
    if ('WebSocket' in window) {
        websocket = new WebSocket("ws://localhost:8080/websocket/socketServer.do");
    } else if ('MozWebSocket' in window) {
        websocket = new MozWebSocket("ws://websocket/socketServer.do");
    } else {
        websocket = new SockJS("http://localhost:8080/sockjs/socketServer.do");
    }
    websocket.onopen = function() {
        alert("链接服务器成功!")
    };
    websocket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        // console.log(message);
        var messageCell = {};
        if(message.username === $scope.myUser.name){  // 是否是当前登录的用户
            messageCell = {
                "user": true,
                "other": false,
                "userId": message.userID,          // 发送消息的用户id
                "username": message.username,      // 发送消息的用户名
                "toUsername": message.toUsername,  // 接收消息的用户
                "details": message.message,
                "time": message.time
            };
            $scope.messageList.push(messageCell);
        }else if(message.username === $scope.userChatTo.name){  // 是否是当前正在通讯的用户
            messageCell = {
                "user": false,
                "other": true,
                "userId": message.userID,          // 发送消息的用户id
                "username": message.username,      // 发送消息的用户名
                "toUsername": message.toUsername,  // 接收消息的用户
                "details": message.message,
                "time": message.time
            };
            $scope.messageList.push(messageCell);
        }else{
            messageCell = {
                "user": false,
                "other": true,
                "userId": message.userID,          // 发送消息的用户id
                "username": message.username,      // 发送消息的用户名
                "toUsername": message.toUsername,  // 接收消息的用户
                "details": message.message,
                "time": message.time
            };
        }
        $scope.setMessageRecord(messageCell);  // 保存聊天记录在local storage中
        console.log($scope.messageList);
        $scope.$apply();  // 更新数据
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    };
    websocket.onerror = function(event) {
    };
    websocket.onclose = function() {
        alert("与服务器断开了链接!")
    };

    // 群组内通讯
    $scope.sendMessageToGroup = function(){
        if (websocket != null) {
            var data = "{\"to\":\"\",\"message\":\"" + $scope.messageToSend + "\"}";
            websocket.send(data);
            $scope.messageToSend = "";
        } else {
            alert('未与服务器链接.');
        }
    };

    // 用户间通讯
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
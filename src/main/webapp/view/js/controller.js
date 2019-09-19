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

    var dateStr;    // 记录当日日期

    // 在local storage中存储通讯消息
    $scope.setMessageRecord = function(data){
        if(typeof(Storage) !== undefined) {
            var key = $scope.userChatTo.name;
            if(data["toUsername"] === "Group"){    // 如果是群聊则键值变为Group
                key = "Group";
            }
            var messageToRecord = {};
            messageToRecord[key] = [];
            if(localStorage.getItem("messageRecord" + dateStr) != null){
                messageToRecord = JSON.parse(localStorage.getItem("messageRecord" + dateStr));
                if(messageToRecord[key] === undefined){
                    messageToRecord[key] = [];
                }
            }
            messageToRecord[key].push(data);
            localStorage.setItem("messageRecord" + dateStr, JSON.stringify(messageToRecord));
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    // 获取local storage中存储的用户间的通讯消息
    $scope.getMessageRecord = function(chatUser){
        if(typeof(Storage) !== undefined) {
            if(localStorage.getItem("dateList") != null){
                var dateList = JSON.parse(localStorage.getItem("dateList"));  // 获取日期列表
                for(var j = 0; j < dateList.length; j ++){
                    // 对于日期列表中的每个日期遍历
                    if(localStorage.getItem("messageRecord" + dateList[j]) != null){
                        var messageDate = JSON.parse(localStorage.getItem("messageRecord" + dateList[j]));
                        if(messageDate[chatUser] !== undefined && messageDate[chatUser].length > 0) {
                            $scope.messageList.push({    // 对于有聊天记录的日期，将日期单独显示
                                "user": false,
                                "other": false,
                                "isTime": true,
                                "time": dateList[j]
                            });
                            $scope.messageList = $scope.messageList.concat(messageDate[chatUser]);
                        }
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
        console.log("$scope.userChatTo");
        console.log($scope.userChatTo);
        $scope.messageList = [];
        $scope.getMessageRecord($scope.userChatTo.name);              // 获取当前窗口的消息记录
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    };

    // 获取群组的通讯窗口
    $scope.getGroupChatWindow = function(){
        $scope.isUser = false;
        $scope.isGroup = true;
        $scope.userChatTo = {
            "id": "group",
            "name": "Group"
        };
        console.log("$scope.userChatTo");
        console.log($scope.userChatTo);
        $scope.messageList = [];
        $scope.getMessageRecord("Group");              // 获取当前窗口的消息记录
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    };

    var params = [];

    // 获取所有用户信息
    homeService.getAllUsers(params, function(userList, myUser){
        $scope.userList = userList;
        $scope.myUser = myUser;

        // 如果local storage中存储的myUser不是当前登录用户，则清空
        if(localStorage.getItem("myUser") == null || localStorage.getItem("myUser") !== $scope.myUser.name){
            localStorage.clear();
            localStorage.setItem("myUser", $scope.myUser.name);
        }

        // 获取当前时间
        var date = new Date();
        dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        console.log("dateStr: " + dateStr);
        var dateList = [];
        if(localStorage.getItem("dateList") != null){
            dateList = JSON.parse(localStorage.getItem("dateList"));
        }
        if(dateList.indexOf(dateStr) < 0){    // 如果没有记录当天的内容
            if(dateList.length >= 7) {    // 只保存最近7天的记录
                var tempDate = dateList.shift();         // 删除数组第一个元素，即时间最久远的元素
                localStorage.removeItem("messageRecord" + tempDate);  // 存储的过期的消息要删除
            }
            dateList.push(dateStr);
        }
        localStorage.setItem("dateList", JSON.stringify(dateList));

        // 获取已经存储在local storage中的消息记录
        if(userList.length > 0){
            $scope.userChatTo = userList[0];
            $scope.getMessageRecord($scope.userChatTo.name);
        }else{
            $scope.userChatTo = {
                "id": "group",
                "name": "Group"
            };
            $scope.getMessageRecord("Group");
        }
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
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
        var messageCell = {
            "userId": message.userID,          // 发送消息的用户id
            "username": message.username,      // 发送消息的用户名
            "toUsername": message.toUsername,  // 接收消息的用户
            "details": message.message,
            "time": message.time
        };
        if(message.username === $scope.myUser.name){  // 是否是当前登录的用户
            messageCell["user"] = true;
            messageCell["other"] = false;
            messageCell["isTime"] = false;
            $scope.messageList.push(messageCell);
        }else if((message.username === $scope.userChatTo.name && message.toUsername !== "Group")
            || (message.toUsername === "Group" && $scope.userChatTo.name === "Group")){  // 是否是当前正在通讯的用户，或正在群聊的用户
            messageCell["user"] = false;
            messageCell["other"] = true;
            messageCell["isTime"] = false;
            $scope.messageList.push(messageCell);
        }else{      // 收到非当前聊天对象的消息时不显示
            messageCell["user"] = false;
            messageCell["other"] = true;
            messageCell["isTime"] = false;
        }
        console.log($scope.messageList);
        $scope.$apply();  // 更新数据
        $scope.setMessageRecord(messageCell);  // 保存聊天记录在local storage中
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
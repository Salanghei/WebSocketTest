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
}).controller("testCtrl", function($scope, $cookies, $timeout, homeService){
    $scope.messageList = [];      // 当前消息列表
    $scope.messageToSend = "";    // 要发送的信息

    $scope.userList = [];         // 所有用户列表
    $scope.groupList = [{"id": "group", "name": "Group1", "mesCount": 0, "unRead": false},
        {"id": "group", "name": "Group2", "mesCount": 0, "unRead": false}];
                                  // 所有群组列表

    $scope.myUser = {};           // 当前用户
    $scope.userChatTo = {};       // 正在对话的用户

    $scope.isGroup = false;      // 是否是群组会话

    var dateStr;                 // 记录当日日期
    var params = [];             // 调用service服务时的参数
    var usernameList = [];       // 用户名列表
    var groupnameList = [];      // 群组名列表

    // 在local storage中存储文字消息
    $scope.setMessageRecord = function(data){
        if(typeof Storage !== undefined) {
            var key = $scope.userChatTo.name;
            if(groupnameList.indexOf(data["toUsername"]) > -1){    // 如果是群聊则键值变为群组名
                key = data["toUsername"];
            }else if(data["username"] !== $scope.userChatTo.name && data["username"] !== $scope.myUser.name){
                // 当前聊天窗口中的用户，与收到的消息来源用户不同时，且与当前登录用户不同时
                // 即既不是我发的消息，也不是对方发的消息，是其他人给我的消息
                key = data["username"];
            }
            var messageToRecord = {};
            messageToRecord[key] = [];
            if(localStorage.getItem("messageRecord" + dateStr) != null){  // 获取已经保存的消息
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

    // 在local storage中存储图片消息
    $scope.setPictureRecord = function(imgDom, data){
        if(typeof Storage !== undefined){
            var key = $scope.userChatTo.name;
            if(groupnameList.indexOf(data["toUsername"]) > -1){    // 如果是群聊则键值变为群组名
                key = data["toUsername"];
            }else if(data["username"] !== $scope.userChatTo.name && data["username"] !== $scope.myUser.name){
                // 当前聊天窗口中的用户，与收到的消息来源用户不同时，且与当前登录用户不同时
                // 即既不是我发的消息，也不是对方发的消息，是其他人给我的消息
                key = data["username"];
            }
            var imgToRecord = {};
            imgToRecord[key] = {};
            if(localStorage.getItem("pictureRecord" + dateStr) != null){  // 获取已经保存的图片信息
                imgToRecord = JSON.parse(localStorage.getItem("pictureRecord" + dateStr));
                if(imgToRecord[key] === undefined){
                    imgToRecord[key] = {};
                }
            }
            var imgCanvas = document.createElement("canvas");
            var imgContext = imgCanvas.getContext("2d");
            // 确保canvas的尺寸和图片一样大
            imgCanvas.width = imgDom.width;
            imgCanvas.height = imgDom.height;
            // 在canvas中绘制图片
            imgContext.drawImage(imgDom, 0, 0, imgDom.width, imgDom.height);
            // 将图片保存为Data URL
            imgToRecord[key][data["details"]] = imgCanvas.toDataURL("image/*");
            localStorage.setItem("pictureRecord" + dateStr, JSON.stringify(imgToRecord));
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    // 获取local storage中存储的用户间的文字消息
    $scope.getMessageRecord = function(){
        if(typeof Storage !== undefined) {
            if(localStorage.getItem("dateList") != null){
                var dateList = JSON.parse(localStorage.getItem("dateList"));  // 获取日期列表
                for(var j = 0; j < dateList.length; j ++){
                    // 对于日期列表中的每个日期遍历
                    if(localStorage.getItem("messageRecord" + dateList[j]) != null){
                        var messageDate = JSON.parse(localStorage.getItem("messageRecord" + dateList[j]));
                        if(messageDate[$scope.userChatTo.name] !== undefined && messageDate[$scope.userChatTo.name].length > 0) {
                            $scope.messageList.push({    // 对于有聊天记录的日期，将日期单独显示
                                "user": false,
                                "other": false,
                                "isTime": true,
                                "time": dateList[j]
                            });
                            $scope.messageList = $scope.messageList.concat(messageDate[$scope.userChatTo.name]);
                        }
                    }
                }
            }
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    var pictureMap = {};
    // 获取local storage中存储的用户间的图片消息
    $scope.getPictureRecord = function(){
        if(typeof Storage !== undefined){
            pictureMap = {};
            if(localStorage.getItem("dateList") != null) {
                var dateList = JSON.parse(localStorage.getItem("dateList"));  // 获取日期列表
                for (var j = 0; j < dateList.length; j++) {
                    // 对于日期列表中的每个日期遍历
                    if (localStorage.getItem("pictureRecord" + dateList[j]) != null) {
                        var pictureDate = JSON.parse(localStorage.getItem("pictureRecord" + dateList[j]));
                        pictureMap = Object.assign(pictureMap, pictureDate[$scope.userChatTo.name]);
                    }
                }
            }
        } else {
            alert("抱歉，您的浏览器不支持local storage功能，无法保存聊天记录...");
        }
    };

    // dom元素渲染完成后执行的操作：加载页面中的历史图片
    $scope.ngRepeatFinished = function(){
        console.log("dom渲染完成");
        if(pictureMap !== undefined) {
            $timeout(function (){
                console.log("load picture ...");
                for (var i = 0; i < $scope.messageList.length; i++) {
                    if ($scope.messageList[i]["isImage"] === true) {
                        var img = document.createElement("img");    // 显示图片
                        img.src = pictureMap[$scope.messageList[i]["details"]];
                        var insertBox = document.getElementById($scope.messageList[i]["time"]);
                        for(var j = insertBox.childNodes.length - 1; j >= 0; j--){
                            if(insertBox.childNodes[j].nodeName === "IMG"){
                                insertBox.removeChild(insertBox.childNodes[j]);
                            }
                        }
                        insertBox.insertBefore(img, insertBox.childNodes[0]);
                    }
                }
            });
        }
    };

    // 获取用户间的通讯窗口
    $scope.getUserChatWindow = function(user){
        $scope.isGroup = false;
        $scope.userChatTo = user;

        var index = usernameList.indexOf($scope.userChatTo.name);
        $scope.userList[index]["unRead"] = false;               // 未读消息提示
        $scope.userList[index]["mesCount"] = 0;                  // 未读消息条数

        $scope.messageList = [];
        $scope.getMessageRecord();              // 获取当前窗口的消息记录
        $scope.getPictureRecord();
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;

        $scope.ngRepeatFinished();
    };

    // 获取群组的通讯窗口
    $scope.getGroupChatWindow = function(group){
        $scope.isGroup = true;
        $scope.userChatTo = group;

        var index = groupnameList.indexOf($scope.userChatTo.name);
        $scope.groupList[index]["unRead"] = false;               // 未读消息提示
        $scope.groupList[index]["mesCount"] = 0;                  // 未读消息条数

        $scope.messageList = [];
        $scope.getMessageRecord();              // 获取当前窗口的消息记录
        $scope.getPictureRecord();
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;

        $scope.ngRepeatFinished();
    };

    // 获取页面中所有信息
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
                localStorage.removeItem("pictureRecord" + tempDate);
            }
            dateList.push(dateStr);
        }
        localStorage.setItem("dateList", JSON.stringify(dateList));

        // 获取已经存储在local storage中的消息记录
        if($scope.userList.length > 0){
            $scope.userChatTo = $scope.userList[0];
            $scope.getMessageRecord();
            $scope.getPictureRecord();
        }else if($scope.groupList.length > 0){
            $scope.userChatTo = $scope.groupList[0];
            $scope.getMessageRecord();
            $scope.getPictureRecord();
        }

        // 获取所有用户名的列表
        for(var i = 0; i < userList.length; i++){
            usernameList.push(userList[i]["name"]);
        }
        // 获取所有群组名的列表
        for(var j = 0; j < $scope.groupList.length; j++){
            groupnameList.push($scope.groupList[j]["name"]);
        }

        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;

        $scope.ngRepeatFinished();
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

    var time;    // 记录当前收到图片的时间
    websocket.onmessage = function(event) {
        pictureMap = undefined;
        if(typeof event.data === "string") {
            $scope.receiveMessage(event);
        }else{
            $scope.receivePicture(event);
        }
        //设置滚动条始终在最下方
        var scrollWindow = document.getElementById("scroll-window");
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    };

    websocket.onerror = function(event) {
    };

    websocket.onclose = function() {
        alert("与服务器断开了链接!");
    };

    var picHeadMessage = {};  // 记录图片的头信息

    // 接收到文字
    $scope.receiveMessage = function(evt){
        var message = JSON.parse(evt.data);
        time = message.time;
        var messageCell = {
            "userId": message.userID,          // 发送消息的用户id
            "username": message.username,      // 发送消息的用户名
            "toUsername": message.toUsername,  // 接收消息的用户
            "details": message.message,
            "time": message.time,
            "isTime": false,
            "isImage": message.isImage === "True",
            "isText": message.isImage === "False"
        };
        if (message.username === $scope.myUser.name) {  // 是否是当前登录的用户
            messageCell["user"] = true;
            messageCell["other"] = false;
            $scope.messageList.push(messageCell);
        } else if ((message.username === $scope.userChatTo.name && groupnameList.indexOf(message.toUsername) < 0)
            || (message.toUsername === $scope.userChatTo.name && groupnameList.indexOf(message.toUsername) > -1)) {
            // 是否是当前正在通讯的用户，或正在群聊的用户
            messageCell["user"] = false;
            messageCell["other"] = true;
            $scope.messageList.push(messageCell);
        } else {      // 收到非当前聊天对象的消息时不显示
            messageCell["user"] = false;
            messageCell["other"] = true;
            var index;
            if (message.toUsername === $scope.myUser.name) {            // 判断是否是发给当前登录用户的（可能是群消息）
                index = usernameList.indexOf(message.username);        // 查找用户在$scope.userList中的索引
                $scope.userList[index]["unRead"] = true;               // 未读消息提示
                $scope.userList[index]["mesCount"] += 1;               // 未读消息条数
            } else {                                                     // 发到群组的消息
                index = groupnameList.indexOf(message.toUsername);      // 查找群组在$scope.groupList中的索引
                $scope.groupList[index]["unRead"] = true;              // 未读消息提示
                $scope.groupList[index]["mesCount"] += 1;               // 未读消息条数
            }
        }
        console.log($scope.messageList);
        $scope.$apply();  // 更新数据
        $scope.setMessageRecord(messageCell);  // 保存聊天记录在local storage中
        if(message.isImage === "True"){
            picHeadMessage = messageCell;
        }
    };

    // 接收到图片
    $scope.receivePicture = function(evt){
        console.log(evt.data);
        var reader = new FileReader();
        reader.onload = function(event){
            if(event.target.readyState === FileReader.DONE){
                // 在对话中显示图片
                var img = document.createElement("img");    // 显示图片
                img.src = this.result;
                var insertBox = document.getElementById(time);
                if(insertBox) {
                    insertBox.insertBefore(img, insertBox.childNodes[0]);
                }else{
                    document.body.appendChild(img);
                    img.style.display = 'none';
                }
                img.onload = function(){
                    $scope.setPictureRecord(img, picHeadMessage);
                };
            }
        };
        reader.readAsDataURL(evt.data);
    };

    // 群组内通讯
    $scope.sendMessage = function(){
        var flag;
        if($scope.isGroup === true){
            flag = "group";
        }else{
            flag = "user";
        }
        if (websocket != null) {
            var data = "{\"to\":\"" + $scope.userChatTo.name + "\", \"flag\":\"" + flag + "\", \"isImg\":\"false\", \"message\":\"" + $scope.messageToSend + "\"}";
            websocket.send(data);
            $scope.messageToSend = "";
        } else {
            alert('未与服务器链接.');
        }
    };

    // 传输图片
    $scope.sendPicture = function(){
        var flag;
        if($scope.isGroup === true){
            flag = "group";
        }else{
            flag = "user";
        }
        var picture = document.querySelector('#picture').files[0];
        console.log(picture);

        // 图片开始传输
        var data = "{\"to\":\"" + $scope.userChatTo.name + "\", \"flag\":\"" + flag + "\", \"isImg\":\"true\", \"message\":\"" + picture.name + ":pictureStart" + "\"}";
        websocket.send(data);

        // 传输图片内容
        var reader = new FileReader();
        reader.readAsArrayBuffer(picture);
        reader.onload = function(){
            var blob = reader.result;
            console.log(blob);
            websocket.send(blob);

            // 图片传输结束
            var data = "{\"to\":\"" + $scope.userChatTo.name + "\", \"flag\":\"" + flag + "\", \"isImg\":\"true\", \"message\":\"" + picture.name + ":pictureEnd" + "\"}";
            websocket.send(data);
        };
    };
});
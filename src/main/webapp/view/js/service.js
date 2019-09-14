app.service("homeService", function($http){

    // 登录
    this.login = function(params, callback) {
        $http({
            method: 'GET',
            url: '/user/login?'+'username='+params.username+'&password='+params.password
        }).then(function success(response) {
            var data = response.data.message;// 这个data是将要传到controller.js中去的
            if (callback) {
                callback(data);// 这样就把data传到controller.js中去了
            }
        }, function error(response) {
            // 请求失败执行代码
        });
    }

    // 获取全部用户列表
    this.getAllUsers = function(params, callback) {
        $http({
            method: 'GET',
            url: '/user/allUsers'
        }).then(function success(response) {
            var userList = response.data.userList;// 这个data是将要传到controller.js中去的
            var myUser = response.data.myUser;
            if (callback) {
                callback(userList, myUser);// 这样就把data传到controller.js中去了
            }
        }, function error(response) {
            // 请求失败执行代码
        });
    }
});
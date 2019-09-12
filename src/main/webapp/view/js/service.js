app.service("homeService", function($http){

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
});
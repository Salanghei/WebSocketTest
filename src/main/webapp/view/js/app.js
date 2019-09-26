var app = angular.module("home", ["ngCookies"]);
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);
app.directive('onFinishRenderFilters', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                // console.log("渲染完毕");
                $timeout(function(){
                    scope.$parent.ngRepeatFinished();
                });
            }
        }
    };
});
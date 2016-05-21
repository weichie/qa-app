var app = angular.module('qaApp', []);

app.controller('MainCtrl', ['$scope', function($scope){
	$scope.test = "Working!";
}]);
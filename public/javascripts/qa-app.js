var app = angular.module('qaApp', ['ui.router']);

app.factory('questions', ['$http', function($http){
	var o = {
		questions: []
	};

	o.getAll = function(){
		return $http.get('/question').success(function(data){
			angular.copy(data,o.questions);
		});
	}

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'questions', function($scope, questions){
	//$scope.questions = questions.questions;
	
	questions.getAll();
	$scope.q = questions.questions;

	console.log( $scope.q );

	$scope.test = "Working! Uhu da werkt sup WEL? deze lolz - gkey! OKK22222eee nicergss :D";
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['questions', function(questions){
					return questions.getAll();
				}]
			}
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		})

	$urlRouterProvider.otherwise('home');
}]);
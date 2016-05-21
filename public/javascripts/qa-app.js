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
}]);

app.controller('QuestionCtrl', ['$scope', '$stateParams', 'questions', function($scope,$stateParams,questions){
	//questions.getAll();
	$scope.question = questions.questions[$stateParams.id];
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
		.state('question', {
			url: '/question/{id}',
			templateUrl: '/question.html',
			controller: 'QuestionCtrl'
		})

	$urlRouterProvider.otherwise('home');
}]);
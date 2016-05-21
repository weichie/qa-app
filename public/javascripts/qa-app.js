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

	o.get = function(id) {
	  return $http.get('/question/' + id).then(function(res){
	    return res.data;
	  });
	};

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'questions', function($scope, questions){
	//$scope.questions = questions.questions;
	
	questions.getAll();
	$scope.q = questions.questions;
}]);


app.controller('QuestionCtrl', ['$scope', '$stateParams', 'questions', 'question', function($scope,$stateParams,questions,question){
	
	$scope.question = question;

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
			controller: 'QuestionCtrl',
			resolve: {
				question: ['$stateParams', 'questions', function($stateParams, questions) {
					return questions.get($stateParams.id);
				}]
			}
		})

	$urlRouterProvider.otherwise('home');
}]);
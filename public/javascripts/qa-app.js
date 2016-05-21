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


	o.plusOne = function(question) {
		return $http.put('/question/' + question._id + '/upvote')
		.success(function(data){
			question.upvotes += 1;
		});
	};

	o.minOne = function(question) {
		return $http.put('/question/' + question._id + '/upvote')
		.success(function(data){
			question.upvotes -= 1;
		});
	};

	o.create = function(question) {
	  return $http.post('/question', question).success(function(data){
	    o.questions.push(data);
	  });
	};

	return o;
}]);

app.controller('MainCtrl', ['$scope', 'questions', function($scope, questions){
	//$scope.questions = questions.questions;
	
	questions.getAll();
	$scope.q = questions.questions;

	$scope.plusOne = function(question) {
		questions.plusOne(question);
	};

	$scope.minOne = function(question) {
		questions.minOne(question);
	};

	$scope.addQuestion = function(){
		if(!$scope.title || $scope.title === '') { return; }

		questions.create({
			'title': $scope.title,
			'link': $scope.link,
		});

		$scope.title = '';
		$scope.link = '';
	}

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
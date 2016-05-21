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
		return $http.put('/question/' + question._id + '/downvote')
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

app.factory('auth', ['$http','$windows', function($http,$windows){
	var auth = {};

	auth.saveToken = function(token){
		$window.localStorage['qa-token'] = token;
	};

	auth.getToken = function(){
		return $window.localStorage['qa-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		}else{
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user){
		return $http.post('/login', user).succes(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logout = function(user){
		$window.localStorage.removeItem('qa-token');
	};

	return auth;
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

app.controller('AuthCtrl', ['$scope','$state','$auth', function($scope,$state,$auth){
	$scope.user = {};

	$scope.register = function(){
		auth.register($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};

	$scope.logIn = function(){
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		})
	};
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
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		});

	$urlRouterProvider.otherwise('home');
}]);
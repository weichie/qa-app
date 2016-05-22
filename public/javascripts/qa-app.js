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

	o.plusOneAnswer = function(question, answer) {
		return $http.put('/question/' + question._id + '/answers/' + answer._id + '/upvote')
		.success(function(data){
			answer.upvotes += 1;
		});
	};

	o.minOneAnswer = function(question, answer) {
		return $http.put('/question/' + question._id + '/answers/' + answer._id + '/downvote')
		.success(function(data){
			answer.upvotes -= 1;
		});
	};

	o.create = function(question) {
	  return $http.post('/question', question).success(function(data){
	    o.questions.push(data);
	  });
	};

	o.addComment = function(id, comment) {
	  return $http.post('/question/' + id + '/answers', comment);
	};

	return o;
}]);

app.factory('auth', ['$http','$window', function($http,$window){
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
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logout = function(user){
		$window.localStorage.removeItem('qa-token');
	};

	return auth;
}]);

app.controller('MainCtrl', ['$scope', 'questions', 'auth', function($scope, questions, auth){
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

	if( auth.isLoggedIn() ){
		$scope.username = auth.currentUser();
	}

	$scope.logout = function(){
		auth.logout();
	};

	$scope.isLoggedIn = auth.isLoggedIn();

	console.log( auth.getToken() );
	console.log( auth.currentUser() );
	console.log( auth.isLoggedIn() );

}]);


app.controller('QuestionCtrl', ['$scope', '$stateParams', 'questions', 'question', function($scope,$stateParams,questions,question){
	
	$scope.question = question;

	console.log($scope.question);

	$scope.addComment = function(){
	  if($scope.body === '') { return; }
	  questions.addComment(question._id, {
	  	body: $scope.body,
	  	author: 'user',
	  }).success(function(answer){
	  	$scope.question.answers.push(answer);
	  });
	  $scope.body = '';
	};

	$scope.plusOne = function(question, answer) {
		questions.plusOneAnswer(question, answer);
	};

	$scope.minOne = function(question, answer) {
		questions.minOneAnswer(question, answer);
	};

}]);

app.controller('AuthCtrl', ['$scope','$state','auth', function($scope,$state,auth){
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
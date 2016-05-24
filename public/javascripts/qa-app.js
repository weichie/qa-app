var app = angular.module('qaApp', ['ui.router']);

app.filter("ifImage" , function(){
  return function(val){
    // regex to check image extension.
    var find = new RegExp("(.png|.jpg|.gif|.jpeg)");
    var data = val;

    geturl = new RegExp(
          "(^|[ \t\r\n])((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))"
         ,"g"
       );

    var matched = data.match(geturl);

    console.log( matched );

    if( matched !== null ){

    	var newData = val;

		for(var i=0;i<matched.length;i++){
	    	console.log( matched[i] );
	    	console.log(newData);
	    	newData = newData.replace(matched[i], '<img src="'+matched[i]+'">');
	    	console.log(newData);
	    }
	    return data = newData;
    } else {
    	return data = val;
    }
    
    // Return value if true
    /*if(find.test(val))
      return data ='<img src="'+val+'">';
    else
      return data = val;*/

   };
});

app.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});

app.filter("sanitize", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
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

	auth.currentUserId = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload._id;
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

app.factory('discussions', ['$http', 'auth', function($http, auth){
	var o = {
		discussions: []
	};

	o.getAll = function(){
		return $http.get('/discussion').success(function(data){
			angular.copy(data,o.discussions);
		});
	};

	o.get = function(id) {
	  return $http.get('/discussion/' + id).then(function(res){
	    return res.data;
	  });
	};

	/*o.plusOne = function(discussion) {
		return $http.put('/discussion/' + discussion._id + '/upvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			discussion.upvotes += 1;
		});
	};

	o.minOne = function(discussion) {
		//return $http.put('/question/' + question._id + '/downvote', null, {
		return $http.put('/discussion/' + discussion._id + '/downvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			discussion.upvotes -= 1;
		});
	};

	o.plusOneQuestion = function(discussion, answer) {
		return $http.put('/discussion/' + discussion._id + '/answers/' + answer._id + '/upvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			question.upvotes += 1;
		});
	};

	o.minOneAnswer = function(question, answer) {
		//return $http.put('/question/' + question._id + '/answers/' + answer._id + '/downvote', null, {
		return $http.put('/question/' + question._id + '/answers/' + answer._id + '/downvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			answer.upvotes -= 1;
		});
	};*/

	o.closeDiscussion = function(discussion){
		return $http.put('/discussion/'+discussion._id+'/close', discussion, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		});
	}

	o.create = function(discussion) {
	  return $http.post('/discussion', discussion, {
	  	headers: {Authorization: 'Bearer ' + auth.getToken()}
	  }).success(function(data){
	    o.discussions.push(data);
	  });
	};

	o.addQuestion = function(id, question) {
	  return $http.post('/discussion/' + id + '/questions', question, {
	  	headers: {Authorization: 'Bearer ' + auth.getToken()}
	  });
	};

	return o;
}]);

app.factory('questions', ['$http', 'auth', function($http, auth){
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
		//return $http.put('/question/' + question._id + '/upvote', null, {
		return $http.put('/question/' + question._id + '/upvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			question.upvotes += 1;
		});
	};

	o.minOne = function(question) {
		//return $http.put('/question/' + question._id + '/downvote', null, {
		return $http.put('/question/' + question._id + '/downvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			question.upvotes -= 1;
		});
	};

	o.plusOneAnswer = function(question, answer) {
		//return $http.put('/question/' + question._id + '/answers/' + answer._id + '/upvote', null, {
		return $http.put('/question/' + question._id + '/answers/' + answer._id + '/upvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			answer.upvotes += 1;
		});
	};

	o.minOneAnswer = function(question, answer) {
		//return $http.put('/question/' + question._id + '/answers/' + answer._id + '/downvote', null, {
		return $http.put('/question/' + question._id + '/answers/' + answer._id + '/downvote', null, {
			headers: {Authorization: 'Bearer ' + auth.getToken()}
		}).success(function(data){
			answer.upvotes -= 1;
		});
	};

	o.create = function(question) {
	  return $http.post('/question', question, {
	  	headers: {Authorization: 'Bearer ' + auth.getToken()}
	  }).success(function(data){
	    o.questions.push(data);
	  });
	};

	o.addComment = function(id, comment) {
	  return $http.post('/question/' + id + '/answers', comment, {
	  	headers: {Authorization: 'Bearer ' + auth.getToken()}
	  });
	};

	o.removeComment = function(answer){
		return $http.put('/answer/' + answer._id, answer, {
		 headers: {Authorization: 'Bearer ' + auth.getToken()}
		});
	}

	return o;
}]);

app.factory('checkIfImg', function($q) {
    return {
        isImage: function(src, i) {
        
            var deferred = $q.defer();
        
            var image = new Image();
            image.onerror = function() {
                deferred.resolve({result:true, i:i});
            };
            image.onload = function() {
                deferred.resolve({result:true, i:i});
            };
            image.src = src;
        
            return deferred.promise;
        }
    };
});

app.controller('MainCtrl', ['$scope', 'questions', 'auth', '$window', 'discussions', function($scope, questions, auth, $window, discussions){
	//$scope.questions = questions.questions;
	
	questions.getAll();
	$scope.q = questions.questions;

	discussions.getAll();
	$scope.discussions = discussions.discussions;

	var username = function(){
		if( auth.currentUser() ){
			return auth.currentUser();
		} else {
			return 'anonymous';
		}
	}

	console.log($window.socket);

	$window.socket.emit('joinDiscussion', {
		discussion: 'homepage',
		user: username(),
	});

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

	// Server broadcasted back that vote has been cast on a question
	$window.socket.on('pushQuestions', function(){
		questions.getAll().then(function(data){
			console.log( data );
			$scope.q = data.data;
		});
	});

	$scope.logout = function(){
		auth.logout();
	};

	//$scope.isLoggedIn = auth.isLoggedIn();
	$scope.isLoggedIn = auth.isLoggedIn;

	console.log( auth.getToken() );
	console.log( auth.currentUser() );
	console.log( auth.currentUserId() );
	console.log( auth.isLoggedIn() );
}]);

app.controller('DiscussionCtrl', ['$scope', '$window', '$stateParams', 'discussions', 'questions', 'discussion', 'auth','checkIfImg', function($scope, $window, $stateParams,discussions,questions,discussion,auth,checkIfImg){

	$scope.discussion = discussion;
	$scope.answer = {};
	$scope.isClosed = discussion.closed;

	var username = function(){
		if( auth.currentUser() ){
			return auth.currentUser();
		} else {
			return 'anonymous';
		}
	}

	$window.socket.emit('joinDiscussion', {
		discussion: discussion._id,
		user: username(),
	});

	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.isAdmin = function(){
		if( auth.currentUserId() === discussion.owner ){
			return true;
		} else {
			return false;
		}
	}

	// When entering the question page we want to check if there are any changes (via socket.io)
	$window.socket.on('changedQuestion', function(q){
		console.log('seems that someone changed this question...');
		console.log(' man man man ');
		console.log(q);

		discussions.get( discussion._id ).then(function(data){
			console.log( data );
			$scope.discussion = data;
			//$scope.findImages();
		});
		//$scope.$apply();
	});

	$scope.trash = function(answer, qindex, aindex){

		console.log( answer );
		console.log( qindex );
		console.log( aindex );

		answer.discussion = discussion._id;

		questions.removeComment(answer)
		.success(function(){
			$scope.discussion.questions[qindex].answers.splice(aindex, 1);
			$window.socket.emit('changedQuestion', discussion);
		});
	}

	$scope.close = function(){
		discussions.closeDiscussion(discussion)
		.success(function(){
			$scope.isClosed = true;
			$window.socket.emit('changedQuestion', discussion);
		});
	}

	$scope.addQuestion = function(){
	  if(!$scope.body || $scope.body === '') { return; }
	  discussions.addQuestion(discussion._id, {
	  	body: $scope.body,
	  }).success(function(question){
	  	// We push our answer to the current scope.
	  	$scope.discussion.questions.push(question);
	  	// Send out an emit
	  	$window.socket.emit('changedQuestion', discussion);

	  });
	  $scope.body = '';
	};

	$scope.addAnswer = function(qid, index){
	  if(!$scope.answer[index].body || $scope.answer[index].body === '') { return; }
	  questions.addComment(qid, {
	  	body: $scope.answer[index].body,
	  }).success(function(answer){
	  	// We push our answer to the current scope.
	  	$scope.discussion.questions[index].answers.push(answer);
	  	// Send out an emit
	  	$window.socket.emit('changedQuestion', discussion);

	  });
	  $scope.answer[index].body = '';
	};


	$window.socket.on('peopleNames', function(people){
		console.log( people );

		$scope.loggedInPeople = people;
	});

	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};


	$window.socket.on('rooms', function(rooms){
		//console.log( rooms[discussion._id].sockets );

		var peopleInDiscussion = [];
		if( typeof rooms[discussion._id] !== 'undefined'){
			for( _socket in rooms[discussion._id].sockets ){

				console.log( 'scoket :' + _socket);

				for(var i=0;i<$scope.loggedInPeople.length;i++){

					console.log( 'person' + $scope.loggedInPeople[i].socket );

					if( $scope.loggedInPeople[i].socket == _socket ){
						console.log( $scope.loggedInPeople[i].user );
						peopleInDiscussion.push( $scope.loggedInPeople[i].user );
					}
				}
			}
		}

		console.log( peopleInDiscussion );
		$scope.people = peopleInDiscussion.join();
		$scope.$apply();
	});


}]);

app.controller('QuestionCtrl', ['$scope', '$window', '$stateParams', 'questions', 'question', 'auth','checkIfImg', function($scope, $window, $stateParams,questions,question, auth,checkIfImg){

	$scope.question = question;

	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.isAdmin = function(){
		if( auth.currentUserId() === question.owner ){
			return true;
		} else {
			return false;
		}
	}

	console.log( $scope.isAdmin() );
	//$scope.isLoggedIn = auth.isLoggedIn();

	console.log($scope.question);

	// When entering the question page we want to check if there are any changes (via socket.io)
	$window.socket.on('changedQuestion', function(q){
		console.log('seems that someone changed this question...');
		console.log(' man man man ');
		console.log(q);

		questions.get( question._id ).then(function(data){
			console.log( data );
			$scope.question = data;
			//$scope.findImages();
			
		});

		//$scope.$apply();
	});

	$scope.plusOne = function(question) {
		$window.socket.emit('changedQuestion', question);
		$window.socket.emit('pushQuestions', question);
		questions.plusOne(question);
	};

	$scope.minOne = function(question) {
		$window.socket.emit('changedQuestion', question);
		$window.socket.emit('pushQuestions', question);
		questions.minOne(question);
	};

	$scope.addComment = function(){
	  if(!$scope.body || $scope.body === '') { return; }
	  questions.addComment(question._id, {
	  	body: $scope.body,
	  	author: 'user',
	  }).success(function(answer){
	  	// We push our answer to the current scope.
	  	$scope.question.answers.push(answer);
	  	// Send out an emit
	  	$window.socket.emit('changedQuestion', question);

	  });
	  $scope.body = '';
	};

	$scope.plusOneAnswer = function(question, answer) {
		$window.socket.emit('changedQuestion', question);
		questions.plusOneAnswer(question, answer);
	};

	$scope.minOneAnswer = function(question, answer) {
		$window.socket.emit('changedQuestion', question);
		questions.minOneAnswer(question, answer);
	};
}]);

app.controller('AddDiscussionCtrl', ['$scope', 'discussions', 'auth', '$window', function($scope, discussions, auth, $window){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.supportsGeo = $window.navigator;
    $scope.position = null;    

	window.navigator.geolocation.getCurrentPosition(function(position) {
		$.get('http://maps.googleapis.com/maps/api/geocode/json?address='+position.coords.latitude+','+position.coords.longitude+'&sensor=false', function(res){
			console.log(res);
			$scope.$apply(function() {
				$scope.position = position.coords.latitude + ";" + position.coords.longitude;			
				$scope.city = res.results[2].formatted_address;
			});
		});	
	}, function(error) {
		alert(error);
	});

	$scope.addDiscussion = function(){
		if(!$scope.title || $scope.title === '') { return; }

		discussions.create({
			'title': $scope.title,
			'location': $scope.position,
			'city': $scope.city
		});

		$window.socket.emit('pushQuestions');

		$scope.title = '';
	}
}]);

app.controller('AddqCtrl', ['$scope', 'questions', 'auth' , function($scope, questions, auth){
	$scope.q = questions.questions;
	$scope.isLoggedIn = auth.isLoggedIn;

	$scope.addQuestion = function(){
		if(!$scope.title || $scope.title === '') { return; }

		questions.create({
			'title': $scope.title,
			'link': $scope.link,
			'body': $scope.body,
		});

		$window.socket.emit('pushQuestions');

		$scope.title = '';
		$scope.link = '';
		$scope.body = '';
	}
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

app.controller('NavCtrl', ['$scope', 'auth', '$window', function($scope, auth, $window){
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
	$scope.rooms;

	$scope.logOut = function(){
		auth.logout();
	};
}]);

app.controller('SidebarCtrl', ['$scope', 'discussions', '$window', function($scope, discussions, $window){
	discussions.getAll();
	$scope.discussions = discussions.discussions;
	$scope.checkOnline = {
	};

	setTimeout(function(){
		console.log( $scope.discussions );
	}, 2500);

	$window.socket.on('peopleNames', function(people){
		console.log( people );
	});

	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	$window.socket.on('rooms', function(rooms){
		console.log( rooms );
		$scope.rooms = rooms;
		$scope.checkOnline = {
		};

		for(var i=0;i<$scope.discussions.length;i++){

			console.log( $scope.discussions[i]._id );

			if( typeof rooms[$scope.discussions[i]._id] !== 'undefined' ){
				$scope.checkOnline[$scope.discussions[i]._id] = Object.size( rooms[$scope.discussions[i]._id].sockets )
			} else {
				$scope.checkOnline[$scope.discussions[i]._id] = 0;
			}
		}

		console.log( $scope.checkOnline );
		$scope.$apply();

		//$scope.$apply();

		/*if( typeof rooms['574431e569f996b84cd3fc06'] !== 'undefined' ){
			console.log( 'lel' );
			console.log( Object.size( rooms['574431e569f996b84cd3fc06'].sockets ) );
		}*/
	});
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
		.state('discussion', {
			url: '/discussion/{id}',
			templateUrl: '/discussion.html',
			controller: 'DiscussionCtrl',
			resolve: {
				discussion: ['$stateParams', 'discussions', function($stateParams, discussions) {
					return discussions.get($stateParams.id);
				}]
			}
		})
		.state('addQuestion', {
			url: '/addQuestion',
			templateUrl: '/addQuestion.html',
			controller: 'AddqCtrl'
		})
		.state('addDiscussion', {
			url: '/addDiscussion',
			templateUrl: '/addDiscussion.html',
			controller: 'AddDiscussionCtrl'
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
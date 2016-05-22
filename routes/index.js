var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var Question = mongoose.model('Question');
var Answer = mongoose.model('Answer');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/question', function(req,res,next){
	Question.find(function(err, question){
		if(err){ return next(err); }

		res.json(question);
	});
});

router.post('/question', auth, function(req,res,next){

	var question = new Question(req.body);
	question.author = req.payload.username;

	question.save(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

router.post('/register', function(req,res,next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields!' });
	}

	var user = new User();
	user.username = req.body.username;
	user.setPassword(req.body.password);

	user.save(function(err){
		if(err){return next(err); }

		return res.json({token: user.generateJWT()})
	});

	/*auth.register = function(user){
		
	};*/
});

router.post('/login', function(req,res,next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields!' });
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			return res.json({token: user.generateJWT()});
		}else{
			return res.status(401).json(info);
		}
	})(req, res, next);
});

// Post Answer to Question
router.post('/question/:question/answers', auth, function(req, res, next) {
  var anwser = new Answer(req.body);
  anwser.question = req.question;

  anwser.save(function(err, anwser){
    if(err){ return next(err); }

    req.question.answers.push(anwser);
    req.question.save(function(err, post) {
      if(err){ return next(err); }

      res.json(anwser);
    });
  });
});

// Build Question Param
router.param('question', function(req,res,next,id){
	var query = Question.findById(id);

	query.exec(function(err,question){
		if(err){ return next(err); }
		if(!question){ return next(new Error('Can\'t find post...')); }

		req.question = question;
		return next();
	});
});

// Build Answer Param
router.param('answer', function(req,res,next,id){
	var query = Answer.findById(id);

	query.exec(function(err,answer){
		if(err){ return next(err); }
		if(!answer){ return next(new Error('Can\'t find post...')); }

		req.answer = answer;
		return next();
	});
});

// Return single Question (with comments :)
router.get('/question/:question', function(req,res){

	req.question.populate('answers', function(err, question){
		if( err ) { return next(err); }
		res.json(question);
	});
});


router.put('/question/:question/upvote', auth, function(req,res,next){

	req.question.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Upvote Answer of Question
router.put('/question/:question/answers/:answer/upvote', auth, function(req,res,next){
	req.answer.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Downvote Question
router.put('/question/:question/downvote', auth, function(req,res,next){
	req.question.downvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Downvote Answer of Question
router.put('/question/:question/answers/:answer/downvote', auth, function(req,res,next){
	req.answer.downvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

module.exports = router;

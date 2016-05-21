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
	if(!req.body.username || req.body.passwort){
		return res.status(400).json({message: 'Please fill out all fields!' });
	}

	var user = new User();
	user.username = req.body.username;
	user.setPasswort(req.body.passwort);

	user.save(function(err){
		if(err){return next(err); }

		return res.json({token: user.generateJWT()})
	});

	auth.register = function(user){
		
	};
});

router.post('/login', function(req,res,next){
	if(!req.body.username || req.body.password){
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

router.param('question', function(req,res,next,id){
	var query = Question.findById(id);

	query.exec(function(err,question){
		if(err){ return next(err); }
		if(!question){ return next(new Error('Can\'t find post...')); }

		req.question = question;
		return next();
	});
});

router.get('/question/:question', function(req,res){
	res.json(req.question);
});

router.put('/question/:question/upvote', auth, function(req,res,next){
	req.question.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

router.put('/question/:question/downvote', auth, function(req,res,next){
	req.question.downvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

module.exports = router;

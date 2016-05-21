var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Question = mongoose.model('Question');
var Answer = mongoose.model('Answer');


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

// Post Question
router.post('/question', function(req,res,next){

	var question = new Question(req.body);

	question.save(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Post Answer to Question
router.post('/question/:question/answers', function(req, res, next) {
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

// Upvote Question
router.put('/question/:question/upvote', function(req,res,next){
	req.question.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Upvote Answer of Question
router.put('/question/:question/answers/:answer/upvote', function(req,res,next){
	req.answer.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(answer);
	});
});

// Downvote Question
router.put('/question/:question/downvote', function(req,res,next){
	req.question.downvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

// Downvote Answer of Question
router.put('/question/:question/answers/:answer/downvote', function(req,res,next){
	req.answer.downvote(function(err,question){
		if(err){ return next(err); }

		res.json(answer);
	});
});

module.exports = router;

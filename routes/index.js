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

router.post('/question', function(req,res,next){

	var question = new Question(req.body);

	question.save(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
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

router.put('/question/:question/upvote', function(req,res,next){
	req.question.upvote(function(err,question){
		if(err){ return next(err); }

		res.json(question);
	});
});

module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var Question = mongoose.model('Question');
var Answer = mongoose.model('Answer');
var User = mongoose.model('User');
var Discussion = mongoose.model('Discussion');

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

router.get('/discussion', function(req, res, next){
	Discussion.find(function(err, discussion){
		if(err){ return next(err); }

		res.json(discussion);
	});
});

router.post('/discussion', auth, function(req,res,next){

	var discussion = new Discussion(req.body);
	discussion.author = req.payload.username;
	discussion.owner = req.payload._id;
	discussion.location = req.payload.location;
	// En hier moeten we de vraag nog aan een discussie toevoegen... ? 

	discussion.save(function(err,question){
		if(err){ return next(err); }

		res.json(discussion);
	});
});

router.post('/question', auth, function(req,res,next){

	var question = new Question(req.body);
	question.author = req.payload.username;
	question.owner = req.payload._id;
	// En hier moeten we de vraag nog aan een discussie toevoegen... ? 

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
			console.log(JSON.stringify(user, null, 4));
			return res.json({token: user.generateJWT()});
		}else{
			return res.status(401).json(info);
		}
	})(req, res, next);
});

// Post Question to Discussion
router.post('/discussion/:discussion/questions', auth, function(req, res, next) {
  var question = new Question(req.body);
  question.discussion = req.discussion;
  question.owner = req.payload._id;
  question.author = req.payload.username;

  question.save(function(err, question){
    if(err){ return next(err); }

    req.discussion.questions.push(question);
    req.discussion.save(function(err, post) {
      if(err){ return next(err); }

      res.json(question);
    });
  });
});

// Post Answer to Question
router.post('/question/:question/answers', auth, function(req, res, next) {
  var answer = new Answer(req.body);
  answer.question = req.question;
  answer.owner = req.payload._id;
  answer.author = req.payload.username;


  answer.save(function(err, anwser){
    if(err){ return next(err); }

    req.question.answers.push(anwser);
    req.question.save(function(err, post) {
      if(err){ return next(err); }

      res.json(answer);
    });
  });
});

// Build Discussion Param
router.param('discussion', function(req,res,next,id){
	var query = Discussion.findById(id);

	query.exec(function(err,discussion){
		if(err){ return next(err); }
		if(!discussion){ return next(new Error('Can\'t find post...')); }

		req.discussion = discussion;
		return next();
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

// Return single Discussion (with questions and commennt? ) :)
/*router.get('/discussion/:discussion', function(req,res){

	req.discussion.populate('questions', function(err, discussion){
		if( err ) { return next(err); }
		res.json(discussion);
	});
});*/

router.get('/discussion/:discussion', function(req,res){

	req.discussion.populate({
		path: 'questions',
		populate: { 
			path: 'answers',
			populate: {
				path: 'question',
				populate: {
					path: 'discussion'
				}
			}
		}
	}, function(err, discussion){
		if( err ) { return next(err); }
		res.json(discussion);
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

// Delete antwoord
router.put('/answer/:answer', auth, function(req, res, next){

	console.log(JSON.stringify(req.body, null, 4));
	//console.log(JSON.stringify(, null, 4));

	Discussion.find(req.body.discussion, function(err, discussion){
		if( err ) { return next(err); }

		//console.log(JSON.stringify(discussion[0].owner, null, 4));
		//console.log(JSON.stringify(req.payload._id, null, 4));

		// Check if discussion owner is the same :D
		if( discussion[0].owner != req.payload._id ){
			return res.status(401).json({message: 'You\'re not the owner of this discussion!' });
		} else {
			req.answer.remove(function(err,question){
				if(err){ return next(err); }

				res.json(question);
			});
		}
	});

	
});


module.exports = router;

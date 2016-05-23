var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
	body: String,
	author: String,
	owner: String,
	upvotes: {type: Number, default: 0},
	question: [{type: mongoose.Schema.Types.ObjectId, ref:'Question'}]
});

AnswerSchema.methods.upvote = function(cb){
	this.upvotes += 1;
	this.save(cb);
}

AnswerSchema.methods.downvote = function(cb){
	this.upvotes -= 1;
	this.save(cb);
}

mongoose.model('Answer', AnswerSchema);
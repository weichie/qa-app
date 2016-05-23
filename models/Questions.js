var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
	title: String,
	body: String,
	link: String,
	closed: Number,
	owner: String,
	author: String,
	upvotes: {type: Number, default: 0},
	answers: [{type:mongoose.Schema.Types.ObjectId, ref:'Answer'}]
});

QuestionSchema.methods.upvote = function(cb){
	this.upvotes += 1;
	this.save(cb);
}

QuestionSchema.methods.downvote = function(cb){
	this.upvotes -= 1;
	this.save(cb);
}

mongoose.model('Question', QuestionSchema);
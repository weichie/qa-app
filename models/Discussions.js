var mongoose = require('mongoose');

var DiscussionSchema = new mongoose.Schema({
	title: String,
	closed: Number,
	owner: String,
	author: String,
	location: String,
	questions: [{type:mongoose.Schema.Types.ObjectId, ref:'Question'}],
	upvotes: {type: Number, default: 0},
});

DiscussionSchema.methods.upvote = function(cb){
	this.upvotes += 1;
	this.save(cb);
}

DiscussionSchema.methods.downvote = function(cb){
	this.upvotes -= 1;
	this.save(cb);
}

mongoose.model('Discussion', DiscussionSchema);
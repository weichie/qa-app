var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
	title: String,
	body: String,
	link: String,
	upvotes: {type: Number, default: 0},
	comments: [{type:mongoose.Schema.Types.ObjectId, ref:'Answer'}]
});

QuestionSchema.methods.upvote = function(cb){
	this.upvotes += 1;
	this.save(cb);
}

mongoose.model('Question', QuestionSchema);
var mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	comments: [{type:mongoose.Schema.Types.ObjectId, ref:'Answer'}]
});

mongoose.model('Question', QuestionSchema);
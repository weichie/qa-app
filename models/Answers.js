var mongoose = require('mongoose');

var AnswerSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: {type: Number, default: 0},
	post: [{type: mongoose.Schema.Types.ObjectId, ref:'Question'}]
});

mongoose.model('Answer', AnswerSchema);
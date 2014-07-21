var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	account: String,
	fname: String,
	mname: String,
	lname: String,
});
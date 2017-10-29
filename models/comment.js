var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commentSchema = new mongoose.Schema({
    name: String,
    comment: String,
    created: {type: Date, default: Date.now}
})

module.exports = mongoose.model("Comment", commentSchema)

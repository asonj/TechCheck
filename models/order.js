var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var orderSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'}, //referencing the User model's ID
    cart: {type: Object, required: true},
    name: {type: String, required: true},
    idNum: {type: String, default: ""},
    email: {type: String, required: true},
    number: {type: String, required: true},
    initials: {type: String, required: true},
    comment: {type: String, required: false},
    status: {type: String, default: "pending"},
    created: {type: Date, default: Date.now},
    returnDate: {type: String, default: Date.now},
    reserveDate: {type: String, default: ""},
    reservation: {type: Boolean, default: false}
    
})

module.exports = mongoose.model("Order", orderSchema)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var itemSchema = new mongoose.Schema({
    name: String,
    brand: String,
    quantity: Number,
    category: {type: String, default: "none"},
    image: {type: String, default: "assets/placerImage.png"},
    created: {type: Date, default: Date.now},
    quantityTally: {type: Number, default: 0},
    description: {type: String, default: ""},
    lastChecked: {type: String, default: Date.now()},
    inOrders: Array
})

module.exports = mongoose.model("Item", itemSchema)

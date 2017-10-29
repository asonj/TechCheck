// constructor function

module.exports = function Cart(oldCart) {
    //get old cart data to update
    this.items = oldCart.items || {}; 
    this.totalQty = oldCart.totalQty || 0;
    
    //add a new item
    this.add = function(item, id, qtyRequested){
        var storedItem = this.items[id];
        //if item does not exist, add to cart
        if(!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0};
        }
        storedItem.qty += qtyRequested;
        this.totalQty += qtyRequested;
    }
    
    
    this.remove = function(id) {
        this.totalQty -= this.items[id].qty;
        delete this.items[id];
        return;
    }
    
    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}
var express = require('express');
var app = express();
var passport = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();

app.use(csrfProtection);

var Cart = require('../models/cart.js');
var Order = require('../models/order.js');
var Item = require('../models/item.js');
var Comment = require('../models/comment.js');

////////////////////////////
///                      ///
///         USERS        /// 
///                      ///
////////////////////////////


app.get('/logout', function(req,res,next) {
    req.logout();
    res.redirect('/');
})

app.get('/profile', isLoggedIn, function(req, res){
    Order.find({user: req.user}, function(err, orders) {
        if(err){
            console.log(err)
        }
        var cart;
        orders.forEach(function(order){
           cart = new Cart(order.cart); 
           order.items = cart.generateArray();
        });
        res.render("user/profile", {title: "Profile", orders: orders})
    })
})
app.post("/orders/update", isLoggedIn, checkAdmin, function(req, res) {
    var status = req.body.status;
    var orderId = req.body.orderId ;
    Order.findByIdAndUpdate(orderId, {status: status}, null, function(err, order) {
        if(err){
            console.log(err)
        } else{
            if(order.reservation && status == "out"){
                order.reservation = false;
                order.save();
                SubStock(order)
            } else if(order.reservation && status =="cancelled") {
                order.reservation = false;
                order.save();
                pullOrder(order);
            } else if(status == "returned" || status == "cancelled") {
                order.reservation = false;
                order.save();
                AddStock(order);
            }
        }
    })
    
})


app.get('/orders', isLoggedIn, checkAdmin, function(req, res){
    Order.find({}, function(err, orders) {
        if(err){
            console.log(err)
        }
        var cart;
        orders.forEach(function(order){
           cart = new Cart(order.cart); 
           order.items = cart.generateArray();
        });
        
        //turn object into array and reverse to show correctly on order view
        var arr = Object.values(orders).reverse()
        
        res.render("user/orders", {title: "Orders", orders: arr, csrfToken: req.csrfToken()})
    })
})

//UPDATE order 
app.put("/orders/:id", isLoggedIn, checkAdmin, function(req,res){
    var name = req.sanitize(req.body.order.name);
    var idNum = req.body.order.idNum;
    var email = req.body.order.email;
    var phone = req.body.order.phone;
    var returnDate = req.body.order.returnDate;
    var comment = req.body.order.comment;
    var reserveDate = req.body.order.reserveDate;
    var newOrder = {
        name,
        idNum,
        email,
        phone,
        returnDate,
        reserveDate,
        comment
    }
    
    Order.findByIdAndUpdate(req.params.id, newOrder, function(err, item){
        if(err){
            res.redirect("/")
        } else {
            res.redirect("/user/orders")
        }
    })
})

//EDIT order
app.get('/orders/:id/edit', isLoggedIn, checkAdmin, function(req, res){
    var orderId = req.params.id;
    Order.findById(orderId, function(err, order) {
        if(err){
            console.log(err)
        }
        res.render("user/order-edit", {
            title: "Order Edit", 
            order: order, 
            csrfToken: req.csrfToken()})
            
    })
})

app.delete("/orders/:id", function(req,res){
    Order.findByIdAndRemove(req.params.id,  function(err, item) {
        if(err){
            console.log(err)
        }
        res.redirect(302, "/user/orders")
    })
})


//CHECK IF NOT LOGGED IN BELOW
app.use('/', notLoggedIn, function(req, res, next) {
    next();
});

app.get('/sign-up',function(req,res, next){
    var messages = req.flash('error');
    res.render('user/signup', {
        title: 'Sign Up to TechCheck',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
        
    })
})

app.post('/sign-up', passport.authenticate('local.signup', {
    failureRedirect: '/user/sign-up',
    failureFlash: true
}), setAdmin, function(req, res, next) { //if login is successful
    if (req.session.fromUrl) {
        var oldUrl = req.session.fromUrl
        req.session.fromUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/')
}});

app.get('/login', function(req,res,next) {
    var messages = req.flash('error');
    res.render('user/login', {
        title: 'Login to TechCheck',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
        
    });
});

app.post('/login', passport.authenticate('local.signin', {
    failureRedirect: '/user/login',
    failureFlash: true
}), setAdmin, function(req, res, next) { //if login is successful
    if(req.session.admin){
        res.redirect('/')
    } else {
        res.redirect('/')
    }
});


///COMMENTS

app.post('/post', isLoggedIn, function(req, res, next){
    var comment = req.body.comment;
    var name = req.body.name;
    var id = req.body.id;
    
    Comment.create({
        comment,
        name
    }, function(err, comment){
        var data = {
            comment: comment,
            name: name,
            id: comment._id
        }
        res.json(data);
    })
})




module.exports = app;

// My Middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login')
}

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login')
}

function setAdmin(req, res, next) {
      var email = req.user.email || req.body.email;
    
      if (email == process.env.ADMIN_EMAIL) { 
        req.session.admin = true;
      } else {
        req.session.admin = false;
      }

      next();
}

function checkAdmin(req, res, next) {
      var email = req.user.email;
    
      if (email == process.env.ADMIN_EMAIL) { 
        next()
      } else {
        res.redirect('/')
      }
}

function SubStock(order) {
    //SUBTRACT reserved items from inventory stock
    Object.entries(order.cart.items).forEach(function(item, index){
       
        var productId = item[0];
        var quantityChecked = item[1].qty;
        var quantityStocked = item[1].item.quantity;
        var newStock = quantityStocked - quantityChecked;

        Item.findByIdAndUpdate(productId, {
            $pull: {inOrders: order._id},
            $set: {quantity: newStock}
        },{upsert: true}, function(err, item) {
            if(err) {
                console.log(err)
            } else {
                // item.quantity = newStock;
                item.save();   
            }
        })
    })
}

function AddStock(order) {
    //ADD returned items back to inventory stock
    Object.entries(order.cart.items).forEach(function(item, index){
        
        var productId = item[0];
        var quantityChecked = item[1].qty;
        var quantityStocked;
        var newStock;
        
        Item.findById(productId, function(err, item) {
            if(err) {
                console.log(err)
            } else {
                
                quantityStocked = item.quantity;
                newStock = quantityStocked + quantityChecked;
                item.quantity = newStock;
                item.save();
            }
        })
        
        Item.findByIdAndUpdate(productId, {
            $pull: {inOrders: order._id}
        }, function(err, item) {
            if(err) {
                console.log(err)
            } else {
                item.save();   
            }
        })
    })
}

function pullOrder(order){
    Object.entries(order.cart.items).forEach(function(item, index){
        var productId = item[0];
        
        Item.findByIdAndUpdate(productId, {
                $pull: {inOrders: order._id}
            },{upsert: true}, function(err, item) {
                if(err) {
                    console.log(err)
                } else {
                    item.save();   
                }
            })
    })
}
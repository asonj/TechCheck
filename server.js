const express = require("express");
const app = express();
const path = require('path');
require("babel-polyfill");
require('dotenv').config()
const expressSanitizer = require('express-sanitizer'); //to be replaced with validator
const bodyParser = require('body-parser');
const request = require("request");
const cookieParser = require('cookie-parser');
const sm = require('sitemap');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const xml = require('xml');
const csrf = require('csurf');
const csrfProtection = csrf();
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const debug = require('debug')('app');
const PORT = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'production';


//MODELS
const Item = require('./models/item.js');
const Cart = require('./models/cart.js');
const Order = require('./models/order.js');
const Comment = require('./models/comment.js');

//ROUTES
const userRoutes = require('./routes/user')

if(env === "production"){
    app.use(express.static(path.join(__dirname, 'dist')));
} else {
    app.use(express.static(path.join(__dirname, 'dev')));
}


////////////////////////////
///                      ///
///        CONFIG        /// 
///                      ///
////////////////////////////

mongoose.connect(process.env.MONGO_IP, { useMongoClient: true })


app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());
app.use(expressSanitizer());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }), 
    cookie: {maxAge: 180 * 60 * 1000 } //expire session in 180 minutes
}));
app.use(csrfProtection);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

require('./config/passport');

app.use('/scripts', express.static('node_modules'));



//set global variables using res.locals
app.use(function(req, res, next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes)

////////////////////////////
///                      ///
///        ROUTES        /// 
///                      ///
////////////////////////////

app.use(isLoggedIn, function(req,res,next){
    next()
})

//INDEX Route
app.get("/", isLoggedIn, function(req,res){
    var messages = req.flash('success')
    // debug(process.env.MONGO_IP)
    Item.find({}, function(err, items){
        if(err){
            console.log(err)
        } else {
            Comment.find({}, function(err, comments){ 
                
                //create and reverse array of comments (to be shown in descending order)
                var commentsReversed = [...comments].reverse()
                if(err){
                    console.log(err)
                } else {
                    res.render("index", {
                        items: items, 
                        title: "Home", 
                        messages: messages,
                        comments: commentsReversed,
                        hasErrors: messages.length > 0,
                        csrfToken: req.csrfToken()
                    }) 
                }
            })
        }
    })
});

app.post("/add-to-cart/:id", function(req, res, next) {
    var productId = req.params.id;
    res.locals.quantityReq = parseInt(req.body.quantity);
    
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Item.findById(productId, function(err, item){
        var quantityStocked = item.quantity;
        if(err){
            return res.redirect('/');
        }
        // if(res.locals.quantityReq > quantityStocked){
        //     req.flash('error', 'Insufficient Stock');
        //     res.redirect('/items/' + productId)
        // } 
        else {
            cart.add(item, item.id, res.locals.quantityReq);
            req.session.cart = cart;
            console.log(cart)
            res.redirect('/');
        }
    })
});

app.get("/remove/:id", function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    cart.remove(productId);
    req.session.cart = cart;
    res.redirect("/shopping-cart");
});

app.get("/shopping-cart", function(req, res, next) {
    var messages = req.flash('error')
    if (!req.session.cart) {
        res.render("shop/shopping-cart", {
            title: "TechCheck - Shopping Cart", 
            hasErrors: false, 
            items: undefined
        });
    } else {
        var cart = new Cart(req.session.cart);
        res.render("shop/shopping-cart", {
            title: "TechCheck - Shopping Cart", 
            items: cart.generateArray(), 
            messages: messages,
            hasErrors: messages.length > 0,
            csrfToken: req.csrfToken()
        })
    }
});

app.get("/checkout", isLoggedIn, function(req, res, next) {
    var messages = req.flash('error')
    
    if (!req.session.cart) {
        res.redirect("/shop/shopping-cart")   
    }
    var cart = new Cart(req.session.cart);
    res.render("shop/checkout", {
        title: "Checkout", 
        messages: messages,
        hasErrors: messages.length > 0,
        csrfToken: req.csrfToken(), 
        cart: cart.generateArray()
    });
});


app.post("/checkout", isReserved, updateInObject, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect("/shop/shopping-cart")   
    }
    
    var cart = req.session.cart;
    var orderIds = res.locals.orderid;
    var orders = res.locals.order;
    var itterated = 0;
    var arr = [];
    //count array length to know when forEach loop is finished below 
    for (var id in cart.items) {
        arr.push(cart.items[id]);
    }
    
    Object.entries(cart.items).forEach(function(item){
        orderIds.forEach(function(orderid){
            Item.findByIdAndUpdate(item[0], {$push: {inOrders: orderid}}, {new: true}, function(err, item){
                if(err){
                    console.log(err) 
                }
                itterated++;
                if(itterated == arr.length){
                    Order.collection.insert(orders, function(err, result) {
                        if(err){
                            console.log(err)
                        }
                        req.flash('success', 'Items succesfully reserved.');
                        req.session.cart = null;
                        res.redirect("/");
                    })
                }
                    
            })
        })
    })
})



////////////////////////////
///                      ///
///         ITEMS        /// 
///                      ///
////////////////////////////
app.get("/items/new", checkAdmin, function(req,res){
    res.render("item-new", {title: "Add Item", csrfToken: req.csrfToken()})
});

//CREATE Route
app.post("/items", checkAdmin, function(req,res){
    var name = req.sanitize(req.body.item.name);
    var brand = req.body.item.brand;
    var quantity = req.body.item.quantity;
    var category = req.body.item.category;
    var description = req.body.item.description;
    var image = req.body.item.image != "" ? req.body.item.image : "assets/placerImage.png";
    var newItem = {
        name,
        brand,
        quantity,
        category,
        description,
        image
    }
    
    Item.create(newItem, function(err, item){
        if(err){
            console.log(err)
        } else {
            res.redirect("/")
        }
    })
})

//SHOW Route
app.get("/items/:id", function(req,res, next){
    var messages = req.flash('error')
    var orderArr = [];
    var itterated = 0;
    
    Item.findById(req.params.id, function(err, item){
        if(err){
            console.log(err)
        } else {
            if(item.inOrders.length != 0){
                item.inOrders.forEach(function(orderId, i) {
                    Order.findById(orderId, function(err, order){
                        if(err){
                            console.log(err);
                        } else {
                            //not null
                            itterated++;
                            if(order){
                                var qty = order.cart.items[req.params.id].qty;
                                var reserveDate = order.reserveDate;
                                var name = order.name;
                                orderArr.push({qty, reserveDate, name})
                                if(itterated >= item.inOrders.length){
                                    res.render("item", {
                                        title: item.name + " info", 
                                        item: item, 
                                        orders: orderArr,
                                        messages: messages,
                                        hasErrors: messages.length > 0,
                                        csrfToken: req.csrfToken()
                                    })
                                }
                            } else {
                                if(itterated >= item.inOrders.length){
                                    res.render("item", {
                                        title: item.name + " info", 
                                        item: item, 
                                        orders: orderArr,
                                        messages: messages,
                                        hasErrors: messages.length > 0,
                                        csrfToken: req.csrfToken()
                                    })
                                }
                            }
                        }
                    })
                })
            } else {
                 res.render("item", {
                    title: item.name + " info", 
                    item: item, 
                    messages: messages,
                    hasErrors: messages.length > 0,
                    csrfToken: req.csrfToken()
                })
            }
        }
    })
})



//EDIT Route
app.get("/items/:id/edit", function(req,res){
    Item.findById(req.params.id, function(err, item){
        if(err){
            console.log(err)
        } else {
            res.render("item-edit", {title: item.name + " edit", item: item, csrfToken: req.csrfToken()})
        }
    })
})

//UPDATE Route 
app.put("/items/:id", function(req,res){
    var name = req.sanitize(req.body.item.name);
    var brand = req.body.item.brand;
    var quantity = req.body.item.quantity;
    var category = req.body.item.category;
    var image = req.body.item.image != "" ? req.body.item.image : "assets/placerImage.png";
    var description = req.body.item.description;
    var newItem = {
        name,
        brand,
        quantity,
        category,
        image,
        description
    }
    
    Item.findByIdAndUpdate(req.params.id, newItem, function(err, item){
        if(err){
            res.redirect("/")
        } else {
            res.redirect("/items/" + req.params.id)
        }
    })
})

//DELETE Route
app.delete("/items/:id", function(req,res){
    Item.findByIdAndRemove(req.params.id,  function(err, item) {
        if(err){
            console.log(err)
        }
        res.redirect(302, "/")
    })
})


app.get("/stats", function(req, res) {
    Item.find({}, function(err, items){
        if(err){
            console.log(err)
        } else {
            res.render("stats", {
                items: items, 
                title: "Stats"
            })
        }
    })
})



app.get("/process",function(req,res){
    if(env === "production"){
        res.end("production")
    } else {
        res.end("dev")
    }
})

//SITEMAP
// var staticUrls = ['/']

// var sitemap = sm.createSitemap({
//     hostname: '',
//     urls: staticUrls
// });

// app.get('/sitemap.xml', function(req, res) {
//   sitemap.toXML( function (err, xml) {
//       if (err) {
//         return res.status(500).end();
//       }
//       res.header('Content-Type', 'application/xml');
//       res.send( xml );
//   });
// });
//end SITEMAP


// handle 404 requests.
app.use("*",function(req,res) {
  res.status(404).send("404 page does not exist");
})

//START SERVER
app.listen(PORT, function(){
  console.info("Server started on port " + PORT + " in " + env + " mode");
});

// Custom Middleware

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    // req.session.fromUrl = req.url; //save the incoming URL to that user can be redirected
    res.redirect('/user/login')
}

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login')
}

function checkAdmin(req, res, next) {
      var email = req.user.email;
    
      if (email == process.env.ADMIN_EMAIL) { 
        next()
      } else {
        res.redirect('/')
      }
}

function updateStock(req, res, next) {
    //Update stock quanties in DB
    var cart = new Cart(req.session.cart)
    var itterated = 0;

    Object.entries(cart.items).forEach(function(item){
        var productId = item[0];
        var quantityChecked = item[1].qty;
        var quantityStocked = item[1].item.quantity
        var newStock = quantityStocked - quantityChecked;
        
        Item.findById(productId, function(err, item) {
            if(err) {
                console.log(err);
            } else {
                item.quantity = newStock;
                item.quantityTally += quantityChecked;
                item.lastChecked = new Date(Date.now()).toLocaleString();
                item.save();
                itterated ++;
            }
            //Only call next once loop is complete
            if(itterated == cart.generateArray().length){
                next(req, res)
            }
        })
    })
}

function updateInObject(req,res,next ){
    
    var cart = req.session.cart
    res.locals.order = [];
    res.locals.orderid = [];
    var reserveDates = req.body.reserveDate.split(',')
    var itterated = 0;
    reserveDates.forEach(function(reserveDate, i) {
        itterated++;
        var order = new Order({
          user: req.user, //passport creates this user object 
          cart: cart,
          name: req.body.name,
          idNum: req.body.idNum,
          email: req.body.email,
          number: req.body.number,
          initials: req.body.initials,
          comment: req.body.comments != "" ? req.body.comments : "",
          returnDate: req.body.returnDate,
          //Reserve date will be a string of comma-seperated dates 
          reserveDate: reserveDates[i],
          reservation: req.body.reservation == "on" ? true : false
        });
        res.locals.orderid.push(order._id);
        res.locals.order.push(order);
        // console.log(res.locals.order)
        if(itterated == reserveDates.length){
            if(order.reservation){
                next(req, res)
            } else {
                //otherwise save
                Order.collection.insert(res.locals.order, function(err, doc) {
                    if(err){
                        console.log(err)
                    }
                    req.flash('success', 'Order submitted successfully');
                    req.session.cart = null;
                    res.redirect("/");
                })
            
            }
        }
    })
}

function setInOrderID(req, res){
    var cart = req.session.cart;
    var orderIds = res.locals.orderid;
    var orders = res.locals.order;
    var itterated = 0;
    var arr = [];
    //count array length to know when forEach loop is finished below
    for (var id in cart.items) {
        arr.push(cart.items[id]);
    }
    Object.entries(cart.items).forEach(function(item){
        orderIds.forEach(function(orderid){
            console.log(orderid)
            Item.findByIdAndUpdate(item[0], {$push: {inOrders: orderid}}, {new: true}, function(err, item){
                if(err){
                    console.log(err) 
                }
                itterated++;
                if(itterated == arr.length){
                    console.log("ITEM \n" + item)
                    Order.collection.insert(orders, function(err, result) {
                        if(err){
                            console.log(err)
                        }
                        req.flash('success', 'Items succesfully reserved.');
                        req.session.cart = null;
                        res.redirect("/");
                    })
                }
                    
            })
        })
    })
}

function checkStock(req, res, next) {
    //Update stock quanties in DB
    var cart = new Cart(req.session.cart)
    var itterated = 0;

    Object.entries(cart.items).forEach(function(item){
        var productId = item[0];
        var quantityChecked = item[1].qty;
        
         Item.findById(productId, function(err, item) {
            if(err) {
                console.log(err);
            } else if(quantityChecked > item.quantity) {
                cart.remove(item._id);
                req.session.cart = cart;
                req.flash('error', 'Insufficient Stock - removed ' + item.name + ` (In Stock: ${item.quantity} In Cart: ${quantityChecked})`);
                return res.redirect('/shopping-cart')
             } else {
                 itterated++;
                 if(itterated == cart.generateArray().length){
                    saveOrder(req, res)
                }
             }
          
        })
    })
}

function saveOrder(req, res, next){
 
    var cart = req.session.cart

    var order = new Order({
      user: req.user, //passport creates this user object 
      cart: cart,
      name: req.body.name,
      idNum: req.body.idNum,
      email: req.body.email,
      number: req.body.number,
      initials: req.body.initials,
      comment: req.body.comments != "" ? req.body.comments : "",
      returnDate: req.body.returnDate,
      reservation: req.body.reservation == "on" ? true : false
    });
        console.log(order)
        // console.log(res.locals.order)

    Order.collection.insert(order, function(err, doc) {
        if(err){
            console.log(err)
        }
        req.flash('success', 'Order submitted successfully');
        req.session.cart = null;
        res.redirect("/");
    })
            
    
}

function isReserved(req, res, next) {
    var reserved = req.body.reservation;
    if(reserved == "on"){
        updateInObject(req, res, setInOrderID)
    } else {
        updateStock(req, res, saveOrder)
    }
}
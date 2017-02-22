// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
var mongojs = require('mongojs');
//var Schema = mongoose.Schema;
var connectionString = 'iris';


// Connect to a collection in the database
var db = mongojs(connectionString, ['irisDetails']);

console.log(db);

db.on('error', function (err) {
    console.log('database error', err);
})

db.on('connect', function () {
    console.log('database connected');
})

/*db.irisDetails.find(function (err, docs) {
  console.log(docs);
})*/



// connect to MongoDB
//mongoose.connect('mongodb://localhost:27017/iris');

/*var irisSchema = new Schema({
    "petal width": Number,
    "petal length": Number,
    "sepal width": Number,
    "sepal length": Number,
    "species": String
});

var Iris = mongoose.model('Iris', irisSchema);*/

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// code to fix the permission issue in Chrome and other browsers
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    db.irisDetails.find({}, {'_id': false}, function (err, docs) {
        res.json(docs);
    })
    //res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

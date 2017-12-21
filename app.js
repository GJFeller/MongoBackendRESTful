var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');
var ensemble = require('./routes/ensemble');


var app = express();

var mongojs = require('mongojs');

var connectionString;
var isLocal = false;
if(isLocal) {
    connectionString = 'ensembleDataSets';
}
else {
    connectionString = "mongodb://admin:admin@ensemble-shard-00-00-38uq3.mongodb.net:27017,ensemble-shard-00-01-38uq3.mongodb.net:27017,ensemble-shard-00-02-38uq3.mongodb.net:27017/ensembleDataSets?ssl=true&replicaSet=Ensemble-shard-0&authSource=admin"
}

var db = mongojs(connectionString);

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

db.on('error', function (err) {
    console.log('database error', err);
})

db.on('connect', function () {
    console.log('database connected');
})

var router = express.Router();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(router);
app.use(express.static(path.join(__dirname, 'public')));

var port = process.env.PORT || 4000;

//app.use('/', index);
//app.use('/users', users);



// development only
/*if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}*/



router.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST","PUT");
    next();
});

router.get('/getVariablesEnsemble/:ensembleId', ensemble.getVariablesEnsemble(db));
router.get('/getAllVariables', ensemble.getAllVariables(db));
router.get('/getAllEnsembles', ensemble.getAllEnsembles(db));
router.get('/getTemporalVarData/:xIdx/:yIdx/:zIdx/:simulationId/:varId/:ensembleId', ensemble.getTemporalVarData(db));
router.get('/getMultivariateData/:xIdx/:yIdx/:zIdx/:time/:simulationId/:varIdList', ensemble.getMultivariateVarData(db));
//router.get('/getMultivariateData', ensemble.getMultivariateVarData(db))


//app.use('/geochemEnsemble', router);
// error handler
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

// APPLICATION  !!!  ---------------------------------------------------------------------------------------------------
router.get('/', router);
// ---------------------------------------------------------------------------------------------------------------------

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});*/

//module.exports = app;
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
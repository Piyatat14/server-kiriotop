// grab the packages we need
var express = require('express'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	path = require('path'),
    app = express();


app.use(express.static(__dirname + '/uploads'));
// parse application/json  middleware
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ 
	extended: true
}));


//dispatching CORS headers for clients can access the data we are exposing
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.end('Server is Running...');

	next();
}

app.use(allowCrossDomain);
app.use('/', require('./routes/index'));

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
	// start the server
	console.log('Server started! At http://localhost:' + app.get('port'));
});

module.exports = app;
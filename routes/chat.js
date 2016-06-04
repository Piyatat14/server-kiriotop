var mysql = require('mysql'),
	strQuery = "",
	/*
	connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "1234",
		database: "kiri_otop"
	});
	*/
	connection = mysql.createConnection({
		host: "us-cdbr-iron-east-04.cleardb.net",
		user: "bb6443716319a5",
		password: "d07d3f2a0fe1967",
		database: "heroku_c492d9ed64b90f3"
	});

connection.connect();

exports.getDataRoomChat = function(req, res, next) {
	console.log('OK getDataRoomChat');
	res.send("Connect Database OK.");
};
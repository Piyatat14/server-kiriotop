var mysql = require('mysql'),
	strQuery = "",
	connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "admin",
		database: "kiri_otop"
	});
	
connection.connect();

var multer = require('multer');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
	
exports.findUser = function(req, res) {
	var emailUser = req.body.username;
	console.log(emailUser);
	strQuery = "SELECT user_info.user_id, user_info.email, user_info.password, user_info.register_date, user_info.user_status, user_profile.first_name, user_profile.last_name, user_profile.user_image FROM user_info LEFT JOIN user_profile ON user_info.user_id = user_profile.user_id WHERE user_info.email=? LIMIT 1";
	connection.query(strQuery, [emailUser], function(err, rows){
		if(err) {
			console.log(err);
			throw err;
		}else {
			if(rows != "") {
				res.send(rows);	
			}else {
				res.send("ERROR");
			}
		}
	});
};

exports.findProfileUser = function(req, res) {
	strQuery = "SELECT profile_id, first_name, last_name, address, tel_no, user_image, can_sell FROM user_profile WHERE user_id=? LIMIT 1";
	connection.query(strQuery, req.body.userID, function(err, rows) {
		if(err) {
			console.log('err');
			throw err;
		}else {										//not error at get data.
			if(rows != '') {						//get data success.
				console.log(rows);
				res.send(rows);
			}else {
				res.send('ERROR');
			}
		}
	});
};

exports.checkRegis = function(req, res) {
	strQuery = "SELECT user_id, email FROM user_info WHERE email=?";
	connection.query(strQuery, req.body.email, function(err, rows){
		if(err) {
			console.log(err);
			throw err;
		}else {
			if(rows != ""){
				res.send("ชื่อผู้ใช้ซ้ำ..กรุณากรอกใหม่");
			}else{
				res.send("Success");
			}
		}
	});
};

exports.insertRegis = function(req, res) {
	var regisData = {
		email : req.body.email,
		password : req.body.encryptPass,
		register_date : new Date(),
		user_status : "ใช้งานได้"
	}
	strQuery = "INSERT INTO user_info SET ?";
	connection.query(strQuery, regisData, function(err, rows){
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send("Success");
		}
	});
};

exports.addImage = function(req, res) {
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './uploads/img');
		},
		filename: function (req, file, cb) {
			console.log("Filename in server : " + file.originalname);
			cb(null, req.body.userID + '-' + file.originalname + '-' + Date.now() + '.jpg'); //Appending mimeType.
		}
	});

	var upload = multer({ storage: storage }).single('image');

	upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      res.send('Error: ' + err.message);
    }
    // Everything went fine
	console.log(req.body);
	console.log(req.file);
	res.send(req.file.filename);				//return filename destination in folder uploads/img in server.
	res.status(204).end();
  })
	
};

exports.insertProfileUser = function(req, res) {
	var profileData = {
		user_id: req.body.userID,
		first_name: req.body.firstname,
		last_name: req.body.lastname,
		address: req.body.address,
		tel_no: req.body.tel,
		user_image: req.body.imageName,
		can_sell: req.body.sell
	}
	strQuery = "INSERT INTO user_profile SET ?";
	connection.query(strQuery, profileData, function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}
		
		var data = {
			profileID: rows.insertId,
			text: 'SUCCESS'
		} 
		//send profile_id after insert data.
		res.send(data);
	})
};

exports.updateProfileUser = function(req, res) {
	var profileData = {
		first_name: req.body.firstname,
		last_name: req.body.lastname,
		address: req.body.address,
		tel_no: req.body.tel,
		user_image: req.body.imageName,
		can_sell: req.body.sell
	}
	strQuery = "UPDATE user_profile SET ? WHERE profile_id = ?";
	connection.query(strQuery, [profileData, req.body.profileID], function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send('SUCCESS');
		}
	});
};

exports.sendPassword = function(req, res) {
	generateCryp(function(err, data) {
		if(err) {
			throw err;
		}
		strQuery = "UPDATE user_info SET password = ? WHERE email = ?";
		connection.query(strQuery, [data, req.body.email], function(err, rows) {
			if(err) {
				console.log(err);
				throw err;
			}else {
				//If update password user succes.
				//If have data. Server send generate password to email user.
				var transporter = nodemailer.createTransport(smtpTransport({
					service: 'gmail',
					auth: {
						user: 'kiriotop.server@gmail.com',
						pass: 'p@ss@dmin9999'
					}
				}));

				var mailOption = {
					from: 'สมาชิก KiriOtop App <kiriotop.server@gmail.com>',
					to: req.body.email,
					subject: 'รหัสผ่านนี้เป็นเพียงรหัสผ่านชั่วคราวเท่านั้น',
					text: 'สวัสดีสมาชิก : ' + req.body.email + ' คุณได้ดำเนินการร้องขอเปลี่ยนรหัสผ่าน  อีเมล์ของคุณคือ : ' + req.body.email + ' รหัสผ่านของคุณคือ : ' + data + ' หลังจากเข้าสู่ระบบเรียบร้อยแล้ว กรุณาทำการเปลี่ยนรหัสผ่านโดยทันที ขอขอบคุณที่ไว้วางใจในการแก้ปัญหาของเรา ผู้ดูแล Kiri-Otop หากมีข้อสงสัยหรือสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ : kiriotop.server@gmail.com',
					html: '<p>สวัสดีสมาชิก : ' + req.body.email +'</p><p>คุณได้ดำเนินการร้องขอเปลี่ยนรหัสผ่าน</p><ul><li>อีเมล์ของคุณคือ : ' + req.body.email + '</li><li>รหัสผ่านของคุณคือ : ' + data + '</li></ul><p>หลังจากเข้าสู่ระบบเรียบร้อยแล้ว กรุณาเปลี่ยนรหัสผ่านโดยทันที</p><br /><br /><br /><p>ขอขอบคุณที่ไว้วางใจในการแก้ปัญหาของเรา</p><p>&nbsp;&nbsp;ผู้ดูแล Kiri-Otop</p><center><p>หากมีข้อสงสัยหรือสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ : kiriotop.server@gmail.com</p></center>'
				}

				transporter.sendMail(mailOption, function(error, info) {
					if(error) {
						console.log(error);
						throw error;
					}else {
						console.log("save password in database and send e-mail success.");
						res.send("SUCCESS");
					}
				});
			}
		});
	});
};

exports.checkPassword = function(req, res) {
	strQuery = "SELECT password FROM user_info WHERE user_id = ?";
	connection.query(strQuery, [req.query.userId], function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send(rows[0]);
		}
	})
};

exports.editPassword = function(req, res) {
	console.log(req.body.encryptPass);
	strQuery = "UPDATE user_info SET password = ? WHERE user_id = ?";
	connection.query(strQuery, [req.body.encryptPass, req.body.userID], function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send("SUCCESS");
		}
	});
};

exports.searchProuct = function(req, res) {
	var name = req.query.prodName;
	var price = parseInt(req.query.prodPrice);
	var twentyPer = parseInt(price*(20/100));
	var bPrice = price-twentyPer;
	var aPrice = price+twentyPer;
	strQuery = "SELECT product.product_id, product.product_name, product.product_price, product.product_rating, product.product_view, product_image.image FROM product LEFT JOIN product_image ON product.product_id = product_image.product_id WHERE product.product_name LIKE ? AND product.product_price >= "+ bPrice +" AND product.product_price <= "+ aPrice;
	connection.query(strQuery, ['%'+name+'%'], function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send(rows);
		}
	});
};

exports.searchProductByName = function(req, res) {
	var name = req.query.prodName;
	strQuery = "SELECT product.product_id, product.product_name, product.product_price, product.product_rating, product.product_view, product_image.image FROM product LEFT JOIN product_image ON product.product_id = product_image.product_id WHERE product.product_name LIKE ?";
	connection.query(strQuery, ['%'+name+'%'], function(err, rows) {
		if(err) {
			console.log(err);
			throw err;
		}else {
			res.send(rows);
		}
	});
};

//function generate data 8 digits.
function generateCryp(callback) {								//call back function.
	//Random Password for send temp password to user in case recovery.
	crypto.randomBytes(4, function(err, buffer) {				//1 byte = 2 digits, 4 byte = 8 digits.
		if(err) {
			throw err;
		}
		console.log("In generate : " + buffer.toString('hex'));
		callback(null, buffer.toString('hex'));
	})
}
/*
function encodeDataHex(data) {
	console.log('data in encode ' + data);
	const cipher = crypto.createCipher('aes192', '');
	
	var encrypted = cipher.update(data, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	console.log(encrypted);
	return encrypted;
}

function decodeDataHex(data) {
	console.log('data in decode ' + data);
	const decipher = crypto.createDecipher('aes192', '');

	var decrypted = decipher.update(data, 'hex', 'utf-8');
	decrypted += decipher.final('utf-8');
	console.log(decrypted);
	return decrypted;
}
*/
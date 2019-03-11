var mysql = require('mysql')

var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'12345678',
	database:'anglogin'
});

connection.connect(function(err){
	if(err){
		console.log("Database connection error")
	}else{
		console.log("Database connected successfully")
	}
});

module.exports = connection
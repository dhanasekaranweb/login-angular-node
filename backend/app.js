const express = require('express')
const bodyparser = require('body-parser')
const config = require('./config.js')
const database = require('./database.js')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const saltRounds = 10
const app = express()

/*cros origin allow*/
app.use(function(req,res,next){
	req.header('Access-Control-Allow-Origin',config.accessControlAllowOrigin)
	req.header('Access-Control-Allow-Headers',config.accessControlAllowHeaders)
	req.header('Access-Control-Allow-Methods',config.accessControlAllowMethods)
	next();
})

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

function checkusername(username){
	return new Promise((resolve,reject) => {
		database.query("select count(*) as tot from users where username = ?",username,function(err,rows,result){
			if(err){
				let response = {
					status:false
				}
				resolve(response)
			}else{
				let count = rows[0].tot
				if(count > 0){
					let response = {
						status : true
					}
					resolve(response)
				}else{
					let response = {
						status: false
					}
					resolve(response)
				}
			}
		})
	})
}

function checkemail(email){
	return new Promise((resolve,reject) => {
		database.query("select count(*) as tot from users where email = ?",email,function(err,rows,result){
			if(err){
				let response = {
					status:false
				}
				resolve(response)
			}else{
				let count = rows[0].tot
				if(count > 0){
					let response = {
						status : true
					}
					resolve(response)
				}else{
					let response = {
						status: false
					}
					resolve(response)
				}
			}
		})
	})
}


function genHashpassword(password){
	return new Promise((resolve,reject) => {
		bcrypt.genSalt(saltRounds, function(err,salt){
			bcrypt.hash(password,salt,function(err,hash){
				resolve(hash)
			})
		})
	})
}

/*
*register function
*post method
*/

app.post("/api/register",(req,res) => {
	const body = req.body
	const username = body.username
	const email = body.email
	const password = body.password
	if(username != "" && email != "" && password != ""){
		/*check username already exists*/
		checkusername(username).then(response => {
			if(response.status == true){
				res.send({
					"status":false,
					"message":"Username already exists",
					"username_exists":true,
					"email_exists":false
				})
			}else{
				/*check email already exists*/
				checkemail(email).then(response => {
					if(response.status == true){
						res.send({
							"status":false,
							"message":"Email already exists",
							"username_exists":false,
							"email_exists":true
						})
					}else{
						/*generate hashed password*/
						genHashpassword(password).then(hash => {
							let insertInfo = {
								username:username,
								email:email,
								password:hash
							}
							database.query("insert into users set ?",insertInfo,function(err,result){
								if(err){
									res.send({
										"status":false,
										"message":"Failed to insert the record",
										"username_exists":false,
										"email_exists":false
									})
								}else{
									res.send({
										"status":true,
										"message":"Insert the record successfully",
										"username_exists":false,
										"email_exists":false
									})
								}
							})
						})
					}
				})
			}
		})
	}else{
		res.send({
			"status":false,
			"message":"Please send required fields"
		})
	}
})

function loginusernamecheck(username){
	return new Promise((resolve,reject) => {
		database.query("select count(*) as tot from users where username = ? or email = ?",[username,username],function(err,rows,result){
			if(err){
				let response = {
					status:false
				}
				resolve(response)
			}else{
				let count = rows[0].tot
				if(count > 0){
					let response = {
						status:true
					}
					resolve(response)
				}else{
					let response = {
						status:false
					}
					resolve(response)
				}
			}
		})
	})
}

function verifyhashpassword(password,hashpass){
	return new Promise((resolve,reject) => {
		bcrypt.compare(password,hashpass,function(err,res){
			resolve(res)
		})
	})
}

function getHashedPassword(username){
	return new Promise((resolve,reject) => {
		database.query("select * from users where username = ? or email = ?",[username,username],function(err,rows,result){
			if(err){
				let response = {
					status:false
				}
				resolve(response)
			}else{
				let result = JSON.parse(JSON.stringify(rows))
				let password = result[0].password
				let response = {
					status:true,
					password:password
				}
				resolve(response)
			}
		})
	})
}

/**
*login function
*post method
**/
app.post("/api/login",(req,res) => {
	const body = req.body
	const username = body.username
	const password = body.password
	if(username != "" && password != ""){
		/*check username or email available*/
		loginusernamecheck(username).then(response => {
			if(response.status == true){
				getHashedPassword(username).then(data => {
					if(data.status == true){
						verifyhashpassword(password,data.password).then(verify => {
							if(verify == true){
								res.send({
									"status":true,
									"message":"Login successful"
								})
							}else{
								res.send({
									"status":false,
									"message":"Password is incorrect"
								})
							}
						})
					}else{
						res.send({
							"status":false,
							"message":"Failed to get the password"
						})
					}
				})
			}else{
				res.send({
					"status":false,
					"message":"No users available in our record"
				})
			}
		})
	}else{
		res.send({
			"status":false,
			"message":"Plase send the required fields"
		})
	}
})

app.listen(config.port, () => {
	console.log("server connected in port " + config.port)
})
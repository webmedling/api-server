'use strict';

const db = require('../../lib/database');
const Crypto = require('crypto');

const dbTable = 'user';
const dbMap = {
	id: 'user_id',
	firstname: 'user_firstname',
	lastname: 'user_lastname',
	email: 'user_email',
	password: 'user_password',
	role: 'user_role',
	salt: 'user_salt'
};

module.exports = class User {
	
	constructor(userData){
		if(userData){
			Object.keys(userData).forEach((val,index,arr)=>{	

										if(dbMap[val]){
											this[val] = userData[val];
										}

									});
		}
		
	}

	async findOne(userId){
	        try {
	            //let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
	            let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
	            this.mapResultToProperties(userDetails[0],dbMap);
	            console.log("Details");
	            console.log(this);
	            return this;
	        } catch (error) {
	            console.log(error);
	        }
	}

	async create(){
			console.log(this);
			try {
	          	let data = await this.isUniqueEmail(this.email);
	          	if(!data){
	            	return {statusCode : 409, message : 'User already exist'};
	          	}else{
	          		//modify password
	          		this.salt = Crypto.randomBytes(16).toString('base64');
	          		console.log (this.salt);
	          		this.password = this.hashPassword(this.password);
	             	let savedUser = await this.save();
	             	if(!savedUser){
	             		return {
		                    statusCode: 500,
		                    message: 'Failed to save user'
		                };
	             	}
	             	return {statusCode : 201, message : 'Sign up successfully'};
	          	}
	        } catch (error) {
	           console.log(error);
	        }
	}

	async isUniqueEmail(email){	
		try {
            let user = await db.query('SELECT * FROM user WHERE user_email=?',email.toLowerCase());
            if (user[0]) {
                return false;
            }
            return true;
        } catch (error) {
        	console.log(error);
	    }
	}

	async save(){
		try{
			let mappedRequest = this.mapToDatabase(dbMap);
			let sql = 'INSERT INTO ' + dbTable + ' (' + Object.keys(mappedRequest).join() + ') VALUES (' + Object.values(mappedRequest).fill('?').join() + ')';
			let saveUser = await db.query(sql,Object.values(this));
			this.id = saveUser.insertId;
			return true;
		} catch (error) {
			console.error(error);
		}
		return userData;
	}

	async authenticate(email,password){
		try {
            //let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
            let userDetails = await db.query('SELECT * FROM user WHERE user_email=?',email.toLowerCase());
            this.mapResultToProperties(userDetails[0],dbMap);
            if(!userDetails[0] || !this.validatePassword(password)){
            	return {
                    statusCode: 401,
                    message: 'Invalid username or password'
                };
            };
            return { statusCode: 200 };
        } catch (error) {
            console.log(error);
        }
	}

	validatePassword(submittedPassword){
		return this.hashPassword(submittedPassword) === this.password;
	}

	hashPassword(pwd){
		
		return Crypto.pbkdf2Sync(pwd, new Buffer(this.salt, 'base64'), 10000, 64, 'sha512').toString('base64');

	}

	mapToDatabase(mapping){
		let mappedData = {};
		Object.keys(this).forEach((val,index,arr)=>{	

										if(mapping[val]){
											mappedData[mapping[val]] = this[val];
										}

									});
		return mappedData;

	}

	mapResultToProperties(dbResult,mapping){
		//only display info specified in mapping
		let mappedData = {};
		Object.keys(mapping).forEach((val,index,arr)=>{
														
										if(dbResult[mapping[val]]){
											this[val] = dbResult[mapping[val]];
										}

									});
		return true;
	}

}

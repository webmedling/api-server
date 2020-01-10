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
	role: 'user_role'
};

module.exports = class User {
	
	constructor(){

	}

	async findOne(userId){
	        try {
	            //let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
	            let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
	            return userDetails[0];
	        } catch (error) {
	            console.log(error);
	        }
	}

	async create(userData){
			try {
	          	let data = await this.isUniqueEmail(userData.email);
	          	if(!data){
	            	return {statusCode : 409, message : 'User already exist'};
	          	}else{
	          		//modify password
	          		userData.password = this.hashPassword(userData.password);
	             	let savedUser = await this.save(userData);
	             	return {statusCode : 201, message : 'Sign up successfully', user : savedUser};
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

	async save(userData){
		try{
			let mappedRequest = this.mapToDatabase(userData,dbMap);
			let sql = 'INSERT INTO ' + dbTable + ' (' + Object.keys(mappedRequest).join() + ') VALUES (' + Object.values(mappedRequest).fill('?').join() + ')';
			let saveUser = await db.query(sql,Object.values(userData));
			let newUser = await this.findOne(saveUser.insertId);
			let userDetails = this.mapResultToProperties(newUser,dbMap);
			return userDetails;
		} catch (error) {
			console.error(error);
		}
		return userData;
	}

	hashPassword(pwd){
		/*
			TODO: 
			- Add salt to User object.
			- Write salt to DB.
			- Load user properties into object.
		*/
		let salt = Crypto.randomBytes(16).toString('base64');
		return Crypto.pbkdf2Sync(pwd, new Buffer(salt, 'base64'), 10000, 64, 'sha512').toString('base64');

	}

	mapToDatabase(data,mapping){
		let mappedData = {};
		Object.keys(data).forEach((val,index,arr)=>{	

										if(mapping[val]){
											mappedData[mapping[val]] = data[val];
										}

									});
		return mappedData;

	}

	mapResultToProperties(dbResult,mapping){
		//only display info specified in mapping
		let mappedData = {};
		Object.keys(mapping).forEach((val,index,arr)=>{
														
										if(dbResult[mapping[val]]){
											mappedData[val] = dbResult[mapping[val]];
										}

									});
		return mappedData;
	}

}

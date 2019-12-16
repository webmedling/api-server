'use strict';
const db = require('../../lib/database');
const Joi = require('joi');

// Helper method for finding user details can be called from web and mobile api controller.
exports.findUserDetails = async (userId)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            //let userDetails = await db.query('SELECT * FROM user WHERE user_id=?',userId);
            let userDetails = await db.query('SELECT * FROM user WHERE user_id=1',userId);
            return resolve(userDetails[0]);
        } catch (error) {
            return reject(error);
        }
    });
};
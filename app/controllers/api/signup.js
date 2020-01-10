'use strict';
var Boom = require('boom');
var JWT   = require('jsonwebtoken');
const Joi = require('joi');
const Config = require('../../../config/config');
const User = require('../../models/test');
const user = new User();

/* ================================== Controllers for V1 ============================== */

// validate user login.
exports.userSignUp = {
    description: 'Sign up api',
    auth : false,
    validate: {
        payload: {
            email: Joi.string().min(3).email().required(),
            password: Joi.string().min(5).required(),
            confirmPassword: Joi.string().min(5).required(),
            firstname: Joi.string().required(),
            lastname: Joi.string().required()
        },
         failAction: (request, h, error) => {
            // Username, passowrd minimum validation failed
            return h.response({ message: error.details[0].message.replace(/['"]+/g, '') }).code(400).takeover();
        }
    },
    handler: async (request, h) => {
          try {
            // Method define in helper and used by both web and api.
            let password = request.payload.password;
            let confirmPassword = request.payload.confirmPassword;
            let email = request.payload.email;
            let firstname = request.payload.firstname;
            let lastname = request.payload.lastname;
            if (password !== confirmPassword) {
                return h.response({ message : 'Password does not match' }).code(401);
            }
            let userObject = {
                email : email,
                firstname : firstname,
                lastname : lastname,
                password : password
            };
            let data = await user.create(userObject);
            if (data.statusCode === 201) {
                let secret = Config.get('/jwtAuthOptions/key');
                let obj = {
                    userId : data.user.id
                }; // object info you want to sign
                let jwtToken = JWT.sign(obj, secret, { expiresIn: '1 day' });
                data.user.password = undefined;
                data.user.salt = undefined;
                var response = h.response({ message : data.message, user : data.user });
                response.header('Authorization', jwtToken);
                response.code(201);
                return response;
            } else {
                // User not found in database
                return h.response({ message: data.message}).code(data.statusCode);  
            } 
          } catch (error) {
             return error.message;
          }  
    },
    tags: ['api'] //swagger documentation
};


/* ================================== Controllers for V2 ============================== */

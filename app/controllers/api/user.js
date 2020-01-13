'use strict';
const Joi = require('joi');
const User = require('../../models/user');

/* ================================== Controllers for V1 ============================== */


//get admin profile page
exports.getUserDetails = {
    description: 'Returns the dashboard',
    auth: 'jwt',
    handler: async (request, h) => {
        try {
            let userId = request.headers.userId;
            let user = new User();
            let userDetails = await user.findOne(userId);
            user.password = undefined;
            user.salt = undefined;
            return h.response({
                userDetails: userDetails
            }).code(200);
        } catch (error) {
            return error.message;
        }
    },
    tags: ['api'] //swagger documentation
};


/* ================================== Controllers for V2 ============================== */

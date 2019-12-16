'use strict';

exports.plugin = {  
    pkg: require('../../../../package.json'),
    name : 'test_routes_v1',
    register: async (server, options) => {
        const Controllers = {
            test: {
                test: require('../../../controllers/api/test')
            }
        };
        const basePath = '/api/v1/';
        server.route([
            {
                method: 'GET',
                path: basePath + 'test',
                config: Controllers.test.test.getUserDetails
            }
        ]);
    
    }
};

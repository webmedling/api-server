'use strict';

const Mysql = require('mysql');  // include the mysql plugin

exports.plugin = {
    register: (plugin, options) => {
        const connection = Mysql.createConnection({
            host     : options.host,
            user     : options.user,
            password : options.password,
            database : options.database
        });
        connection.connect(function(err) {
            if (err) {
                console.error('Error connecting Mysql: ' + err.stack);
                return;
            } else{
                console.log('Mysql started');
            }
        });
        exports.query = function sql(query,variables){
            return new Promise(async (resolve,reject)=>{
                connection.query(query, variables, function (err, results, fields) {
                    if (err) {
                       console.log('error', err);
                       return resolve({
                            sent: false,
                            message: err
                        });
                    }
                    return resolve(results);
                });
            });
        };
        

    },
   //pkg: require('../package.json'),
    name : 'database'
};
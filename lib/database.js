'use strict';

const Mysql = require('mysql');  // include the mysql plugin

exports.plugin = {
    register: (plugin, options) => {
        const pool = Mysql.createPool({
            connectionLimit : options.maxconnections,
            host     : options.host,
            user     : options.user,
            password : options.password,
            database : options.database
        });
      
        exports.query = function sql(query,variables){
            return new Promise(async (resolve,reject)=>{
                pool.getConnection(function(err, connection) {
                    if (err) throw err; // not connected!
                    // Use the connection
                    connection.query(query, variables, function (err, results, fields) {
                        // When done with the connection, release it.
                        connection.release();
                     
                        // Handle error after the release.
                        if (err) {
                           console.log('error', err);
                           return resolve({
                                sent: false,
                                message: err
                            });
                        }
                        return resolve(results);
                 
                    // Don't use the connection here, it has been returned to the pool.
                    });
                });
            });
        };

        pool.on('acquire', function (connection) {
            console.log('Connection %d acquired', connection.threadId);
        });
        
        pool.on('connection', function (connection) {
            console.log('Connection %d created', connection.threadId);
        });

        pool.on('enqueue', function () {
            console.log('Waiting for connection.');
        });

        pool.on('release', function (connection) {
            console.log('Connection %d released', connection.threadId);
        });

        process.on('SIGINT', function() {
            pool.end(function (err) {
                if (err) throw err;
                console.log('Mysql Database disconnected through app termination');
                process.exit(0);
            });
        });

    },
    //pkg: require('../package.json'),
    name : 'database'
};
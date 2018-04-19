var LABPROJECT_BASE = process.cwd();
var LABPROJECT_LIB = LABPROJECT_BASE + "/lib";

var mongodb = require('mongodb');
var mongoclient = mongodb.MongoClient;
var mongostring = require(LABPROJECT_BASE + '/config').database_connection_string;

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

// Holds the database connection
var db_connection = null;

function get_connection(callback) {

    if (db_connection===null) {
        mongoclient.connect(mongostring, function(m_error, db) {
            if (!m_error) {
                db_connection = db;
                callback(null, db_connection)
            }else{
                callback(m_error, null);
            }
        });
    }else{
        callback(null, db_connection);
    }
}

module.exports = {
    setup: function(callback) {
        get_connection(function(m_error, db) {

            var collection_id_map = {
                "test": "id",
                "sessions": "session_id",
                "users": "username",
                "disks": "disk_id",
                "labs": "lab_id",
                "permissions": "username",
                'groups': "groupname",
                'registered_devices': "uuid",
                'allocated_devices': "uuid",
                'allocated_labs': "lab_id",
                'interfaces': 'interface_name',
                'states': "state_name",
                'isos': "iso_id"
            };

            for (collection in collection_id_map) {
                db.createCollection(collection);
                var options = {}
                options[collection_id_map[collection]] = 1;
                db.createIndex(collection, options, {unique: true}, function(){});
            }
            callback();
        });
    },
    find: function(collection_name, query, options, callback){
        if (typeof callback !== "function") {
            throw new Error('No callback defined');
        }

        get_connection(function(m_error, db) {

            var fields = {};

            if (options&&options.fields) {
                fields = options.fields;
                options.fields = null;
            }

            var cursor = db.collection(collection_name).find(query, fields, options);

            if (cursor) {
                cursor.toArray(function(c_error, query_results){
                    if (c_error) {
                        callback(c_error, null);
                    }else{
                        callback(null, query_results);
                    }
                });
            }else{
                callback(new Error('Invalid collection name ' + collection_name), null);
            }

        });
    },
    findOne: function(collection_name, query, callback){

        if (typeof callback !== "function") {
            throw new Error('No callback defined');
        }
        get_connection( function(m_error, db){
            var col = db.collection(collection_name);
            if (col) {
                col.findOne(query, function(c_error, query_results) {
                    if (c_error) {
                        callback(c_error, null);
                    }else{
                        callback(null, query_results);
                    }
                });
            }else{
                callback(new Error('Invalid collection name ' + collection_name), null);
            }

        });
    },
    insert: function(collection_name, query, callback){

        if (typeof callback !== "function") {
            throw new Error('No callback defined');
        }

        get_connection(function(m_error, db) {

            if (!m_error) {

                var col = db.collection(collection_name);
                if (col) {
                    col.insert(query, {safe:true}, function(err, query_results) {
                        if (err) {
                            callback(err, null);
                        }else{
                            callback(null, query_results);
                        }
                    });
                }else{
                    callback(new Error('Invalid collection name ' + collection_name), null);
                }

            } else {
                callback(m_error, null);
            }


        });
    },
    update: function(collection_name, query, update, do_all ,callback){

        if (typeof callback !== "function") {
            throw new Error('No callback defined');
        }

        get_connection(function(m_error, db){
            var col = db.collection(collection_name);
            if (col) {
                var options = {safe:true};

                if (do_all === true) {
                    options.multi = true;
                }

                col.update(query, update, options, function(c_error, query_results) {
                    if (c_error) {
                        callback(c_error, null);
                    } else {
                        callback(null, query_results);
                    }
                });
            }else{
                callback(new Error('Invalid collection name ' + collection_name), null);
            }

        });
    },
    remove: function(collection_name, query ,callback){

        if (typeof callback !== "function") {
            throw new Error('No callback defined');
        }

        get_connection(function(m_error, db){

            var col = db.collection(collection_name);

            if (col) {
                col.remove(query, {safe:true}, function(c_error, query_results) {
                    if (c_error) {
                        callback(c_error, null);
                    }else{
                        callback(null, query_results);
                    }
                });
            }else{
                callback(new Error('Invalid collection name ' + collection_name), null);
            }

        });
    },
    close: function() {
        if (db_connection!==null) {
            db_connection.close();
        }
    }
};

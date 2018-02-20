/*
 * Main module for the web front end
 */
const LABPROJECT_BASE = process.cwd();
const LABPROJECT_LIB = process.cwd() + "/lib";
const VERSION = "0.1.2-dev";

// Includes for express
var express = require('express')
var cookie = require('cookie');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');


var session_controller = require(LABPROJECT_LIB + "/controllers/stubs/session_controller");

var sanitize = require(LABPROJECT_LIB + '/common/sanitize');

var session_api = require(LABPROJECT_LIB + '/frontends/web/api/session_api');
var messaging_api = require(LABPROJECT_LIB + '/frontends/web/api/messaging_api');
var lab_api = require(LABPROJECT_LIB + '/frontends/web/api/lab_api');
var user_api = require(LABPROJECT_LIB + '/frontends/web/api/user_api');

var temp = null;

module.exports = {
    start: function (logger, vm_server_client, config, on_start) {
        logger.log("notice", "Starting web frontend");
        start_server(logger, vm_server_client, config);
    }
};

function start_server(logger, vm_server_client, config) {

    var app = express();
    var server = require('http').Server(app);
    var io = require('socket.io')(server);

    server.listen(config.port);

    app.use('/static', express.static(__dirname + '/static'));
    // app.use('/templates', express.static('templates'));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser("blurb"));

    app.set('view engine', 'pug');
    app.set('views', __dirname + '/pages');

    app.get('/', function (req, res) {
        console.log(req.signedCookies)
        if (!('session_id' in req.signedCookies) || req.signedCookies['session_id'] == undefined) {
            res.redirect('/login');
        } else {
            var session_id = req.signedCookies['session_id'];

            session_controller.session_valid(session_id, function(error, result) {
                if (error || result === false) {
                    res.redirect('/login');
                } else {
                    res.redirect('/main');
                }
            });
        }
    });

    app.get('/main', function (req, res) {
        var session_id = req.signedCookies['session_id'];
        
        session_controller.session_valid(session_id, function(error, result) {
            if (error || result === false) {
                res.redirect('/login');
            } else {
                res.render('main');
            }
        });
    });

    app.get('/admin', function (req, res) {
        res.redirect('/manage');
    });

    app.get('/manage', function (req, res) {
        var session_id = req.signedCookies['session_id'];
        
        session_controller.session_valid(session_id, function(error, result) {
            if (error || result === false) {
                res.redirect('/login');
            } else {
                res.render('manage');
            }
        });
    });

    app.get('/lab', function (req, res) {
        var session_id = req.signedCookies['session_id'];
        session_controller.session_valid(session_id, function(error, result) {
            if (error || result === false) {
                res.redirect('/login');
            } else {
                if (!req.query.hasOwnProperty('lab_id')) {
                    res.redirect('/main');
                } else {
                    res.render('lab');
                }
            }
        });

    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.post('/login', function (req, res) {

        var username = sanitize.simple_string(req.body.username);
        var password = req.body.password;

        session_controller.password_login(username, password, function(error, session_id) {
            if (error) {
                res.render('login', { error: error.message });
            } else {
                res.cookie('session_id', session_id, { signed: true });
                res.redirect('/main');
            }
        });
    });

    app.get('/logout', function (req, res) {
        if (req.signedCookies.session_id) {
            res.clearCookie('session_id');
        }
        res.redirect('/login');
    });

    io.use(function(socket, next) {
        var handshakeData = socket.request;
        // console.log(handshakeData);
        var cookies = cookie.parse(handshakeData.headers.cookie);
        
        var session_id = cookieParser.signedCookie(cookies['session_id'], "blurb");
        
        session_controller.session_valid(session_id, function(error, result) {
            if (error || result === false) {
                next(new Error('SESSION_NOT_SET'));
            } else {
                socket.request.session_id = session_id;
                next();
            }
        });
    });

    io.on('connection', function (socket) {
        logger.log("notice", "Client connected");
        session_api.register(socket);
        messaging_api.register(socket);
        lab_api.register(socket);
        user_api.register(socket);

    });
}

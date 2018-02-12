"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
const WebSocket = require("ws");
// routes
const UsersRouter_1 = require("./routes/UsersRouter");
// actions
const Actions_1 = require("./actions/Actions");
// config
const config = require('./config/config');
// db models
const models = require('./models');
// cluster master thread
if (cluster.isMaster) {
    // mysql db init
    models.sequelize.sync().then(function () {
        // check for initialize
        if (config.init.initialize) {
            Actions_1.initializeDemo();
        }
        else {
            // spawn blockchain listener
            var listenerService;
            var spawnListenerService = function () {
                // set service type
                var worker_env = {};
                worker_env["WORKER_TYPE"] = "listenerService";
                listenerService = cluster.fork(worker_env);
                // restart on kill
                listenerService.on('exit', function (code, signal) {
                    console.log('respawning listener service');
                    spawnListenerService();
                });
            };
            spawnListenerService();
            // spawn rest api
            var restService;
            var spawnRestService = function () {
                // set service type
                var worker_env = {};
                worker_env["WORKER_TYPE"] = "restService";
                restService = cluster.fork(worker_env);
                // restart on kill
                restService.on('exit', function (code, signal) {
                    console.log('respawning rest service');
                    spawnRestService();
                });
            };
            spawnRestService();
        }
    });
}
else {
    switch (process.env['WORKER_TYPE']) {
        case 'listenerService':
            console.log('starting blockchain listener');
            const ws = new WebSocket(config.ws_url, { origin: 'http://localhost:9984' });
            ws.on('open', function open() {
                //console.log('connected');
            });
            ws.on('close', function close() {
                //console.log('disconnected');
            });
            ws.on('message', function incoming(data) {
                Actions_1.handleAction(JSON.parse(data));
            });
            break;
        case 'restService':
            // rest api http express server
            console.log('starting rest api');
            var app = express();
            // middleware
            app.use(function (req, res, next) {
                // headers?
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
                next();
            });
            app.use(logger('dev'));
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: false }));
            app.use(compression());
            // routes
            app.use('/api/v1/users', UsersRouter_1.default);
            // listen
            var server = app.listen(4000);
            break;
    }
}

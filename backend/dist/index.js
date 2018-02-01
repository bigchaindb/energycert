"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const cluster = require("cluster");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
const WebSocket = require("ws");
// routes
const ObjectsRouter_1 = require("./routes/ObjectsRouter");
const DifferentRouter_1 = require("./routes/DifferentRouter");
const UsersRouter_1 = require("./routes/UsersRouter");
// actions
const Actions_1 = require("./actions/Actions");
// config
const config = require('./config/config');
// db models
const models = require('./models');
// master log
const log = debug('server:master');
// cluster master thread
if (cluster.isMaster) {
    // mysql db init
    models.sequelize.sync().then(function () {
        // spawn blockchain listener
        var listenerService;
        var spawnListenerService = function () {
            // set service type
            var worker_env = {};
            worker_env["WORKER_TYPE"] = "listenerService";
            listenerService = cluster.fork(worker_env);
            // restart on kill
            listenerService.on('exit', function (code, signal) {
                log('respawning listener service');
                spawnListenerService();
            });
        };
        listenerService = spawnListenerService();
        // spawn rest api
        var restService;
        var spawnRestService = function () {
            // set service type
            var worker_env = {};
            worker_env["WORKER_TYPE"] = "restService";
            restService = cluster.fork(worker_env);
            // restart on kill
            restService.on('exit', function (code, signal) {
                log('respawning rest service');
                spawnRestService();
            });
        };
        restService = spawnRestService();
    });
}
else {
    switch (process.env['WORKER_TYPE']) {
        case 'listenerService':
            log('starting blockchain listener');
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
            log('starting rest api');
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
            app.use('/api/v1/different', DifferentRouter_1.default);
            app.use('/api/v1/objects', ObjectsRouter_1.default);
            app.use('/api/v1/users', UsersRouter_1.default);
            // listen
            var server = app.listen(4000);
            break;
    }
}

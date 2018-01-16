"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const cluster = require("cluster");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
// routes
const ObjectsRouter_1 = require("./routes/ObjectsRouter");
const DifferentRouter_1 = require("./routes/DifferentRouter");
debug('express:server');
// cluster master thread
if (cluster.isMaster) {
    /*
    var workers = [];
    // Spawn process with i
    var spawn = function(i) {
        workers[i] = cluster.fork();
        // Restart worker on exit
        workers[i].on('exit', function(code, signal) {
            console.log('respawning worker', i);
            spawn(i);
        });
    };
    // Spawn processes
    for (var i = 0; i < 2; i++) {
        spawn(i);
    }
    */
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
            console.log('respawning rest service');
            spawnRestService();
        });
    };
    restService = spawnRestService();
}
else {
    switch (process.env['WORKER_TYPE']) {
        case 'listenerService':
            console.log('startin blockchain listener');
            break;
        case 'restService':
            // rest api http express server
            console.log('startin rest api');
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
            // listen
            var server = app.listen(3000);
            break;
    }
}

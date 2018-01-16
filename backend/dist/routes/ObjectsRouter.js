"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class ObjectsRouter {
    /**
     * Initialize the MeRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    basicRequest(req, res, next) {
        return { kasdf: 'akfj' };
    }
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.basicRequest);
    }
}
exports.ObjectsRouter = ObjectsRouter;
// Create the Router, and export its configured Express.Router
const objectsRoutes = new ObjectsRouter();
objectsRoutes.init();
exports.default = objectsRoutes.router;

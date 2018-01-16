"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class DifferentRouter {
    /**
     * Initialize the MeRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    getIt(req, res, next) {
        return res.send({ 'status': 'done' });
    }
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/:id', this.getIt);
    }
}
exports.DifferentRouter = DifferentRouter;
// Create the MeRouter, and export its configured Express.Router
const differentRoutes = new DifferentRouter();
differentRoutes.init();
exports.default = differentRoutes.router;

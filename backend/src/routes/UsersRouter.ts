import { Router, Request, Response, NextFunction } from 'express';
import * as request from 'request';
import * as xtechAPI from '../XtechService/xtechservice';
const config =  require('../config/config');


export class UsersRouter {
    router: Router;

    /**
     * Initialize the MeRouter
     */
    constructor() {
        this.router = Router();
        this.init();
    }
    /**
        call xtech API: POST /getwallet
    */
    getAmount(req: Request, res: Response, next: NextFunction) {

        // call xtech API: POST /getwallet
       xtechAPI.getAmount(req.body.uuid, function(results){
          return res.send({ 'amount': results });
          });
    }

    /**
        call xtech API: POST /transfer
    */
    transfer(req: Request, res: Response, next: NextFunction) {

        // call xtech API: POST /getwallet
       xtechAPI.transfer(req.body, function(result){
          return res.send({ 'result': result });
          });
    }

    /**
        call xtech API: POST /addWallet
    */
    addWallet(req: Request, res: Response, next: NextFunction) {

        // call xtech API: POST /getwallet
       xtechAPI.addWallet(req.body.user_id, req.body.state, function(result){
          return res.send({ 'result': result });
          });
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.post('/amount', this.getAmount);
        this.router.post('/transfer', this.transfer);
        this.router.post('/addWallet', this.addWallet);
    }
}


// Create the Router, and export its configured Express.Router
const usersRoutes = new UsersRouter();
usersRoutes.init();

export default usersRoutes.router;

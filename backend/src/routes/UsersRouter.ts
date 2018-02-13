import { Router, Request, Response, NextFunction } from 'express';
import * as request from 'request';
import * as xtechAPI from '../XtechService/xtechservice';

const config =  require('../config/config');
const models = require('../models')

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
        call xtech API: POST /getwallet to get amount ´
    */
    getAmount(req: Request, res: Response, next: NextFunction) {
      // get user wallet for publickey
      models.users.findOne({where:{publickey:req.body.publicKey}}).then((user)=>{
        if(user){
          // call xtech API: POST /getwallet
          xtechAPI.getAmount(user.userwallet)
          .then((result)=>{
            return res.send({ 'amount': result.data[0].total_balance })})
          .catch(function (err) {
            return res.send({ 'error': err })
          })
        }
      })
    }
    /**
        call xtech API: POST /transfer
    */
    transfer(req: Request, res: Response, next: NextFunction) {

        // call xtech API: POST /getwallet
       xtechAPI.transfer(req.body)
       .then((result)=>{
            return res.send({ 'result': result })})
       .catch(function (err) {
             return res.send({ 'error': err })})
    }

    /**
        call xtech API: POST /addWallet
    */
    addWallet(req: Request, res: Response, next: NextFunction) {

        // call xtech API: POST /getwallet
      xtechAPI.addWallet(req.body.user_id, req.body.state)
      .then((result)=>{
           return res.send({ 'result': result })})
      .catch(function (err) {
            return res.send({ 'error': err })})
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

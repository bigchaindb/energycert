import { Router, Request, Response, NextFunction } from 'express';
import * as request from 'request';
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
      Get wallet balance. For flagged amounts special business logic
      can be implemented in front end application.
      E.g. funds cannot be transferred outside of the system / no withdrawal to bank account.

      ### required parameters ###
      uuid      String
    */
    getAmount(req: Request, res: Response, next: NextFunction) {

        let userId : string = req.body.uuid;
        // POST /getwallet
        request.post(
            config.xtech_api_url+'/getwallet',
            { json: { uuid: userId } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
                 return res.send({ 'amount': body.data[0].total_balance });
            }
        );
    }
    /**
      Transfer amount from one wallet to some other wallet.
      A maximum transfer amount can be configured (default: 10000).

       ### required parameters ###
       order_id    String
       from_wallet String
       to_wallet   String
       amount      Integer

       ### optional parameters ###
       type         String
       reference    String
       flag         binary
       flag_expires timestamp
       fee          Integer
     */
    transfer(req, res, next) {

        let from_wallet :string = "51287e29-5601-454f-a0c5-0b542e868af1";
        let to_wallet :string = "1df06465-a30d-455d-8cee-147510ba1c82";
        let order_id: number = 1;
        let amount: number = 1;

        // POST /transfer
        request.post(
              config.xtech_api_url+'/transfer',
            { json: { from_wallet: from_wallet,
                      to_wallet: to_wallet,
                      order_id: order_id,
                      amount: amount } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
                 return res.send({ 'response': body });
            }
        );
    }

    /**
      Creates a new wallet.
      ### required parameters ###
      uuid      String
      state     String    can be:
                          kyc => KYC pending,
                          active (default),
                          alert => manual check required,
                          locked => no transactions possible,
                          deleted,
                          supply_wallet
    */
    addWallet(req: Request, res: Response, next: NextFunction) {

        let userId : string = "1234567891234";//req.params.uuid;
        // POST addWallet
        request.post(
            config.xtech_api_url+'/addWallet',
            { json: { uuid: userId,  state: 'active'} },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
                 return res.send({ 'response': body});
            }
        );
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

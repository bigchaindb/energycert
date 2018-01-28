const config =  require('../config/config');
import * as request from 'request';


/**
  Get wallet balance. For flagged amounts special business logic
  can be implemented in front end application.
  E.g. funds cannot be transferred outside of the system / no withdrawal to bank account.

  ### required parameters ###
  uuid      String
*/
export async function getAmount(uniqueUserID: string, callback) {
    // POST /getwallet
    request.post(
      config.xtech_api_url+'/getwallet',
      { json: { uuid: uniqueUserID } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body)
          }
           callback(body.data[0].total_balance);
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
export async function transfer(parameters : any, callback){

    let from_wallet :string = parameters.from_wallet;
    let to_wallet :string = parameters.to_wallet;
    let order_id: number = parameters.order_id;
    let amount: number = parameters.amount;

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
            callback(body);
        }
    );
}

/**
  Creates a new wallet. Generates a uuid based on user_id
  ### required parameters ###
  user_id   String
  state     String    can be:
                      kyc => KYC pending,
                      active (default),
                      alert => manual check required,
                      locked => no transactions possible,
                      deleted,
                      supply_wallet
*/
export async function addWallet(uniqueUserID: string, walletState: string ,callback) {

    // POST addWallet
    request.post(
        config.xtech_api_url+'/addWallet',
        { json: { user_id: uniqueUserID,  state: walletState} },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
            callback(body);
        }
    );
}

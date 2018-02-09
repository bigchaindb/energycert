const config =  require('../config/config');

import * as request from 'request';
var rp = require('request-promise');

var options = {
    method: 'POST',
    uri: config.xtech_api_url,
    simple: false,
    body: {},
    json: true
};


/**
  Get wallet balance. For flagged amounts special business logic
  can be implemented in front end application.
  E.g. funds cannot be transferred outside of the system / no withdrawal to bank account.

  ### required parameters ###
  uuid      String
*/
export async function getAmount(uniqueUserID: string) {

    // POST /getwallet
    options.uri += '/getwallet';
    options.body = { uuid: uniqueUserID }
    return rp(options)
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
export async function transfer(parameters : any){

    let from_wallet :string = parameters.from_wallet;
    let to_wallet :string = parameters.to_wallet;
    let order_id: number = parameters.order_id;
    let amount: number = parameters.amount;

    //POST /transfer
    options.uri += '/transfer';
    options.body = {
                      from_wallet: from_wallet,
                      to_wallet: to_wallet,
                      order_id: order_id,
                      amount: amount }
    return rp(options)
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
export async function addWallet(uniqueUserID: string, walletState: string) {

    // POST addWallet
  options.uri += '/addwallet';
  options.body = {
                    user_id: uniqueUserID,
                    state: walletState }
  return rp(options)
}

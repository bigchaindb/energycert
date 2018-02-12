import * as http from 'http';
import {
  getSortedTransactions,
  sentToXtech,
  getTransaction,
  transferAsset,
  getAssetHistory,
  createNewAsset,
  getKeypairFromSeed,
  createNewDivisibleAsset,
  transferDivisibleAsset
} from '../bdbservice/BdbService';
import * as xtechAPI from '../XtechService/xtechservice';

import * as debug from 'debug';

import * as uuidV4 from "uuid/v4"

// config
const config = require('../config/config');

// db models
const models = require('../models');

export function handleAction(inputData) {
  getTransaction(inputData.transaction_id).then((transaction)=>{
    if (transaction.operation === "CREATE") {
      switch(transaction.asset.data.data) {
        case "UserAsset":
          handleUserAsset(transaction)
          break
        case "OfferAsset":
          handleOfferAsset(transaction)
          break
        case "AcceptAsset":
          handleAcceptAsset(transaction)
          break
        case "CancelAsset":
          handleCancelAsset(transaction)
          break
      }
    }
    if (transaction.operation === "TRANSFER") {
      // transfer of tokens?
      console.log("transfer transaction: "+JSON.stringify(transaction))
      /*
      if(transaction.metadata.aaa === "token") {
        handleTokenTransfer(transaction)
      }
      */
    }
  })
}

function handleUserAsset(transaction) {
  // input checks
  if (
    transaction.metadata.email === undefined ||
    transaction.metadata.name === undefined
  ){
    console.log('userAsset missing parameters')
    return
  }

  // create user on xtech
  xtechAPI.addWallet(transaction.inputs[0].owners_before[0], 'active')
  .then((result) => {
    console.log(result)
    // if success:
    models.users.create({
        email: transaction.metadata.email,
        name: transaction.metadata.name,
        userid: result.data[0].uuid,
        publickey: transaction.inputs[0].owners_before[0]
    }).then((user) => {
        console.log('user saved!')
    }).catch((err) => {
        console.log('userAsset db save error')
    });
  });
}

function handleOfferAsset(transaction) {
  // input checks
  if (
    transaction.asset.data.timestamp === undefined ||
    transaction.asset.data.receiver_public_key === undefined ||
    transaction.asset.data.sender_public_key === undefined ||
    transaction.asset.data.offered_money === undefined ||
    transaction.asset.data.offered_tokens === undefined ||
    transaction.metadata !== null
  ){
    console.log('offerAsset missing parameters')
    return
  }
  // sent to xtech?
  if (sentToXtech(transaction) === false) {
    console.log('offerAsset owner error')
    return
  }

  // TODO: transfer between wallets
  // let parameters =
  // {
  //   to_wallet : "4ca00f34-1486-4375-b30b-cbc1e939f51b",
  //   from_wallet : "51287e29-5601-454f-a0c5-0b542e868af1",
  //   order_id : 1,
  //   amount:  2
  // }
  // call xtech API: POST /getwallet
  // xtechAPI.transfer(parameters)
  //.then((result) => {
    // if success
      transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:"allocated"}).then((tx)=>{
        console.log('offerAsset allocated updated')
      })
    // else  //.catch((err) => {
      // transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:'failed'}).then((tx)=>{
      //   log('offerAsset failed updated')
      // })
  // });
}

function handleCancelAsset(transaction) {
  // input checks
  if (
    transaction.asset.data.timestamp === undefined ||
    transaction.asset.data.asset_id === undefined
  ){
    console.log('cancelAsset missing parameters')
    return
  }
  // sent to xtech?
  if (sentToXtech(transaction) === false) {
    console.log('cancelAsset owner error')
    return
  }
  // offerAsset creator with create asset ownership of acceptAsset
  getSortedTransactions(transaction.asset.data.asset_id).then((txs)=>{
    // valid offer & receiver is the same as offer accepter
    if (
      (transaction.inputs[0].owners_before[0] === txs[0].asset.data.receiver_public_key ||
      transaction.inputs[0].owners_before[0] === txs[0].asset.data.sender_public_key) &&
      txs[0].asset.data.data === 'OfferAsset' &&
      txs[0].operation === 'CREATE' &&
      txs[1].metadata.allocation === 'allocated' &&
      txs.length < 3
    ) {
      // TODO: return money to sender
      transferAsset(txs[1], config.xtech_keypair, config.xtech_keypair.publicKey, {cancel:"canceled"}).then(()=>{
        console.log('offerAsset cancel updated')
      })
    } else {
      console.log('cancelAsset not receiver')
    }
  })
}

function handleAcceptAsset(transaction) {
  // input checks
  if (
    transaction.asset.data.timestamp === undefined ||
    transaction.asset.data.asset_id === undefined
  ){
    console.log('acceptAsset missing parameters')
    return
  }
  // sent to xtech?
  if (sentToXtech(transaction) === false) {
    console.log('acceptAsset owner error')
    return
  }
  // offerAsset creator with create asset ownership of acceptAsset
  getSortedTransactions(transaction.asset.data.asset_id).then((txs)=>{
    // valid offer & receiver is the same as offer accepter
    if (
      transaction.inputs[0].owners_before[0] === txs[0].asset.data.receiver_public_key &&
      txs[0].asset.data.data === 'OfferAsset' &&
      txs[0].operation === 'CREATE' &&
      txs[1].metadata.allocation === 'allocated' &&
      txs.length < 3
    ) {
      transferAsset(txs[1], config.xtech_keypair, config.xtech_keypair.publicKey, {accepted:"accepted"}).then(()=>{
        console.log('offerAsset accepted updated')
      })
    } else {
      console.log('acceptAsset not receiver')
    }
  })
}

function handleTokenTransfer(transaction) {
  // checks
  /*
  // money from escrow to new account
   let parameters =
   {
      to_wallet : "51287e29-5601-454f-a0c5-0b542e868af1",
      from_wallet : config.xtech_escrow_wallet,
      order_id : 1,
      amount:  2
   }
  // call xtech API: POST /getwallet
  xtechAPI.transfer(parameters, function(results){
    return results;
    });
  */
}

export async function initializeDemo() {

  // create users
  for (let user of config.init.users) {
    let keypair = getKeypairFromSeed(user.password+user.email)
    let asset = {data:'UserAsset'}
    let metadata = {
      email: user.email,
      name: user.name
    }
    await createNewAsset(keypair, asset, metadata)
  }

  // create tokens
  let tokensTx = await createNewDivisibleAsset(
    config.xtech_keypair,
    {data:config.init.nameOfToken},
    null,
    config.init.amountOfTokens
  )
  console.log("Add token id to config: "+tokensTx.id);

  // transfer tokens to each users
  let toPublicKeysAmounts = []
  let avaliableAmount = config.init.amountOfTokens
  let transferAmount = 100
  for (let user of config.init.users) {
    let keypair = getKeypairFromSeed(user.password+user.email)
    toPublicKeysAmounts.push({publicKey:keypair.publicKey, amount:transferAmount})
    avaliableAmount = avaliableAmount - transferAmount
  }
  toPublicKeysAmounts.push({publicKey:config.xtech_keypair.publicKey, amount:avaliableAmount})
  await transferDivisibleAsset(tokensTx, config.xtech_keypair, toPublicKeysAmounts, null)
  process.exit()
}

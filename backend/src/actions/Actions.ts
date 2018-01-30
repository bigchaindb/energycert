import * as http from 'http';
import { getTransaction, transferAsset, getAssetHistory } from '../bdbservice/BdbService'
import * as debug from 'debug';

import * as uuidV4 from "uuid/v4"

// config
const config = require('../config/config');

// debug
const log = debug('server:listener:actions');

// db models
const models = require('../models');

export function handleAction(inputData) {
  getTransaction(inputData.asset_id).then((transaction)=>{
    switch(transaction.asset.data.data) {
      case "UserAsset":
        handleUserAsset(transaction)
        break
      case "OfferAsset":
        handleOfferAsset(transaction)
        break
      }
    }
  )
}

function handleUserAsset(transaction) {

  // input checks
  if (
    transaction.operation !== "CREATE" ||
    transaction.metadata.email === undefined ||
    transaction.metadata.name === undefined
  ){
    log('userAsset missing parameters')
    return
  }

  /*
  console.log("public key: <public Key>")
  console.log(transaction.inputs[0].owners_before[0])

  console.log("operation: CREATE")
  console.log(transaction.operation)

  console.log("metadata email: <email>")
  console.log(transaction.metadata.email)

  console.log("metadata name: <name>")
  console.log(transaction.metadata.name)
  */

  // create user on xtech

  // save user
  models.users.create({
      email: transaction.metadata.email,
      name: transaction.metadata.name,
      userid: uuidV4(), // TODO: GET THIS FROM XTECH
      publickey: transaction.inputs[0].owners_before[0]
  }).then((user) => {
      log('user saved!')
  }).catch((err) => {
      log('userAsset db save error')
  });
}

function handleOfferAsset(transaction) {
  console.log(transaction)
  // input checks
  if (
    transaction.operation !== "CREATE" ||
    transaction.asset.data.data !== "OfferAsset" ||
    transaction.asset.data.timestamp === undefined ||
    transaction.asset.data.receiver_public_key === undefined ||
    transaction.asset.data.offered_money === undefined ||
    transaction.asset.data.offered_tokens === undefined ||
    transaction.metadata !== null
  ){
    log('offerAsset missing parameters')
    return
  }
  // sent to xtech?
  if (transaction.outputs[0].public_keys.length !== 1 || transaction.outputs[0].public_keys[0] !== config.xtech_keypair.publicKey) {
    log('offerAsset owner error')
    return
  }
  // money to escrow
  // TODO

  // update updated
  transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:"allocated"}).then((tx)=>{
    log('offerAsset allocated updated')
  })
  /*
  transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:'failed'}).then((tx)=>{
    log('offerAsset failed updated')
  })
  */
}

function handleCancelAsset(transaction) {
  // checks
  // update status
  /*
  getAssetHistory(transaction.id).then((txList)=>{
    console.log(txList)
  })
  */
  // money from escrow back to owner
}

function handleAcceptAsset(transaction) {
  // checks
  /*
  getAssetHistory(transaction.id).then((txList)=>{
    console.log(txList)
  })
  */
  // update status
}

function handleTokenTransfer(transaction) {
  // checks
  // money from escrow to new account
}

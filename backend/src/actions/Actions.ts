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
    if (transaction.operation === "TRANSFER" &&
      transaction.asset.id === config.init.idOfToken &&
      transaction.metadata !== null &&
      transaction.metadata.offer !== null
    ) {
      handleTokenTransfer(transaction)
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
        userwallet: result.data[0].uuid,
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
  // fake sent
  if (transaction.asset.data.sender_public_key !== transaction.inputs[0].owners_before[0]) {
    console.log('offerAsset owner != sender')
    return
  }

  // get user wallet for publickey
  models.users.findOne({where:{publickey:transaction.inputs[0].owners_before[0]}}).then((user)=>{
    if(user){
      let parameters = {
        to_wallet: config.xtech_escrow_wallet,
        from_wallet: user.userwallet,
        order_id: transaction.id,
        amount: transaction.asset.data.offered_money
      }
      // call xtech API: POST /getwallet
      xtechAPI.transfer(parameters)
      .then((result) => {
        if (result.success === true){
          transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:"allocated"}).then((tx)=>{
            console.log('offerAsset allocated updated')
          })
        } else {
          console.log(result.msg)
          transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:'failed'}).then((tx)=>{
            console.log('offerAsset failed updated')
          })
        }
      });
    } else {
      console.log("user has no xtech wallet")
    }
  })
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
      txs[1].metadata.allocation === 'allocated' &&
      txs.length < 3
    ) {
      // get user wallet for publickey
      models.users.findOne({where:{publickey:txs[0].asset.data.sender_public_key}}).then((user)=>{
        if(user){
          let parameters = {
            to_wallet: user.userwallet,
            from_wallet: config.xtech_escrow_wallet,
            order_id: txs[0].id,
            amount: txs[0].asset.data.offered_money
          }
          // call xtech API: POST /getwallet
          xtechAPI.transfer(parameters)
          .then((result) => {
            if (result.success === true){
              transferAsset(txs[1], config.xtech_keypair, config.xtech_keypair.publicKey, {cancel:"canceled"}).then(()=>{
                console.log('offerAsset cancel updated')
              })
            } else {
              console.log(result.msg)
            }
          });
        } else {
          console.log("user has no xtech wallet")
        }
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
  // get offer and check status
  //console.log(transaction)
  getSortedTransactions(transaction.metadata.offer).then((offer)=>{
    console.log(offer)
    if(
      offer[0].asset.data.data === 'OfferAsset' &&
      offer[1].metadata.allocation === 'allocated' &&
      offer[2].metadata.accepted === 'accepted' &&
      offer.lenght < 4
    ){
      console.log("here")
      // check for amount
      let amount = 0
      for(let output of transaction.outputs){
        if(output.public_keys[0] === offer[0].asset.data.receiver_public_key){
          amount = amount + parseInt(output.amount)
        }
      }
      if(amount !== parseInt(offer[0].asset.data.offered_tokens)){
        console.log('no enough tokens')
        return
      }
      // get user wallet for publickey
      models.users.findOne({where:{publickey:offer[0].asset.data.receiver_public_key}}).then((user)=>{
        if(user){
          let parameters = {
            to_wallet: user.userwallet,
            from_wallet: config.xtech_escrow_wallet,
            order_id: offer[0].id,
            amount: offer[0].asset.data.offered_money
          }
          console.log(parameters)
          // call xtech API: POST /getwallet
          xtechAPI.transfer(parameters)
          .then((result) => {
            if (result.success === true){
              transferAsset(offer[2], config.xtech_keypair, config.xtech_keypair.publicKey, {finished:"finished"}).then(()=>{
                console.log('offerAsset finished updated')
              })
            } else {
              console.log(result.msg)
            }
          });
        } else {
          console.log("user has no xtech wallet")
        }
      })
    }
  })
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
    let newAsset = await createNewAsset(keypair, asset, metadata)
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
  let tranfer = await transferDivisibleAsset(tokensTx, config.xtech_keypair, toPublicKeysAmounts, null)
  process.exit()
}

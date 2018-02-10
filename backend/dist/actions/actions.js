"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BdbService_1 = require("../bdbservice/BdbService");
const debug = require("debug");
const uuidV4 = require("uuid/v4");
// config
const config = require('../config/config');
// debug
const log = debug('server:listener:actions');
// db models
const models = require('../models');
function handleAction(inputData) {
    console.log(inputData);
    BdbService_1.getTransaction(inputData.transaction_id).then((transaction) => {
        if (transaction.operation === "CREATE") {
            switch (transaction.asset.data.data) {
                case "UserAsset":
                    handleUserAsset(transaction);
                    break;
                case "OfferAsset":
                    handleOfferAsset(transaction);
                    break;
                case "AcceptAsset":
                    handleAcceptAsset(transaction);
                    break;
                case "CancelAsset":
                    handleCancelAsset(transaction);
                    break;
            }
        }
        if (transaction.operation === "TRANSFER") {
            // transfer of tokens?
            console.log("transfer transaction: " + JSON.stringify(transaction));
            /*
            if(transaction.metadata.aaa === "token") {
              handleTokenTransfer(transaction)
            }
            */
        }
    });
}
exports.handleAction = handleAction;
function handleUserAsset(transaction) {
    // input checks
    if (transaction.metadata.email === undefined ||
        transaction.metadata.name === undefined) {
        log('userAsset missing parameters');
        return;
    }
    // TODO create user on xtech
    // xtechAPI.addWallet(transaction.inputs[0].owners_before[0], 'active')
    //.then((result) => {
    // if success:
    models.users.create({
        email: transaction.metadata.email,
        name: transaction.metadata.name,
        userid: uuidV4(),
        publickey: transaction.inputs[0].owners_before[0]
    }).then((user) => {
        log('user saved!');
    }).catch((err) => {
        log('userAsset db save error');
    });
    // });
}
function handleOfferAsset(transaction) {
    // input checks
    if (transaction.asset.data.timestamp === undefined ||
        transaction.asset.data.receiver_public_key === undefined ||
        transaction.asset.data.sender_public_key === undefined ||
        transaction.asset.data.offered_money === undefined ||
        transaction.asset.data.offered_tokens === undefined ||
        transaction.metadata !== null) {
        log('offerAsset missing parameters');
        return;
    }
    // sent to xtech?
    if (BdbService_1.sentToXtech(transaction) === false) {
        log('offerAsset owner error');
        return;
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
    BdbService_1.transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, { allocation: "allocated" }).then((tx) => {
        log('offerAsset allocated updated');
    });
    // else  //.catch((err) => {
    // transferAsset(transaction, config.xtech_keypair, config.xtech_keypair.publicKey, {allocation:'failed'}).then((tx)=>{
    //   log('offerAsset failed updated')
    // })
    // });
}
function handleCancelAsset(transaction) {
    // input checks
    if (transaction.asset.data.timestamp === undefined ||
        transaction.asset.data.asset_id === undefined) {
        log('cancelAsset missing parameters');
        return;
    }
    // sent to xtech?
    if (BdbService_1.sentToXtech(transaction) === false) {
        log('cancelAsset owner error');
        return;
    }
    // offerAsset creator with create asset ownership of acceptAsset
    BdbService_1.getSortedTransactions(transaction.asset.data.asset_id).then((txs) => {
        // valid offer & receiver is the same as offer accepter
        if (transaction.inputs[0].owners_before[0] === txs[0].asset.data.receiver_public_key &&
            txs[0].asset.data.data === 'OfferAsset' &&
            txs[0].operation === 'CREATE' &&
            txs[1].metadata.allocation === 'allocated' &&
            txs.length < 3) {
            // TODO: return money to sender
            BdbService_1.transferAsset(txs[1], config.xtech_keypair, config.xtech_keypair.publicKey, { cancel: "canceled" }).then(() => {
                log('offerAsset cancel updated');
            });
        }
        else {
            log('cancelAsset not receiver');
        }
    });
}
function handleAcceptAsset(transaction) {
    // input checks
    if (transaction.asset.data.timestamp === undefined ||
        transaction.asset.data.asset_id === undefined) {
        log('acceptAsset missing parameters');
        return;
    }
    // sent to xtech?
    if (BdbService_1.sentToXtech(transaction) === false) {
        log('acceptAsset owner error');
        return;
    }
    // offerAsset creator with create asset ownership of acceptAsset
    BdbService_1.getSortedTransactions(transaction.asset.data.asset_id).then((txs) => {
        // valid offer & receiver is the same as offer accepter
        if (transaction.inputs[0].owners_before[0] === txs[0].asset.data.receiver_public_key &&
            txs[0].asset.data.data === 'OfferAsset' &&
            txs[0].operation === 'CREATE' &&
            txs[1].metadata.allocation === 'allocated' &&
            txs.length < 3) {
            BdbService_1.transferAsset(txs[1], config.xtech_keypair, config.xtech_keypair.publicKey, { accepted: "accepted" }).then(() => {
                log('offerAsset accepted updated');
            });
        }
        else {
            log('acceptAsset not receiver');
        }
    });
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
function initializeDemo() {
    return __awaiter(this, void 0, void 0, function* () {
        // create users
        for (let user of config.init.users) {
            let keypair = BdbService_1.getKeypairFromSeed(user.password + user.email);
            let asset = { data: 'UserAsset' };
            let metadata = {
                email: user.email,
                name: user.name
            };
            yield BdbService_1.createNewAsset(keypair, asset, metadata);
        }
        // create tokens
        let tokensTx = yield BdbService_1.createNewDivisibleAsset(config.xtech_keypair, { data: config.init.nameOfToken }, null, config.init.amountOfTokens);
        // transfer tokens to each users
        let toPublicKeysAmounts = [];
        let avaliableAmount = config.init.amountOfTokens;
        let transferAmount = 100;
        for (let user of config.init.users) {
            let keypair = BdbService_1.getKeypairFromSeed(user.password + user.email);
            toPublicKeysAmounts.push({ publicKey: keypair.publicKey, amount: transferAmount });
            avaliableAmount = avaliableAmount - transferAmount;
        }
        toPublicKeysAmounts.push({ publicKey: config.xtech_keypair.publicKey, amount: avaliableAmount });
        BdbService_1.transferDivisibleAsset(tokensTx, config.xtech_keypair, toPublicKeysAmounts, null);
    });
}
exports.initializeDemo = initializeDemo;

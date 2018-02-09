var config = {};
// api
config = {};
//config.bdb_url = 'http://energycert.westeurope.cloudapp.azure.com:49984/';
//config.ws_url = 'ws://energycert.westeurope.cloudapp.azure.com:9985/api/v1/streams/valid_transactions';
config.bdb_url = 'http://' + process.env.BIGCHAINDB_HOST + ':9984/api/v1/';
config.ws_url = 'ws://' + process.env.BIGCHAINDB_HOST + ':9985/api/v1/streams/valid_transactions';
//config.bdb_url = 'http://127.0.0.1:9984/api/v1/';
//config.ws_url = 'ws://127.0.0.1:9985/api/v1/streams/valid_transactions';
config.init = {};
config.init.initialize = process.env.INIT;
config.init.users = [
    { email: "test1@gmail.com", name: "test1", password: "test1" },
    { email: "test2@gmail.com", name: "test2", password: "test2" },
    { email: "test3@gmail.com", name: "test3", password: "test3" },
];
config.init.amountOfTokens = 1000000000;
config.init.nameOfToken = "Energy";
config.xtech_api_url = "https://wallet.staging.payxapi.com/apiv2/wallet/";
config.xtech_keypair = {
    publicKey: "HejcHtiQ2t4tHZZchSDVSuvWqfjYGHDxWJpcEfxkzTGP",
    privateKey: "FGqyZKhv7yR3bP8RSn7BwAmLqLGsMkr25m1byZtkboWH"
};
config.db = {};
config.db.host = process.env.MYSQL_HOST;
config.db.username = 'user';
config.db.password = '1234';
config.db.database = 'database';
config.db.dialect = 'mysql';
config.db.logging = false;
config.db.operatorsAliases = false;
module.exports = config;

var config = {};
// api
config = {};
//config.bdb_url = 'http://energycert.westeurope.cloudapp.azure.com:49984/';
//config.ws_url = 'ws://energycert.westeurope.cloudapp.azure.com:49985/api/v1/streams/valid_transactions';
config.bdb_url = 'http://localhost:9984/api/v1/';
config.ws_url = 'ws://localhost:9985/api/v1/streams/valid_transactions';
config.xtech_api_url = "https://wallet.staging.payxapi.com/apiv2/wallet/";
module.exports = config;

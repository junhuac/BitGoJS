const dashPrototype = require('./dash').prototype;

const Tdash = function() {
  // this function is called externally from BaseCoin
  // replace the BaseCoin prototype with the local override prototype, which inherits from BaseCoin
  // effectively, move the BaseCoin prototype one level away

  // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp#L287
  this.network = {
    messagePrefix: '\x19Dash Signed Message:\n',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x8c,
    scriptHash: 0x13,
    wif: 0xef,
    dustThreshold: 0, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L360-L365
    dustSoftThreshold: 100000, // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.h#L53
    feePerKb: 100000 // https://github.com/litecoin-project/litecoin/blob/v0.8.7.2/src/main.cpp#L56
  };
};

Tdash.prototype = Object.create(dashPrototype);
Tdash.constructor = Tdash;

Tdash.prototype.getChain = function() {
  return 'Tdash';
};

Tdash.prototype.getFullName = function() {
  return 'Testnet Dash';
};

module.exports = Tdash;

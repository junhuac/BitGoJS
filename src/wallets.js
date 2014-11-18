//
// Wallets Object
// BitGo accessor to a user's wallets.
//
// Copyright 2014, BitGo, Inc.  All Rights Reserved.
//

var request = require('superagent');
var ECKey = require('./bitcoin/eckey');
var Wallet = require('./wallet');

//
// Constructor
//
var Wallets = function(bitgo) {
  this.bitgo = bitgo;
};

//
// list
// List the user's wallets
//
Wallets.prototype.list = function(callback) {
  if (typeof(callback) != 'function') {
    throw new Error('invalid argument');
  }
  var self = this;
  this.bitgo.get(this.bitgo.url('/wallet'))
  .end(function(err, res) {
    if (err) {
      return callback(err);
    }
    var wallets = {};
    for (var wallet in res.body.wallets) {
      wallets[wallet] = new Wallet(self.bitgo, res.body.wallets[wallet]);
    }
    callback(null, wallets);
  });
};

//
// createKey
// Create a single bitcoin key.  This runs locally.
// Returns: {
//   address: <address>
//   key: <key, in WIF format>
// }
Wallets.prototype.createKey = function() {
  var key = new ECKey();
  return {
    address: key.getBitcoinAddress(),
    key: key.getWalletImportFormat()
  };
};

//
// createWalletWithKeychains
// Create a new 2-of-3 wallet and it's associated keychains.
// Returns the locally created keys with their encrypted xprvs.
// **WARNING: BE SURE TO BACKUP! NOT DOING SO CAN RESULT IN LOSS OF FUNDS!**
//
// 1. Creates the user keychain locally on the client, and encrypts it with the provided passphrase
// 2. If no xpub was provided, creates the backup keychain locally on the client, and encrypts it with the provided passphrase
// 3. Uploads the encrypted user and backup keychains to BitGo
// 4. Creates the BitGo key on the service
// 5. Creates the wallet on BitGo with the 3 public keys above
//
// Options include:
//   "passphrase": wallet passphrase to encrypt user and backup keys with
//   "backupXpub": backup keychain xpub, it is HIGHLY RECOMMENDED you generate this on a separate machine!
//                 BITGO DOES NOT GUARANTEE SAFETY OF WALLETS WITH MULTIPLE KEYS CREATED ON THE SAME MACHINE **
// Returns: {
//   wallet: newly created wallet model object
//   userKeychain: the newly created user keychain, which has an encrypted xprv stored on BitGo
//   backupKeychain: the newly created backup keychain
//
// ** BE SURE TO BACK UP THE ENCRYPTED USER AND BACKUP KEYCHAINS!**
//
// }
Wallets.prototype.createWalletWithKeychains = function(options, callback) {
  if (typeof(options) != 'object' || typeof(callback) != 'function' ||
    typeof(options.passphrase) != 'string' || typeof(options.label) != 'string' ||
    (options.backupXpub && typeof(options.backupXpub) != 'string')) {
    throw new Error('invalid argument');
  }

  var self = this;
  var label = options.label;

  // Create the user and backup key.
  var userKeychain = this.bitgo.keychains().create();
  userKeychain.encryptedXprv = this.bitgo.encrypt(options.passphrase, userKeychain.xprv);
  var backupKeychain = { "xpub" : options.backupXpub };
  if (!options.backupXpub) {
    backupKeychain = this.bitgo.keychains().create();
    backupKeychain.encryptedXprv = this.bitgo.encrypt(options.passphrase, backupKeychain.xprv);
  }

  // Add keychains to BitGo
  var options = {
    "label": "key1",
    "xpub": userKeychain.xpub,
    "encryptedXprv": userKeychain.encryptedXprv
  };

  self.bitgo.keychains().add(options, function(err, keychain) {
    if (err) {
      callback(err);
    }

    var options = {
      "label": "key2",
      "xpub": backupKeychain.xpub
    };
    self.bitgo.keychains().add(options, function(err, keychain) {
      if (err) { console.dir(err); throw new Error("Could not create the backup keychain"); }

      // Do the actual key creation here
      self.bitgo.keychains().createBitGo({}, function(err, bitGoKeychain) {
        if (err) {
          callback(err);
        }

        var options = {
          "label": label,
          "m": 2,
          "n": 3,
          "keychains": [
            { "xpub": userKeychain.xpub },
            { "xpub": backupKeychain.xpub },
            { "xpub": bitGoKeychain.xpub} ]
        };
        self.add(options, function (err, result) {
          if (err) {
            return callback(err);
          }

          callback(null, {
            "wallet": result,
            "userKeychain": userKeychain,
            "backupKeychain": backupKeychain
          });
        });
      });
    });
  });
};

//
// add
// Add a new wallet (advanced mode).
// This allows you to manually submit the keychains, type, m and n of the wallet
// Options include:
//    "label": label of the wallet to be shown in UI
//    "type": should be "safehd"
//    "m": number of keys required to unlock wallet (2)
//    "n": number of keys available on the wallet (3)
//    "keychains": array of keychain xpubs
Wallets.prototype.add = function(options, callback) {
  if (typeof(options) != 'object' || typeof(callback) != 'function' ||
    Array.isArray(options.keychains) === false || typeof(options.m) !== 'number' ||
    typeof(options.n) != 'number') {
    throw new Error('invalid argument');
  }

  // TODO: support more types of multisig
  if (options.m != 2 || options.n != 3) {
    throw new Error('unsupported multi-sig type');
  }
  var self = this;
  var keychains = options.keychains.map(function(k) { return {xpub: k.xpub}; });
  this.bitgo.post(this.bitgo.url('/wallet'))
  .send({
    label: options.label,
    m: options.m,
    n: options.n,
    keychains: keychains
  })
  .end(function(err, res) {
    if (self.bitgo.handleBitGoAPIError(err, res, callback)) {
      return;
    }
    callback(null, new Wallet(self.bitgo, res.body));
  });
};

//
// get
// Fetch an existing wallet
// Options include:
//   address: the address of the wallet
//
Wallets.prototype.get = function(options, callback) {
  if (typeof(options) != 'object' || typeof(options.id) != 'string' ||
      typeof(callback) != 'function') {
    throw new Error('invalid arguments: id and callback arguments required.');
  }
  var self = this;
  this.bitgo.get(this.bitgo.url('/wallet/' + options.id))
  .end(function(err, res) {
    if (self.bitgo.handleBitGoAPIError(err, res, callback)) {
      return;
    }
    callback(null, new Wallet(self.bitgo, res.body));
  });
};

module.exports = Wallets;
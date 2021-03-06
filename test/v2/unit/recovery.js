//
// Tests for Wallets
//

const should = require('should');
const Promise = require('bluebird');
const co = Promise.coroutine;
const nock = require('nock');
nock.enableNetConnect();

const TestV2BitGo = require('../../lib/test_bitgo');
const recoveryNocks = require('../lib/recovery-nocks');

describe('Recovery:', function() {
  let bitgo;

  before(function() {
    // TODO: replace dev with test
    bitgo = new TestV2BitGo({ env: 'test' });
    bitgo.initializeTestVars();

  });

  after(function() {
    nock.cleanAll();
  });

  describe('Recover Bitcoin', function() {
    it('should generate BTC recovery tx', co(function *() {
      recoveryNocks.nockBtcRecovery();

      const basecoin = bitgo.coin('tbtc');
      const recovery = yield basecoin.recover({
        userKey: '{"iv":"fTcRIg7nlCf9fPSR4ID8XQ==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"pkIS5jVDi0Y=","ct":"SJQgP+ZzfOMf2fWxyQ2jpoWYioq6Tqfcw1xiKS1WpWAxLvXfH059sZvPrrYMdijJEbqA8EEaYXWmdgYSkMXdwckRMyvM3uWl9H8iKw1ZJmHyy2eDSy5r/pCtWICkcO3oi2I492I/3Op2YLfIX6XqKWs2mztu/OY="}',
        backupKey: '{"iv":"0WkLaOsnO3M7qnV2DbSvWw==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"lGxBnvlGAoM=","ct":"cBalT6MGZ3TYIYHt4jys0WDTZEKK9qIubltKEqfW4zXtxYd1dYLz9qLve/yXPl7NF5Cb1lBNGBBGsfqzvpr0Q5824xiy5i9IKzRBI/69HIt3fC2RjJKDfB1EZUjoozi2O5FH4K7L6Ejq7qZhvi8iOd1ULVpBgnE="}',
        bitgoKey: 'xpub661MyMwAqRbcGsSbYgWmr9G1dFgPE8HEb1ASRShbw9S1Mmu1dTQ7QStNwpaYFESq3MeKivGidN8twMeJzqh1veuSP1t2XLENL3mwpatfTst',
        walletPassphrase: TestV2BitGo.V2.TEST_WALLET1_PASSCODE,
        recoveryDestination: '2NB5Ynem6iNvA6GBLZwRxwid3Kui33729Nw',
        scan: 5
      });

      recovery.transactionHex.should.equal('010000000174eda73749d65473a8197bac5c26660c66d60cc77a751298ef74931a478382e100000000fdfd000048304502210091687819c7543a17d84768bca0019278c64ccc67e1c2a665422c091eb70bade902206be55b4ec25f80d433ea26ef7caa35b7b77791954f26b35e48f3535b0c4189a901473044022070328e7c3541f3acd83a0600834fcb0e0e566c93826434bd378c5913f09cb11c02201f33817cf92354dc5bc40a55a5070688949cfca93cd77860a7549a36acace2d3014c69522102f5ca5d074093abf996278d1e82b64497333254c786e9a69d34909a785aa9af32210239125d1a21ba8ae375cd37a92e48700cbb3bc1b1268d3c3f7e1d95f42155e1a821031ab00568ea1522a55f277699110649f3b8d08022494af2cc475c09e8a43b3a3a53aeffffffff0100ed7b000000000017a914c39dcc27823a8bd42cd3318a1dac8c25789b7ac78700000000');
      recovery.tx.TxId.should.equal('6a441c7263a1596b68434f4cd7c0dd209308391b23f7f21f37d7e154bb2239d1');
      recovery.tx.Vin.length.should.equal(1);
      recovery.tx.Vout.length.should.equal(1);
      recovery.tx.Vin[0].TxId.should.equal('e18283471a9374ef9812757ac70cd6660c66265cac7b19a87354d64937a7ed74');
      recovery.tx.Vin[0].Sequence.should.equal('4294967295');
      recovery.tx.Vin[0].ScriptSig.Asm.should.equal('0 304502210091687819c7543a17d84768bca0019278c64ccc67e1c2a665422c091eb70bade902206be55b4ec25f80d433ea26ef7caa35b7b77791954f26b35e48f3535b0c4189a9[ALL] 3044022070328e7c3541f3acd83a0600834fcb0e0e566c93826434bd378c5913f09cb11c02201f33817cf92354dc5bc40a55a5070688949cfca93cd77860a7549a36acace2d3[ALL] 522102f5ca5d074093abf996278d1e82b64497333254c786e9a69d34909a785aa9af32210239125d1a21ba8ae375cd37a92e48700cbb3bc1b1268d3c3f7e1d95f42155e1a821031ab00568ea1522a55f277699110649f3b8d08022494af2cc475c09e8a43b3a3a53ae');
      recovery.tx.Vin[0].ScriptSig.Hex.should.equal('0048304502210091687819c7543a17d84768bca0019278c64ccc67e1c2a665422c091eb70bade902206be55b4ec25f80d433ea26ef7caa35b7b77791954f26b35e48f3535b0c4189a901473044022070328e7c3541f3acd83a0600834fcb0e0e566c93826434bd378c5913f09cb11c02201f33817cf92354dc5bc40a55a5070688949cfca93cd77860a7549a36acace2d3014c69522102f5ca5d074093abf996278d1e82b64497333254c786e9a69d34909a785aa9af32210239125d1a21ba8ae375cd37a92e48700cbb3bc1b1268d3c3f7e1d95f42155e1a821031ab00568ea1522a55f277699110649f3b8d08022494af2cc475c09e8a43b3a3a53ae');
      recovery.tx.Vout[0].N.should.equal(0);
      recovery.tx.Vout[0].Value.should.equal(0.081216);
      recovery.tx.Vout[0].ScriptPubKey.Asm.should.equal('OP_HASH160 c39dcc27823a8bd42cd3318a1dac8c25789b7ac7 OP_EQUAL');
      recovery.tx.Vout[0].ScriptPubKey.Hex.should.equal('a914c39dcc27823a8bd42cd3318a1dac8c25789b7ac787');
      recovery.tx.Vout[0].ScriptPubKey.Type.should.equal('scripthash');
      recovery.tx.Vout[0].ScriptPubKey.ReqSigs.should.equal(1);
      recovery.tx.Vout[0].ScriptPubKey.Addresses.length.should.equal(1);
      recovery.tx.Vout[0].ScriptPubKey.Addresses[0].should.equal('2NB5Ynem6iNvA6GBLZwRxwid3Kui33729Nw');
    }));


  });

  describe('Recover Bitcoin Cash', function() {
    it('should generate BCH recovery tx', co(function *() {
      recoveryNocks.nockBchRecovery();

      const basecoin = bitgo.coin('tbch');
      const recovery = yield basecoin.recover({
        userKey: '{"iv":"A3HVSDow6/GjbU8ZUlq5GA==","v":1,"iter":10000,"ks":256,"ts":64,"mode"\n' +
        ':"ccm","adata":"","cipher":"aes","salt":"D1V4aD1HVto=","ct":"C5c0uFBH6BuB11\n' +
        'ikKnso9zaTpZbdk1I7c3GwVHdoOj2iEMl2jfKq30K0fL3pKueyQ5S412a+kbeDC0/IiZAE2sDIZ\n' +
        't4HQQ91ivGE6bRS/PJ9Pv4E2y44plH05YTNPdz9bZhf2NCvSve5+TPS4iZuptOeO2lXE1w="}',
        backupKey: '{"iv":"JG0lyUpjHs7k2UVN9ox31w==","v":1,"iter":10000,"ks":256,"ts":64,"mode"\n' +
        ':"ccm","adata":"","cipher":"aes","salt":"kEdza1Fy82E=","ct":"54fBDIs7EWVUp1\n' +
        '6slxuM6nQsLJCrwgxXB3lzS6GMbAptVtHSDPURUnZnbRYl0CN9LnNGZEqfl7w4GbCbDeCe2IvyZ\n' +
        'dgeFCVPRYiAL/0VZeC97/pAkP4tuybqho0XELLyrYOgwgGAtoqYs5gqmfexu8R/9wEp2iI="}\n',
        bitgoKey: 'xpub661MyMwAqRbcFwmW1HYESGP4x6tKWhYCgSK3J9T3y1eaLXkGszcbBSd4h4tM6Nt17JkcZV768RWHYrqjeEpyYabj2gv9XtdNJyww4LnJZVK',
        walletPassphrase: TestV2BitGo.V2.TEST_RECOVERY_PASSCODE,
        recoveryDestination: '2MztSo6jqjLWcvH4g6QoMChbrWkJ3HHzQua',
        scan: 5
      });

      should.exist(recovery);
      recovery.transactionHex.should.equal('02000000015a3319949e2a3741bbb062f63543f4327db3ce47d26eb3adb4bcdc31fbe8a6df00000000fdfd000047304402206b1809a6e92683976d26acc9a49256f0c36cae9eac2d50a2fe6ef6941139662902205df3393a7363512db6fe17ce6422993eee01ca5344ac074d6142b63096840f4d41483045022100d3c3cc60e547eb4dded6596ca7ae386d016357d7261f805a8a08d085d80e357f022036ed44555f2a9ebd5cb5f7b26e82f8d2155e6a352fc0dfce2c4411b9399ac7b3414c69522103b11db31fb294b8757cf6849631dc6b23e56db0ed4e55d14edf3a8cb8c0eebff42103129bdad9e9a954d2b8c4a375b020b012b634a3641c5f3a0404af4ce99fd23c9521023015ea25115d67e49424248552491cf6b5e47eddb387fad1d652811e02cd53f453aeffffffff01ce6886470000000017a91453d2f642f1e40f888ba0ef57c359983ccfd40f908700000000');
      recovery.should.have.property('inputs');
      recovery.inputs.length.should.equal(1);
      recovery.inputs[0].should.have.property('chainPath');
      recovery.inputs[0].chainPath.should.equal('/0/0/1/1');
      recovery.inputs[0].should.have.property('redeemScript');
      recovery.inputs[0].redeemScript.should.equal('522103b11db31fb294b8757cf6849631dc6b23e56db0ed4e55d14edf3a8cb8c0eebff42103129bdad9e9a954d2b8c4a375b020b012b634a3641c5f3a0404af4ce99fd23c9521023015ea25115d67e49424248552491cf6b5e47eddb387fad1d652811e02cd53f453ae');
    }));
  });

  describe('Recover Ripple', function() {
    it('should generate XRP recovery tx', function() {

      recoveryNocks.nockXrpRecovery();

      const basecoin = bitgo.coin('txrp');
      return basecoin.recover({
        userKey: '{"iv":"rU++mEtIHtbp3d4jg5EulA==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"ip1rb59uYnM=","ct":"ssmP9abPoVyXkW4Io0SUy+AAS8lr+wgIerTMw+lDYnkUh0sjlI4A6Fpve0q1riQ3Dy/J0bNu7dgoZkO4xs/X6dzwEwlmPhk3pEQ7Yd4CXa1zA01y0Geu900FLe4LdaS8jt6fixui2tTd4Vi3JYglF1/HmCjG1Ug="}',
        backupKey: '{"iv":"uB/BTcn1rXmgYGfncXOowg==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"I3WrumxkuMQ=","ct":"sgyDNAzNsBruTRm0d04oBTBf8lheHNKS+dRgl8FeMEhodKsiyjtRVHG0CHPf5rV3g5ixVnZ+iwsSCv3PKyyeoy7RGnT0AG9YYpi0me+OvP8331iO+n5quzstrGbV1j8uEh5IMW78S+YUZKSx6zbbdZ0xNu8D5WM="}',
        rootAddress: 'raGZWRkRBUWdQJsKYEzwXJNbCZMTqX56aA',
        walletPassphrase: TestV2BitGo.V2.TEST_WALLET1_PASSCODE,
        recoveryDestination: 'rsv2kremJSSFbbaLqrf8fWxxN5QnsynNm2?dt=12345'
      })
      .then(function(recovery) {
        recovery.txHex.should.equal('120000228000000024000000042E00003039201B00060FB561400000024E06C0C068400000000000001E7300811439CA010E0E0198150F8DDD5768CCD2B095701D8C8314201276ADC469C4F10D1369E0F5C5A7DEF37B2267F3E0107321026C91974146427889C801BD26CE31CE0E10307A69DFE4139DE45E5E35933A6B03744630440220759D31959F364794A84F42E6E300D67C56A52EE253324020AC7ECD48E36BE1CA022001DC461FC0471BBF3E1D8F66679EAD173CDA74214D10462C0309D5E6A5C413E18114ABB5B7C843F3AA8D8EFACC3C5A7D9B0484C17442E1E010732102F4E376133012F5404990C7E1DF83A9F943B30D55F0D856632C8E8378FCEB70D2744730450221009E1FC6A174E68250A1104DEDA5D667BBFA431944FA67608FB11FD17CAE5AF09C0220453E6157411B70F01D799179B08EB7BD2135BCD8E6253F07CB681989547078778114ACEF9F0A2FCEC44A9A213444A9E6C57E2D02856AE1F1');
        recovery.id.should.equal('02D3CEEFC34AF91072F12ABF3588D610299FE51A8F478424616E28DE0B8041D4');
        recovery.outputAmount.should.equal('9899000000');
        recovery.outputs.length.should.equal(1);
        recovery.outputs[0].address.should.equal('rsv2kremJSSFbbaLqrf8fWxxN5QnsynNm2?dt=12345');
        recovery.outputs[0].amount.should.equal('9899000000');
        recovery.fee.fee.should.equal('30');
      });

    });
  });

  describe('Recover ERC20', function() {
    it('should successfully construct a recovery transaction for tokens stuck in a wallet', co(function *() {
      const wallet = bitgo.nockEthWallet();

      // There should be 24 Potatokens stuck in our test wallet (based on nock)
      const tx = yield wallet.recoverToken({
        tokenContractAddress: TestV2BitGo.V2.TEST_ERC20_TOKEN_ADDRESS,
        recipient: TestV2BitGo.V2.TEST_ERC20_TOKEN_RECIPIENT,
        walletPassphrase: TestV2BitGo.V2.TEST_ETH_WALLET_PASSPHRASE
      });

      should.exist(tx);
      tx.should.have.property('halfSigned');

      const txInfo = tx.halfSigned;
      txInfo.should.have.property('contractSequenceId');
      txInfo.contractSequenceId.should.equal(101);
      txInfo.should.have.property('expireTime');
      txInfo.should.have.property('gasLimit');
      txInfo.gasLimit.should.equal(500000);
      txInfo.should.have.property('gasPrice');
      txInfo.gasPrice.should.equal(20000000000);
      txInfo.should.have.property('operationHash');
      txInfo.should.have.property('signature');
      txInfo.should.have.property('tokenContractAddress');
      txInfo.tokenContractAddress.should.equal(TestV2BitGo.V2.TEST_ERC20_TOKEN_ADDRESS);
      txInfo.should.have.property('walletId');
      txInfo.walletId.should.equal(TestV2BitGo.V2.TEST_ETH_WALLET_ID);
      txInfo.should.have.property('recipient');
      txInfo.recipient.should.have.property('address');
      txInfo.recipient.address.should.equal(TestV2BitGo.V2.TEST_ERC20_TOKEN_RECIPIENT);
      txInfo.recipient.should.have.property('amount');
      txInfo.recipient.amount.should.equal('2400');
    }));
  });

});

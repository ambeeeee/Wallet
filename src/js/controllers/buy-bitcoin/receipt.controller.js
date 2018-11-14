'use strict';

(function() {
  angular
      .module('bitcoincom.controllers')
      .controller('buyBitcoinReceiptController', receiptController);

  function receiptController(
    $ionicHistory
    , $log
    , moonPayService
    , profileService
    , popupService
    , $scope
    , $state
    ) {
    var vm = this;

    // Functions
    vm.onDone = onDone;
    vm.onGoToWallet = onGoToWallet;
    vm.onMakeAnotherPurchase = onMakeAnotherPurchase;

    var moonpayTxId = '';
    var walletId = '';
    

    $scope.$on('$ionicView.beforeEnter', _onBeforeEnter);

    function _initVariables() {
      moonpayTxId = $state.params.moonpayTxId;
      console.log('moonpayTxId:', moonpayTxId);

      vm.haveTxInfo = false;
      // Change this to crypto later when the transaction is complete
      vm.lineItems = {
        bchQty: 0,
        rateUsd: 0,
        processingFee: 0,
        total: 0
      }
      vm.purchasedCurrency = 'USD';
      vm.walletName = '';

      console.log(moonpayTxId);
    }

    function _onBeforeEnter() {
      console.log('_onBeforeEnter()');
      _initVariables();

      moonPayService.getTransaction(moonpayTxId).then(
        function onGetTransactionSuccess(transaction) {
          console.log('Transaction:', transaction);
          
          vm.haveTxInfo = true;

          vm.purchasedAmount = transaction.baseCurrencyAmount
          vm.lineItems.bchQty = transaction.quoteCurrencyAmount;

          vm.rateUsd = transaction.baseCurrencyAmount / transaction.quoteCurrencyAmount;

          vm.lineItems.processingFee = transaction.feeAmount + transaction.extraFeeAmount;
          vm.lineItems.total = vm.lineItems.processingFee + transaction.baseCurrencyAmount;

          profileService.getWalletFromAddresses([transaction.walletAddress], 'bch', function onWallet(err, walletAndAddress) {
            if (err) {
              $log.error('Error getting wallet from address. ' + err.message || '');
              return;
            }

            vm.wallet = walletAndAddress.wallet;

            $scope.$apply();
          });

          //$scope.$apply();
        },
        function onGetTransactionError(err) {
          $log.error(err);
          
          var title = gettextCatalog('Error');
          var message = err.message || gettextCatalog('Failed to get transaction data.');
          popupService.showAlert(title, message);
        }
      );

      
    }

    function onDone() {
      $ionicHistory.nextViewOptions({
        disableAnimation: true,
        historyRoot: true
      });
      $state.go('tabs.home').then(
        function () {
          $state.go('tabs.buybitcoin');
        }
      );
    }

    function onGoToWallet() {
      $ionicHistory.nextViewOptions({
        disableAnimation: true,
        historyRoot: true
      });
      $state.go('tabs.home').then(
        function() {
          $state.go('tabs.wallet', { walletId: walletId });
        }
      );
    }

    function onMakeAnotherPurchase() {
      $ionicHistory.nextViewOptions({
        disableAnimation: true,
        historyRoot: true
      });
      $state.go('tabs.home').then(
        function() {
          $state.go('tabs.buybitcoin').then(
            function () {
              $state.go('tabs.buybitcoin-amount');
            }
          );
        }
      );
    }

  }
})();

'use strict';

/**
 * incomingData is an intermediate to redirect either to the sendFlow
 * or to import/join a wallet.
 */
angular.module('copayApp.services').factory('incomingData', function(externalLinkService, bitcoinUriService, $log, $state, $timeout, $ionicHistory, bitcore, bitcoreCash, $rootScope, payproService, scannerService, sendFlowService, appConfigService, popupService, gettextCatalog, bitcoinCashJsService) {

  var root = {};

  root.showMenu = function(data) {
    $rootScope.$broadcast('incomingDataMenu.showMenu', data);
  };

  root.redir = function(data, cbError) {
    var parsed = bitcoinUriService.parse(data);

    console.log(parsed);
    $log.debug(parsed);


    if (parsed.isValid) {
      if (parsed.isTestnet) {
        if (cbError) {
          var errorMessage = gettextCatalog.getString('Testnet is not supported.');
          cbError(new Error(errorMessage));
        }
      } else {
        scannerService.pausePreview();

        /**
         * Strategy for the action
         */
        if (parsed.copayInvitation) {
          $state.go('tabs.home').then(function() {
            $state.transitionTo('tabs.add.join', {
              url: data
            });
          });
        } else if (parsed.import) {
          $state.go('tabs.home').then(function() {
            $state.transitionTo('tabs.add.import', {
              code: data
            });
          });
        } else if (
          !parsed.isValid
          || parsed.privateKey
          || (sendFlowService.state.isEmpty() && !parsed.url && !parsed.amount)
        ) {
          root.showMenu({
            original: data,
            parsed: parsed
          });
        } else {
          var state = sendFlowService.state.getClone();
          state.data = data;
          
          sendFlowService.start(state, function onError(err) {
            /**
             * OnError, open the menu (link not validated)
             */
            root.showMenu({
              original: data,
              parsed: parsed
            });
          });
        }
      }
    } else {
      if (cbError) {
        var errorMessage = gettextCatalog.getString('Data not recognised.');
        cbError(new Error(errorMessage));
      }
    }
  };

  return root;
});

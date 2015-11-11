/* global angular, Anvil */

'use strict'

window.Anvil = (function () {
  var Anvil = {}
  // file anvil-connect.js is loaded after this file.
  // initialization happens below.

  function init ($q, $http, $location, $document, $window) {
    Anvil.initHttpAccess({
      request: function (config) {
        return $http(config) // ? TODO: do we need .promise() here
      },
      getData: function (response) {
        return response.data
      }
    })

    Anvil.initDeferred({
      defer: function () {
        return $q.defer()
      },
      deferToPromise: function (deferred) {
        return deferred.promise
      }
    })

    Anvil.initLocationAccess({
      hash: function () {
        return $location.hash()
      },
      path: function () {
        return $location.path()
      }
    })

    Anvil.initDOMAccess({
      getWindow: function () {
        return $window
      },
      getDocument: function () {
        return $document[0]
      }
    })

    // should this be called here or in .run block?
    // This would now change to
    // Anvil.validate.prepareValidate().then(function () {
    //  console.log(provider)
    // })

    $window.addEventListener('storage', Anvil.updateSession, true)

    /**
     * Reinstate an existing session
     */

    Anvil.deserialize()
  }

  Anvil.init = init

  return Anvil
})()

angular.module('anvil', [])

  .provider('Anvil', function AnvilProvider () {
    /**
     * Require Authentication
     */

    function requireAuthentication ($location, Anvil) {
      if (!Anvil.isAuthenticated()) {
        Anvil.authorize()
      }

      return Anvil.session
    }

    Anvil.requireAuthentication = ['$location', 'Anvil', requireAuthentication]

    /**
     * Require Scope
     */

    Anvil.requireScope = function (scope, fail) {
      return ['$location', 'Anvil', function requireScope ($location, Anvil) {
        if (!Anvil.isAuthenticated()) {
          Anvil.authorize()
        } else if (Anvil.session.access_claims.scope.indexOf(scope) === -1) {
          $location.path(fail)
          return false
        } else {
          return Anvil.session
        }
      }]
    }

    /**
     * Provider configuration
     */

    this.configure = function (options) {
      Anvil.configure(options)
    }

    /**
     * Factory
     */

    Anvil.$get = [
      '$q',
      '$http',
      '$rootScope',
      '$location',
      '$document',
      '$window', function ($q, $http, $rootScope, $location, $document, $window) {
        Anvil.init($q, $http, $location, $document, $window)
        return Anvil
      }]

    return Anvil
  })

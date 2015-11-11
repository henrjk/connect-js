/* global Q, location */

'use strict'

window.Anvil = (function () {
  var Anvil = {}

  function init () {
    Anvil.initHttpAccess({
      request: function (config) {
        return Q.xhr(config)
      },
      getData: function (response) {
        return response.data
      }
    })

    Anvil.initDeferred({
      defer: function () {
        return Q.defer()
      },
      deferToPromise: function (deferred) {
        return deferred.promise
      }
    })

    Anvil.initLocationAccess({
      hash: function () {
        return location.hash.substring(1)
      },
      path: function () {
        return location.pathname
      }
    })

    Anvil.initDOMAccess({
      getWindow: function () {
        return window
      },
      getDocument: function () {
        return document
      }
    })

    window.addEventListener('storage', Anvil.updateSession, true)

    /**
     * Reinstate an existing session
     */

    Anvil.deserialize()
  }

  Anvil.init = init

  return Anvil
})()

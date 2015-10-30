/* global jQuery, $, location */

'use strict'

window.Anvil = (function () {
  var Anvil = {}

  function init () {
    Anvil.initHttpAccess({
      request: function (config) {
        return $.ajax(config).promise()
      },
      getData: function (response) {
        return response
      }
    })

    Anvil.initDeferred({
      defer: function () {
        return jQuery.Deferred()
      },
      deferToPromise: function (deferred) {
        return deferred.promise()
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

    if (!Anvil.validate.setJWK) {
      delete Anvil.getKeys
    }

    window.addEventListener('storage', Anvil.updateSession, true)

    /**
     * Reinstate an existing session
     */

    Anvil.deserialize()
  }

  Anvil.init = init

  return Anvil
})()

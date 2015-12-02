/* eslint-env es6 */
/* global location */

'use strict'

import Q from 'q'
import Anvil from './anvil-connect'

export default function init (providerOptions) {
  Anvil.init(providerOptions, {
    http: {
      request: function (config) {
        return Q.xhr(config)
      },
      getData: function (response) {
        return response.data
      }
    },
    deferred: {
      defer: function () {
        return Q.defer()
      },
      deferToPromise: function (deferred) {
        return deferred.promise
      }
    },
    location: {
      hash: function () {
        return location.hash.substring(1)
      },
      path: function () {
        return location.pathname
      }
    },
    dom: {
      getWindow: function () {
        return window
      },
      getDocument: function () {
        return document
      }
    }
  })
  return Anvil
}

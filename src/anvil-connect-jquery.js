/* eslint-env es6 */
/* global location */

import Anvil from './anvil-connect'
import jQuery from 'jquery'

export default function init (providerOptions) {
  Anvil.init(providerOptions, {
    http: {
      request: function (config) {
        return jQuery.ajax(config).promise()
      },
      getData: function (response) {
        return response
      }
    },
    deferred: {
      defer: function () {
        return jQuery.Deferred()
      },
      deferToPromise: function (deferred) {
        return deferred.promise()
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

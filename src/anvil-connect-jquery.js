/* eslint-env es6 */
/* global location */

'use strict'  // ES6 modules are strict but may be safer for transpiling perhaps

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

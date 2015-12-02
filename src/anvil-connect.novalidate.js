/* eslint-env es6 */

// WARNING: jwt tokes are not validated by this module!
//
// JavaScript inside a browser cannot be
// locked down to ensure only trusted code runs and an attacker
// can take advantage of this to disable any crypto we might put in place
// here.
// Some believe that all browser crypto is futile.
//
// But cryto can help against other attacks such as
// cross-site request forgery and also accessing and stealing
// information from the Browsers local storage.
//
// This is used that tokens were just received from the server which
// in production must happen over SSL.
// For situations where validating the just received token
// in the browser seems the top this version can be used.
//
// This code does not come with the crypto dependencies required for
// validating the tokens and may be useful for a certain class of browser
// applications.

import jwt_decode from 'jwt-decode'

/* eslint-disable indent */
// (function (exports) {
  'use strict'

  var Validate = {}

  /**
   * Provider configuration
   */

  function configure (anvil, options) {
    Validate.anvil = anvil
  }

  Validate.configure = configure

  /*
   * Prepare validate
   *
   * Nothing to do really but callers expect a promise return value
   */
  function prepareValidate () {
    var deferred = Validate.anvil.apiDefer.defer()
    deferred.resolve()
    return Validate.anvil.apiDefer.deferToPromise(deferred)
  }

  Validate.prepareValidate = prepareValidate

/**
   * Validate tokens
   */

  function validateAndParseToken (token) {
    if (!token) {
      return undefined
    }

    var claims = jwt_decode(token)
    return claims
  }

  Validate.validateAndParseToken = validateAndParseToken

  export default Validate
// })(Anvil)

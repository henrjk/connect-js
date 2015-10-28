/* global Anvil, localStorage, b64utohex, KJUR  */

/* eslint-disable no-shadow-restricted-names */
(function (exports, undefined) {
/* eslint-enable no-shadow-restricted-names */

  'use strict'

  var Validate = {}

  var jwk, hN, hE

  /**
   * Set JWK
   */

  function setJWK (jwks) {
    var key = 'anvil.connect.jwk'

    // Recover from localStorage.
    if (!jwks) {
      try {
        jwk = JSON.parse(localStorage[key])
      } catch (e) {
        console.log('Cannot deserialized JWK')
      }
    }

    // Argument is a naked object.
    if (!Array.isArray(jwks) && typeof jwks === 'object') {
      jwk = jwks
    }

    // Argument is an array of JWK objects.
    // Find the key for verifying signatures.
    if (Array.isArray(jwks)) {
      jwks.forEach(function (obj) {
        if (obj && obj.use === 'sig') {
          jwk = obj
        }
      })
    }

    if (jwk) {
      // provider.jwk = jwk
      hN = b64utohex(jwk.n)
      hE = b64utohex(jwk.e)
      localStorage[key] = JSON.stringify(jwk)
    }
  }

  Validate.setJWK = setJWK

  /**
   * Provider configuration
   */

  function configure (options) {
    setJWK(options.jwk)
  }

  Validate.configure = configure

  /**
   * Validate tokens
   */

  function validateAndParseToken (token) {
    if (!token) {
      return undefined
    }
    var jws = new KJUR.jws.JWS()
    // Decode the access token and verify signature
    if (token &&
      !jws.verifyJWSByNE(token, hN, hE)) {
      throw new Error('Failed to verify access token signature.')
    }
    try {
      var claims = JSON.parse(jws.parsedJWS.payloadS)
      return claims
    } catch (e) {
      throw e
    }
  }

  Validate.validateAndParseToken = validateAndParseToken

  /**
   * Export
   */

  exports.validate = Validate

  return exports.validate
})(Anvil)

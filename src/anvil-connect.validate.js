/* eslint-env es6 */

import bows from 'bows'
import Anvil from './anvil-connect'

'use strict'

var log = bows('Anvil.validate')

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
      log('Cannot deserialized JWK', e)
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
  return jwk
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
 * Signing Key - only used if validate has setJWK method!
 */

function getKeys () {
  var apiHttp = Anvil.apiHttp
  return Anvil.request({
    method: 'GET',
    url: Anvil.issuer + '/jwks',
    crossDomain: true
  }).then(response => {
    Anvil.validate.setJWK(response && apiHttp.getData(response) &&
      apiHttp.getData(response).keys)
    return response
  })
}

Validate.getKeys = getKeys

/*
 * Prepare validate
 *
 * May retrieve keys if needed. Returns a promise.
 */
function prepareValidate () {
  var jwk = setJWK() // reads from local storage
  if (jwk) {
    // this is not doing anything
    return Promise.resolve()
  } else {
    return getKeys()
  }
}

Validate.prepareValidate = prepareValidate

/**
 * Validate tokens
 */

function validateAndParseToken (token) {
  return new Promise(function (resolve, reject) {
    if (!token) {
      resolve(undefined)
    } else {
      const jws = new KJUR.jws.JWS()
      // Decode the access token and verify signature
      try {
        if (token && !jws.verifyJWSByNE(token, hN, hE)) {
          throw new Error('Failed to verify access token signature.')
        }
      } catch (e) {
        reject(e)
      }
      try {
        let claims = JSON.parse(jws.parsedJWS.payloadS)
        resolve(claims)
      } catch (e) {
        reject(e)
      }
    }
  })
}

Validate.validateAndParseToken = validateAndParseToken

export default Validate

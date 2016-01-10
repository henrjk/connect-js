/* eslint-env es6 */
/* global localStorage */

import bows from 'bows'
import Anvil from './anvil-connect'
import {verifyJWT} from './subtle_encrypt'
import {decodeJWSSegment} from './jws'

'use strict'

var log = bows('Anvil.validate')

var jwk

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
    localStorage[key] = JSON.stringify(jwk)
  }
  return jwk
}

/**
 * Provider configuration
 */

export function configure (anvil, options) {
  setJWK(options.jwk)
}

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

/*
 * Prepare validate
 *
 * May retrieve keys if needed. Returns a promise.
 */
export function prepareValidate () {
  var jwk = setJWK() // reads from local storage
  if (jwk) {
    // Return promise also if keys are already in local storage
    return Promise.resolve()
  } else {
    return getKeys()
  }
}

/**
 * Validate tokens
 */
export function validateAndParseToken (token) {
  const p = Promise.resolve(undefined)
  if (!token) {
    return p
  } else {
    return p
      .then(() => {
        return verifyJWT(jwk, token)
      })
      .then(token => {
        return decodeJWSSegment(token.payload)
      })
  }
}

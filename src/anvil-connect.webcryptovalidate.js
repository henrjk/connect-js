/* eslint-env es6 */

import * as jwks from './jwks'
import {verifyJWT} from './subtle_encrypt'
import {decodeSegment} from './jws'
import bows from 'bows'

const log = bows('webcryptovalidate')

/**
 * JWKs configuration
 */
export function configure (anvil, options) {
  jwks.setJWK(options.jwk)
}

/*
 * Prepare validate
 *
 * May retrieve keys if needed. Returns a promise.
 */
export function prepareValidate () {
  return jwks.prepareKeys()
}

/**
 * Validate tokens
 */
export function validateAndParseToken (token) {
  const p = Promise.resolve(undefined)
  if (!token) {
    return p
  } else {
    log.debug('validateAndParseToken(): entering with token:', token)
    return p
      .then(() => {
        return verifyJWT(jwks.jwk, token)
      })
      .then(token => {
        log.debug('validateAndParseToken() token verified, now decoding:', token)
        return decodeSegment(token.payload)
      })
  }
}

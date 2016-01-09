/**
 * Created by dev on 27/12/15.
 */

import {ab2hex, base64urlstr2ab, ascii2ab} from './ab_utils'

let crypto = window.crypto

// see https://github.com/diafygi/webcrypto-examples
// see http://blog.engelke.com/2014/06/22/symmetric-cryptography-in-the-browser-part-1/

export function generateEncryptionKey () {
  return crypto.subtle.generateKey(
    {name: 'AES-CBC', length: 128},
    true,
    ['encrypt', 'decrypt']
  )
}

function exportEncryptionKey (key) {
  return crypto.subtle.exportKey(
    'raw', key). then(keyData =>
      ({ encryptionKey: key, exportedKey: keyData }))
}

function encryptArrayBuffer ({key, abPlainText}) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  return crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    key.encryptionKey,
    abPlainText).then(encrypted => ({
      abKey: key.exportedKey,
      abIv: iv,
      abEncrypted: encrypted
    }))
}

export function genKeyAndEncrypt (abPlainText) {
  return generateEncryptionKey()
    .then(exportEncryptionKey)
    .then(key => {
      return encryptArrayBuffer({key, abPlainText})
    })
}

function importEncryptionKey (abKeyData) {
  return crypto.subtle.importKey(
    'raw', abKeyData,
    {name: 'AES-CBC'},
    false,
    ['encrypt', 'decrypt']
  )
}

function decryptArrayBuffer ({key, abIv, abEncrypted}) {
  return crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: abIv
    },
    key,
    abEncrypted)
}

export function decrypt ({abKey, abIv, abEncrypted}) {
  return importEncryptionKey(abKey)
    .then(key => {
      return decryptArrayBuffer({key, abIv, abEncrypted})
    })
}

export function sha256 (ab) {
  return crypto.subtle.digest('SHA-256', ab)
}

// jwk is a JWK object not JSON?: toto verify that exportKey would do this
// as well
// https://github.com/WebKit/webkit/blob/master/LayoutTests/crypto/subtle/rsassa-pkcs1-v1_5-import-jwk.html
function importJWK (jwk) {
  return crypto.subtle.importKey(
    'jwk', jwk,
    {name: 'RSASSA-PKCS1-v1_5', hash: {name: 'SHA-256'}},
    true, // extractable
    ['verify']
  )
}

export function verifyJWT (jwkPublic, token) {
  return new Promise(function (resolve, reject) {
    let [theader, tpayload, tsignature, ...rest] = token.split('.')
    if (rest.length > 0) {
      reject(`token has ${3 + rest.length} dot '.' separated sections where 3 are expected.`)
      return
    }
    if (tsignature === undefined) {
      reject('token misses signature')
      return
    }
    if (tpayload === undefined) {
      reject('token misses payload')
      return
    }
    if (theader === undefined) {
      reject('token misses header')
      return
    }
    try {
      let abData = ascii2ab(theader + '.' + tpayload)
      let abSignature = base64urlstr2ab(tsignature)
      // todo: this should probably throw if character are not base64plus chars!

      resolve(importJWK(jwkPublic).then(key => {
        return crypto.subtle.verify(
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: {
              name: 'SHA-256'
            }
          },
          key,
          abSignature,
          abData
        )
      }))
    } catch (err) {
      reject(err)
    }
  })
}


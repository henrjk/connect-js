/**
 * Created by dev on 27/12/15.
 */

import {ab2hex} from './ab_utils'

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
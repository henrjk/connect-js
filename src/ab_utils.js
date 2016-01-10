/* eslint-env es6 */
/* global TextEncoderLite, TextDecoderLite */

import * as base64 from 'base64-js'
import 'text-encoder-lite'
// see jsperf.com/hex-conversion

const hexChars = '0123456789abcdef'
const hexEncodeArray = hexChars.split('')

export function ab2hex (ab) {
  let arr = new Uint8Array(ab)
  let s = ''
  for (var i = 0, n = ab.byteLength; i < n; i++) {
    const byte = arr[i]
    s += hexEncodeArray[byte >>> 4]
    s += hexEncodeArray[byte & 0x0f]
  }
  return s
}

function hexdigit (c) {
  const i = hexChars.indexOf(c)
  if (i < 0) {
    throw new Error(`Character '${c}' is not a valid hex character: expected '${hexChars}'`)
  }
  return i
}

export function hex2ab (hexstr) {
  const len = hexstr.length
  if (len % 2 !== 0) {
    throw new Error(`hex string '${hexstr} 'is expected to have even number of hex characters`)
  }
  const buflen = len >>> 1
  const buf = new ArrayBuffer(buflen)
  const view = new Uint8Array(buf)

  let i = 0
  let rest = hexstr
  while (rest.length > 0) {
    let [d1, d0, ... newrest] = rest  // rest parameter must not be the same as already existing variable
    // d0 === undefined should be handled by throw above.
    let n = hexdigit(d1) * 16 + hexdigit(d0)
    view[i++] = n
    rest = newrest
  }
  return buf
}

//
// JavaScript exposes characters (charCode) in a string as ucs-2.
// ucs-2 does not map unicode characters outside of the BMP [0000-ffff] 16-bit range.
// However one can store surrogate characters inside a ucs-2 string which
// can be properly decoded as well.
//
// ES6 however also supports code points (codePoint).
// Code points are available for all unicode characters in [0-10ffff] 21 bit range.
// It appears that this means that ES6 supports surfacing UTF-16 encoded strings
// inside of a plain string as sequences of code points.
//
// See https://mathiasbynens.be/notes/javascript-encoding
// See https://mathiasbynens.be/notes/javascript-unicode
// See http://www.2ality.com/2015/01/es6-strings.html
//
// A different character encoding such as UTF-8 would come to play only if
// one has to map a character string to a sequence of bytes.

// https://github.com/inexorabletash/text-encoding
// todo: do we need to support exotic unicode characters which may not be
//       converted correctly with the code shown below?
// function utf8str2ab(utf8str) {
//  return new TextEncoder('utf-8').encode(utf8str)
// }

// [JavaScript typed arrays - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
// [How to convert ArrayBuffer to and from String | Web Updates - Google Developers](https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en)
//
// Should one use the charCodeAt function as shown in http://qnimate.com/passphrase-based-encryption-using-web-cryptography-api/?
//
// http://stackoverflow.com/questions/5943726/string-charatx-or-stringx

// Encoding a JavaScript string as UTF-8 in an array buffer should be more
// straightforward to code in ES6 as one iterator over the unicode points
// simply like this:
// for (let c of str) {
//   let cp = ch.codePointAt(0)  // do something with code point.
//
// However at the moment I'd rather use the TextEncodeLite library for this.
// (https://github.com/coolaj86/TextEncoderLite)
//
// This is not a major endorsenment for that library. I took it because it is
// lean and mentioned on the MDN (https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob()_and_btoa()_using_TypedArrays_and_UTF-8

export function str2utf8ab (str) {
  return new TextEncoderLite('utf-8').encode(str)
}

export function abutf82str (ab) {
  return new TextDecoderLite('utf-8').decode(ab)
}

export function str2ab (str) {
  const strlen = str.length
  let buf = new ArrayBuffer(strlen * 2)
  let view = new Uint16Array(buf)
  for (var i = 0; i < strlen; i++) {
    view[i] = str.charCodeAt(i)
    // don't use charAt(i) here.
  }
  return buf
}

export function ab2str (ab) {
  return String.fromCharCode.apply(null, new Uint16Array(ab))
}

export function ascii2ab (str) {
  const strlen = str.length
  let buf = new ArrayBuffer(strlen)
  let view = new Uint8Array(buf)
  for (var i = 0; i < strlen; i++) {
    const cc = str.charCodeAt(i)
    if (cc > 127) {
      throw new Error(`String contains non ascii characters: charCode = '${cc}' at index '${i}'`)
    }
    view[i] = cc
  }
  return buf
}

export function ab2ascii (ab) {
  const view = new Uint8Array(ab)
  const len = view.length
  let s = ''
  for (var i = 0; i < len; i++) {
    const cc = ab[i]
    if (cc > 127) {
      throw new Error(`String contains non ascii characters: charCode = '${cc}' at index '${i}'`)
    }
    s += String.fromCharCode(cc)
  }
  return s
}

export function base64str2ab (base64str) {
  return base64.toByteArray(base64str)
}

export function ab2base64str (buf) {
  return base64.fromByteArray(new Uint8Array(buf))
}

export function base64urlstr2ab (base64urlstr) {
  // Decode url-safe style base64: https://github.com/beatgammit/base64-js/pull/10
  // however '=' padding characters must be added, if needed
  let str = base64urlstr
  let npad = 4 - str.length % 4
  if (npad === 4) {
    npad = 0
  }
  str = (str + '===').slice(0, str.length + npad)
  return base64.toByteArray(str)
}

export function ab2base64urlstr (buf) {
  const str = base64.fromByteArray(new Uint8Array(buf))
  // '=' is percent encoded in an URL so strip this:
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

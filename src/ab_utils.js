// see jsperf.com/hex-conversion
const hexChars = '0123456789abcdef'
const hexEncodeArray = hexChars.split('')

export function ab2hex (ab) {
  let arr = new Uint8Array(ab)
  let s = ''
  for (var i=0, n=ab.byteLength; i < n; i++) {
    const byte = arr[i]
    s += hexEncodeArray[byte >>> 4]
    s += hexEncodeArray[byte & 0x0f]
  }
  return s
}

function hexdigit(c) {
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
  while (rest.length > 0 ) {
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


export function utf8str2ab (str) {
  let buf = new ArrayBuffer(str.length)
  let view = new Uint8Array(buf)
  for (var i = 0, strlen = str.length; i < strlen; i++) {
    view[i] = str.charCodeAt(i)
    // don't use charAt(i) here.
  }
  return buf
}

export function ab2utf8str (ab) {
  let view = new Uint8Array(ab)
  let unis = []
  for (var i = 0, len = view.length; i < len; i++) {
    view[i] = str.charCodeAt(i)
    // don't use charAt(i) here.
  }

  let buf = new ArrayBuffer(str.length)
  for (var i = 0, strlen = str.length; i < strlen; i++) {
    view[i] = str.charCodeAt(i)
    // don't use charAt(i) here.
  }
  return buf
}

export function str2ab (str) {
  const strlen = str.length
  let buf = new ArrayBuffer(strlen*2)
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


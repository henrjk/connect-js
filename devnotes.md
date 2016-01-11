# Implementation notes about this code

## JavaScript and UTF-8

JavaScript (JS) exposes characters (charCode) in a string as *ucs-2*.
*ucs-2* does not map unicode characters outside of the BMP `[0000-ffff]` 16-bit range.
However one can use two surrogate characters inside a ucs-2 string to represent
a unicode character outside of the BMP.

ES6 supports code points (codePoint).
Code points are available for all unicode characters in `[0-10ffff]` 21 bit range.
It appears this means that ES6 supports surfacing UTF-16 encoded strings
inside of a JavaScript string as sequences of code points.

If this seems new to you reading these articles should help:
* [JavaScript’s internal character encoding: UCS-2 or UTF-16? · Mathias Bynens](https://mathiasbynens.be/notes/javascript-encoding)
* [JavaScript has a Unicode problem · Mathias Bynens](https://mathiasbynens.be/notes/javascript-unicode)
* [New string features in ECMAScript 6](http://www.2ality.com/2015/01/es6-strings.html)

## UTF-8 used in this code base
### JWS token
JWS tokens have three segments. The first two, the header and payload
represent JSON objects.

These segments are encoded as base64url encoding of the
bytes of the UTF-8 representation of JSON string:

  `base64url` encoded string -> utf8 bytes -> JSON JS string -> JS Object

### Anvil.sha256url(str)

Here the encoding is done as follows:

  JS String -> UTF-8 encoded bytes -> sha256 bytes -> base64url encoded bytes


### Thoughts on the implementation of UTF-8 support

There is a TextEncoder,TextDecoder standard API which however is not yet
supported across the board. The general polyfill would be quite large as this
supports more encodings than just UTF-8.

I did not find UTF-8 encodes/decoders coded in ES6 yet. Compared to implementing
this in ES5 the ES6 implementation should be relatively
straightforward to code as iterators will advance over unicode points
simply like this:
for (let c of str) {
  let cp = ch.codePointAt(0)  do something with code point.


However at the moment I'd rather use a library already available, the [TextEncoderLite library](https://github.com/coolaj86/TextEncoderLite) for this (on Github [inexorabletash/text-encoding](https://github.com/inexorabletash/text-encoding)

This is not a major endorsement for that library, but I did not find anything
wrong with it, it is
lean and mentioned on the [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob()_and_btoa()_using_TypedArrays_and_UTF-8)
A different character encoding such as UTF-8 would come to play only if
one has to map a character string to a sequence of bytes.

An alternative as [dissected here](http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html) would be to use:

``` JavaScript
function encode_utf8( s ) {
  return unescape( encodeURIComponent( s ) );
}

function decode_utf8( s ) {
  return decodeURIComponent( escape( s ) );
}
```

The following led me away from this approach:
  1. `escape` and `unescape` are deprecated
  2. Needed to produce bytes not characters.
  3. Looked rather inefficient.

Further general references on working with ArrayBuffers:

* [JavaScript typed arrays - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
* [How to convert ArrayBuffer to and from String | Web Updates - Google Developers](https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en)

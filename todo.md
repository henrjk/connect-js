## TODO before release/PR

- [x] @chris Check If OK to not use PhantomJS. I think yes
- [x] consider removing detailed comments...
- [x] remove/refactor none essential test code. -> did extended test suite
- [x] Look at todos in code base
- [ ] Make an ES5 commonJS build or AMD -> npm?
- [x] Add unit test so that token with alg: none will not be a security issue
- [ ] Automatic fallback to use no-validate when enabled cases.
- [ ] Wait for jspm 0.17
- [x] Check about the server key incompatibility
- [ ] Test MS browsers. This will require installing node on win or use a
       cloud service
- [x] Remove jquery
- [x] Look into crypto downloads of jspm, what are they for?
       https://github.com/jspm/jspm-cli/issues/1067
       These were dragged in by npm:sjcl
- [ ] Ensure webcrypto-shim to be versioned and perhaps not from master.
- [ ] Remove dependencies or have as dev/test dependencies:
         [ ] angular-mocks,
         [ ] babel*?
         [x] jquery
         [x] capaj/jspm-hot-reloader" seems like this is not really needed here..
         [x] sjcl
       True dependencies are:
         bows, base64-js, text-encode-lite, webcrypto-shim, tiny-emitter
         for plain.js: q
         for angular: angulat

## Should be elsewhere:

Resources used:
* [RFC 7517 - JSON Web Key (JWK)](https://tools.ietf.org/html/rfc7517#ref-JWT)
* [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519#ref-JWS)
* [RFC 7515 - JSON Web Signature (JWS)](https://tools.ietf.org/html/rfc7515#appendix-A.1)


## Issue/Question about keys used.

* [Webcrypto API · Issue #7 · anvilresearch/connect-js](https://github.com/anvilresearch/connect-js/issues/7)

* [test for pem-jwk](issue https://github.com/dannycoates/pem-jwk/issues/2)
Comment here:

Related workspaces are at
/Users/dev/code/experiment/rsa-pem-to-jwk
/Users/dev/code/experiment/pem-jwk

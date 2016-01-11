## TODO before release/PR

- [  ] @chris If OK to not use PhantomJS, then remove it
- [  ] consider removing detailed comments...
- [  ] Look at todos in code base
- [  ] Make an ES5 commonJS build or AMD -> npm?
- [  ] Add unit test so that token with alg: none will not be a security issue
- [  ] Automatic fallback to use no-validate when enabled cases.
- [  ] Wait for jspm 0.17
- [  ] Check about the key incompatibility
- [  ] Test MS browsers. This will require installing node on win or use a
       cloud service
- [  ] Remove jquery
- [  ] Look into crypto downloads of jspm, what are they for?
       https://github.com/jspm/jspm-cli/issues/1067
- [  ] Remove dependencies or have as dev/test dependencies:
         [ ]angular-mocks,
         [ ] babel*?
         [x] capaj/jspm-hot-reloader" seems like this is not really needed here..
         [x] sjcl
       True dependencies are:
         bows, base64-js, text-encode-lite, webcrypto-shim, tiny-emitter
         for plain.js: q
         for angular:


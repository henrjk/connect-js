/* eslint-env jasmine */
/* global localStorage */

import {module, inject} from 'angular-mocks'
import '../src/anvil-connect-angular'
import sjcl from 'sjcl'


'use strict'

describe('Anvil Connect', function () {
  var {Anvil, AnvilProvider, uri, nonce, $httpBackend, promise} = {}

  var config =
    {issuer: 'https://accounts.anvil.io',
    client_id: 'uuid',
    redirect_uri: 'https://my.app.com',
    scope: ['other'],
    display: 'popup',
    jwk: {
      'kty': 'RSA',
      'use': 'sig',
      'alg': 'RS256',
      'n': 'nhubIr98ugQw-6JHq4c5aWGMlFAU-6dXFYewby7A-d4mY_EIY9tujJWUIa0PXGx8e3KAi7vOF81tvUCIdbmlzduLWTy50zcIdBRO6d65020yQg4Mab-lNXedDVMfW2v15uq5PfrQNMSGSaO__ktnCyc4DQcB__cYb1-7yCXnmaGkqfKFamRusevK6HxzHyFTMvCLlGvmADUiuFA_1IVfbLryy5JLTCnsehBMiJ7oRfL8bY4mLuSolLRSORcrtk-p_no4YGb5OVgGbDJd1ZndsGCWeU-MFvrt7FIyJeaL7J54Vrna1YtmU6o1_oJZvZes1_o9YLG3Q1ntXcc86uM6Yw',
      'e': 'AQAB'
    }
    }

  beforeEach(module('anvil'))

  beforeEach(module(function ($injector) {
    AnvilProvider = $injector.get('AnvilProvider')
    AnvilProvider.configure(config)
  }))
  // console.log('AFTER CONFIG', AnvilProvider)

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend')
    Anvil = $injector.get('Anvil')
  }))

  describe('configure provider', function () {
    it('should set the issuer', function () {
      expect(AnvilProvider.issuer).toBe(config.issuer)
    })

    it('should set the default response type', function () {
      expect(AnvilProvider.params.response_type).toBe('id_token token')
    })

    it('should set the client id', function () {
      expect(AnvilProvider.params.client_id).toBe(config.client_id)
    })

    it('should set the redirect uri', function () {
      expect(AnvilProvider.params.redirect_uri).toBe(config.redirect_uri)
    })

    it('should set the default scope', function () {
      expect(AnvilProvider.params.scope).toContain('openid')
      expect(AnvilProvider.params.scope).toContain('profile')
    })

    it('should set additional scope', function () {
      expect(AnvilProvider.params.scope).toContain('other')
    })

    it('should set the display', function () {
      expect(AnvilProvider.display).toBe('popup')
    })

    it('should set the default display', function () {
      AnvilProvider.configure({})
      expect(AnvilProvider.display).toBe('page')
    })
  })

  describe('toFormUrlEncoded', function () {
    it('should encode a string from an object', function () {
      var encoded = Anvil.toFormUrlEncoded(AnvilProvider.params)
      expect(encoded).toContain('response_type=id_token%20token')
      expect(encoded).toContain('&redirect_uri=https%3A%2F%2Fmy.app.com')
      expect(encoded).toContain('&scope=openid%20profile%20other')
    })
  })

  describe('parseFormUrlEncoded', function () {
    it('should decode and parse an encoded object', function () {
      var decoded = Anvil.parseFormUrlEncoded('a=b%20c&d=e')
      expect(decoded.a).toBe('b c')
      expect(decoded.d).toBe('e')
    })
  })

  describe('parseUriFragment', function () {
    it('should return a fragment value from a Url', function () {
      var fragment = Anvil.getUrlFragment('https://host:port/path#a=b&c=d')
      expect(fragment).toBe('a=b&c=d')
    })
  })

  describe('popup', function () {
    it('should return parameters for a popup window', function () {
      var popup = Anvil.popup(700, 500)
      expect(popup).toContain('width=700,')
      expect(popup).toContain('height=500,')

      expect(popup).toContain('dialog=yes,')
      expect(popup).toContain('dependent=yes,')
      expect(popup).toContain('scrollbars=yes,')
      expect(popup).toContain('location=yes')
    })
  })

  describe('serialize', function () {
    beforeEach(function (done) {
      delete localStorage['anvil.connect']
      Anvil.session.access_token = 'random'
      Anvil.serialize().then(r => {
        this.result = r
        done()
      }).catch(e => {
        this.exception = e
        done()
      })
    })

    it('should store the current session in localStorage', function () {
      expect(localStorage['anvil.connect']).toBeDefined()
    })
  })

  describe('deserialize', function () {
    it('should retrieve and parse the current session from localStorage')
  })

  describe('reset', function () {
    it('should delete the current session from localStorage')
    it('should reset the session object')
    it('should remove the cookie value')
  })

  describe('uri with "authorize" endpoint', function () {
    beforeEach(function (done) {
      Anvil.uri().then( v => {
        uri = v
        done()
      })
    })

    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/authorize?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "signin" endpoint', function () {
    beforeEach(function (done) {
      Anvil.uri('signin').then( v => {
        uri = v
        done()
      })
    })

    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/signin?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "signup" endpoint', function () {
    beforeEach(function (done) {
      Anvil.uri('signup').then( v => {
        uri = v
        done()
      })
    })
    it('should contain issuer', function () {
      expect(uri).toContain(config.issuer)
    })

    it('should contain endpoint', function () {
      expect(uri).toContain('/signup?')
    })

    it('should contain response type', function () {
      expect(uri).toContain('id_token%20token')
    })

    it('should contain client id', function () {
      expect(uri).toContain(config.client_id)
    })

    it('should contain redirect uri', function () {
      expect(uri).toContain(encodeURIComponent(config.redirect_uri))
    })

    it('should contain scope', function () {
      expect(uri).toContain(encodeURIComponent('openid profile other'))
    })

    it('should contain nonce', function () {
      expect(uri).toContain('&nonce=')
    })
  })

  describe('uri with "connect" endpoint', function () {
    it('should contain issuer')
    it('should contain endpoint')
    it('should contain response type')
    it('should contain client id')
    it('should contain redirect uri')
    it('should contain scope')
    it('should contain nonce')
  })

  describe('nonce without argument', function () {
    let result = {}
    beforeEach(function (done) {
      Anvil.nonce().then(nonce => {
        result.nonce = nonce
        done()
      }).catch(e => {
        result.err = e
        done()
      })
    })
    it('should return a base64url encoded sha256 hash of a random value', function () {
      expect(result.nonce.length).toBe(43)
    })

    it('should store the nonce in localStorage', function () {
      expect(localStorage['nonce'].length).toBe(10)
    })
  })

  describe('nonce with argument', function () {
    let result = {}
    beforeEach(function (done) {
      Anvil.nonce().then(nonce => {
        result.nonce = nonce
        done()
      }).catch(e => {
        result.err = e
        done()
      })
    })

    it('should verify an argument matching a hash of the value in localStorage', function (done) {
      Anvil.nonce(result.nonce).then( val => {
        expect(val).toBe(true)
        done()
      })
    })

    it('should not verify a mismatching argument', function (done) {
      Anvil.nonce('WRONG').then( val => {
        expect(val).toBe(false)
        done()
      })
    })
  })

  describe('sha256url', function () {
    let result = {}
    const input = 'test'

    beforeEach(function (done) {
      Anvil.sha256url(input).then(r => {
        result.sha256url = r
        done()
      }).catch(e => {
        result.err = e
        done()
      })
    })
    it('should base64url encode the SHA 256 hash of a provided string', () => {
      let oldresult = sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(input))
      expect(oldresult).toEqual('n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg')
      expect(result.sha256url).toEqual(oldresult)
      expect(result.sha256url).toEqual('n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg')
    })
  })

  describe('headers', function () {
    it('should add a bearer token Authorization header to an object', function () {
      Anvil.session = { access_token: 'random' }
      expect(Anvil.headers()['Authorization']).toContain('Bearer random')
    })
  })

  describe('request', function () {
    uri = config.issuer + '/userinfo'

    beforeEach(function () {
      Anvil.session.access_token = 'random'
      var headers =
      {'Authorization': `Bearer ${Anvil.session.access_token}`,
        'Accept': 'application/json, text/plain, */*'}
      $httpBackend.expectGET(uri, headers).respond(200, {})
    })

    it('should add a bearer token to an HTTP request', function (done) {
      promise = Anvil.request({ method: 'GET', url: uri })
      setTimeout(() => {
        $httpBackend.flush()
        promise.then(() => {
          done()
        })
      }, 0)
    })
  })

  describe('userInfo', function () {
    it('should request user info from the provider', function (done) {
      uri = config.issuer + '/userinfo'
      Anvil.session.access_token = 'random'
      var headers =
        {'Authorization': `Bearer ${Anvil.session.access_token}`,
        'Accept': 'application/json, text/plain, */*'}
      $httpBackend.expectGET(uri, headers).respond(200, {})
      promise = Anvil.userInfo()
      setTimeout(() => {
        $httpBackend.flush()
        promise.then(v => {
          done()
        })
      }, 0)
    })
  })

  describe('callback with error response', function () {
    beforeEach(function () {
      localStorage['anvil.connect'] = '{}'
      promise = Anvil.callback({ error: 'invalid' })
    })
    afterEach(function (done) {
      promise.catch(() => {
        // expect errors
        done()
      })
    })

    it('should return a promise', function () {
      expect(promise.then).toBeDefined()
    })

    it('should clear the session', function () {
      expect(localStorage['anvil.connect']).toBeUndefined()
    })

    it('should reject the promise', function () {
      promise.catch(err => {
        expect(err).toBeDefined()
      })
    })
  })

  describe('callback with authorization response', function () {
    let session

    // pretty bad hack but it works.
    // the flush must happen after the request
    function flushHttpBackend () {
      try {
        $httpBackend.flush()
      } catch (e) {
        setTimeout(flushHttpBackend, 0) // try again
      }
    }

    beforeEach(function (done) {
      uri = config.issuer + '/userinfo'
      $httpBackend.when('GET', uri).respond({})

      promise = Anvil.callback({ access_token: 'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ' })
      setTimeout(flushHttpBackend, 0)
      promise.then(thesession => {
        done()
      }, e => {
        err = e
        done()
      })

    })

    it('should return a promise', function () {
      expect(promise.then).toBeDefined()
    })

    it('should set session property on the service', function () {
      expect(Anvil.session.access_token).toBe('eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ')
    })
  })

    // it 'should serialize the session'

    // it 'should resolve the promise'

  describe('authorize with location fragment', function () {
    it('should invoke the callback with the parsed authorization response')
  })

  describe('authorize with page display', function () {
    it('should navigate to the authorize endpoint')
  })

  describe('authorize with popup display', function () {
    it('should open a new window')
    it('should attach a listener')
    it('should return a promise')
  })

  describe('listener', function () {
    it('should invoke the callback with parsed event data')
    it('should remove the listener')
  })

  describe('connect', function () {})

  describe('signout', function () {})
})

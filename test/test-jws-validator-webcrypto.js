/* eslint-env jasmine */
/* eslint-disable quotes */
import 'webcrypto-shim'
import * as jwtvalidator from '../src/jws-validator-webcrypto.js'

describe('Check jws-validator', () => {
  const key = {
    jwk: {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "n": "nhubIr98ugQw-6JHq4c5aWGMlFAU-6dXFYewby7A-d4mY_EIY9tujJWUIa0PXGx8e3KAi7vOF81tvUCIdbmlzduLWTy50zcIdBRO6d65020yQg4Mab-lNXedDVMfW2v15uq5PfrQNMSGSaO__ktnCyc4DQcB__cYb1-7yCXnmaGkqfKFamRusevK6HxzHyFTMvCLlGvmADUiuFA_1IVfbLryy5JLTCnsehBMiJ7oRfL8bY4mLuSolLRSORcrtk-p_no4YGb5OVgGbDJd1ZndsGCWeU-MFvrt7FIyJeaL7J54Vrna1YtmU6o1_oJZvZes1_o9YLG3Q1ntXcc86uM6Yw",
      "e": "AQAB"
    }
  }

  const token = "eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ"

  describe('verifies a good token', () => {
    let result = {}

    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, token).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done()
        }
      )
    })

    it('should not reject the promise', () => {
      expect(result.err).not.toBeDefined()
    })
    it('should fulfill with the claims', () => {
      expect(Object.keys(result.claims)).toEqual(["jti", "iss", "sub", "aud", "exp", "iat", "scope"])
      expect(result.claims.aud).toEqual('58148b70-85aa-4726-af7d-42bd109dcc49')
      expect(result.claims.exp).toEqual(1413944758335)
      expect(result.claims.iat).toEqual(1413941158335)
      expect(result.claims.iss).toEqual('http://localhost:3000')
      expect(result.claims.jti).toEqual('4535099f6570b90ce19f')
      expect(result.claims.scope).toEqual('openid profile')
      expect(result.claims.sub).toEqual('4076f412-374f-4bc6-909a-1d8eb1aa233c')
    })
  })

  describe('reject a bad token', () => {
    let result = {}
    const badToken = 'eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.eyJhbGciOiJSUzI1NiJ9'
    // badToken can be logged in test-subtle-encrypt
    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, badToken).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done()
        }
      )
    })

    it('should reject the promise', () => {
      expect(result.err).toBeDefined()
    })
  })
  describe('reject an alg=none', () => {
    let result = {}
    const algNoneToken = 'eyJhbGciOiJub25lIn0.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ'
    // algNoneToken can be logged in test-subtle-encrypt
    beforeEach(done => {
      jwtvalidator.validateAndParseToken(key.jwk, algNoneToken).then(
        claims => {
          result.claims = claims
          done()
        },
        err => {
          result.err = err
          done()
        }
      )
    })

    it('should reject the promise', () => {
      expect(result.err).toBeDefined()
    })
  })
})


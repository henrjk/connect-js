/* eslint-env jasmine */
/* eslint-disable quotes */
import * as se from '../src/subtle_encrypt'
import * as jws from '../src/jws'
import {ab2hex, hex2ab, str2ab, ab2str, ab2base64urlstr} from '../src/ab_utils'
import {encodeJWSSegment} from './tlib'
import bows from 'bows'

const log = bows('Anvil Test')

// localStorage.debug = true triggers log statements

describe('Check generateEncryptionKey produces key', () => {
  let result = {}

  beforeEach(done => {
    se.generateEncryptionKey().then(r => {
      result.key = r
      done()
    }).catch(err => {
      result.err = err
      done()
    })
  })

  it('should produced a key', () => {
    expect(result.err).not.toBeDefined()
    expect(result.key).toBeDefined()
    // key may not be accessible: expect(new Uint8Array(result.key).length).toBeGreaterThan(1)
  })
})

describe('Check encrypt/decrypt based on subtle webcrypto', () => {
  let input = {}
  let result = {}
  let plaintext = 'secret'

  beforeEach(done => {
    input.abPlaintext = str2ab(plaintext)
    se.genKeyAndEncrypt(input.abPlaintext).then(r => {
      return se.decrypt(r)
    }).then(abDecrypted => {
      result.abDecrypted = abDecrypted
      done()
    }).catch(err => {
      result.err = err
      done()
    })
  })

  it('decrypt of encrypt should be original bytes', () => {
    expect(ab2hex(result.abDecrypted)).toBe(ab2hex(input.abPlaintext))
    expect(ab2str(result.abDecrypted)).toBe(plaintext)
  })
})

describe('Check jwk sign verification', () => {
  describe('hard coded key', () => {
    let key = {
      jwk: {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "n": "nhubIr98ugQw-6JHq4c5aWGMlFAU-6dXFYewby7A-d4mY_EIY9tujJWUIa0PXGx8e3KAi7vOF81tvUCIdbmlzduLWTy50zcIdBRO6d65020yQg4Mab-lNXedDVMfW2v15uq5PfrQNMSGSaO__ktnCyc4DQcB__cYb1-7yCXnmaGkqfKFamRusevK6HxzHyFTMvCLlGvmADUiuFA_1IVfbLryy5JLTCnsehBMiJ7oRfL8bY4mLuSolLRSORcrtk-p_no4YGb5OVgGbDJd1ZndsGCWeU-MFvrt7FIyJeaL7J54Vrna1YtmU6o1_oJZvZes1_o9YLG3Q1ntXcc86uM6Yw",
        "e": "AQAB"
      }
    }
    // NOTE: This is the original key copied from a prior test
    // This seems to be in conflict with Chrome see this issue:
    // https://github.com/OADA/rsa-pem-to-jwk/issues/1
    // https://code.google.com/p/chromium/issues/detail?id=383998
    // key 2 was derived from the below by decoding the n to the hex form.
    // this started with '009e1b'. Then stripped off the leading '00' and converted
    // with code below:
    //   let nwithoutZeroes = ab2base64urlstr(hex2ab(
    // //"9e1b9b22bf7cba0430fba247ab873969618c945014fba7571587b06f2ec0f9de2663f10863db6e8c959421ad0f5c6c7c7b72808bbbce17cd6dbd408875b9a5cddb8b593cb9d3370874144ee9deb9d36d32420e0c69bfa535779d0d531f5b6bf5e6eab93dfad034c48649a3bffe4b670b27380d0701fff7186f5fbbc825e799a1a4a9f2856a646eb1ebcae87c731f215332f08b946be6003522b8503fd4855f6cbaf2cb924b4c29ec7a104c889ee845f2fc6d8e262ee4a894b45239172bb64fa9fe7a386066f93958066c325dd599ddb06096794f8c16faedec523225e68bec9e7856b9dad58b6653aa35fe8259bd97acd7fa3d60b1b74359ed5dc73ceae33a63"
    // ))
    /*
    let key_original = {
      jwk: {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "n": "AJ4bmyK_fLoEMPuiR6uHOWlhjJRQFPunVxWHsG8uwPneJmPxCGPbboyVlCGtD1xsfHtygIu7zhfNbb1AiHW5pc3bi1k8udM3CHQUTuneudNtMkIODGm_pTV3nQ1TH1tr9ebquT360DTEhkmjv_5LZwsnOA0HAf_3GG9fu8gl55mhpKnyhWpkbrHryuh8cx8hUzLwi5Rr5gA1IrhQP9SFX2y68suSS0wp7HoQTIie6EXy_G2OJi7kqJS0UjkXK7ZPqf56OGBm-TlYBmwyXdWZ3bBglnlPjBb67exSMiXmi-yeeFa52tWLZlOqNf6CWb2XrNf6PWCxt0NZ7V3HPOrjOmM",
        "e": "AQAB"
      }
    }
    */
    let nwithoutZeroes = ab2base64urlstr(hex2ab("9e1b9b22bf7cba0430fba247ab873969618c945014fba7571587b06f2ec0f9de2663f10863db6e8c959421ad0f5c6c7c7b72808bbbce17cd6dbd408875b9a5cddb8b593cb9d3370874144ee9deb9d36d32420e0c69bfa535779d0d531f5b6bf5e6eab93dfad034c48649a3bffe4b670b27380d0701fff7186f5fbbc825e799a1a4a9f2856a646eb1ebcae87c731f215332f08b946be6003522b8503fd4855f6cbaf2cb924b4c29ec7a104c889ee845f2fc6d8e262ee4a894b45239172bb64fa9fe7a386066f93958066c325dd599ddb06096794f8c16faedec523225e68bec9e7856b9dad58b6653aa35fe8259bd97acd7fa3d60b1b74359ed5dc73ceae33a63"
    ))

    log.debug('nwithoutZeroes= ', nwithoutZeroes)

    let token = "eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ"
    let [header, payload, signature] = token.split('.')

    // let token_firefox = "eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0NTM1MDk5ZjY1NzBiOTBjZTE5ZiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsInN1YiI6IjQwNzZmNDEyLTM3NGYtNGJjNi05MDlhLTFkOGViMWFhMjMzYyIsImF1ZCI6IjU4MTQ4YjcwLTg1YWEtNDcyNi1hZjdkLTQyYmQxMDlkY2M0OSIsImV4cCI6MTQxMzk0NDc1ODMzNSwiaWF0IjoxNDEzOTQxMTU4MzM1LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIn0.QuBrm0kb0NeVigV1vm_p6-xnGj0J0F_26PHUILtMhsa5-K2-W-0JtQ7o0xcoa7WKlBX66mkGDBKJSpA3kLi4lYEkSUUOo5utxwtrAaIS7wYlq--ECHhdpfHoYgdx4W06YBfmSekbQiVmtnBMOWJt2J6gmTphhwiE5ytL4fggU79LTg30mb-X9FJ_nRnFh_9EmnOLOpej8Jxw4gAQN6FEfcQGRomQ-rplP4cAs1i8Pt-3qYEmQSrjL_w8LqT69-MErhbCVknq7BgQqGcbJgYKOoQuRxWudkSWQljOaVmSdbjLeYwLilIlwkgWcsIuFuSSPtaCNmNhdn13ink4S5UuOQ"

    it('should verify a matching hardcoded token with key', done => {
      se.verifyJWT(key.jwk, token).then(
        verifiedToken => {
          expect(verifiedToken.header).toBeDefined()
          expect(verifiedToken.payload).toBeDefined()
          done()
        },
        err => {
          log.debug(err)
          expect(undefined).toBeTruthy()
          done()
        }
      )
    })
    it('should provide payload so that we can parse claims', done => {
      se.verifyJWT(key.jwk, token).then(
        verifiedToken => {
          expect(verifiedToken.header).toBeDefined()
          expect(verifiedToken.payload).toBeDefined()
          {
            let headerJSON = jws.decodeSegment(verifiedToken.header)
            expect(Object.keys(headerJSON)).toEqual(['alg'])
            expect(headerJSON.alg).toEqual('RS256')
          }
          {
            let payloadJSON = jws.decodeSegment(verifiedToken.payload)
            expect(Object.keys(payloadJSON)).toEqual(["jti", "iss", "sub", "aud", "exp", "iat", "scope"])
            expect(payloadJSON.aud).toEqual('58148b70-85aa-4726-af7d-42bd109dcc49')
            expect(payloadJSON.exp).toEqual(1413944758335)
            expect(payloadJSON.iat).toEqual(1413941158335)
            expect(payloadJSON.iss).toEqual('http://localhost:3000')
            expect(payloadJSON.jti).toEqual('4535099f6570b90ce19f')
            expect(payloadJSON.scope).toEqual('openid profile')
            expect(payloadJSON.sub).toEqual('4076f412-374f-4bc6-909a-1d8eb1aa233c')
          }
          done()
        },
        err => {
          log.debug(err)
          done()
          expect(undefined).toBeTruthy()
        }
      )
    })
    it('should NOT verify a none matching hardcoded token with key', done => {
      se.verifyJWT(key.jwk, `${header}.${payload}.${header}`).then(
        verifiedToken => {
          expect(undefined).toBeDefined()
          done()
        },
        err => {
          expect(err).toBeDefined()
          done()
        }
      )
    })
    // https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/
    it('should NOT verify a token with a substituted alg: none header', done => {
      let algNoneHeader = encodeJWSSegment({"alg": "none"})
      se.verifyJWT(key.jwk, `${algNoneHeader}.${payload}.${signature}`).then(
        () => {
          expect(undefined).toBeDefined()
          done()
        },
        err => {
          expect(err).toBeDefined()
          done()
        }
      )
    })
  })
})


import * as se from '../src/subtle_encrypt'
import {ab2hex, hex2ab, str2ab, ab2str} from '../src/ab_utils'


describe('Check generateEncryptionKey produces key', () => {

  let result = {}

  beforeEach(done => {
    se.generateEncryptionKey().then( r => {
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

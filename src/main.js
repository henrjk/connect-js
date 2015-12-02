/* eslint-env es6 */

import anvilplain from './anvil-connect-plain'
import bows from 'bows'

var log = bows('test')

log.warn('fools days.')
console.log('anvilplain', anvilplain)

var Anvil = anvilplain({
  issuer: 'https://accounts.anvil.io'
})

console.log(Anvil)

/* eslint-env es6 */
/* global localStorage */

var Anvil = {}

import bows from 'bows'
import TinyEmitter from 'tiny-emitter'
import jwtvalidator from 'anvil-connect-jwt-validator'
import sjcl from 'sjcl'

'use strict'

var log = bows('Anvil')

var session = {}

// All init functions below must be called!
/**
 * TODO: update comment.
 * Init function used for http requests.
 * Function is called with a config object as first parameter with
 * fields:
 *    method
 *    url
 *    crossDomain
 *    headers
 *
 *  It is expected to return a promise.
 */
function initHttpAccess (http) {
  if (http && typeof http === 'object' &&
    typeof http.request === 'function' &&
    typeof http.getData === 'function') {
    Anvil.apiHttp = this.apiHttp = http
  } else {
    throw new Error("Must pass in object with functions in fields: 'request', 'getData'.")
  }
}

Anvil.initHttpAccess = initHttpAccess

function initDeferred (deferred) {
  if (deferred && typeof deferred === 'object' &&
    typeof deferred.defer === 'function' &&
    typeof deferred.deferToPromise === 'function') {
    Anvil.apiDefer = this.apiDefer = deferred
    return
  }
  throw new Error("Must pass in object with functions in fields: 'defer', 'deferToPromise'.")
}
Anvil.initDeferred = initDeferred

/**
 *  Init functions for location access.
 */
function initLocationAccess (loc) {
  if (loc && typeof loc === 'object' &&
    typeof loc.hash === 'function' &&
    typeof loc.path === 'function') {
    this.locAccess = loc
    return
  }
  throw new Error("Must pass in object with functions in fields: 'hash', 'path'.")
}
Anvil.initLocationAccess = initLocationAccess

/**
 *  Init functions for DOM/window access.
 */
function initDOMAccess (da) {
  if (da && typeof da === 'object' &&
    typeof da.getWindow === 'function' &&
    typeof da.getDocument === 'function') {
    this.domAccess = da
    return
  }
  throw new Error("Must pass in object with functions in fields: 'getWindow', 'getDocument'.")
}
Anvil.initDOMAccess = initDOMAccess

/**
 * Extend
 */

function extend () {
  var target = arguments[0]

  // iterate over arguments, excluding the first arg
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]

    // iterate through properties, copying to target
    for (var prop in source) {
      if (source[prop] !== undefined) { target[prop] = source[prop] }
    }
  }

  return target
}

/**
 * Support events, e.g. 'authenticated'
 *
 * The 'authenticated' event is emitted in response to a
 * local storage 'anvil.connect' event when the user is authenticated.
 *
 * This can be leveraged to react to an authentiation performed in
 * other windows or tabs.
 */
extend(Anvil, TinyEmitter.prototype)

/**
 * Provider configuration
 */
function configure (options) {
  var params
  Anvil.issuer = options.issuer
  jwtvalidator.configure(Anvil, options)

  Anvil.params = params = {}
  params.response_type = options.response_type || 'id_token token'
  params.client_id = options.client_id
  params.redirect_uri = options.redirect_uri
  params.scope = [
    'openid',
    'profile'
  ].concat(options.scope).join(' ')
  Anvil.display = options.display || 'page'
}

Anvil.configure = configure

function init (providerOptions, apis) {
  if (providerOptions) {
    Anvil.configure(providerOptions)
  }

  Anvil.initHttpAccess(apis.http)

  Anvil.initDeferred(apis.deferred)

  Anvil.initLocationAccess(apis.location)

  Anvil.initDOMAccess(apis.dom)

  apis.dom.getWindow().addEventListener('storage', Anvil.updateSession, true)

  /**
   * Reinstate an existing session
   */

  Anvil.deserialize()
}

Anvil.init = init

/**
 * Do initializations which require network calls.
 *
 * returns a promise.
 */

function prepareAuthorization () {
  return jwtvalidator.prepareValidate()
    .then(function (val) {
      log.debug('Anvil.prepareAuthorization() succeeded.', val)
      return val
    }, function (err) {
      log.warn('Anvil.prepareAuthorization() failed:', err.stack)
      throw err
    })
}

Anvil.prepareAuthorization = prepareAuthorization

/**
 * Form Urlencode an object
 */

function toFormUrlEncoded (obj) {
  var pairs = []

  Object.keys(obj).forEach(function (key) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
  })

  return pairs.join('&')
}

Anvil.toFormUrlEncoded = toFormUrlEncoded

/**
 * Parse Form Urlencoded data
 */

function parseFormUrlEncoded (str) {
  var obj = {}

  str.split('&').forEach(function (property) {
    var pair = property.split('=')
    var key = decodeURIComponent(pair[0])
    var val = decodeURIComponent(pair[1])

    obj[key] = val
  })

  return obj
}

Anvil.parseFormUrlEncoded = parseFormUrlEncoded

/**
 * Get URI Fragment
 */

function getUrlFragment (url) {
  return url.split('#').pop()
}

Anvil.getUrlFragment = getUrlFragment

/**
 * Configure the authorize popup window
 * Adapted from dropbox-js for ngDropbox
 */

function popup (popupWidth, popupHeight) {
  var x0, y0, width, height, popupLeft, popupTop

  var window = this.domAccess.getWindow()
  var documentElement = this.domAccess.getDocument().documentElement

  // Metrics for the current browser win.
  x0 = window.screenX || window.screenLeft
  y0 = window.screenY || window.screenTop
  width = window.outerWidth || documentElement.clientWidth
  height = window.outerHeight || documentElement.clientHeight

  // Computed popup window metrics.
  popupLeft = Math.round(x0) + (width - popupWidth) / 2
  popupTop = Math.round(y0) + (height - popupHeight) / 2.5
  if (popupLeft < x0) { popupLeft = x0 }
  if (popupTop < y0) { popupTop = y0 }

  return 'width=' + popupWidth + ',height=' + popupHeight + ',' +
  'left=' + popupLeft + ',top=' + popupTop + ',' +
  'dialog=yes,dependent=yes,scrollbars=yes,location=yes'
}

Anvil.popup = popup

/**
 * Session object
 */

Anvil.session = session

/**
 * Serialize session
 */

function serialize () {
  var now = new Date()
  var time = now.getTime()
  var exp = time + (Anvil.session.expires_in || 3600) * 1000
  var random = Math.random().toString(36).substr(2, 10)
  var secret = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(random))

  now.setTime(exp)
  this.domAccess.getDocument().cookie = 'anvil.connect=' + secret +
    '; expires=' + now.toUTCString()

  var encrypted = sjcl.encrypt(secret, JSON.stringify(Anvil.session))
  localStorage['anvil.connect'] = encrypted
  localStorage['anvil.connect.session.state'] = Anvil.sessionState
  log.debug('SERIALIZED', encrypted)
}

Anvil.serialize = serialize

/**
 * Deserialize session
 */

function deserialize () {
  var re, secret, json, parsed

  try {
    // Use the cookie value to decrypt the session in localStorage
    re = /\banvil\.connect=([^\s;]*)/
    secret = this.domAccess.getDocument().cookie.match(re).pop()
    json = sjcl.decrypt(secret, localStorage['anvil.connect'])
    parsed = JSON.parse(json)
    log.debug('Deserialized session data', parsed.userInfo)
  } catch (e) {
    // this is not unexpected.
    log.debug('Cannot deserialize session data', e, e.stack)
  }

  Anvil.session = session = parsed || {}
  Anvil.sessionState = localStorage['anvil.connect.session.state']
  return session
}

Anvil.deserialize = deserialize

/**
 * Reset
 */

function reset () {
  Anvil.session = session = {}
  this.domAccess.getDocument().cookie = 'anvil.connect=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  delete localStorage['anvil.connect']
}

Anvil.reset = reset

/**
 * Quick and dirty uri method with nonce
 */

function uri (endpoint, options) {
  return Anvil.issuer + '/' +
  (endpoint || 'authorize') + '?' +
  toFormUrlEncoded(extend({}, Anvil.params, options, {
    nonce: this.nonce()
  }))
}

Anvil.uri = uri

/**
 * Create or verify a nonce
 */

function nonce (nonce) {
  if (nonce) {
    var lnonce = localStorage['nonce']
    if (!lnonce) {
      return false
    }
    return (Anvil.sha256url(localStorage['nonce']) === nonce)
  } else {
    localStorage['nonce'] = Math.random().toString(36).substr(2, 10)
    return this.sha256url(localStorage['nonce'])
  }
}

Anvil.nonce = nonce

/**
 * Base64url encode a SHA256 hash of the input string
 */

function sha256url (str) {
  return sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(str))
}

Anvil.sha256url = sha256url

/**
 * Headers
 */

function headers (headers) {
  if (this.session.access_token) {
    return extend(headers || {}, {
      'Authorization': 'Bearer ' + this.session.access_token
    })
  } else {
    return headers
  }
}

Anvil.headers = headers

/**
 * Request
 */

function request (config) {
  config.headers = this.headers(config.headers)
  config.crossDomain = true
  return this.apiHttp.request(config)
    .then(function (val) {
      log.debug('Anvil.request succeeded.', config)
      return val
    }, function (err) {
      log.warn('Anvil.request failed:', config, err.stack)
      throw err
    })
}

Anvil.request = request

/**
 * UserInfo
 */

function userInfo () {
  return this.request({
    method: 'GET',
    url: Anvil.issuer + '/userinfo',
    crossDomain: true
  })
}

Anvil.userInfo = userInfo

/**
 * Callback
 */

function callback (response) {
  var deferred = this.apiDefer.defer()

  if (response.error) {
    // clear localStorage/cookie/etc
    Anvil.sessionState = response.session_state
    localStorage['anvil.connect.session.state'] = Anvil.sessionState
    Anvil.reset()
    deferred.reject(response)
  } else {
    // NEED TO REVIEW THIS CODE FOR SANITY
    // Check the conditions in which some of these verifications
    // are skipped.

    try {
      response.access_claims = jwtvalidator.validateAndParseToken(response.access_token)
    } catch (e) {
      deferred.reject('Failed to verify or parse access token')
    }
    try {
      response.id_claims = jwtvalidator.validateAndParseToken(response.id_token)
    } catch (e) {
      deferred.reject('Failed to verify or parse id token')
    }

    // Validate the nonce
    if (response.id_claims && !Anvil.nonce(response.id_claims.nonce)) {
      deferred.reject('Invalid nonce.')
    }

    // Verify at_hash
    if (['id_token token'].indexOf(Anvil.params.response_type) !== -1) {
      var sha = sjcl.hash.sha256.hash(response.access_token)
      var atHash = sjcl.codec.hex.fromBits(sha)
      atHash = atHash.slice(0, atHash.length / 2)
      if (response.id_claims && atHash !== response.id_claims.at_hash) {
        deferred.reject('Invalid access token hash in id token payload')
      }
    }

    Anvil.session = response
    Anvil.sessionState = response.session_state
    log.debug('CALLBACK SESSION STATE', Anvil.sessionState)

    var apiHttp = this.apiHttp
    Anvil.userInfo().then(
      function userInfoSuccess (userInfo) {
        Anvil.session.userInfo = apiHttp.getData(userInfo)
        Anvil.serialize()
        deferred.resolve(Anvil.session)
      },

      function userInfoFailure () {
        deferred.reject('Retrieving user info from server failed.')
      }
    )
  }

  return this.apiDefer.deferToPromise(deferred)
}

Anvil.callback = callback

/**
 * Authorize
 */

function authorize () {
  // handle the auth response
  if (this.locAccess.hash()) {
    return Anvil.callback(parseFormUrlEncoded(this.locAccess.hash()))

  // initiate the auth flow
  } else {
    Anvil.destination(this.locAccess.path())

    var window = this.domAccess.getWindow()
    if (Anvil.display === 'popup') {
      // open the signin page in a popup window
      // In a typical case the popup window will be redirected
      // to the configured callback page.

      // If this callback page is rendered in the popup it
      // should send the message:
      // `opener.postMessage(location.href, opener.location.origin)`.
      // This will then cause a login in this window (not the popup) as
      // implemented in the 'message' listener below.

      var deferred = this.apiDefer.defer()
      var popup

      var listener = function listener (event) {
        if (event.data !== '__ready__') {
          var fragment = getUrlFragment(event.data)
          Anvil.callback(parseFormUrlEncoded(fragment))
          .then(
            function (result) { deferred.resolve(result) },
            function (fault) { deferred.reject(fault) }
          )
          window.removeEventListener('message', listener, false)
          if (popup) {
            popup.close()
          }
        }
      }

      window.addEventListener('message', listener, false)

      // Some authentication methods will NOT cause a redirect ever!
      //
      // The passwordless login method sends the user a link in an email.
      // When the user presses this link then a new window openes with the
      // configured callback.
      // In this case the callback page has no opener and is expected to
      // call Anvil.callback itself.
      // The listener below will react to the case where there is a
      // successful login and then close the popup.
      Anvil.once('authenticated', function () {
        if (popup) {
          popup.close()
        }
      })
      popup = window.open(this.uri(), 'anvil', Anvil.popup(700, 500))
      return this.apiDefer.deferToPromise(deferred)

    // navigate the current window to the provider
    } else {
      window.location = this.uri()
    }
  }
}

Anvil.authorize = authorize

/**
 * Signout
 */

function signout (path) {
  var win = this.domAccess.getWindow()
  // parse the window location
  var url = this.domAccess.getDocument().createElement('a')
  url.href = win.location.href
  url.pathname = path || '/'

  // set the destination
  Anvil.destination(path || false)

  // url to sign out of the auth server
  var signoutLocation = Anvil.issuer + '/signout?post_logout_redirect_uri=' +
    url.href + '&id_token_hint=' + Anvil.session.id_token

  // reset the session
  Anvil.reset()

  // "redirect"
  win.location = signoutLocation
}

Anvil.signout = signout

/**
 * Destination
 *
 * Getter/setter location.pathname
 *
 *    // Set the destination
 *    Anvil.destination(location.pathname)
 *
 *    // Get the destination
 *    Anvil.destination()
 *
 *    // Clear the destination
 *    Anvil.destination(false)
 */

function destination (path) {
  if (path === false) {
    path = localStorage['anvil.connect.destination']
    delete localStorage['anvil.connect.destination']
    return path
  } else if (path) {
    localStorage['anvil.connect.destination'] = path
  } else {
    return localStorage['anvil.connect.destination']
  }
}

Anvil.destination = destination

/**
 * Check Session
 *
 * This is for use by the RP iframe, as specified by
 * OpenID Connect Session Management 1.0 - draft 23
 *
 * http://openid.net/specs/openid-connect-session-1_0.html
 */

function checkSession (id) {
  var targetOrigin = this.issuer
  var message = this.params.client_id + ' ' + this.sessionState
  var w = window.parent.document.getElementById(id).contentWindow
  w.postMessage(message, targetOrigin)
}

Anvil.checkSession = checkSession

/**
 * Update Session
 */

function updateSession (event) {
  if (event.key === 'anvil.connect') {
    Anvil.deserialize()
    Anvil.emit('authenticated', Anvil.session)
  }
}

Anvil.updateSession = updateSession

/**
 * Is Authenticated
 */

function isAuthenticated () {
  return (Anvil.session.id_token)
}

Anvil.isAuthenticated = isAuthenticated

export default Anvil

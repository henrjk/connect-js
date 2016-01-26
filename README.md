# Anvil Connect JavaScript Client
[![Build Status](https://travis-ci.org/anvilresearch/connect-js.svg?branch=master)](https://travis-ci.org/anvilresearch/connect-js)

## Install

```bash
$ bower install anvil-connect --save
```

### API Documentation

#### Anvil.configure(options)
<!--
lorem ipsum dolor amit

**Arguments**

- `prop` – description
- `prop` – description
- `prop` – description

**Examples**

```javascript
// ...
```
-->

#### Anvil.init()
since 0.2.0
#### Anvil.promise.prepareAuthorization
since 0.2.0
#### Anvil.once
since 0.2.0

#### Anvil.toFormUrlEncoded(obj)
#### Anvil.parseFormUrlEncoded(str)
#### Anvil.getUrlFragment(url)
#### Anvil.popup(popupWidth, popupHeight)
#### Anvil.session
#### Anvil.promise.serialize()
since 0.2.0 this is a promise
#### Anvil.promise.deserialize()
since 0.2.0 this is a promise
#### Anvil.reset()
#### Anvil.promise.uri()
since 0.2.0 this is a promise
#### Anvil.promise.nonce()
since 0.2.0 this is a promise
#### Anvil.promise.sha256url()
since 0.2.0 this is a promise
#### Anvil.headers()
#### Anvil.promise.request()
since 0.2.0: was promise before but now is no longer available under Anvil.request()
#### Anvil.promise.userInfo()
since 0.2.0: was promise before but now is no longer available under Anvil.request()
#### Anvil.promise.callback(response)
since 0.2.0: was promise before but now is no longer available under Anvil.request()
#### Anvil.promise.authorize()
since 0.2.0: was promise before but now is no longer available under Anvil.request()
#### Anvil.signout(path)
#### Anvil.destination(path)
#### Anvil.checkSession(id)
#### Anvil.updateSession(event)
#### Anvil.isAuthenticated()


### AngularJS Usage

Be sure to [register your app as a client](https://github.com/anvilresearch/connect-docs/blob/master/clients.md#registration) with your Anvil Connect provider to obtain credentials.



#### Authenticate with a popup window

First copy `callback.html` from this repository into your public assets, and add `anvil-connect.angular.js` to your `index.html` file.

```html
<script src="bower_components/angular/angular.js"></script>
<!-- ... -->
<script src="bower_components/sjcl/sjcl.js"></script>
<script src="bower_components/anvil-connect/anvil-connect.angular.js"></script>
<!-- ... -->
<script src="scripts/app.js"></script>
<!-- ... -->
```


Then you can load the module and configure the provider.

```javascript
angular.module('App', ['...', 'anvil'])

  .config(function (..., AnvilProvider) {

    AnvilProvider.configure({
      issuer:       'http://localhost:3000',
      client_id:    '<CLIENT_ID>',
      redirect_uri: '<YOUR_APP_HOST>/callback.html',
      display:      'popup'
    });

    // ...

  })
```

You can inject the Anvil service into your controllers and call `Anvil.promise.authorize()` wherever you want to initiate an OpenID Connect authentication flow.

```javascript
  .controller(function ($scope, ..., Anvil) {
    $scope.signin = function () {
      Anvil.promise.authorize();
    };
  })
```


#### Authenticate with full page navigation

Configuring the service to use full page navigation is similar to popup configuration, but requires a route definition to handle the authorization response from Anvil Connect:

```javascript
angular.module('App', ['...', 'anvil'])

  .config(function (..., $routeProvider, AnvilProvider) {

    AnvilProvider.configure({
      issuer:       'http://localhost:3000',
      client_id:    '<CLIENT_ID>',
      redirect_uri: '<YOUR_APP_HOST>/callback',
      // `display` defaults to "page"
    });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!';

    $routeProvider

      // ...

      .when('/callback', {
        resolve: {
          session: function ($location, Anvil) {
            Anvil.promise.authorize().then(
              function (response) {
                $location.url('/');
              },
              function (fault) {
                // your error handling
              }
            )
          }
        }
      })

      // ...

  })
```

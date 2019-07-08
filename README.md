# vue-azure-active-directory

Vue.js plugin to connect with MSAL client library to Azure Active Directory. Forked from the [package](https://www.npmjs.com/package/vue-azure-active-directory) by Kevin McCarthy <kevin@kaymic.com>. Original code is MIT licensed as visible on the package page. This was not listed in GitHub under the creator's repositories.

## Basic Use

[Register your app with AAD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

```html
<div id="app">
  <span v-if="$azure.currentUser">
    Hello <strong>{{ $azure.currentUser.name }}</strong>
  </span>

  <button v-if="$azure.currentUser" type="button" @click="$azure.logout">Logout</button>
  <button v-else type="button" @click="$azure.login">Login</button>

  <pre>{{ $azure.$data }}</pre>
</div>

<!-- babel-polyfill for IE Promise support -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.2.5/polyfill.min.js"></script>
<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/vue-azure-active-directory"></script>

<script type="text/javascript">
Vue.use(VueAzureActiveDirectory, {
  clientID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  authority: 'https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  graphScopes: ['user.read'],
  graphEndpoint: 'https://graph.microsoft.com/v1.0/me'
})

new Vue({
  el: '#app'
})
</script>
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

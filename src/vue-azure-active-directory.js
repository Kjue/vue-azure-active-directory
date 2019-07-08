import { UserAgentApplication } from 'msal'
import axios from 'axios'

export default class VueAzureActiveDirectory {
  static install (Vue, options) {
    Vue.prototype.$azure = new Vue({
      ...new this(),
      ...options
    })
  }

  constructor () {
    return {
      data () {
        return {
          token: null,
          currentUser: null,
          graphResponse: null
        }
      },
      methods: {
        login () {
          this.agent.loginPopup(this.$options.graphScopes).then(id => {
            this.acquireToken()
          }).catch(err => { console.warn('Login Error: ', err) })
        },
        logout () {
          this.agent.logout()
        },
        get (endpoint = this.$options.graphEndpoint, parameters = {}) {
          return axios.get(endpoint, { ...this.graphParams, ...parameters })
        },
        acquireToken () {
          return this.agent.acquireTokenSilent(this.$options.graphScopes).catch(err => {
            if (['consent_required', 'interaction_required', 'login_required'].some(x => err.indexOf(x) >= 0)) {
              return (this.ieOrEdge) ? this.agent.acquireTokenRedirect(this.$options.graphScopes) : this.agent.acquireTokenPopup(this.$options.graphScopes)
            } else {
              return null
            }
          }).then(accessToken => {
            this.currentUser = this.agent.getUser()
            this.token = accessToken
            if (this.token) this.get().then(res => this.graphResponse = res.data)
          })
        },
        tokenReceivedCallBack (...args) {
          // errorDesc, token, error, tokenType
          console.log('tokenReceivedCallBack', args)
        }
      },
      computed: {
        agent () {
          return new UserAgentApplication(this.$options.clientID, this.$options.authority, this.tokenReceivedCallBack, {})
        },
        graphParams () {
          return {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        },
        ieOrEdge () {
          // Browser check variables
          var ua = window.navigator.userAgent;
          var msie = ua.indexOf('MSIE ');
          var msie11 = ua.indexOf('Trident/');
          var msedge = ua.indexOf('Edge/');
          var isIE = msie > 0 || msie11 > 0;
          var isEdge = msedge > 0;
          return (isIE || isEdge)
        }
      },
      created: function () {
        if (!this.currentUser) this.acquireToken()
      }
    }
  }
}

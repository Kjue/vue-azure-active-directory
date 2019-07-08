import { UserAgentApplication } from 'msal'
import axios from 'axios'

/**
 * Vue MSAL client plugin. This class is initialized with the optins
 * that define the client connection.
 * @param clientID: The AD client identifier.
 * @param authority: The authority to use for AD. Default 'https://login.microsoftonline.com/common'
 * @param graphScopes: The graph scopes to use when reading details from MS Graph connection. Default ['user.read'].
 * @param graphEndpoint: The MS Graph endpoint to use. Default 'https://graph.microsoft.com/v1.0/me'
 * @param agentOptions: Agent client options are all nullable values, so they may be provided; otherwise defaults apply.
 * @param agentOptions.redirectUri The redirect uri on the login.
 * @param agentOptions.navigateToLoginRequestUrl The flag to override redirect.
 * @param agentOptions.postLogoutRedirectUri Uri to redirect to after logout completed.
 * @param agentOptions.cacheLocation Possible values are localStorage, sessionStorage.
 * @param agentOptions.storeAuthStateInCookie 
 * @param agentOptions.validateAuthority The flag to validate the authority given.
 * @param agentOptions.protectedResourceMap 
 * @param agentOptions.unprotectedResources 
 * @param agentOptions.logger 
 * @param agentOptions.loadFrameTimeout 
 * @param agentOptions.isAngular 
 * @param agentOptions.state 
 */
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
        /**
         * Login using the MSAL helpers. This method only provides the login popup option.
         * @returns Promise that resolves the login action.
         */
        login () {
          return this.agent.loginPopup(this.$options.graphScopes).then(id => {
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
          return new UserAgentApplication(
            this.$options.clientID,
            this.$options.authority,
            this.tokenReceivedCallBack,
            this.$options.agentOptions || {})
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

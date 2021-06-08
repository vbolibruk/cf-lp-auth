import { Directive } from '@angular/core';
import { environment } from '../../environments/environment'

interface LpConfig {
  redirectURI: string,
  authURI: string,
  clientID: string,
  response_type: string,
}

@Directive({
  selector: '[lpTag]',
})
export class LivepersonDirective {
  private config: LpConfig;
  private lpTag: any;
  constructor() {
    this.lpTag = (window as any).lpTag as any;
    const { redirectURI, authURI, clientID, response_type } = environment;
    this.config = { redirectURI, authURI, clientID, response_type };

    this.lpTag.identities = [];
    this.lpTag.identities.push(this.identityFn);
    const self = this;
    (window as any).lpGetAuthenticationToken = (function() { return self.lpGetAuthenticationToken.bind(self)})();
  }

  public lpGetAuthenticationToken(callback: Function): void {
    const code = this.getParameterByName('code');
    if (code == null) {
      const url = this.authRedirect(this.config);
      document.location.href = url;
    } else {
      const result = {
        ssoKey: code,
        redirect_uri: this.config.redirectURI
      };
      callback(result);
    }
  };

  private identityFn(callback: Function): void {
    callback({
      iss: "BrandIDP",
      acr: "loa1",
      sub: "UserIdentity" 
    });
  }

  private authRedirect(cnf: LpConfig): string {
    const { redirectURI, authURI, clientID, response_type } = cnf;
    const url = `${authURI}?scope=openid email profile&client_id=${clientID}&response_type=${response_type}&redirect_uri=${redirectURI}`;
    return url.replace(' ','+');
  }
  
  private getParameterByName(name: string, url?: string): string|null {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}

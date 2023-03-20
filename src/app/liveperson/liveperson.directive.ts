import { Directive } from '@angular/core';
import { environment } from '../../environments/environment'
import { ActivatedRoute, Router,Params } from '@angular/router';

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
  private code: any = null;
  private engagementId: any = null;

  // TODO to generate dynamically 
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.lpTag = (window as any).lpTag as any;
    const { redirectURI, authURI, clientID, response_type } = environment;
    this.config = { redirectURI, authURI, clientID, response_type };

    this.lpTag.identities = [];
    this.lpTag.identities.push(this.identityFn);
    const self = this;
    (window as any).lpGetAuthenticationToken = (function() { return self.lpGetAuthenticationToken.bind(self)})();
    
  }


  ngOnInit(): void {    
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if(queryParams['code'] &&  queryParams['state'])
      this.code = queryParams['code'];
      this.engagementId = queryParams['state'] ;


      // auto open button sample
      try {
      //   setTimeout( () => {
      //     if(this.code && this.engagementId){
      //       if(this.lpTag && this.lpTag.taglets && this.lpTag.taglets.rendererStub){
      //       var clicked = this.lpTag.taglets.rendererStub.click(this.engagementId);
      //       }
      //     }        }, 1000);
      } catch (e : any) {
        console.dir(e.message);
      }
  });

  this.lpTag.events.bind("LP_OFFERS","OFFER_CLICK",(data: any,info: any) =>{
    if(data && data.engagementId){
      this.engagementId = data.engagementId
    }
 });

 
}

  public lpGetAuthenticationToken(callback: Function): void {
    this.code = this.getParameterByName('code');
    if (this.code == null) {
      const url = this.authRedirect(this.config);
      document.location.href = url;
    } else {
      const result = {
        ssoKey: this.code,
        redirect_uri: this.config.redirectURI
      };
      callback(result);
    }
  };

  private identityFn(callback: Function): void {
    // sub is dynamic per user
    callback({
      iss: "BrandIDP",
      acr: "loa1",
      sub: "UserIdentity" 
    });
  }

  private authRedirect(cnf: LpConfig): string {
    const { redirectURI, authURI, clientID, response_type } = cnf;
    const url = `${authURI}?scope=openid email profile&client_id=${clientID}&response_type=${response_type}&redirect_uri=${redirectURI}&state=${this.engagementId}`;
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

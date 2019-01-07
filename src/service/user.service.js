import { Observable } from 'rxjs/Rx';
import apiProxyHelper from '../helpers/api.proxy.helper'
import APIService from '../service/api.service'

export class UserService {

  sessionId = '19760613';

  constructor() {

  }

  /** 登入 Parse Server 
   *   username: string,
       password: string
  */
  login(args) {
    console.log('APIService.serverUrl' , APIService.serverUrl)
    const query = Observable.fromPromise(apiProxyHelper.apiProxy({
      hostname: APIService.serverUrl + '/frs/cgi',
      url: 'login',
      method: 'POST',
      body: {
        username: args.username,
        password: args.password
      }
    }))
      .switchMap(res => res.json())
      .map(data => {

        console.log('Login Api AppConsole : ' + JSON.stringify(data));

        if (!data.session_id) {
         // console.log('Login AppConsole : Login Failed');
          return false;
        }

        this.sessionId = data.session_id;
        return true;
      })
      .do(flag => {
        return flag;
      });

    return query;
  }

  autologin() {
    return this.login({ username: this.username, password: this.password });
  }

  /** 維護 Session */
  maintainSession() {
    const query = Observable.fromPromise(apiProxyHelper.apiProxy({
      hostname: APIService.serverUrl + '/frs/cgi',
      url: 'maintainsession',
      method: 'POST',
      body: {
        session_id: this.sessionId,
      }
    }))
      .switchMap(res => res.json())
      .map(data => {

        //console.log('Maintain Session Console : ' + JSON.stringify(data));

        if (!data.message || !data.message.includes('ok')) {
         // console.log('Maintain Session Console : Maintain Session Failed');
          return false;
        }

        return true;
      })
      .do(flag => {
        return flag;
      });

    return query;
  }
}

export default new UserService();
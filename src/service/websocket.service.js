import ApiService from './api.service';
import UserService from './user.service'

export class WebSocketService{

    WS = {};

    WS_NON = {};

    ttt = '1234567896'

    init(){
        WS = new WebSocket(ApiService.websocketUrl + '/fcsreconizedresult');
        WS_NON = new WebSocket(ApiService.websocketUrl + '/fcsnonreconizedresult');
    }
    
   

}

export default new WebSocketService();
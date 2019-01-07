import SettingsService from './settings.service';
import apiProxyHelper from '../helpers/api.proxy.helper';
import { Observable } from 'rxjs/Rx';
import UserService from './user.service';
import DeviceInfo from 'react-native-device-info';
import userService from "./user.service";
import { Platform } from 'react-native'

export class ApiService {

    host = '172.16.10.29';

    port = 8088;

    wsport = 7077;

    isHttps = false;

    get httpType() {
        return this.isHttps == 'true' ? 'https' : 'http';
    }

    get serverUrlserverUrl() {
        return `${this.httpType}://${this.host}:${this.port}`;
    }

    get websocketUrl() {
        // return `ws://${this.host}:${this.wsport}/frs/ws`;
        if (Platform.OS=== 'ios'){
            return `ws://${this.host}:7077/frs/ws`;

        }else
        {
            return `ws://${this.host}:7077/frs/ws`;

        }

    }

    constructor() {

    }

    init(args) {
        this.host = args.host;
        this.port = args.port;
        if (args.wsport!="") this.wsport = args.wsport;
        this.serverUrl  = `${this.httpType}://${this.host}:${this.port}`;
        console.log('this.serverUrl' , this.serverUrl )
    }

    /** 臉部比對 */
    verifyFace(args) {
        const query  = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'verifyface',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                target_score: SettingsService.getThreshold,
                request_client: 'mobileApp',
                action_enable: 1,
                source_id: 'mobileApp' ,
                location: 'mobileApp',
                image: args.image,
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
             //  console.log("verifyFace data",data)
                return data;             
            })

          return query;
    }

    createperson(args) {
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            url: 'createperson',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                person_info: args.person_info,
                image: args.image.replace(/\n/g, '')
            }
        }))

        return query;
    }

    getverifyresult(args) {
       // console.log('getverifyresult ',args)
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'getverifyresult',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                verify_face_id: args
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
                return data;
            })

        return query;
    }
    getpersonlist() {
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'getpersonlist',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                page_size: 999,
                skip_pages : 0
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
                //console.log("getpersonlist.data:", data)
                return data;
            })

        return query;
    }

    getFace(_id) {
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'getfaceimage',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                face_id_number: _id
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
                //console.log('getFace',data)
                if (data.message == "ok") {

                    return data.image;
                  } else {
                    return null;
                  }
            })

        return query;
    }

    addPushDevice(token,deviceId,deviceName) {
        console.log("deviceId",deviceId);
        console.log("deviceName",deviceName)

        deviceName = userService.username+" android";
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'addpushdevice',
            method: 'POST',
            body: {  session_id: UserService.sessionId, 
            push_device_type : "android", 
            push_device_uuid : deviceId, 
            push_device_name : deviceName, 
            push_device_token : token,
            push_device_id : token }
        }))
            .switchMap(res => res.json())
            .map(data => {
                //console.log('getFace',data)
                if (data.message == "ok") {

                    return data.image;
                  } else {
                    return null;
                  }
            })

        return query;
    }

    getGroupList()
    {
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'getgrouplist',
            method: 'POST',
            body: {
                session_id: UserService.sessionId,
                page_size: 999,
                skip_pages : 0
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
                if (data.group_list)
                {
                    return data.group_list.groups;
                }else{
                    return null;
                }
               
            })

        return query;
    }

    applypersontogroups(person_id,group_id_list) {
        const query = Observable.fromPromise(apiProxyHelper.apiProxy({
            hostname: this.serverUrl + '/frs/cgi',
            headers: { 'content-type': 'text/plain' },
            url: 'applypersontogroups',
            method: 'POST',
            body: {  
            session_id: UserService.sessionId, 
            person_id : person_id, 
            group_id_list : group_id_list
            }
        }))
            .switchMap(res => res.json())
            .map(data => {
                //console.log('getFace',data)
                if (data.message == "ok") {

                    return data.image;
                  } else {
                    return null;
                  }
            })

        return query;
    }

}

export default new ApiService();
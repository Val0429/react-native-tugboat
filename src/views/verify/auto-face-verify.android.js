import React from 'react'

import { Platform, AppState, BackHandler, StyleSheet, TouchableHighlight, Animated, AppRegistry, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native'
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base'
import ColorConfig from '../../config/color.config '
import StorageHepler from '../../helpers/storage.helper'
import AlertHelper from '../../helpers/alert.helper'
import { ConfigKeys } from '../../domain/storage'
import iStyle from '../../style/main-style'
//  import { VideoView } from '../shared/video-view'
import autobind from 'class-autobind'
import ApiService from '../../service/api.service'
import ConsoleHelper from '../../helpers/console.helper'
import UserService from '../../service/user.service'
import Sidebar from '../shared/sidebar'
import EventService from '../../service/event.service'
import { SettingsService } from '../../service/settings.service';
import moment from 'moment';
import alertHelper from '../../helpers/alert.helper';
import Swiper from 'react-native-swiper';
import timer from 'react-native-timer';
import Device from '../../components/react-native-device-detection-val';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { NewFaceDetectionView } from 'react-native-face-detection';
import { from } from "rxjs/observable/from";

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var loading = false
var encodedData ='';
export class AutoFaceVerify extends React.Component {
    WS = {};
    callbackCount =0;
    encodedData ='';
    loading = false
    constructor(props) {
        super(props);
        autobind(this);

        var { height, width } = Dimensions.get('window');
        var toValue = (height / 3 * 2);

        this.state = {
            bounceValue: new Animated.Value(toValue),  //This is the initial position of the subview
            bounceSideBarValue: new Animated.Value(toValue),  //This is the initial position of the subview
            isHidden: true,
            isCamActive: false,
            isSideBarHidden: true,
            hasNoMatch: false,
            viewRefs: {},
            encodedData: '',
            isCatched: false,
            sessionId: '',
            threshold: '',
            finished: false,
            verifyResult: {
                name: '',
                score: 0,
                uid: '',
                employeeno: '',
                groupName: ''
            },
            loading: false,
            appState: AppState.currentState,
            resultID: '',
            runing: false,
            height: height,
            width: width,
           // fill: 0
        }
        this.getLocation();
        this._onNativeCallback = this._onNativeCallback.bind(this);
        

    }


    getVerifyConfig() {

        StorageHepler.getStorage(ConfigKeys.session)
            .then(config => {

                if (!config.sessionId || !config.sessionId) {
                    return false;
                }
                this.setState({
                    sessionId: config.sessionId
                });
            })
            .catch((error) => {
                ConsoleHelper.error('getVerifyConfig');
                return;
            });

        StorageHepler.getStorage(ConfigKeys.login)
            .then(config => {
                this.setState({
                    threshold: config.threshold || '70'
                });
            })
            .catch((error) => {
              //  ConsoleHelper.log(error.message);
                return;
            });
    }

    initState() {
        console.log("initState")
        this.loading = false
        this.setState({
            isCamActive: false,
            encodedData: '',
            isCatched: false,
            finished: false,
            loading: false,
            verifyResult: {
                name: '',
                score: 0,
                uid: '',
                employeeno: '',
                groupName: '',
               // fill: 0
            },
            resultID: '',

        });
    }

    componentDidMount() {
        try {
            // setTimeout(() => {
            if (Platform.OS === 'ios')
            {
                this.switchCamera();
            }else{
                this.startCamera();
            }

           // this.enableBug(false);
            AppState.addEventListener('change', this._handleAppStateChange);
            this.initMaintainSession();
            this.openWebScoket();
            
        } catch (error) {
           // AlertHelper.alertError(error)
        }

        setInterval(() => {
            if (this.WS)
            {
                if(this.WS.readyState != 1){
                    console.log('WebScoket recon')
                    this.openWebScoket();
                }
            }
           
        }, 1000 * 3);
      

    }

    openWebScoket()
    {
        
       // if(this.WS) this.WS.close();
        this.WS = new WebSocket(ApiService.websocketUrl + '/fcsreconizedresult');
        this.WS.onopen = () => {
            console.log(" WebScoket onopen")
        // connection opened
        var id = {
            session_id: UserService.sessionId,
        }

        this.WS.send(JSON.stringify(id)); // send a message
        setTimeout(() => {
            var id = {
                session_id: UserService.sessionId,
            }
            this.WS.send(JSON.stringify(id)); // send a message
        }, 6 * 10000);
        };

       
        this.WS.onmessage = (e) => {
            var tmp  = JSON.parse(e.data)

            if (tmp.person_info) {
                if (tmp.channel.indexOf("mobileApp")>-1) {
                    clearTimeout(this.timer)
                    this.setVerifyResult(tmp);
                }
            }
        };

        this.WS.onerror = (e) => {
            console.log(" WebScoket onerror")

            setTimeout(() => {
                this.openWebScoket();
            }, 2 * 1000);
        };

        this.WS.onclose = (e) => {
            console.log(" WebScoket onerror")

            setTimeout(() => {
                this.openWebScoket();
            }, 2 * 1000);
        };
     }

    componentWillUnmount() {

        this.stopCamera();
        AppState.removeEventListener('change', this._handleAppStateChange);

    }

    /** 每三分鐘檢查一次 保持 Socket 連線*/
    initMaintainSession() {

        setInterval(() => {
            UserService.maintainSession().do(res => {
                if (!res) {
                    UserService.autologin().toPromise();
                }
            }).toPromise()
                .catch(error => {
                   // console.log('Maintain Session Error : ', error);
                    UserService.autologin().toPromise();
                });
        }, 1000 * 60 *1);
    }

    setVerifyResult(message) {
       
        const data = message;
        if (data.score < SettingsService.getThreshold) {
            this.error();
            return;
        }
        const resultData = {
            imgUrl: data.snapshot,
            name: data.person_info ? data.person_info.fullname || '' : '',
            score: (data.score * 100).toFixed(0),
            uid: data.person_info ? data.person_info.uid || '' : '',
            employeeno: data.person_info ? data.person_info.employeeno || '' : '',
            department: data.person_info ? data.person_info.department || '' : '',
            groupName: (data.groups && data.groups.length > 0) ? data.groups[0].name : 'unclassified'
        }

        EventService.resultID = '';
        this.setState({
            loading: false,
            verifyResult: resultData,
            resultID: '',
            finished: true
        });
        this.loading = false;
        console.log('timeTest faceVerify end websocket')
        // this.setState({
        //     loading: false,
        //     verifyResult: resultData,
        //     resultID: ''
        // }, () => {
        //     this.toggleSubview(true);
        // });

        // },200);       

        if (this.timer1) {
            clearTimeout(this.timer1);
        }
        // this.timer1 = setTimeout(() => {
        //     this.startCamera();
        // }, 2 * 1000);
        //this.WS.close();
    }

    setVerufyResult(message) {


        // const data = JSON.parse(message.result);
        const data = message.result;

        // setTimeout(()=>{


        //  if (!data.person_info) {
        if (!data.person_info) {
            console.log('No Match Data Detected person_info not get');
            this.error();
            return;
        }

        if (data.score < SettingsService.getThreshold) {
            console.log('No Match Data Detected score so low');
            this.error();
            return;
        }

        const resultData = {
            imgUrl: data.snapshot,
            name: data.person_info ? data.person_info.fullname || '' : '',
            score: (data.score * 100).toFixed(0),
            uid: data.person_info ? data.person_info.uid || '' : '',
            employeeno: data.person_info ? data.person_info.employeeno || '' : '',
            department: data.person_info ? data.person_info.department || '' : '',
            groupName: (data.groups && data.groups.length > 0) ? data.groups[0].name : 'unclassified'
        }

        EventService.resultID = '';
        this.setState({
            loading: false,
            verifyResult: resultData,
            resultID: '',
            finished: true
        });
        // this.setState({
        //     loading: false,
        //     verifyResult: resultData,
        //     resultID: ''
        // }, () => {
        //     this.toggleSubview(true);
        // });

        // },200);   
        console.log('timeTest faceVerify end api')

        if (this.timer1) {
            clearTimeout(this.timer1);
        }
        this.timer1 = setTimeout(() => {
            this.startCamera();
        }, 2 * 1000);    
    }


    _handleAppStateChange = (nextAppState) => {

        // App 進入背景模式時 停止 Camera 並且重置 icon
        if (nextAppState.match(/inactive|background/)) {

            this.setState({
                hasNoMatch: true
            });
            this.stopCamera();
            

        } else {
           // this.getVerifyConfig();
            this.startCamera();
            this.openWebScoket();
        }

    }

    _onNativeCallback =  (event) => {
        if (this.callbackCount ==0){
            this.callbackCount = 1;
            console.log('callbackCount' , this.callbackCount)
            return;
        }else{
            this.callbackCount = 0;
            console.log('callbackCount' , this.callbackCount)
        }
        if (this.loading&& event.nativeEvent.image && event.nativeEvent.image2) {
            return;
        } else {
            
            this.loading = true;
            this.encodedData = event.nativeEvent.image;
            this.setState({
                isCatched: true,
                encodedData: event.nativeEvent.image2,
                loading: true
            }),()=>{
                //this.newSendData();
            };
        
          
           this.stopCamera();
           this.newSendData(this.encodedData);
        }


    }
  
    async newSendData(encodeData) {
        console.log('timeTest faceVerify start')
        const faceverifyRetrun= await this.faceVerify(encodeData);
      
        if (faceverifyRetrun || faceverifyRetrun.message == 'ok') {
            if(this.state.finished != true){
                this.timer = setTimeout( async() => {
                    if(this.state.finished != true){
                        var GetVerifyResult = await this.callGetVerifyResultApi(faceverifyRetrun.verify_face_id);
                          this.setVerufyResult(GetVerifyResult);
                    }
                }, 2 * 1000);

            }
        } else {
            AlertHelper.displayToast('Can not connect to server.');
            this.error();
        }
        
        if (this.timer1) {
            clearTimeout(this.timer1);
        }
        this.timer1 = setTimeout( () => {
            this.startCamera();
        }, 3 * 1000);
    }

    /** 顯示下方選單 */
    toggleSubview(flag) {

        // var { height, width } = Dimensions.get('window');
        // var toValue = (height / 3 * 2);

        // if (flag) {
        //     toValue = 0;
        // } else {
        //     console.log("toggleSubview", toggleSubview);
        //     this.startCamera();
        //     // this.switchCamera();
        // }

        // //This will animate the transalteY of the subview between 0 & 100 depending on its current state
        // //100 comes from the style below, which is the height of the subview.
        // Animated.spring(
        //     this.state.bounceValue,
        //     {
        //         toValue: toValue,
        //         velocity: 3,
        //         tension: 2,
        //         friction: 8,
        //     }
        // ).start();

        // this.setState({
        //     isHidden: flag
        // });
    }

    toggleSideBar() {
        // var { height, width } = Dimensions.get('window');
        // var toValue = height;

        // if (this.state.isSideBarHidden) {
        //     toValue = 0;
        // }

        // //This will animate the transalteY of the subview between 0 & 100 depending on its current state
        // //100 comes from the style below, which is the height of the subview.
        // Animated.spring(
        //     this.state.bounceSideBarValue,
        //     {
        //         toValue: toValue,
        //         velocity: 0.2,
        //         tension: 2,
        //         friction: 8,
        //     }
        // ).start();

        // this.setState({
        //     isSideBarHidden: !this.state.isSideBarHidden
        // });

        // this.state.isSideBarHidden ? this.stopCamera() : !this.state.isHidden ? this.startCamera() : this.stopCamera();
    }

    switchCamera() {

        if (this.state.runing) {
            return;
        }

        this.setState({
            runing: true
        });

        setTimeout(() => {
            this.setState({
                runing: false
            })
        }, 1 * 1000);

        if (this.state.loading) {
            return;
        }

      
        this.startCamera();
        

        this.state.viewRefs['video'].setFacingFront(!this.state.facing);

        this.setState({ hasNoMatch: false, encodedData: '', isCatched: false, facing: !this.state.facing });

    }

    bodyStyle() {
        return {
            height: this.state.height * 0.7,
        }
    }
 
    render() {
        return (
            <Container style={iStyle.container}>
                <Body style={[styles.cam_container, this.bodyStyle()]}>
                    {!this.state.finished &&
                        <Item regular style={[styles.statusBar, iStyle.no_border, Device.select({
                            phone: { height: 60, },
                            tablet: { height: 60, }
                        })]}>
                            <Text style={[iStyle.header_title]}>Face Scan</Text> 
                        </Item>
                    }
                    {this.state.finished &&
                        <View style={[styles.pic_viewer]}>
                            {this.state.verifyResult.name == '' &&
                                <View style={[styles.slide, { flex: 1 }]}>
                                    <Item regular style={[iStyle.no_border, styles.returnItem]}>
                                        <Text style={[iStyle.header_title, styles.returnText]}>No Match Found</Text>
                                    </Item>
                                    <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                        <Text style={[iStyle.header_title, styles.returnSmallText]}>Please try again</Text>
                                    </Item>x
                                    <Item regular style={[styles.slide, iStyle.no_border, iStyle.screenshotItem]}>
                                        <View style={[styles.slide, { height: '100%', width: '100%' }]}>
                                            <View style={[iStyle.bigCircle, { backgroundColor: ColorConfig.MAIN_ERROR }]}>
                                                <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.encodedData}` }} />
                                            </View>
                                            <Image style={styles.smallCircle} source={require('../../assets/img/wrong.png')} />
                                        </View>
                                    </Item>
                                    <TouchableOpacity onPress={() => { this.retryScan() }}>

                                        <Item regular style={[styles.slide, iStyle.no_border, iStyle.btn_login, { backgroundColor: ColorConfig.MAIN_ERROR, }]}>
                                            <Text style={[iStyle.loginText, { color: 'white' }]}>Retry</Text>
                                        </Item>
                                    </TouchableOpacity>

                                </View>
                            }

                            {this.state.verifyResult.name != '' &&
                                <View style={[styles.slide, { flex: 1 }]}>
                                    <Item regular style={[iStyle.no_border, styles.returnItem]}>
                                        <Text style={[iStyle.header_title, styles.returnText]}>Matching Success</Text>
                                    </Item>
                                    <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                        <Text style={[iStyle.header_title, styles.returnSmallText]}>
                                            welcome {this.state.verifyResult.name}
                                        </Text>
                                    </Item>
                                    <Item regular style={[styles.slide, iStyle.no_border,iStyle.screenshotItem ]}>
                                        <View style={[styles.slide, { height: '100%', width: '100%' }]}>
                                            <View style={[iStyle.bigCircle, { backgroundColor: ColorConfig.MAIN_SUCESS }]}>
                                            <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.encodedData}` }} />

                                                {/* <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.verifyResult.imgUrl}` }} /> */}
                                                {/* <Image style={iStyle.screenshot} source={{ uri: `${ApiService.serverUrl}/frs/cgi/snapshot/session_id=${UserService.sessionId}&image=${this.state.verifyResult.imgUrl}` }} /> */}

                                            </View>

                                            <View style={[styles.smallCircle,
                                                , { backgroundColor: ColorConfig.MAIN_SUCESS }]}>
                                                <Image style={styles.cancel} source={require('../../assets/img/checked.png')} />
                                            </View>
                                        </View>
                                    </Item>
                                    <Item regular style={[iStyle.no_border, styles.returnItem]}>
                                        <Text style={[iStyle.header_title, styles.returnText]}> {this.state.verifyResult.name}</Text>
                                    </Item>
                                    <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                        <Text style={[iStyle.header_title, styles.returnSmallText]}>UID:{this.state.verifyResult.employeeno}</Text>
                                    </Item>
                                    <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                        <Text style={[iStyle.header_title, styles.returnSmallText]}>GPS:{this.longitude} {this.latitude}</Text>
                                    </Item>
                                    <TouchableOpacity onPress={() => { this.retryScan() }}>

                                        <Item regular style={[styles.slide, iStyle.no_border, iStyle.btn_login, { backgroundColor: ColorConfig.MAIN_SUCESS, }]}>
                                            <Text style={[iStyle.loginText, { color: 'white' }]}>Done</Text>
                                        </Item>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                    }
                         {/* {this.state.loading
                            &&
                            <View style={[{
                                position: 'absolute', height: '100%', width: '100%', alignItems: 'center',
                                justifyContent: 'center', zIndex: 10000, backgroundColor: 'rgba(22, 29 ,40,0.4)'
                            }]}>
                            </View>} */}

                    <View style={[styles.cam_videoview]}>
                       
                        {/* <VideoView style={styles.cam_videoview}
                            ref={(video_view) => {
                                this.state.viewRefs['video'] = video_view;
                            }}
                            onNativeCallback={this._onNativeCallback}>
                        </VideoView> */}

                        <NewFaceDetectionView key="NewFaceDetectionView" style={styles.cam_videoview} ref={(ref) => {
                             this.state.viewRefs['video'] = ref;
                            }} onNativeCallback={(event) => {
                                this._onNativeCallback(event)
                                }}
                        />
                        <Item regular style={[styles.statusBar, iStyle.no_border,,Device.select({
                            phone: { height: '10%',marginTop:'1%' },
                            tablet: { height: '10%',marginTop:'1%' }
                            })]}>
                            <Image style={[styles.screenShotBtn,this.state.isCatched==false&& {opacity:0.5}]} 
                                source={ require('../../assets/img/Scanning.gif') } />
                        </Item>
                    </View>
                    
                        
                    
                </Body>

                {/* <Animated.View
                    style={[styles.subView,
                    { transform: [{ translateY: this.state.bounceValue }] }]}
                >
                    {this.state.verifyResult && this.renderResultItem()}

                    <Item style={styles.btn_container}>
                        <Button style={iStyle.btn_primary} onPress={() => { this.toggleSubview(false) }}>
                            <Text>Retry</Text>
                        </Button>
                    </Item>
                </Animated.View> */}
                {/* <Animated.View
                    style={[iStyle.sideBar,
                    { transform: [{ translateX: this.state.bounceSideBarValue }] }]}
                >
                    <Sidebar
                        toggleSideBar={this.toggleSideBar.bind(this)}
                        pressLogout={this.logout.bind(this)}
                        pressSettings={this.settings.bind(this)}
                        pressFaceEnroll={this.enrollFace.bind(this)}
                    ></Sidebar>
                    <Text style={styles.versionText}>version: {pjson.version}</Text>
                </Animated.View> */}
            </Container>
        );
    }

    startCamera = async () => {
        console.log("startCamera")
        
        if (this.state.loading && this.state.finished
        ) {
            return;
        }
        this.initState();
       
        if(Platform.OS === 'ios'){
            var promise = this.state.viewRefs['video'].StartCamera(true);
        }else{
            var promise = this.state.viewRefs['video'].start(true);
        }
        let v = await promise;
        // if (ref && this.first) {
        //     this.thisref = ref;
        //     ref.start(true);
        //     this.first = false;
        // }
        //  this.state.viewRefs['video'].SetFacingFront(1);

        return v;
    }

    stopCamera = async () => {
       
        if(Platform.OS === 'ios'){
            var promise = this.state.viewRefs['video'].StopCamera();
        }else{
            var promise = this.state.viewRefs['video'].stop();
        }
       
        let v = await promise;
        return v;
    }

    enableBug = async (flag) => {
        var promise = this.state.viewRefs['video'].EnableDebugInfo(flag);
        let v = await promise;
        return v;
    }

    async faceVerify(encodeData) {
        console.log("call faceVerify")
        // this.setState({
        //     fill: 10
        // });
       return await ApiService.verifyFace({
            image: encodeData.replace(/\n/g, '')
        })
            .do((data) => {
                return data;
            })
            .toPromise()
            .catch(error => {
                AlertHelper.displayToast('Can not connect to server.');
                return null;
               // this.error();
                
            });



    }
    retryScan() {
        this.startCamera();
    }
   async callGetVerifyResultApi(verify_face_id) {
    return await ApiService.getverifyresult(
            verify_face_id
        ).do((verifyData) => {
           
            return verifyData ;
        }).toPromise()
            .catch(error => {
               return null;
            });
    }
    renderResultItem() {

        console.log('renderResultItem');

        if (!this.state.verifyResult) {
            return;
        }

        return (
            <Content style={styles.result_bar}>
                <View style={styles.result_item}>
                    <Text style={styles.result_item_info_groupName}>{`${this.state.verifyResult.groupName}`}</Text>
                    <View style={styles.result_item_container}>
                        <View style={styles.result_item_img_container}>
                            <Image style={styles.result_item_img} source={{ uri: `${ApiService.serverUrl}/frs/cgi/snapshot/session_id=${UserService.sessionId}&image=${this.state.verifyResult.imgUrl}` }} />
                        </View>
                        <View style={styles.result_item_info_container}>
                            <Text numberOfLines={1} ellipsizeMode={Platform.OS === 'android' ? 'tail' : 'clip'} style={styles.result_item_info_score}>{`${this.state.verifyResult.score}`}%</Text>
                            <Text numberOfLines={1} ellipsizeMode={Platform.OS === 'android' ? 'tail' : 'clip'} style={styles.result_item_info_name}>{`${this.state.verifyResult.name}`}</Text>
                            <Text numberOfLines={1} ellipsizeMode={Platform.OS === 'android' ? 'tail' : 'clip'} style={styles.result_item_info_idno}>{`${this.state.verifyResult.employeeno}`}</Text>
                        </View>
                        <TouchableOpacity style={styles.result_item_detail_container} onPress={() => this.verifyResult(this.state.verifyResult)}>
                            <Image style={styles.result_item_detail_icon} source={require('../../assets/img/icon_file.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Content>
        )
    }

    getImage(verfiName) {
       ApiService.getpersonlist(verfiName
        ).do((result) => {
            if (result["message"] == "ok") {
                var ps = result.person_list.persons;
                for (var p of ps) {
                    if (p.person_info.fullname ==verfiName) 
                    {
                        ApiService.getFace(p.face_id_numbers
                            ).do((image) => {
                                return image;
                                  
                            }).toPromise()
                                .catch(error => {
                                 
                        });
                    }
                }
                return null;
              }
        }).toPromise()
            .catch(error => {
            });


       
    }


    settings() {
        this.stopCamera();
        this.props.navigation.navigate('settingPage');
    }

    logout() {
        this.stopCamera();
        this.props.navigation.navigate('login');
    }

    enrollFace() {
        this.stopCamera();
        this.props.navigation.navigate('information');
    }

   async error() {
       await this.setState({
            loading: false,
            hasNoMatch: false,
            resultID: '',
            finished: true,
        });
       await this.stopCamera();
       if (this.timer1) {
        clearTimeout(this.timer1);
        }
        this.timer1 = setTimeout( () => {
            this.startCamera();
        }, 2 * 1000);
        // this.props.navigation.navigate('errorResult', { scanImg: this.state.encodedData });
    }

    verifyResult(profile) {
        this.props.navigation.navigate('verifyResult', { profile: profile });
    }

    longitude='' ;
    latitude ='';

    getLocation() {
      var Geolocation = require('Geolocation');
      Geolocation.getCurrentPosition(
          location => {
          
            this.longitude= location.coords.longitude.toFixed(3);
            this.latitude =  location.coords.latitude.toFixed(3) ;
          }
      );
   }

}

const styles = StyleSheet.create({
    cam_container: {
        flex: 5,
        //  padding: 15,
        height: '100%',
        width: '100%',
        margin: 0

    },
    cam_viewer: {
        height: '80%',
        width: '100%',
        // borderTopWidth: Platform.OS === 'android' ? 2 : 0,
        // borderBottomWidth: Platform.OS === 'android' ? 2 : 0,
        // borderLeftWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRightWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRadius: Platform.OS === 'android' ? 5 : 0,
        // padding: Platform.OS === 'android' ? 5 : 0,
        borderColor: ColorConfig.MAIN_BACKGROUND,
        shadowColor: ColorConfig.MAIN_BACKGROUND,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        // shadowRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pic_viewer: {
        height: '100%',
        width: '100%',
        // borderTopWidth: Platform.OS === 'android' ? 2 : 0,
        // borderBottomWidth: Platform.OS === 'android' ? 2 : 0,
        // borderLeftWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRightWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRadius: Platform.OS === 'android' ? 5 : 0,
        // padding: Platform.OS === 'android' ? 5 : 0,
        borderColor: ColorConfig.MAIN_BACKGROUND,
        shadowColor: ColorConfig.MAIN_BACKGROUND,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        // shadowRadius: 5,
    },
    cam_videoview: {
        height: '90%',
        width: '100%',
        borderRadius: 5,
        zIndex: 1,
        borderColor: ColorConfig.MAIN_BACKGROUND,
        shadowColor: ColorConfig.MAIN_BACKGROUND,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,


    },
    result_item: {
        flex: 1,
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
        // minHeight: 155,
        borderColor: ColorConfig.MAIN_MUDIUM,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderRadius: 5,

    },
    result_item_container: {
        //height: 120,
        flexDirection: 'row',
        flex: 1,
        padding: 9
    },
    result_item_img_container: {

    },
    result_item_img: {
        width: 100,
        height: 100
    },
    result_item_info_container: {
        marginLeft: 15,
        // width: '40%',
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    result_item_info_score: {
        fontSize: 55,
        lineHeight: 55,
        color: ColorConfig.MAIN_FONT,
        width: '100%',
        // flex: 1,
        flexShrink: 0,
        //numberOfLines:1,
        // ellipsizeMode:'tail'
        // height: 55
    },
    result_item_info_name: {
        fontSize: 20,
        lineHeight: 22,
        color: ColorConfig.MAIN_MUDIUM,
        // height: 24
    },
    result_item_info_idno: {
        fontSize: 20,
        lineHeight: 22,
        color: ColorConfig.MAIN_DEEP,
        // height: 24
    },
    result_item_info_groupName: {
        fontSize: 20,
        backgroundColor: ColorConfig.MAIN_MUDIUM,
        color: ColorConfig.MAIN_FONT_DEEP,
        padding: 5,
        paddingTop: 0,
        height: 33,
        width: '100%'
    },
    returnItem: {
        ...Device.select({
            phone: {},
            tablet: {}
        })
    },
    returnSmallItem: {
        ...Device.select({
            phone: { height: 30 },
            tablet: { height: 30 }
        })
    },
    returnText: {
        ...Device.select({
            phone: { fontSize: 36 },
            tablet: { fontSize: 36 }
        })
    },
    returnSmallText: {
        ...Device.select({
            phone: { fontSize: 16, height: 20 },
            tablet: { height: 22, fontSize: 14 }
        })
    },
   
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    result_item_detail_container: {
        marginLeft: 15,
        width: 50,
        height: 100,
        justifyContent: 'flex-end',
    },
    result_item_detail_icon: {
        width: '100%',
        resizeMode: 'contain'
    },
    row_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    videoview: {
        width: 320,
        height: 240,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    detected_view: {
        width: 160,
        height: 120,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        margin: 10
    },
    button: {
        padding: 8,
    },
    subView: {
        position: "absolute",
        bottom: 0,
        width: '100%',
        backgroundColor: ColorConfig.MAIN_MASK,
        height: '40%',
        borderColor: ColorConfig.MAIN_FONT_BLACK,
        borderTopWidth: 1
    },
    hintBar: {
        backgroundColor: ColorConfig.MAIN_MASK,
        justifyContent: 'center',
        padding: 18,
        position: 'absolute',
        top: 30,
        borderRadius: 10
    },
    versionText: {
        position: 'absolute',
        bottom: 10,
        color: ColorConfig.MAIN_DEEP,
        right: 10
    },
    thumbnial: {
        position: 'absolute',
        top: 20,
        right: 20,
        borderRadius: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 120,
        height: 180,
        borderWidth: 2,
        borderColor: ColorConfig.MAIN_MUDIUM,
        borderRadius: 8,
        marginBottom: 15,
    },
    headshot: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 5
    },
    btn_container: {
        height: 55,
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 0,
        backgroundColor: ColorConfig.TRANSPARENT,
    },
    swithColor: {
        backgroundColor: ColorConfig.MAIN_MUDIUM,
        borderRadius: 17
    },
    textLabel: {
        color: ColorConfig.MAIN_MUDIUM,
        padding: 5
    },
    txtStatus: {
        color: ColorConfig.MAIN_MUDIUM,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 40,
        color: 'white'
    },
    txtWelcome: {
        color: ColorConfig.MAIN_MUDIUM,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 80
    },
    txtDate: {
        color: ColorConfig.MAIN_MUDIUM,
        position: 'absolute',
    },
    txtTime: {
        color: ColorConfig.MAIN_MUDIUM,
        fontSize: 15,
        position: 'absolute',
        top: 35,
        right: 20,
    },
    statusBar: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        // padding: 5,
        // height: 10,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        flexDirection: 'row',

    },


    slide: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    dot: {
        opacity: 0.3,
        width: 8,
        height: 8,
        borderRadius: 7,
        marginLeft: 7,
        marginRight: 7,
        zIndex: 1000,
        top: 100,
        position: 'absolute',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 7,
        marginLeft: 7,
        marginRight: 7
    },
    paginationStyle: {
        bottom: 10,
    },

    cancel: {
        ...Device.select({
            phone: { height: 15, width: 15 },
            tablet: { height: 15, width: 15 }
        })
    },
    screenShotBtn:{
        ...Device.select({phone: { height: 69, width: 153 },tablet: { height: 24, width: 51 }
        }),   
        position: 'absolute',
        opacity:1
    },
    smallCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 10,
        right: '28%',
        ...Device.select({
            phone: {
                height: 36,
                width: 36,
                borderRadius: 18
            },
            tablet: {
                height: 36,
                width: 36,
                borderRadius: 18
            }
        })
    }
});

AppRegistry.registerComponent('FaceVerify', () => FaceVerify);


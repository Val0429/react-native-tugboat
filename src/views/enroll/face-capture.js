import React from 'react'

import { Platform, AppState, BackHandler, StyleSheet, TouchableHighlight, Animated, AppRegistry, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native'
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base'
import ColorConfig from '../../config/color.config '
import StorageHepler from '../../helpers/storage.helper'
import AlertHelper from '../../helpers/alert.helper'
import { ConfigKeys } from '../../domain/storage'
import iStyle from '../../style/main-style'
import { VideoView } from '../shared/video-view'
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
import EZSideMenu from 'react-native-ezsidemenu';
import { NewFaceDetectionView } from 'react-native-face-detection';

export class FaceCapture extends React.Component {
    
    WS = {};

    WS_NON = {};

    constructor(props) {
        super(props);
        autobind(this);
        console.log('Face-capture')
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
            fill: 0,
            mode :'home',
            department: '',
            contactNumber: '',
            uidata:'',
            facing: true
        }
        this._onNativeCallback = this._onNativeCallback.bind(this);
    }

    componentDidMount() {
        try {
           // this.enableBug(false);
           this.startCamera();
            AppState.addEventListener('change', this._handleAppStateChange);
            this.initMaintainSession();
           
        } catch (error) {
            AlertHelper.alertError(error)
        }

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
                    console.log('Maintain Session Error : ', error);
                    UserService.autologin().toPromise();
                });
        }, 1000 * 60 * 3);
    }

  

    _handleAppStateChange = (nextAppState) => {

        // App 進入背景模式時 停止 Camera 並且重置 icon
        if (nextAppState.match(/inactive|background/)) {

            this.setState({
                hasNoMatch: true
            });
            this.stopCamera();

        } else {
            //this.getVerifyConfig();
            this.startCamera();
        }

    }

    _onNativeCallback = (event) => {
        if (this.state.loading && event.nativeEvent.image2) {
            return;
        } else {
            // this.setState({ encodedData: event.nativeEvent.image, isCatched: true });
            this.setState({
                isCatched: true,
                encodedData: event.nativeEvent.image,
                uidata: event.nativeEvent.image2
            });
            // setTimeout(() => {
            //     this.stopCamera();
            //     this.sendData();
            // }, 500);
        }


    }

    frImage()
    {
        if (this.state.encodedData)
        {
            console.log('stopCamera3')

            this.stopCamera();
            this.props.navigation.navigate('information', {
                uid: this.state.uid,
                name: this.state.name,
                department: this.state.department,
                contactNumber: this.state.contactNumber,
                encodedData:this.state.encodedData,
                uidata:this.state.uidata
            });
        }
    }

    sendData() {

        // if (!this.state.isCatched) {
        //     AlertHelper.alertError("this.state.encodedData" + this.state.encodedData);
        // }
        //AlertHelper.alertError("this.state.encodedData" + this.state.encodedData);
        console.log('faceVerify start');

        this.faceVerify(this.state.encodedData);

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
 
    contentView() {
        var pjson = require('../../../package.json');
        return (
            <Container style={iStyle.container}>
                <Body style={[styles.cam_container, this.bodyStyle()]}>
                    {!this.state.finished &&
                        <Item onPress={() => {  this.goToAddPerson() }} regular style={[styles.statusBar,iStyle.no_border,Device.select({phone: { height:'10%'},tablet: { height: 50, } }),
                        {width:'100%',height:'10%'}]}>
                            <Image style={[iStyle.backIcon]} source={require('../../assets/img/backtologin.png')}/>
                            <Text style={[iStyle.loginText, { color: 'rgb(0,122,255)', left: 25, position: 'absolute' }]}>Back</Text>
                            <Text style={[iStyle.header_title]}>Face Scan</Text>
                        </Item>
                    }
                    <View style={[styles.cam_viewer]}>
                        {this.state.loading
                            &&
                            <View style={[{
                                position: 'absolute', height: '100%', width: '100%', alignItems: 'center',
                                justifyContent: 'center', zIndex: 10000, backgroundColor: 'rgba(22, 29 ,40,0.4)'
                            }]}>
                                <AnimatedCircularProgress
                                    size={150}
                                    width={10}
                                    fill={this.state.fill}
                                    backgroundColor="rgb( 18 ,204 ,243)"
                                    onAnimationComplete={() => console.log('onAnimationComplete')}
                                    tintColor="rgb( 57 ,125 ,246)" >
                                    {
                                        (fill) => (
                                            <Text style={[iStyle.header_title, { fontSize: 40, color: 'rgb( 57 ,125 ,246)' }]} >
                                                {this.state.fill} %
                                            </Text>
                                        )
                                    }
                                </AnimatedCircularProgress>
                            </View>}

                        {/* <VideoView style={styles.cam_videoview}
                            ref={(video_view) => {
                                this.state.viewRefs['video'] = video_view;
                            }}
                             onNativeCallback={this._onNativeCallback}
                            >
                        </VideoView> */}
                        <NewFaceDetectionView key="NewFaceDetectionView" backgroundColor="rgb( 18 ,204 ,243)" style={styles.cam_videoview} ref={(ref) => {
                             this.state.viewRefs['video'] = ref;
                            }} onNativeCallback={(event) => {
                                this._onNativeCallback(event)
                                }}
                        />
                    </View>
                   
                    <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',},Device.select({
                            phone: { height: '15%' },
                            tablet: { height: 50 }
                        })]}>
                        <TouchableOpacity style={[Device.select({phone: { height: 40, width: 40 ,left: 20},tablet: { height: 20, width: 20,left: 20 }
                            }), { position: 'absolute' }]} onPress={() => { this.switchCamera() }}  >
                            <Image style={[Device.select({phone: { height: 40, width: 40 },tablet: { height: 20, width: 20 }
                                }), {  position: 'absolute' }]} source={require('../../assets/img/reuse.png')} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.screenShotBtn} onPress={() => { this.frImage() }}  >
                            <Image style={[styles.screenShotBtn,this.state.isCatched==false&& {opacity:0.5}]}  source={require('../../assets/img/shot.png')} />
                        </TouchableOpacity>
                    </Item>
                    
                </Body>

            </Container>
        );
    }

    startCamera = async () => {
        if (this.state.loading && this.state.finished
        ) {
            return;
        }
        if(Platform.OS === 'ios'){
            var promise = this.state.viewRefs['video'].StartCamera(true);
        }else{
            var promise = this.state.viewRefs['video'].start(true);
        }
        let v = await promise;
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

    retryScan() {
        this.startCamera();
    }
   
    enrollFace() {
        this.stopCamera();
        const params = this.props.navigation.state.params;   
        if (params)
        {
            this.props.navigation.navigate('information', {
                uid: params.uid,
                name: params.name,
                department: params.department,
                contactNumber: params.contactNumber,
                encodedData:this.state.encodedData
            });
        }
        else
        {
            this.props.navigation.navigate('information', {
                uid:'',
                name: '',
                department: '',
                contactNumber: '',
                encodedData:''
              
            });
        }
      
    }


    verifyResult(profile) {
        this.props.navigation.navigate('verifyResult', { profile: profile });
    }

    simpleMenu() {
        return this.contentView() 
    }

     goToAddPerson()
     {
        this.enrollFace()
     }
     menu(opacity) {
        const menu = (
          <Animated.View style={{ flex: 1 }}>
                <View style={[styles.slide, { flex: 1 }]}>
                <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',flex:1}]}>     
                </Item>
               
                <Item regular onPress={() => { this.enrollFace() }}  style={[styles.selectstatusBar, iStyle.no_border,{width:'100%',flex:1}]}>
                    <Image style={styles.menuIcon} source={require('../../assets/img/face.png')} />
                        <Text style={styles.menuText}>Face Enroll </Text>
                </Item>
                  
                <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',flex:1}]}>
                    <Image style={styles.menuIcon} source={require('../../assets/img/notification.png')} />
                        <Text style={styles.menuText}>Notification</Text>
                </Item>
                <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',flex:1}]}>
                    <Image onPress={() => { this.logout() }} style={styles.menuIcon}  source={require('../../assets/img/settings.png')} />
                        <Text style={styles.menuText}>Setting        </Text>
                </Item>
                <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',flex:1}]}>
                    <Image onPress={() => { this.logout() }} style={styles.menuIcon}  source={require('../../assets/img/out.png')} />   
                        <Text style={styles.menuText}>Logout        </Text>  
                </Item>

                <Item regular style={[styles.statusBar, iStyle.no_border,{width:'100%',flex:5}]}>
                         
                </Item>


                </View>
             
          </Animated.View>

            // <Item style={[iStyle.no_border, { flex:1,height:20, width: '100%', position: 'absolute' }]} >
            // <Text style={[styles.loginText]}>12121212</Text>
            // </Item>
            // <Item style={[iStyle.no_border, { flex:2,height:20, width: '100%', position: 'absolute' }]} >
            // <Text style={[styles.loginText]}>vdfvdfvdv</Text>
            // </Item>
        );
        return menu
      }
      render() {
         return this.simpleMenu()
        //return this.advancedMenu()
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
        height: '75%',
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
        height: '100%',
        width: '100%',
        borderRadius: 5,
        zIndex: 1,
        borderColor: ColorConfig.MAIN_BACKGROUND,
        shadowColor: ColorConfig.MAIN_BACKGROUND,
        // backgroundColor: ColorConfig.MAIN_BACKGROUND,


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
            tablet: { fontSize: 18 }
        })
    },
    returnSmallText: {
        ...Device.select({
            phone: { fontSize: 16, height: 20 },
            tablet: { height: 10, fontSize: 8 }
        })
    },
    btn_login: {
        justifyContent: 'center',
        alignItems: 'center',
        ...Device.select({
            phone: { width: 300, height: 50, marginTop: 50, borderRadius: 3 },
            tablet: { width: 300, height: 25, marginTop: 20, borderRadius: 3 }
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
    selectstatusBar: {
        backgroundColor: 'rgb(57,125,246)',
        // padding: 5,
        // height: 10,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        flexDirection: 'row',
    },


    slide: {
        backgroundColor: 'transparent',
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
    },
    menuIcon:{
        position: 'absolute' ,
        ...Device.select({phone: { height: 30, width: 30 ,left: 20},tablet: { height: 20, width: 20,left: 20 }
        })
    },
    menuText:{
        color:ColorConfig.WHITE,
        textAlign:'left',
        ...Device.select({
            phone: {
              fontSize:18
            },
            tablet: {
                fontSize:18
            }
        })
    },
    screenShotBtn:{
        ...Device.select({phone: { height: 60, width: 60 },tablet: { height: 20, width: 20 }
        }),  
        position: 'absolute',
        opacity:1
    },
  
});

AppRegistry.registerComponent('FaceVerify', () => FaceVerify);


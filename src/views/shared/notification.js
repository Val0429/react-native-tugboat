import React from 'react';

import { StatusBar, Image, StyleSheet, Switch, View ,ScrollView} from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab,Picker } from 'native-base';
import ColorConfig from '../../config/color.config ';
import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import AlertHelper from '../../helpers/alert.helper';
import StringHelper from '../../helpers/string.helper';
import { ConfigKeys } from '../../domain/storage';
import SettingsService from '../../service/settings.service';
import ApiService from '../../service/api.service';
import StorageHepler from '../../helpers/storage.helper';
import UserService from '../../service/user.service';
import Validation from '../../helpers/validation.helper';
import Device from '../../components/react-native-device-detection-val';
import SwipeView from 'react-native-swipeout'

export class Notification extends React.Component {
    host = '';
    port = '';
    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            host: '',
            port: '',
            wsport: '',
            threshold: '70',
            account: '',
            password: '',
            isAutoCapture: false,
            notificationListData:[
            ]
        };
    }
    renderRow(index) {
      return  [{
            backgroundColor:'red',
            color:'white',
            text:'Delete',
            onPress:()=>{this.deleteNotofication(index)}
        }];
    }
    deleteNotofication(index)
    {
      
        StorageHepler.getStorage("notificationDataList")
        .then(_data => {
            _data.NotificationList= _data.NotificationList.slice(index+1,1);
          this.setState({
            notificationListData: _data.NotificationList,
          });

          StorageHepler.setStorage("notificationDataList", {
            NotificationList: _data.NotificationList
          });

        })
        .catch((error) => {
          return;
        });

    }
    async componentDidMount() {
        this.getLoginConfig();
        StorageHepler.getStorage("notificationDataList")
        .then(_data => {
            console.log('_data.NotificationList',_data.NotificationList);
          this.setState({
            notificationListData: _data.NotificationList,
          });
        })
        .catch((error) => {
          return;
        });

    }


    timecodeToDateString(timecode) {
        if (timecode == null) return "";
    
        var dd = new Date(timecode);
        var _y = dd.getFullYear();
        var _M = dd.getMonth() < 9 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1); // getMonth() is zero-based
        var _d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
        var _h = dd.getHours() < 10 ? "0" + dd.getHours() : dd.getHours();
        var _m = dd.getMinutes() < 10 ? "0" + dd.getMinutes() : dd.getMinutes();
        return _y + '/' + _M + '/' + _d +" " + _h + ':' + _m;
      }
    getLoginConfig() {
        StorageHepler.getStorage(ConfigKeys.login)
            .then(config => {
                this.host =config.host;
                this.port =config.port;
                this.setState({
                    host: config.host,
                    port: config.port,
                    wsport: config.wsport,
                    account: config.account,
                    password: config.password,
                    threshold: config.threshold
                });
            })
            .catch((error) => {
                console.log(error.message);
                return;
            });
    }

    render() {
        var pjson = require('../../../package.json');
        return (
          <Content style={{ flex: 1 }}
            contentContainerStyle={styles.sideBarContainer}
            scrollEnabled={false}>
            <Item style={[iStyle.no_border, { top: 20, width: '100%', position: 'absolute' }]} >
              <Image  style={[Device.select({
                phone: { height: 24, width: 24 },
                tablet: { height: 20, width: 20 }
              }), { left: 0, position: 'absolute' }]} source={require('../../assets/img/backtologin.png')} />
              <Text onPress={() => { this.props.navigation.state.params.callBackData(); this.props.navigation.goBack();}} style={[iStyle.loginText, { color: 'rgb(0,122,255)', left: 25, position: 'absolute' }]}>Back</Text>
              <Text style={[iStyle.loginText]}>Notification List</Text>
            </Item>
            <Form style={[styles.loginForm,{marginTop:20}]}>
              <ScrollView>
                {this.setNotificationListData()}     
              </ScrollView>
               
            </Form>
          </Content>
        )
    }
    setNotificationListData()
    {  
        var pages =[];
        pages.push(
            this.state.notificationListData.map((_data,index )=> 
           
                <SwipeView style={[{backgroundColor:ColorConfig.MAIN_BACKGROUND}]} right={this.renderRow(index)}  >
                     <Item regular style={[iStyle.no_border, styles.itemStyle]}>   
                            <Item style={[iStyle.no_border]} >
                                {
                                    !_data.checkStatus &&
                                    <View style={[styles.circle]}>
                                </View>
                                }
                                
                            </Item>
                            <Item style={[iStyle.no_border,{flex:4}]} >
                                { _data.snapshot!=undefined &&
                                    <Image style={[
                                        Device.select({
                                            phone: {
                                                height: 25,
                                                width: 25                                            },
                                            tablet: {
                                                height: 60,
                                                width: 60                                            }
                                        }) ]} source={{ uri: `${ApiService.serverUrl}/frs/cgi/snapshot/session_id=${UserService.sessionId}&image=${_data.snapshot}` }} />
                                }
                                    {/* <Image style={[styles.bigCircle]} source={require('../../assets/img/headshot.png')} /> */}
                            </Item>
                            <Item style={[iStyle.no_border,{flex:22}]} >
                        
                                <Item style={[iStyle.no_border,{flexDirection: 'row',marginLeft:4,width:'100%'}]}>
                                    <Text style={[styles.contentText ,{width:'75%'}]} >{_data.content}</Text>
                                    <Text numberOfLines={1} style={[styles.dateText,{width:'25%',textAlign:'left'}]} >{ this.timecodeToDateString(_data.sentTime)}</Text> 
                                </Item>
                            {/* <Item style={[iStyle.no_border,{marginLeft:2,width:'100%'}]}>
                                <Text numberOfLines={2} style={[styles.contentText,{width:'100%'} ]} >{_data.content}</Text>
                            </Item>  */}
                            </Item>
                        </Item>     
                </SwipeView>
           
                )

            
        );
    
        return(
            pages
        )
    }
    cancel() {
        this.props.navigation.goBack();
    }

    saveLoginConfig() {

        if (!Validation.ValidNumber(this.state.threshold)) {
            AlertHelper.alertError('Please check your threshold settings.');
            return;
        }


        SettingsService.threshold = this.state.threshold;
        ApiService.init(this.state.host, this.state.port, this.state.wsport);

        StorageHepler.setStorage(ConfigKeys.login, {
            host: this.state.host,
            port: this.state.port,
            wsport: this.state.wsport,
            threshold: this.state.threshold,
            account: UserService.username,
            password: UserService.password,
        })
            .catch((error) => {
                AlertHelper.alertError('Save LoginConfig Failed');
                return false;
            });
        AlertHelper.displayToast('Successfully Saved');
        return true;
    }

    save() {

        if (this.saveLoginConfig()) {
            this.props.navigation.goBack();
            return;
        }
    }
}

const styles = StyleSheet.create({
    baseContainer: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND
    },
    sideBarContainer:{
        flex: 1,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        flexDirection: 'column',
        justifyContent: 'space-between',
        
    },
  
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginForm: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        top:50,
        borderRadius: 5,
        flex: 1
    },
    regularInput: {
        backgroundColor: ColorConfig.GRAY_INPUT_BACKGROUND,
        borderColor: ColorConfig.GRAY_INPUT_BACKGROUND,
        borderRadius: 5,
        marginBottom: 10
    },
    title: {
        fontSize: 24,
        color: ColorConfig.MAIN_FONT,
        marginBottom: 15,
        textAlign: 'center'
    },
    loginButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 0
    },
    loginButton: {
        backgroundColor: ColorConfig.YELLOW_MAIN_THEME,
        borderColor: ColorConfig.GRAY_BUTTON_BORDER,
        borderWidth: 1,
    },
    settingButton: {
        backgroundColor: 'transparent',
        width: 60,
        height: 60,
        borderWidth: 0,
        borderColor: ColorConfig.MAIN_DEEP,
        borderRadius: 5,
        right: 15,
        marginBottom: 15,

    },
    settingButtonImg: {

        width: 40,
        height: 40,
        borderWidth: 0,
        marginBottom: 15,
    },
    footer: {
        borderWidth: 0,
        justifyContent: 'flex-end',
        backgroundColor: ColorConfig.MAIN_BACKGROUND,

    },
    loginText: {
        ...Device.select({
          phone: { fontSize: 19, },
          tablet: { fontSize: 8 ,}
        }),
        textAlign:'left',
        color: ColorConfig.WHITE
    },
    contentText:{
        ...Device.select({
            phone: { fontSize: 16, },
            tablet: { fontSize: 16 ,}
          }),
          textAlign:'left',
          color: 'rgb(129,144,176)',
    },
    dateText:{
        ...Device.select({
            phone: { fontSize: 10, },
            tablet: { fontSize: 10 ,}
          }),
          textAlign:'left',
          color: 'rgb(129,144,176)',
    },
    itemStyle: {
        width: '100%',
       backgroundColor: 'rgb(22 ,29 ,40)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        margin:2,
        ...Device.select({
          phone: { height: 80 },
          tablet: { height: 40}
        })
    },
    footerText: {
        color: ColorConfig.MAIN_FONT_BLACK,
        fontSize: 16
    },
    info_content: {
        color: ColorConfig.WHITE,
        fontSize: 24,
        textAlign: 'center'
    },
    circle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(0,122,255)',
        ...Device.select({
            phone: {
                height: 10,
                width: 10,
                borderRadius: 75
            },
            tablet: {
                height: 10,
                width: 10,
                borderRadius: 55
            }})
    },
    bigCircle:{
        alignItems: 'center',
        justifyContent: 'center',
        ...Device.select({
            phone: {
                height: 50,
                width: 50,
                borderRadius: 75
            },
            tablet: {
                height: 20,
                width: 20,
                borderRadius: 55
            }})
    }
     
});
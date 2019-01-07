import React from 'react';
import { Observable } from 'rxjs/Rx';
import { StatusBar, Image, StyleSheet, TouchableOpacity, Animated, Dimensions, AsyncStorage, ActivityIndicator, View , Platform } from 'react-native';
import { Button, CheckBox,Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab,ListItem, Thumbnail,Picker } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';


import ColorConfig from '../config/color.config ';
import AlertHelper from '../helpers/alert.helper';
import StorageHepler from '../helpers/storage.helper';
import { ConfigKeys } from '../domain/storage';
import Validation from '../helpers/validation.helper';
import StringHelper from '../helpers/string.helper';
import UserService from '../service/user.service';
import ApiService from '../service/api.service';
import autobind from 'class-autobind';
import iStyle from '../style/main-style';
import Device from '../components/react-native-device-detection-val';

import SettingsService from '../service/settings.service';
import alertHelper from '../helpers/alert.helper';
import { registerKilledListener, registerAppListener } from "../fcm/Listeners";

// import CheckBox from 'react-native-check-box'

import FCM from "react-native-fcm";
import DeviceInfo from 'react-native-device-info';
import { PermissionsAndroid } from 'react-native';

export class Login extends React.Component {


  constructor(props) {
    super(props);
    autobind(this);
    var { height, width } = Dimensions.get('window');
    var toValue = width;

    this.state = {
      // host: '172.16.10.29',
      // port: '8088',
      // wsport: '7077',
      // threshold: '70',

      host: '',
      port: '',
      wsport: '',
      threshold: '',
      account: '',
      password: '',
      loading: false,
      bounceValue: new Animated.Value(toValue),  //This is the initial position of the subview       
      isSettingsHidden: true,
      accessible: false,
      viewWidth: 0,
      height: height,
      width: width,
      showPassword: false,
      mode :"auto",
      remenber:false
    };

 

  }

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          'title': 'Cool Photo App Camera Permission',
          'message': 'Cool Photo App needs access to your camera ' +
                     'so you can take awesome pictures.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera")
      } else {
        console.log("Camera permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }


  async componentDidMount() {
    // 取得暫存的資料
    this.getLoginStorage();

    var { height, width } = Dimensions.get('window');

    this.setState({
      viewWidth: width,
      height: height,
      width: width
    })
    this.requestCameraPermission();
  //  this._toggleSubview();
 

  }

  




  login() {
  
    if (this.state.loading) {
      return;
    }

    if (!Validation.ValidHost(this.state.host) || !Validation.ValidPort(this.state.port)) {
      AlertHelper.alertError('Please check your server settings.');
      return;
    }

    if (!Validation.ValidValue(this.state.account) || !Validation.ValidValue(this.state.password)) {
      AlertHelper.alertError('Please check your account and password.');
      return;
    }

    if (!Validation.ValidNumber(this.state.threshold)) {
      AlertHelper.alertError('Please check your threshold settings.');
      return;
    }

    SettingsService.threshold = this.state.threshold;
    ApiService.init({
      host: this.state.host,
      port: this.state.port,
      wsport: this.state.wsport
    });

    this.saveLoginStorage();
    this.setLoading(true);

    UserService.login({ username: this.state.account, password: this.state.password })
      .do(res => {

        if (!res) {
          AlertHelper.alertError('Unauthorized account.');
          return false;
        }
        console.log("login sucess!!", res)
        UserService.username = this.state.account;
        UserService.password = this.state.password;
        this.setLoading(false);
       // this.nextPage();
       
        FCM.requestPermissions();
        if (Platform.OS === 'ios')
        {
          FCM.getFCMToken().then(token => {
           // AlertHelper.alertError('addDevices sucess.');
            ApiService.addPushDevice(
              token,
              DeviceInfo.getDeviceId(),
              DeviceInfo.getDeviceName()
            ).do(() => {
              registerAppListener(this.props.navigation);
              this.nextPage();
            }).toPromise()
              .catch(error => {
                 //AlertHelper.alertError('getAPNSToken Fail.');
                registerAppListener(this.props.navigation);
              this.nextPage();
              });
          });
        }else{
          FCM.getFCMToken().then(token => {
            ApiService.addPushDevice(
              token,
              DeviceInfo.getDeviceId(),
              DeviceInfo.getDeviceName()
            ).do(() => {
              registerAppListener(this.props.navigation);
              this.nextPage();
            }).toPromise()
              .catch(error => {
                 // AlertHelper.alertError('addDevices Fail.');
                registerAppListener(this.props.navigation);
              this.nextPage();
              });
          });
        }
       
      //getAPNSToken

      })
      .toPromise()
      .catch((error) => {
        console.log(error);
        this.setLoading(false);

        this.setState({ loading: false });
        AlertHelper.alertError('Login Error : Please check your internet connection.');
      });

  }

  getLoginStorage() {

    StorageHepler.getStorage(ConfigKeys.login)
      .then(config => {
        this.setState({
          host: config.host,
          port: config.port,
          wsport: config.wsport,
          account: config.account,
          threshold: config.threshold,
          mode: config.mode,
          password : config.remenber ? config.password : '',
          remenber:config.remenber ? config.remenber  :true
        });
      })
      .catch((error) => {
        AlertHelper.displayToast('Save LoginConfig Failed.');
        this.setState({
          port: '8088',
          remenber:true
        });
        return;
      });

  }

  saveHostStorage() {

    if (!Validation.ValidHost(this.state.host) || !Validation.ValidPort(this.state.port)) {
      AlertHelper.alertError('Please check your server settings.');
      return;
    }

    StorageHepler.setStorage(ConfigKeys.login, {
      host: this.state.host,
      port: this.state.port,
      wsport: this.state.wsport,
      account: this.state.account,
      password: this.state.password,
      threshold: this.state.threshold,
      mode :this.state.mode,
      remenber: this.state.remenber
    }).catch((error) => {
      AlertHelper.displayToast('Save Host Information Failed.');
      return;
    });

    AlertHelper.displayToast('Successfully Saved.');
    this._toggleSubview();
  }

  saveLoginStorage() {

    StorageHepler.setStorage(ConfigKeys.login, {
      host: this.state.host,
      port: this.state.port,
      wsport: this.state.wsport,
      threshold: this.state.threshold,
      account: this.state.account,
      password: this.state.password,
      mode :this.state.mode,
      remenber:this.state.remenber
    })

      .catch((error) => {
        AlertHelper.displayToast('Save LoginConfig Failed.');
        return false;
      });

    return true;
  }

  render() {
    var pjson = require('../../package.json');
    return (
      <Container style={[styles.baseContainer, { flex: 1 }]}>
        <Content style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={false}>
          <Image style={iStyle.logo} source={require('../assets/img/logo.png')} />
          <Form style={styles.loginForm}>
            <Item style={[iStyle.no_border]} >
              <Text style={[styles.loginText]}>Version : {pjson.version}</Text>
            </Item>
            <Item regular style={[iStyle.no_border, iStyle.itemStyle, iStyle.firstItem]}>
              <Image style={[iStyle.icon]} source={require('../assets/img/user.png')} />
              <Item style={[iStyle.no_border, styles.line]} >
              </Item>
              <Input
                placeholder='User Name'
                style={[styles.form_control_input, styles.loginText]}
                autoCapitalize='none'
                onChangeText={(account) => this.setState({ account })}
                value={this.state.account} />
            </Item>

            <Item regular style={[iStyle.no_border, iStyle.itemStyle, Device.select({
              phone: { marginTop: 20 }, tablet: { }
            }),]}>
              <Image style={[iStyle.icon]} source={require('../assets/img/password.png')} />
               <Item style={[iStyle.no_border, styles.line]} >
              </Item>
              <Input
                secureTextEntry={!this.state.showPassword}
                placeholder='Password'
                style={[styles.form_control_input, styles.loginText]}
                autoCapitalize='none'
                onChangeText={(password) => this.setState({ password })}
                value={this.state.password} />
              <TouchableOpacity onPressIn={() => this.setState({ showPassword: true })} onPressOut={() => this.setState({ showPassword: false })} >
                <Image style={[iStyle.icon,Device.select({
                  phone: {   },
                  tablet: {  }
                })]} source={require('../assets/img/eye.png')} />
              </TouchableOpacity>


            </Item>
            <ListItem style={[iStyle.no_border, iStyle.itemStyle,{backgroundColor:ColorConfig.MAIN_BACKGROUND}, Device.select({
              phone: { marginTop:0  }, tablet: { marginTop:0 }
            }),]}>
              <CheckBox
                color={'rgb(79,91,114)'}
                checked={this.state.remenber} 
                onPress={()=>{
                  this.setState({
                    remenber:!this.state.remenber
                  });
              }}
              />
              <Text style={[styles.loginText]}> Remenber Me</Text>
            </ListItem>
            
           
           
            {/* <CheckBox
                style={{flex: 1, padding: 10,marginTop:20}}
                onClick={()=>{
                  console.log('checkClick')
                }}
                isChecked={this.state.remenber}
                rightText={"Remenber Me"}
                disabled ={true}
                rightTextStyle={[styles.form_control_input, styles.checkBoxText]}
                checkBoxColor = {ColorConfig.MAIN_TEXT_COLOR}    
                uncheckedCheckBoxColor = {ColorConfig.MAIN_TEXT_COLOR}   
                checkedCheckBoxColor= {ColorConfig.MAIN_TEXT_COLOR}   
            /> */}
        
      


            <TouchableOpacity onPress={() => { this.login() }}
            >
              <LinearGradient colors={['#4b7dee', '#5ec9ef']} end={{ x: 1, y: 0 }} start={{ x: 0, y: 1 }} onPress={() => { this.login() }} 
                style={[iStyle.btn_login, Device.select({
                phone: { width: '100%', height: 50, marginTop: 10, borderRadius: 3 },
                tablet: { width: '100%', height:50,marginTop: 10,borderRadius: 3 }
              })]} >
                <Text style={[styles.loginText, { color: 'white' }]}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity >
              <Item style={[iStyle.no_border, Device.select({
                phone: { marginTop: 30, marginBottom: 100 }
                , tablet: { marginTop: 30, marginBottom: 180 }
              })]} >
                <Text onPress={() => { this._toggleSubview() }}
                  style={[styles.loginText, { textDecorationLine: 'underline' }]}>Setting</Text>
              </Item>
            </TouchableOpacity>


            {/* </Item> */}
          </Form>


        </Content>
        <Animated.View
          style={[styles.subView,
          { transform: [{ translateX: this.state.bounceValue }] }]}
        >
          {this.renderSettings()}
        </Animated.View>
      </Container>
    );
  }

  renderSettings() {

    var pjson = require('../../package.json');
    return (
      <Content style={{ flex: 1 }}
        contentContainerStyle={iStyle.sideBarContainer}
        scrollEnabled={false}>
        <Item style={[iStyle.no_border, { top: 20, width: '100%', position: 'absolute' }]} >
          <Image onPress={() => { this._toggleSubview() }} style={[Device.select({
            phone: { height: 24, width: 24 },
            tablet: { height: 20, width: 20 }
          }), { left: 0, position: 'absolute' }]} source={require('../assets/img/backtologin.png')} />
          <Text onPress={() => { this._toggleSubview() }} style={[styles.loginText, { color: 'rgb(0,122,255)', left: 25, position: 'absolute' }]}>Back</Text>
          <Text style={[styles.loginText,{color:ColorConfig.WHITE}]}>Setting</Text>
          <Text onPress={() => { this.saveHostStorage() }} style={[styles.loginText, { color: 'rgb(0,122,255)', right: 0, position: 'absolute' }]}>Save</Text>
        </Item>
        <Image style={iStyle.logo} source={require('../assets/img/logo.png')} />
        <Form style={styles.loginForm}>
          <Item style={[iStyle.no_border]} >
              <Text style={[styles.loginText]}>Version : {pjson.version}</Text>
            </Item>
          <Item regular style={[iStyle.no_border, iStyle.itemStyle,iStyle.firstItem]}>
            <Image style={[iStyle.icon]} source={require('../assets/img/ipAddress.png')} />
             <Item style={[iStyle.no_border, styles.line]} >
              </Item>
            <Input
              placeholder='Server IP Address'
              style={[styles.form_control_input, styles.loginText]}
              autoCapitalize='none'
              onChangeText={(host) => this.setState({ host })}
              value={this.state.host} />
          </Item>
          <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
            <Image style={[iStyle.icon]} source={require('../assets/img/port.png')} />
             <Item style={[iStyle.no_border, styles.line]} >
              </Item>
            <Input
              placeholder='Server Port'
              style={[styles.form_control_input, styles.loginText]}
              autoCapitalize='none' keyboardType='numeric'
              onChangeText={(port) => this.setState({ port })}
              value={this.state.port} />
          </Item>
          <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
            <Image style={[iStyle.icon]} source={require('../assets/img/threshold.png')} />
            <Item style={[iStyle.no_border, styles.line]} >
              </Item>
            <Input
              placeholder='recognition Threshold'
              style={[styles.form_control_input, styles.loginText]}
              autoCapitalize='none' keyboardType='numeric'
              onChangeText={(threshold) => {
                if (threshold<=100) this.setState({ threshold })
              } }
              value={this.state.threshold} />
          </Item>
          <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
            <Image style={[iStyle.icon]} source={require('../assets/img/threshold.png')} />
            <Item style={[iStyle.no_border, styles.line]} >
            </Item>
            
            <Picker selectedValue={this.state.mode} style={[{  color: ColorConfig.WHITE,height: 50 },
            Device.select({
              phone: { width: '80%' }, tablet: { width:250} }) ] } onValueChange={(itemValue, itemIndex) => {
            this.setState({ mode: itemValue });

            }}>
                <Picker.Item label="auto" value="auto"/>
                <Picker.Item label="manual" value="manual"/>
              </Picker>
            </Item>
        </Form>
      </Content>
    )
  }

  // Settings Page Slide In Slide Out
  _toggleSubview() {

    var toValue = this.state.viewWidth;

    if (this.state.isSettingsHidden) {
      toValue = 0;
    }
    //This will animate the transalteY of the subview between 0 & 100 depending on its current state
    //100 comes from the style below, which is the height of the subview.
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: toValue,
        velocity: 0.2,
        tension: 0,
        friction: 8,
      }
    ).start();

    this.setState({
      isSettingsHidden: !this.state.isSettingsHidden
    });
  }

  nextPage() {
    //this.props.navigation.navigate('startPage');
    if (this.state.mode=="auto")
      this.props.navigation.navigate('autofaceVerify');
   else
      this.props.navigation.navigate('manualFaceVerify');
  }

  setLoading(flag) {
    this.setState({
      loading: flag
    });
  }
 
}



const styles = StyleSheet.create({
  baseContainer: {
    backgroundColor: ColorConfig.MAIN_BACKGROUND
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: ColorConfig.MAIN_BACKGROUND,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  loginForm: {
    width: '70%',
  },
  regularInput: {
    backgroundColor: ColorConfig.GRAY_INPUT_BACKGROUND,
    borderColor: ColorConfig.GRAY_INPUT_BACKGROUND,
    borderRadius: 5,
    // marginBottom: 10
  },
  form_control_input: {
    color: ColorConfig.MAIN_FONT,
    textAlign: 'left',
  },
  loginText: {
    ...Device.select({
      phone: { fontSize: 19, },
      tablet: { fontSize: 15,}
    }),
    color: ColorConfig.MAIN_TEXT_COLOR
  },
  checkBoxText:{
    ...Device.select({
      phone: { fontSize: 14, },
      tablet: { fontSize: 13,}
    }),
    color: ColorConfig.MAIN_TEXT_COLOR
  },
  loginButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0,
    height: '25%',
    // backgroundColor: 'red'
  },
  btn_login_container: {
    backgroundColor: ColorConfig.MAIN_ERROR,
    borderColor: ColorConfig.TRANSPARENT,
    width: 150,
    height: '100%'
    // width: 150,
    // height: 150
  },
  btn_login: {
    backgroundColor: ColorConfig.MAIN_MUDIUM,
    borderColor: ColorConfig.MAIN_MUDIUM,
    borderWidth: 0,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButton: {
    position: "absolute",
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: ColorConfig.MAIN_DEEP,
    borderRadius: 5,
    right: 10,
    bottom: 0,
  },
  line:{
    backgroundColor: ColorConfig.MAIN_TEXT_COLOR, 
    height: '40%', 
    width: 1 ,
    ...Device.select({
      phone: { marginLeft: 7 },
      tablet: { marginLeft: 7 }
    })
  },
  settingButtonImg: {
    borderWidth: 0,
    marginBottom: 15,
  },
  footer: {
    borderWidth: 0,
    justifyContent: 'flex-end',
    backgroundColor: ColorConfig.MAIN_BACKGROUND,

  },
  footerText: {
    color: ColorConfig.MAIN_FONT_BLACK,
    fontSize: 16
  },
  subView: {
    position: "absolute",
    right: 0,
    width: '100%',
    backgroundColor: "#FFFFFF",
    height: '100%',
  },
  versionText: {
    position: 'absolute',
    bottom: 10,
    color: ColorConfig.MAIN_DEEP,
    right: 10
  }
});
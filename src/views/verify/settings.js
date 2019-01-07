import React from 'react';

import { StatusBar, Image, StyleSheet, Switch, View } from 'react-native';
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

export class Settings extends React.Component {
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
            isAutoCapture: false
        };
    }

    componentDidMount() {
        this.getLoginConfig();
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
            contentContainerStyle={iStyle.sideBarContainer}
            scrollEnabled={false}>
            <Item style={[iStyle.no_border, { top: 20, width: '100%', position: 'absolute' }]} >
              <Image onPress={() => { this.props.navigation.state.params.callBackData(); this.props.navigation.goBack(); }} style={[Device.select({
                phone: { height: 24, width: 24 },
                tablet: { height: 20, width: 20 }
              }), { left: 0, position: 'absolute' }]} source={require('../../assets/img/backtologin.png')} />
              <Text onPress={() => { this.props.navigation.state.params.callBackData(); this.props.navigation.goBack();}} style={[iStyle.loginText, { color: 'rgb(0,122,255)', left: 25, position: 'absolute' }]}>Back</Text>
              <Text style={[iStyle.loginText,{color:ColorConfig.WHITE}]}>Setting</Text>
              <Text onPress={() => { this.save() }} style={[iStyle.loginText, { color: 'rgb(0,122,255)', right: 0, position: 'absolute' }]}>Save</Text>
            </Item>
            <Image style={iStyle.logo} source={require('../../assets/img/logo.png')} />
            <Form style={styles.loginForm}>
              <Item style={[iStyle.no_border]} >
                  <Text style={[iStyle.loginText]}>Version : {pjson.version}</Text>
                </Item>
              <Item regular style={[iStyle.no_border, iStyle.itemStyle,iStyle.firstItem]}>
                <Image style={[iStyle.icon]} source={require('../../assets/img/ipAddress.png')} />
                 <Item style={[iStyle.no_border, styles.line]} >
                  </Item>
                <Input
                  placeholder='Server IP Address'
                  style={[styles.form_control_input, iStyle.loginText]}
                  autoCapitalize='none'
                  editable={false}
                  value={this.state.host}  />
              </Item>
              <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
                <Image style={[iStyle.icon]} source={require('../../assets/img/port.png')} />
                 <Item style={[iStyle.no_border, styles.line]} >
                  </Item>
                <Input
                  placeholder='Server Port'
                  style={[styles.form_control_input, iStyle.loginText]}
                  autoCapitalize='none'
                  editable={false}
                  value={this.state.port} />
              </Item>
              <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
                <Image style={[iStyle.icon]} source={require('../../assets/img/threshold.png')} />
                <Item style={[iStyle.no_border, styles.line]} >
                  </Item>
                <Input
                  placeholder='recognition Threshold'
                  style={[styles.form_control_input, iStyle.loginText]}
                  autoCapitalize='none'
                  onChangeText={(threshold) => this.setState({ threshold })}
                  value={this.state.threshold} />
              </Item>
            </Form>
          </Content>
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
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginForm: {
        // backgroundColor: 'white',
        width: '90%',
        borderRadius: 5,
        padding: 15
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
  
    sideBarContainer: {
        flex: 1,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15
    },
    footerText: {
        color: ColorConfig.MAIN_FONT_BLACK,
        fontSize: 16
    },
    info_content: {
        color: ColorConfig.WHITE,
        fontSize: 24,
        textAlign: 'center'
    }
});
import React from 'react';

import { StatusBar, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../config/color.config ';

import iStyle from '../style/main-style';
import autobind from 'class-autobind';
import Device from '../components/react-native-device-detection-val';


export class Start extends React.Component{

    constructor(props) {
        super(props);
        autobind(this);

    }

    render() {
        return (
            <Container style={styles.baseContainer}>
                <Content style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    scrollEnabled={false}>
                    <Item regular style={[iStyle.no_border, styles.loginForm]}>
                        <Text onPress={() => { this.goVerify() }}
                        style={[iStyle.loginText]}>Click to Start</Text>
                    </Item>
                    {/* <TouchableOpacity style={styles.btn_login_container}
                        onPress={this.goVerify}>
                        <Image style={styles.btn_login} source={require('../assets/img/btn_click_start.png')} />
                    </TouchableOpacity> */}
                </Content>
            </Container>
        );
    }

    goVerify() {
        this.props.navigation.navigate('manualFaceVerify');
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
        backgroundColor: 'rgb(57,125,246)',
        width: '85%',
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
        marginBottom: 15
    },
    loginText: {
        ...Device.select({
          phone: { fontSize: 19, },
          tablet: { fontSize: 8 ,}
        }),
        color:ColorConfig.WHITE
    },
    loginButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 0
    },
    btn_login_container: {
        backgroundColor: ColorConfig.TRANSPARENT,
        borderColor: ColorConfig.TRANSPARENT,
        width: 180,
        height: 180,
        justifyContent: 'center',
    },
    btn_login: {
        width: '100%',
        resizeMode: 'contain'
    },
});
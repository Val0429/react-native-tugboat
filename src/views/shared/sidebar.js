import React from 'react';

import { TouchableOpacity, Image, View } from 'react-native';
import {
    Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab,

} from 'native-base';
import iStyle from '../../style/main-style';
// import ColorConfig from '../../config/color.config ';


export class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ip: '',
            port: '',
            account: '',
            password: '',
            loading: false
        };
    }

    render() {
        return (
            <Content >
                <TouchableOpacity style={iStyle.sideBar_menu} onPress={() => { this.toggleSideBar() }}>
                    <Image style={iStyle.sideBar_menu_img} source={require('../../assets/img/btn_menu_bar.png')} />
                </TouchableOpacity>
                <View>
                    <TouchableOpacity style={iStyle.sideBar_menu_item} onPress={() => { this.PressFaceEnroll() }}>
                        <View style={iStyle.sideBar_menu_item_icon_container}>
                            <Image style={iStyle.sideBar_menu_item_icon} source={require('../../assets/img/enrollFace.png')} />
                        </View>
                        <Text style={iStyle.sideBar_menu_item_text}> Enroll Face</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={iStyle.sideBar_menu_item} onPress={ () => {this.PressSettings()}}>
                        <View style={iStyle.sideBar_menu_item_icon_container}>
                            <Image style={iStyle.sideBar_menu_item_icon} source={require('../../assets/img/icon_gear.png')} />
                        </View>
                        <Text style={iStyle.sideBar_menu_item_text}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={iStyle.sideBar_menu_item} onPress={ () => {this.PressLogout()}}>
                        <View style={iStyle.sideBar_menu_item_icon_container}>
                            <Image style={iStyle.sideBar_menu_item_icon} source={require('../../assets/img/icon_logout.png')} />
                        </View>
                        <Text style={iStyle.sideBar_menu_item_text}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Content>
        );
    }

    toggleSideBar(){
        this.props.toggleSideBar();
    }

    PressLogout() {
        this.props.pressLogout();
    }

    PressSettings() {
        this.props.pressSettings();
    }

    PressFaceEnroll() {
        this.props.pressFaceEnroll();
    }
}

module.exports = Sidebar;
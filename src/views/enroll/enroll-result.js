import React from 'react';

import { StatusBar, StyleSheet, TouchableHighlight, Animated, AppRegistry, ScrollView, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';

import AlertHelper from '../../helpers/alert.helper';

import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import ApiService from '../../service/api.service';



export class EnrollResult extends React.Component {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            enrollImage: this.props.navigation.state.params.enrollImage,
            UserDetail: this.props.navigation.state.params.UserDetail
        };
    }

    render() {
        return (
            <Container style={iStyle.baseContainer}>

                <Item regular style={iStyle.header}>
                    <View style={iStyle.header_icon_container}>
                        <Image style={iStyle.header_icon} source={require('../../assets/img/enrollFaceHeadLogo.png')} />
                    </View>
                    <Text style={iStyle.header_title}>Enroll Face</Text>
                </Item>
                <ScrollView>
                    <Content style={{ flex: 1 }}
                        contentContainerStyle={iStyle.scrollContainer}
                        scrollEnabled={false}>

                        <View style={styles.headshot_container}>
                            <Image style={styles.headshot} source={{ uri: `data:image/png;base64,${this.state.enrollImage}` }} />
                        </View>

                        <Text style={styles.nameText}>{this.state.UserDetail.completeName}</Text>
                        <Text style={styles.idNoText}>{this.state.UserDetail.uid}</Text>
                        {/* <Text style={styles.groupNameText}>{this.state.UserDetail.groupName}</Text> */}
                        <Image style={iStyle.hr} source={require('../../assets/img/underLine.png')} />
                        
                        <View style={styles.btn_container}>
                            <Image style={styles.btn_img} source={require('../../assets/img/check.png')} />
                        </View>
                       
                        <Text style={styles.idNoText}>Successfully enrolled</Text>

                        <TouchableOpacity style={styles.btn_container}
                            onPress={this.goBack}>
                            <Image style={styles.btn_img} source={require('../../assets/img/Back.png')} />
                        </TouchableOpacity>
                    </Content>
                </ScrollView>
            </Container>
        );
    }

    goBack() {
        this.props.navigation.navigate('faceVerify');
    }

    save() {
        this.goSuccess();
    }

    goSuccess() {
        this.props.navigation.navigate('enrollResult', {
            enrollImage: this.state.enrollImage,
            UserDetail: this.state.UserDetail
        });
    }

    goError() {
        this.props.navigation.navigate('errorResult', {
            enrollImage: this.state.enrollImage,
            UserDetail: this.state.UserDetail
        });
    }
}

const styles = StyleSheet.create({
    header_icon_container: {
        width: 18,
        height: 30,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    nameText: {
        color: ColorConfig.MAIN_LIGHT,
        fontSize: 35,
        textAlign: 'center'
    },
    idNoText: {
        color: ColorConfig.MAIN_MUDIUM,
        fontSize: 25,
        marginBottom: 10,
        textAlign: 'center'
    },
    groupNameText: {
        color: ColorConfig.MAIN_DEEP,
        fontSize: 25,
        marginBottom: 10,
        textAlign: 'center'
    },
    info_title: {
        color: ColorConfig.MAIN_MUDIUM,
        fontSize: 18
    },
    info_content: {
        color: ColorConfig.MAIN_FONT,
        fontSize: 24,
        textAlign: 'center'
    },
    headshot_container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 200,
        borderWidth: 2,
        borderColor: ColorConfig.MAIN_MUDIUM,
        borderRadius: 5,
        marginBottom: 15,
        padding: 5
    },
    headshot: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 5
    },
    btn_container: {
        backgroundColor: ColorConfig.TRANSPARENT,
        borderColor: ColorConfig.TRANSPARENT,
        width: 150,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btn_img: {
        width: '100%',
        resizeMode: 'contain'
    },
    loginButtonContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 0
    }
});

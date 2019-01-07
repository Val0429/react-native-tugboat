import React from 'react';

import { StatusBar, StyleSheet, TouchableHighlight, Animated, AppRegistry, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';

import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import AlertHelper from '../../helpers/alert.helper';



export class ErrorResult extends React.Component {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            enrollImage: this.props.navigation.state.params.enrollImage,
            UserDetail: this.props.navigation.state.params.UserDetail
        };

    }

    componentDidMount() {
        // AlertHelper.alertError(this.state.scanImg);
    }

    render() {
        return (
            <Container style={iStyle.baseContainer}>
                <Content style={{ flex: 1 }}
                    contentContainerStyle={iStyle.scrollContainer}
                    scrollEnabled={false}>
                    <View style={styles.headshot_container}>
                        <Image style={styles.headshot} source={{ uri: `data:image/png;base64,${this.state.enrollImage}` }} />
                    </View>
                    <Text style={styles.nameText}>{this.state.UserDetail.completeName}</Text>
                    <Text style={styles.idNoText}>{this.state.UserDetail.uid}</Text>
                    <View style={styles.icon_container}>
                        <Image style={styles.btn_img} source={require('../../assets/img/enrolFailed.png')} />
                    </View>

                    <Text style={styles.errorText}>Enroll Failed</Text>

                    <TouchableOpacity style={styles.btn_container}
                        onPress={this.retry}>
                        <Image style={styles.btn_img} source={require('../../assets/img/btn_retry.png')} />
                    </TouchableOpacity>
                </Content>
            </Container>
        );
    }

    retry() {
        this.props.navigation.navigate('information',{
            UserDetail:this.state.UserDetail
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
        color: ColorConfig.WHITE,
        fontSize: 35,
        textAlign: 'center'
    },
    idNoText: {
        color: ColorConfig.GRAY_NOTE,
        fontSize: 25,
        marginBottom: 10,
        textAlign: 'center'
    },
    errorText: {
        color: ColorConfig.MAIN_ERROR,
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
        borderColor: ColorConfig.MAIN_ERROR,
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
    icon_container: {
        backgroundColor: ColorConfig.TRANSPARENT,
        borderColor: ColorConfig.TRANSPARENT,
        width: 80,
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

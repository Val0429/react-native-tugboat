import React from 'react';

import { StatusBar, StyleSheet, TouchableHighlight, Animated, AppRegistry, ScrollView, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';

import AlertHelper from '../../helpers/alert.helper';

import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import ApiService from '../../service/api.service'
import UserService from '../../service/user.service'

export class VerifyResult extends React.Component {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            UserDetail: this.props.navigation.state.params.profile
        };
    }
    componentDidMount() {
        // this.getUserDetail();
    }


    render() {
        return (
            <Container style={iStyle.baseContainer}>

                <TouchableOpacity style={iStyle.header} onPress={this.goBack}>
                    <View style={styles.header_icon_container}>
                        <Image style={iStyle.header_icon} source={require('../../assets/img/icon_back.png')} />
                    </View>
                    <Text style={iStyle.header_title}>Back</Text>
                </TouchableOpacity>
                <ScrollView>
                    <Content style={{ flex: 1 }}
                        contentContainerStyle={iStyle.scrollContainer}
                        scrollEnabled={false}>
                        <View style={styles.headshot_container}>
                            <Image style={styles.headshot} source={{ uri: `${ApiService.serverUrl}/frs/cgi/snapshot/session_id=${UserService.sessionId}&image=${this.state.UserDetail.imgUrl}` }} />
                        </View>
                        <Text style={styles.nameText}>{this.state.UserDetail.name}</Text>
                        <Text style={styles.idNoText}>{this.state.UserDetail.uid}</Text>



                        <Text style={styles.groupNameText}>{this.state.UserDetail.groupName}</Text>
                        <Image style={iStyle.hr} source={require('../../assets/img/underLine.png')} />

                        {this.state.UserDetail.employeeno ?
                            <View>
                                <Text style={styles.info_title}>Employee Number</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.employeeno || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.school ?
                            <View>
                                <Text style={styles.info_title}>School</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.school || '-'}</Text>
                            </View>
                            : null}


                        {this.state.UserDetail.campus ?
                            <View>
                                <Text style={styles.info_title}>Campus</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.campus || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.programDesc ?
                            <View>
                                <Text style={styles.info_title}>Program Desc</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.programDesc || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.admitTerm ?
                            <View>
                                <Text style={styles.info_title}>ADMIT_TERM</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.admitTerm || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.acadProg ?
                            <View>
                                <Text style={styles.info_title}>ACAD_PROG</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.acadProg || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.progStatus ?
                            <View>
                                <Text style={styles.info_title}>PROG_STATUS</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.progStatus || '-'}</Text>
                            </View>
                            : null}


                        {this.state.UserDetail.department ?
                            <View>
                                <Text style={styles.info_title}>Company</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.department || '-'}</Text>
                            </View>
                            : null}

                    </Content>
                </ScrollView>
            </Container>
        );
    }

    goBack() {
        this.props.navigation.goBack();
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
});

import React from 'react';

import { StatusBar, StyleSheet, TouchableHighlight, Animated, AppRegistry, ScrollView, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';

import AlertHelper from '../../helpers/alert.helper';
import ApiService from '../../service/api.service';

import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import UserService from '../../service/user.service';


export class Confirm extends React.Component {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            loading: false,
            faceId: '',
            enrollImage: this.props.navigation.state.params.enrollImage,
            UserDetail: this.props.navigation.state.params.enrollInformation
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

                        {this.state.UserDetail.contactNumber ?
                            <View>
                                <Text style={styles.info_title}>Contact Number</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.contactNumber || '-'}</Text>
                            </View>
                            : null}

                        {this.state.UserDetail.department ?
                            <View>
                                <Text style={styles.info_title}>Company</Text>
                                <Text style={styles.info_content}>{this.state.UserDetail.department || '-'}</Text>
                            </View>
                            : null}

                        {this.state.loading &&
                            <Item regular style={iStyle.footer}>
                                {this.state.loading && <Spinner color={ColorConfig.MAIN_FONT} />}
                            </Item>
                        }

                        {!this.state.loading &&
                            <Item style={styles.loginButtonContainer}>

                                <Button style={iStyle.btn_deep} onPress={this.goBack}>
                                    <Text>Previous</Text>
                                </Button>
                                <Button style={iStyle.btn_primary} onPress={this.save}>
                                    <Text>Submit</Text>
                                </Button>
                            </Item>
                        }
                    </Content>
                </ScrollView>
            </Container>
        );
    }

    goBack() {
        this.props.navigation.goBack();
    }

    save() {

        this.setState({
            loading: true
        });

        UserService.maintainSession()
            .do(() => {
                ApiService.createperson({
                    image: this.state.enrollImage,
                    name: this.state.UserDetail.uid,
                    person_info: {
                        "fullname": this.state.UserDetail.completeName,
                        "department": this.state.UserDetail.department,
                        "contactNumber": this.state.UserDetail.contactNumber,
                        "employeeno": this.state.UserDetail.uid
                    }
                })
                    .switchMap(res => res.json())
                    .map(data => {

                        console.log('Create Person Console : ' + JSON.stringify(data));

                        if (!data.message || !data.message.includes('ok')) {
                            console.log('Create Person Console : Create Person Failed');
                            return false;
                        }
                        return true;
                    })
                    .do(flag => {
                        if (flag) {
                            this.setState({
                                loading: false
                            });
                            this.goSuccess()
                        } else {
                            this.goError();
                            this.setState({
                                loading: false
                            });
                        }
                    })
                    .toPromise()
                    .catch(error =>{
                        this.setState({
                            loading: false
                        });
                        console.log('Enroll Face Error : ',error);
                        AlertHelper.alertError('Please check your internet connection.');
                    })

            })
            .toPromise()
            .catch(error => {
                this.setState({
                    loading: false
                });
                console.log('Enroll Face Maintain Session Error : ',error);
                AlertHelper.alertError('Please check your internet connection.');
            });
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

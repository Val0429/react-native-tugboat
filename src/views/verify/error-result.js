import React from 'react';

import { StatusBar, StyleSheet, TouchableHighlight, Animated, AppRegistry, Dimensions, Switch, View, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Container, Content, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';

import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import AlertHelper from '../../helpers/alert.helper';
// import { VideoView } from 'isap-face-verify';



export class ErrorResult extends React.Component {

    constructor(props) {
        super(props);
        autobind(this);

        this.state = {
            scanImg: this.props.navigation.state.params.scanImg
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
                        <Image style={styles.headshot}  source={{ uri: `data:image/png;base64,${this.state.scanImg}` }} />
                    </View>
                    <Text style={styles.errorText}>No Match Found</Text>
                    <TouchableOpacity style={styles.btn_container}
                        onPress={this.retry}>
                        <Image style={styles.btn_img} source={require('../../assets/img/btn_retry.png')} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.btn_container}>
                        <Image style={styles.btn_img} source={require('../../assets/img/btn_report.png')} />
                    </TouchableOpacity> */}
                </Content>
            </Container>
        );
    }

    retry() {
        this.props.navigation.goBack();
    }
}

const styles = StyleSheet.create({
    errorText:{
        color:ColorConfig.MAIN_ERROR,
        fontSize:24
    },
    headshot_container: {
        justifyContent: 'center',
        alignItems: 'center',
        width:150,
        height:200,
        borderWidth:2,
        borderColor:ColorConfig.MAIN_ERROR,
        borderRadius:5,
        marginBottom:15,
        padding:5
    },
    headshot: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
        borderRadius:5
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

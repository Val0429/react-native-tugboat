import React from 'react';

import { StatusBar, TouchableOpacity, ScrollView, Image, StyleSheet, Switch, View } from 'react-native';
import { Button, Text, Container, Content, Radio, ListItem, Form, Item, Input, Icon, Left, Body, Right, Label, Header, Title, Spinner, Footer, FooterTab } from 'native-base';
import ColorConfig from '../../config/color.config ';
import iStyle from '../../style/main-style';
import autobind from 'class-autobind';
import AlertHelper from '../../helpers/alert.helper';
import StringHelper from '../../helpers/string.helper';
import { ConfigKeys } from '../../domain/storage';
import SettingsService from '../../service/settings.service';
import OTPHelper from '../../helpers/otp.helper';
import Device from '../../components/react-native-device-detection-val';
import UserService from '../../service/user.service';
import ApiService from '../../service/api.service';
import CheckBox from 'react-native-check-box'

export class Information extends React.Component {
    uuid = OTPHelper.otpCode();
    tmpGroupList=[];
    encodedData='';
    constructor(props) {
        super(props);
        autobind(this);

        otp = OTPHelper.otpCode();
        const params = this.props.navigation.state.params;
        if (params) {
            this.encodedData = params.encodedData2 ? params.encodedData2 : '',
            this.state = {
                finished : false,
                uid: this.uuid,
                name: params.name ? params.name : '',
                department: params.department ? params.department : '',
                contactNumber: params.contactNumber ? params.contactNumber : '',
                encodedData :  params.encodedData ? params.encodedData : '',
                return : '',
                getgrouplist: [],
                tmpGroupList:[],
                uidata: params.uidata ? params.uidata : '',
               
            };
        } else {
            this.state = {
                finished : false,
                uid: this.uuid,
                name: '',
                department: '',
                contactNumber: '',
                encodedData : '',
                return : '',
                getgrouplist: [],
                tmpGroupList:[],
                uidata : ''
                // group: 'Register',
            };
        }
      


    }

    componentDidMount() {
        if (this.props.navigation.state.params)
        {
            this.state.uid= this.props.navigation.state.params.uid,
            this.state.name= this.props.navigation.state.params.name,
            this.state.department= this.props.navigation.state.params.department,
            this.state.contactNumber=  this.props.navigation.state.params.contactNumber,
            this.state.groupName= this.props.navigation.state.params.group
        }
        this.callGrouplistApi();
    
        // var tmp  = [
        //     {
        //         "name": "vip2",
        //         "group_info": {
        //             "actions": [],
        //         },
        //         "group_id": "5ad6f2d91cd2a813bd2b3730"
        //     },
        //     {
        //         "name": "vip1",
        //         "group_info": {
        //             "actions": [],
        //         },
        //         "group_id": "5ad6f2d91cd2a813bd2b3732"
        //     }
        // ];
        // this.setState({ 
        //     getgrouplist :tmp
        // });
           
    }
    callGrouplistApi()
    {
         ApiService.getGroupList(
        ).do((groupList) => {
            console.log('getgrouplist1',groupList);
            this.setState({ 
                getgrouplist :groupList
            });
           // return groupList ;
        }).toPromise()
            .catch(error => {
             console.log('')
            });
    }
    render() {
        return (
            
            <Container style={styles.baseContainer}>
                {this.state.finished &&
                    <View style={[styles.pic_viewer]}>
                        {this.state.return=='sucess' &&  <View style={[styles.slide, { flex: 1 }]}>
                                <Item regular style={[iStyle.no_border, styles.returnItem]}>
                                    <Text style={[iStyle.header_title, styles.returnText]}>Enrollment Success</Text>
                                </Item>
                                <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                    <Text style={[iStyle.header_title, styles.returnSmallText, { backgroundColor: 'rgba (255, 255 ,255, 0.5)' }]}>
                                        Your add were finish, please check this action.
                                    </Text>
                                </Item>
                                <Item regular style={[styles.slide, iStyle.no_border, Device.select({
                                    phone: { height: 220, },
                                    tablet: { height: 120, }
                                })]}>
                                    <View style={[styles.slide, { height: '100%', width: '100%' ,top:20}]}>
                                        <View style={[iStyle.bigCircle, { backgroundColor: ColorConfig.MAIN_SUCESS }]}>
                                            <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.uidata}` }} />
                                        </View>

                                        <View style={[styles.smallCircle,
                                            , { backgroundColor: ColorConfig.MAIN_SUCESS ,  top: 10,
                                                right: '25%',}]}>
                                            <Image style={styles.cancel} source={require('../../assets/img/checked.png')} />
                                        </View>
                                    </View>
                                </Item>
                                <Item regular style={[iStyle.no_border, styles.returnItem]}>
                                    <Text style={[iStyle.header_title, styles.returnText]}>{this.state.name}</Text>
                                </Item>
                                <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                                    <Text style={[iStyle.header_title, styles.returnSmallText, { backgroundColor: 'rgba (255, 255 ,255, 0.5)' }]}>UID:{this.uuid}</Text>
                                </Item>

                                <TouchableOpacity onPress={() => { this.retryScan() }}>
                                    <Item onPress={() => { this.retryScan() }} regular style={[styles.slide, iStyle.no_border, iStyle.btn_login, { backgroundColor: ColorConfig.MAIN_SUCESS, }]}>
                                        <Text style={[iStyle.loginText, { color: 'white' }]}>Done</Text>
                                    </Item>
                                </TouchableOpacity>
                            </View>
                        }
                {this.state.return=='error' &&
                    <View style={[styles.slide, { flex: 1 }]}>
                        <Item regular style={[iStyle.no_border, styles.returnItem]}>
                            <Text style={[iStyle.header_title, styles.returnText]}>Enrollment Failed</Text>
                        </Item>
                        <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                            <Text style={[iStyle.header_title, styles.returnSmallText, { backgroundColor: 'rgba (255, 255 ,255, 0.5)' }]}>
                                Wrong reason, please try again.
                            </Text>
                        </Item>
                        <Item regular style={[styles.slide, iStyle.no_border, Device.select({
                            phone: { height: 220, },
                            tablet: { height: 120, }
                        })]}>
                 <View style={[styles.slide ,Device.select({
                        phone: {
                            height: '100%', width: '100%' ,top:20
                        },
                        tablet: {
                            height: 270,
                            width: 270,
                            top:20
                        }
                    })]}>
                     <View style={[iStyle.bigCircle, { backgroundColor: ColorConfig.MAIN_ERROR }]}>
                         <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.uidata}` }} />
                     </View>

                     <View style={[styles.smallCircle,
                         , { backgroundColor: ColorConfig.MAIN_ERROR ,  top: 10,
                             right: '25%',}]}>
                         <Image style={[styles.cancel,{backgroundColor:ColorConfig.MAIN_ERROR}]} source={require('../../assets/img/cancel.png')} />
                     </View>
                 </View>
             </Item>
             <Item regular style={[iStyle.no_border, styles.returnItem]}>
                 <Text style={[iStyle.header_title, styles.returnText]}>{this.state.name}</Text>
             </Item>
             <Item regular style={[styles.slide, iStyle.no_border, styles.returnSmallItem]}>
                 <Text style={[iStyle.header_title, styles.returnSmallText, { backgroundColor: 'rgba (255, 255 ,255, 0.5)' }]}>UID:{this.uid}</Text>
             </Item>

             <TouchableOpacity onPress={() => { this.retryScan() }}>
                 <Item onPress={() => { this.retryScan() }} regular style={[styles.slide, iStyle.no_border, iStyle.btn_login, { backgroundColor: ColorConfig.MAIN_ERROR, }]}>
                     <Text style={[iStyle.loginText, { color: 'white' }]}>Retry</Text>
                 </Item>
             </TouchableOpacity>
                </View>
                    }
                    </View>
                        
                }


                <Item onPress={ this.backtoHome } regular style={iStyle.header}>
                    <Image style={[iStyle.backIcon]} source={require('../../assets/img/backtologin.png')}/>
                        <Text style={[iStyle.loginText, { color: 'rgb(0,122,255)', left: 25, position: 'absolute' }]}>Back</Text>
                    <Content style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} scrollEnabled={false}>
                        <Text style={[iStyle.header_title]}>Add New Person Info</Text>
                    </Content>
                   
                </Item>
                <ScrollView>
                    <Content style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContainer}
                        scrollEnabled={false}>
                        <Item onPress={this.addScreenShot }  style={[iStyle.no_border]} >
                            {this.state.uidata=='' && 
                                <View style={[iStyle.bigCircle]}>
                                    <Image style={iStyle.screenshot} source={require('../../assets/img/mobileBtnUploadProfilePic.png')} />                         
                                </View>
                            } 
                            {this.state.uidata!='' && 
                               <View style={[styles.slide]}>
                                    <View style={[iStyle.bigCircle]}>
                                        <Image style={iStyle.screenshot} source={{ uri: `data:image/png;base64,${this.state.uidata}` }} />                        
                                    </View>
                                <View style={[styles.smallCircle,, { backgroundColor: 'rgb(57,125,246)' }]}>
                                    <Image style={styles.cancel} source={require('../../assets/img/edit.png')} />
                                </View>
                            </View>
                            }  
                        </Item>
                      
                        <Form style={[styles.loginForm]}>
                            <Item regular style={[iStyle.no_border, iStyle.itemStyle,{marginTop:0}]}>
                                <Image style={[iStyle.icon]} source={require('../../assets/img/uid.png')} />
                                    <Item style={[iStyle.no_border, styles.line]}></Item>
                            <Input
                                placeholder='UID'
                                style={[styles.form_control_input, iStyle.loginText]}
                                autoCapitalize='none'
                                editable={false}
                                value={this.uuid} />
                            </Item>
                            <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
                                <Image style={[iStyle.icon]} source={require('../../assets/img/user.png')} />
                                    <Item style={[iStyle.no_border, styles.line]} >
                                </Item>
                            <Input
                                placeholder='Name'
                                style={[styles.form_control_input, iStyle.loginText]}
                                autoCapitalize='none'
                                onChangeText={(name) => this.setState({ name })}
                                value={this.state.name} />
                            </Item>
                            <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
                                <Image style={[iStyle.icon]} source={require('../../assets/img/dpm.png')} />
                                    <Item style={[iStyle.no_border, styles.line]} >
                                    </Item>
                            <Input
                                placeholder='Department'
                                style={[styles.form_control_input, iStyle.loginText]}
                                autoCapitalize='none'
                                onChangeText={(department) => this.setState({ department })}
                                value={this.state.department} />
                            </Item>
                            <Item regular style={[iStyle.no_border, iStyle.itemStyle]}>
                                <Image style={[iStyle.icon]} source={require('../../assets/img/contact.png')} />
                                    <Item style={[iStyle.no_border, styles.line]} >
                                    </Item>
                            <Input
                                placeholder='Contact Number'
                                style={[styles.form_control_input, iStyle.loginText]}
                                autoCapitalize='none'
                                keyboardType='phone-pad'
                                onChangeText={(contactNumber) => this.setState({ contactNumber })}
                                value={this.state.contactNumber} />
                            </Item>
                                <ScrollView horizontal={true} contentContainerStyle={[ styles.group,iStyle.no_border]} >
                                    { this.state.getgrouplist.map((_data )=>  
                                        <TouchableOpacity onPress={ ()=>{ this.changeGroup(_data)} } style={[(this.state.tmpGroupList.indexOf(_data)>-1) ? styles.groupBtnChange : styles.groupBtn  ]}   >
                                           <Text style={[iStyle.loginText, (this.state.tmpGroupList.indexOf(_data)>-1 )? {color:ColorConfig.WHITE} : {color:'rgb(79,91,114)'} ]}>{_data.name}</Text>
                                       </TouchableOpacity>     
                                    )}
                                       
                                </ScrollView>
                            <Item regular style={[ styles.addBtn]} onPress={() => { this.save() }}  >
                                <Text onPress={() => { this.save() }} style={[iStyle.loginText,{color:'rgb(57,125,246)'}]}>Add New Person</Text>
                            </Item>
                        </Form>
                    </Content>
                </ScrollView>
            
            </Container>

        );
    }
    changeGroup(_data)
    {
        var _index =this.tmpGroupList.indexOf(_data)
        if (_index>-1){
            this.tmpGroupList.splice(_index,1);

        }
        else{
            this.tmpGroupList.push(_data);
        }
        this.setState({
            tmpGroupList:this.tmpGroupList
        });
    }
    getIdList()
    {
        var tmp =[];
        for ( i =0 ; i<=this.tmpGroupList.length-1;i++)
        {
          
            tmp.push(this.tmpGroupList[i].group_id);
          
        }
        return tmp;
    }
    renderItemList() {

        const items = [];
        const itemList = ['Register', 'VIP', 'Blacklist'];

        itemList.forEach(item => {
            items.push(
                <TouchableOpacity key={item} style={(this.state.group == item) ? styles.radioButtonActive : styles.radioButton}
                    onPress={() => {
                        this.setState({
                            group: item
                        })
                    }}
                >
                    <Text style={(this.state.group == item) ? styles.radioButtonTextActive : styles.radioButtonText}>{item}</Text>
                </TouchableOpacity>
            );
        });

        return items;
    }

    cancel() {
        this.props.navigation.navigate('faceVerify');
    }
    retryScan()
    {
        const otp = OTPHelper.otpCode();
        this.uuid= otp;
        this.setState({
            finished : false,
            uid: otp,
            name: '',
            department: '',
            contactNumber: '',
            encodedData : '',
            return : '',
            tmpGroupList:[]
        })
      
    }
    addScreenShot() {
        this.props.navigation.navigate('faceCapture', {
            uid: this.uuid,
            name: this.state.name,
            department: this.state.department,
            contactNumber: this.state.contactNumber,
            mode :'faceCapture'
          
        });
        return;

    }
    backtoHome()
    {
        this.props.navigation.navigate('manualFaceVerify', {
            mode :'faceCapture'
          
        });
    }




    save() {
        if(this.state.loading){
            return;
        }

        if (StringHelper.isNullOrEmpty(this.state.name)|| StringHelper.isNullOrEmpty(this.state.encodedData)) {
            AlertHelper.alertError('Employee info is mandatory.');
            return;
        }
        this.setState({
            loading: true
        });
        console.log('this.uuid,',this.uuid)
        console.log('this.encodedData,',this.encodedData)

        UserService.maintainSession()
            .do(() => {
                ApiService.createperson({
                    image: this.state.uidata,
                    name: this.uuid,
                    person_info: {
                        "fullname": this.state.name,
                        "department": this.state.department,
                        "contactNumber": this.state.contactNumber,
                        "employeeno": this.uuid
                    }
                })
                    .switchMap(res => res.json())
                    .map(data => {

                        console.log('Create Person Console : ' + JSON.stringify(data));

                        if (!data.message || !data.message.includes('ok')) {
                            console.log('Create Person Console : Create Person Failed');
                            AlertHelper.alertError(data.message );

                            return false;
                        }
                        else{
                            ApiService.applypersontogroups(data.person_id,this.getIdList());
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
        this.setState({
            finished: true,
            return : 'sucess'
        });
        
        // this.props.navigation.navigate('enrollResult', {
        //     enrollImage: this.state.encodedData,
        //     UserDetail: {
        //         "fullname": this.state.name,
        //         "department": this.state.department,
        //         "contactNumber": this.state.contactNumber,
        //         "employeeno": this.state.uid
        //     }
        // });
    }

    goError() {
        this.setState({
            finished: true,
            return : 'error'
        });
        // this.props.navigation.navigate('errorResult', {
        //     enrollImage: this.state.encodedData,
        //     UserDetail: {
        //         "fullname": this.state.name,
        //         "department": this.state.department,
        //         "contactNumber": this.state.contactNumber,
        //         "employeeno": this.state.uid
        //     }
        // });
    }
}


const styles = StyleSheet.create({
    baseContainer: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        
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
    addBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor:'rgb(57,125,246)',
        marginTop:10,
        padding: 15
    },
    group: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15
    },
    groupBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 15,
        marginLeft:5,
        borderColor: 'rgb(79,91,114)'
    },
    groupBtnChange: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 15,
        marginLeft:5,
        borderColor: 'rgb(139,152,178)'

    },
  
    title: {
        fontSize: 24,
        color: ColorConfig.MAIN_FONT,
        marginBottom: 15,
        textAlign: 'center'
    },
    loginButtonContainer: {
        padding: 10,
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
        backgroundColor: ColorConfig.MAIN_BACKGROUND
    },
    footerText: {
        color: ColorConfig.MAIN_FONT_BLACK,
        fontSize: 16
    },
    radioButton: {
        borderWidth: 1,
        borderColor: ColorConfig.MAIN_MUDIUM,
        padding: 10,
        borderRadius: 5,
        marginBottom: 5
    },
    radioButtonActive: {
        borderWidth: 1,
        borderColor: ColorConfig.MAIN_MUDIUM,
        backgroundColor: ColorConfig.MAIN_MUDIUM,
        padding: 10,
        borderRadius: 5,
        marginBottom: 5
    },
    radioButtonText: {
        fontSize: 24,
        color: ColorConfig.MAIN_MUDIUM
    },
    radioButtonTextActive: {
        fontSize: 24,
        color: ColorConfig.MAIN_BACKGROUND
    },
    loginText: {
        ...Device.select({
          phone: { fontSize: 19, },
          tablet: { fontSize: 8 ,}
        }),
        color: ColorConfig.MAIN_TEXT_COLOR
    },

    smallCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 10,
        right: '7%',
        ...Device.select({
            phone: {
                height: 38,
                width: 38,
                borderRadius: 19
            },
            tablet: {
                height: 36,
                width: 36,
                borderRadius: 18
            }
        })
    },
    slide: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancel: {
        ...Device.select({
            phone: { height: 20, width: 20 },
            tablet: { height: 20, width: 20 }
        })
    },
      pic_viewer: {
        height: '100%',
        width: '100%',
        // borderTopWidth: Platform.OS === 'android' ? 2 : 0,
        // borderBottomWidth: Platform.OS === 'android' ? 2 : 0,
        // borderLeftWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRightWidth: Platform.OS === 'android' ? 2 : 0,
        // borderRadius: Platform.OS === 'android' ? 5 : 0,
        // padding: Platform.OS === 'android' ? 5 : 0,
        borderColor: ColorConfig.MAIN_BACKGROUND,
        shadowColor: ColorConfig.MAIN_BACKGROUND,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        // shadowRadius: 5,
    },
    returnText: {
        ...Device.select({
            phone: { fontSize: 36 },
            tablet: { fontSize: 18 }
        })
    },
    returnSmallText: {
        ...Device.select({
            phone: { fontSize: 16, height: 20 },
            tablet: { height: 10, fontSize: 8 }
        })
    },
    btn_login: {
        justifyContent: 'center',
        alignItems: 'center',
        ...Device.select({
            phone: { width: 300, height: 50, marginTop: 50, borderRadius: 3 },
            tablet: { width: 300, height: 25, marginTop: 20, borderRadius: 3 }
        })
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
      
});
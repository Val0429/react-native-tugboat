import { StyleSheet } from 'react-native';
import ColorConfig from '../config/color.config ';
import Device from '../components/react-native-device-detection-val';

const iStyle = StyleSheet.create({
    baseContainer: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND
    }, scrollContainer: {
        flex: 1,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30
    },
    logo: {
        width: 70,
        height: 70,
        marginBottom: 10
    },
    img: {
        width: '100%',
        resizeMode: 'contain'
    },
    header: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        padding: 15,
        height: 75,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        flexDirection: 'row',
    },
    header_icon_container: {
        width: 40,
        height: 40,
        marginRight: 5,
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'absolute',

    },
    header_icon: {
        width: '100%',
        resizeMode: 'contain',
        position: 'absolute',
      

    },

    header_menu: {
        position: 'absolute',
        top: 18,
        right: 15,
        backgroundColor: ColorConfig.TRANSPARENT,
        borderColor: ColorConfig.TRANSPARENT,
        width: 30,
        height: 30
    },
    header_menu_img: {
        width: '100%',
        resizeMode: 'contain'
    },
    sideBar: {
        position: "absolute",
        right: 0,
        width: '80%',
        backgroundColor: ColorConfig.MAIN_MASK,
        height: '100%',
        borderColor: ColorConfig.MAIN_FONT_BLACK,
        borderLeftWidth: 1
    },
    sideBar_menu: {
        alignSelf: 'flex-end',
        right: 15,
        marginTop: 18,
        backgroundColor: ColorConfig.TRANSPARENT,
        borderColor: ColorConfig.TRANSPARENT,
        width: 30,
        height: 30,
        marginBottom: 20
    },
    sideBar_menu_img: {
        width: '100%',
        resizeMode: 'contain'
    },

    sideBar_menu_item: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        flex: 1,
        flexDirection: 'row',
        padding: 15,
        paddingLeft: 30
    }
    , sideBar_menu_item_icon_container: {
        width: 30,
        height: 30,
        marginRight: 20

    }, sideBar_menu_item_icon: {
        width: '100%',
        resizeMode: 'contain',
    },
    sideBar_menu_item_text: {
        color: ColorConfig.WHITE,
        fontSize: 22
    },
    
    footer: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        padding: 15,
        height: 75,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer_menu: {
        flex: 1,
        top: 0,
        backgroundColor: ColorConfig.MAIN_MASK,
        borderColor: ColorConfig.TRANSPARENT,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footer_shoot: {
        backgroundColor: ColorConfig.MAIN_MASK,
        flex: 1,
        top: 0,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',

    },
    footer_menu_img: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        justifyContent: 'flex-end',
    },
    form_group: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginBottom: 30
    },
    form_control: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        color: ColorConfig.MAIN_FONT,
        //fontSize: 24,
        borderWidth: 2,
        borderColor: ColorConfig.MAIN_LIGHT,
        borderRadius: 5,
        // marginBottom: 10,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    form_control_b_n: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        color: ColorConfig.MAIN_FONT,
        fontSize: 24,
        borderWidth: 0,
        borderRadius: 5,
        // marginBottom: 10,
        textAlign: 'left',
    },
    btn_primary: {
        backgroundColor: ColorConfig.MAIN_MUDIUM,
        borderColor: ColorConfig.MAIN_MUDIUM,
        borderWidth: 1,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    btn_deep: {
        backgroundColor: ColorConfig.MAIN_GRAY,
        borderColor: ColorConfig.MAIN_GRAY,
        borderWidth: 1,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    no_border: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        backgroundColor: ColorConfig.MAIN_BACKGROUND
    },
    hr: {
        width: '100%',
        height: 3,
        marginBottom: 15
    },
    itemStyle: {
        width: '100%',
        backgroundColor: 'rgb(22 ,29 ,40)',
        justifyContent: 'center',
        alignItems: 'center',
        ...Device.select({
          phone: { height: 50, borderRadius: 7, marginTop: 20 },
          tablet: { height: 50, borderRadius: 7, marginTop: 20 }
        })
      },
      firstItem:{
        ...Device.select({ phone: { marginTop: 50 }, tablet: { marginTop: 20, } })
      },
      icon:{
        ...Device.select({
          phone: { height: 24, width: 24, marginLeft: 10 },
          tablet: { height: 24, width: 24 ,marginLeft: 10}
        })
      },
      backIcon:{
        ...Device.select({
            phone: { height: 24, width: 24 },
            tablet: { height: 20, width: 20 }
        }),
         left: 0, position: 'absolute' 
      },
      sideBarContainer: {
        flex: 1,
        backgroundColor: ColorConfig.MAIN_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15
      },
      logo: {
        ...Device.select({
          phone: { height: 46, width: 118 },
          tablet: { height: 46, width: 118 }
        })
      },
      bigCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        top: 10,
        ...Device.select({
            phone: {
                height: 160,
                width: 160,
                borderRadius: 80
            },
            tablet: {
                height: 270,
                width: 270,
               borderRadius: 135
            }
        })
    },
    screenshot: {
        ...Device.select({
            phone: { height: 140, width: 140, borderRadius: 70 },
            tablet: { height: 250, width: 250, borderRadius: 125}
        }),
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    screenshotItem:{
        ...Device.select({
            phone: { height: 180, },
            tablet: { height: 320, }
        })
    },
    loginText: {
        ...Device.select({
          phone: { fontSize: 19, },
          tablet: { fontSize: 19 ,}
        }),
        color: ColorConfig.MAIN_TEXT_COLOR
    },
    header_title: {
        ...Device.select({
            phone: { fontSize: 19 },
            tablet: { fontSize: 19 }
        }),
        color: 'rgb(225,235,255)'
    },
    btn_login: {
        justifyContent: 'center',
        alignItems: 'center',
        ...Device.select({
            phone: { width: 300, height: 50, marginTop: 50, borderRadius: 3 },
            tablet: { width: 300, height: 50, marginTop: 50, borderRadius: 3 }
        })
    },
    
});



export default iStyle;
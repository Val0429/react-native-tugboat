import React from 'react';
import { DrawerNavigator } from "react-navigation";
import { Root } from 'native-base';

import { Login, VerifyRoot, EnrollRoot } from './views';
import { StatusBar, TabBarIOS, StyleSheet } from 'react-native';
import ColorConfig from './config/color.config ';
import { AutoFaceVerify } from './views/verify/auto-face-verify.ios';

const Index = DrawerNavigator(
  {
    login: {
      screen: Login,
      navigationOptions: ({ navigation }) => ({
        drawerLockMode: 'locked-closed'
      })
    },
    EnrollRoot: {
      screen: EnrollRoot,
      navigationOptions: ({ navigation }) => ({
        drawerLockMode: 'locked-closed'
      })
    },
    autofaceVerify: {
      screen: AutoFaceVerify,
      navigationOptions: ({ navigation }) => ({
        drawerLockMode: 'locked-closed'
      })
    },
    VerifyRoot: {
      screen: VerifyRoot,
      navigationOptions: ({ navigation }) => ({
        drawerLockMode: 'locked-closed'
      })
    },
    
  }

);

export default () =>
  <Root>
    <StatusBar hidden />
    <Index style={styles.baseContainer} />
  </Root>;


const styles = StyleSheet.create({
  baseContainer: {
    backgroundColor: ColorConfig.MAIN_BACKGROUND
  }
});
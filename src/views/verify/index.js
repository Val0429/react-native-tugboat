import React, { Component } from 'react';
import { StatusBar } from "react-native";
import { StackNavigator } from 'react-navigation';
import { ErrorResult } from './error-result';
import { VerifyResult } from './verify-result';
import { Settings } from './settings';
import { ManualFaceVerify } from './manual-face-verify';
import { Notification } from '../shared/notification'

export const VerifyRoot = StackNavigator({
  manualFaceVerify: {
    screen: ManualFaceVerify,
    navigationOptions: {
      header: null
    }
  },
  notification: { 
    screen: Notification,
    navigationOptions: { 
      header: null
    }
  },
  settingPage: {
    screen: Settings,
    navigationOptions: {
      header: null
    }
  },
  errorResult: {
    screen: ErrorResult,
    navigationOptions: {
      header: null
    }
  },
  verifyResult: {
    screen: VerifyResult,
    navigationOptions: {
      header: null
    }
  }
});
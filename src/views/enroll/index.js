import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { FaceCapture } from './face-capture';
import { Information } from './information';
import { from } from "rxjs/observable/from";
export const EnrollRoot = StackNavigator({
  
  faceCapture: { 
    screen: FaceCapture,
    navigationOptions: { 
      header: null
    }
  },
  information: { 
    screen: Information,
    navigationOptions: { 
      header: null
    }
  },
 
});
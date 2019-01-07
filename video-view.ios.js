import React, { Component } from 'react';
import {
  requireNativeComponent,
  NativeModules,
  AppRegistry,
  StyleSheet,
  findNodeHandle,
  Text,
  ImageStore,
  View
} from 'react-native';

var NativeVideoView = requireNativeComponent('FaceDetectionView', VideoView, {
});
  
export class VideoView extends React.Component {
  constructor(props) {
    super(props);
  }
  
  Start() {
	  NativeModules.FaceDetectionViewManager.Start(findNodeHandle(this.refs.native));
  }
  
  Stop() {
	  NativeModules.FaceDetectionViewManager.Stop(findNodeHandle(this.refs.native));
  }
  
  SetFacingFront(value) {
	  NativeModules.FaceDetectionViewManager.SetFacingFront(findNodeHandle(this.refs.native), value);
  }
  
  EnableDebugInfo(value) {
	  NativeModules.FaceDetectionViewManager.EnableDebugInfo(findNodeHandle(this.refs.native), value);
  }

  render(){
        return <NativeVideoView 
            ref="native"
            {...this.props}
            />;
    }
}

AppRegistry.registerComponent('FaceDetectionView', () => VideoView);

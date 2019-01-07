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

const UIManager = NativeModules.UIManager;
const DispatchManager = UIManager.dispatchViewManagerCommand;
const Commands = UIManager.FaceDetectionView.Commands;

var NativeVideoView = requireNativeComponent('FaceDetectionView', VideoView, {
});
  


export class VideoView extends Component {
  constructor(props) {
    super(props);
  }
  
  StartCamera() {
	  DispatchManager(findNodeHandle(this.refs.native), Commands.what, ['Start'])
  }

  
  StartCamera(value) {
	  DispatchManager(findNodeHandle(this.refs.native), Commands.what, ['Start', value])
  }
  
  
  StopCamera() {
	  DispatchManager(findNodeHandle(this.refs.native), Commands.what, ['Stop'])
  }
  
  SetFacingFront(value) {
	  DispatchManager(findNodeHandle(this.refs.native), Commands.what, ['SetFacingFront', value])
  }

  EnableDebugInfo(value) {
	  DispatchManager(findNodeHandle(this.refs.native), Commands.what, ['EnableDebugInfo', value])
  }
  

  render(){
        return <NativeVideoView 
            ref="native"
            {...this.props}
            />;
    }
}

AppRegistry.registerComponent('FaceDetectionView', () => VideoView);

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  Switch,
  Image,
  Dimensions,
  View
} from 'react-native';

import { VideoView } from './src/views/shared/video-view';

var deviceWidth = Dimensions.get('window').width;
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    this._onNativeCallback = this._onNativeCallback.bind(this);
  }

  getInitialState() {
    return {
      facing: false,
      show_debug: false,
      viewRefs: {},
      encodedData: '',
      encodedData2: '',
    }
  }

  _onNativeCallback(event) {
    if (event.nativeEvent.image)
      this.setState({ encodedData: event.nativeEvent.image });
    else if (event.nativeEvent.image2)
      this.setState({ encodedData2: event.nativeEvent.image2 });

  }

  render() {
    return (
      <View style={styles.container}>

        <VideoView style={styles.videoview}
          ref={(video_view) => {
            this.state.viewRefs['video'] = video_view;
          }}
          onNativeCallback={this._onNativeCallback}>
        </VideoView>
        <View style={styles.row_container}>
          <Button
            onPress={async () => {
              var promise = this.state.viewRefs['video'].StartCamera();
              let v = await promise;
            }}
            title='Start' />

          <Button
            onPress={async () => {
              var promise = this.state.viewRefs['video'].StopCamera();
              let v = await promise;
            }}
            title='Stop' />
            
        </View>

        <View style={styles.row_container}>
          <Image style={styles.detected_view} source={{ uri: `data:image/png;base64,${this.state.encodedData}` }} />
          <Image style={styles.detected_view} source={{ uri: `data:image/png;base64,${this.state.encodedData2}` }} />
        </View>

        <View style={styles.row_container}>
          <View style={styles.row_container}>
            <Text>Facing {this.state.facing ? 'Front' : 'Back'}</Text>
            <Switch
              onValueChange={(value) => {
                this.setState({ facing: value });
                this.state.viewRefs['video'].SetFacingFront(value);
              }}
              value={this.state.facing} />
          </View>

          <View style={styles.row_container}>
            <Text>Debug </Text>
            <Switch
              onValueChange={(value) => {
                this.setState({ show_debug: value });
                this.state.viewRefs['video'].EnableDebugInfo(value);
              }}
              value={this.state.show_debug} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  row_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  videoview: {
    width: deviceWidth,
    height: deviceWidth,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  detected_view: {
    width: 160,
    height: 120,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    margin: 10
  }
});

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

import { VideoView } from './video-view';

var deviceWidth = Dimensions.get('window').width*0.5;
var deviceHeight = Dimensions.get('window').height;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
	this._onNativeCallback = this._onNativeCallback.bind(this);
  }
  
  getInitialState() {
    return {
		facing: false,
      viewRefs: {},
	  encodedData: '',
	  encodedData2: '',
    }
  }
  
  _onNativeCallback(event){
    console.log('got a callback: ' + event.nativeEvent.caller + ' - ' + event.nativeEvent.image.length);
	if (event.nativeEvent.image)
		this.setState({encodedData:event.nativeEvent.image});
	if (event.nativeEvent.image2)
		this.setState({encodedData2:event.nativeEvent.image2});
	
  }
  
  render() {
    return (
      <View style={styles.row_container}>
				<VideoView style={styles.videoview}
					ref={(video_view) => { 
								this.state.viewRefs['video'] = video_view;                
								}}
					onNativeCallback={this._onNativeCallback}>
				</VideoView>

				<View style={styles.col_container}>

					<Image style={styles.detected_view} source={{uri: `data:image/png;base64,${this.state.encodedData}`}} />
					<Image style={styles.detected_view} source={{uri: `data:image/png;base64,${this.state.encodedData2}`}} />

					<View style={styles.row_container}>
						<Button
							onPress={async () => {
							var promise = this.state.viewRefs['video'].Start(true);
							let v = await promise;
							}}
							title='Start' />
					
						<Button
							onPress={async () => {
							var promise = this.state.viewRefs['video'].Stop();
							let v = await promise;
							}}
							title='Stop' />		
					</View>


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
  col_container: {
    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
	flexDirection: 'column',
		backgroundColor: '#F5FCFF',
  },
  row_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
		backgroundColor: '#F5FCFF',
		justifyContent: 'space-around',
  },
  videoview: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: '#333333',
//    justifyContent: 'center',
//    alignItems: 'center',
   margin: 10
  },
  detected_view: {
	width: 160,
  height: 120,
	backgroundColor: '#ffffff',
	justifyContent: 'center',
	alignItems: 'center',
	margin: 10
  }
});

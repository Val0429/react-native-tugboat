import React, { Component } from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
export default class ImageEquallyEnlarge extends Component {
   
    constructor(props) {
        super(props);
        this.state = {
            style: {}
        };
        this.onImageLayout=this.onImageLayout.bind(this);
    }

    onImageLayout(event) {
        let layout=event.nativeEvent.layout;
        if(layout.width<=this.props.originalWidth) return;
        if(layout.height<=this.props.originalHeight) return;
        let originalAspectRatio=this.props.originalWidth/this.props.originalHeight;
        let currentAspectRatio=layout.width/layout.height;
        if(originalAspectRatio===currentAspectRatio) return;
        if(originalAspectRatio>currentAspectRatio){
            let newHeight=layout.width/originalAspectRatio; 
            this.setState({
                style:{
                    height:newHeight
                }
            });
            return ;
        }
        let newWidth=layout.height*originalAspectRatio;
        this.setState({
            style:{
                width:newWidth
            }
        });
    }
    render(){
        return(
            <Image {...this.props}
                style={[this.props.style,this.state.style]}
                onLayout={this.onImageLayout}
            />
        )
    }
}

ImageEquallyEnlarge.prototype = {
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired
};
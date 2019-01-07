import React, {
  PixelRatio,
  Platform,
  Dimensions
} from 'react-native';

const windowSize = Dimensions.get('window');

class DetectDeviceService {
  constructor() {
    this.pixelDensity = PixelRatio.get();
    this.width = windowSize.width;
    this.height = windowSize.height;
    this.adjustedWidth = this.width * this.pixelDensity;
    this.adjustedHeight = this.height * this.pixelDensity;
    
    this.isPhoneOrTablet();
    this.isIosOrAndroid();
  }
  
  isPhoneOrTablet() {
    if(this.pixelDensity < 2 && (this.adjustedWidth >= 1000 || this.adjustedHeight >= 1000)) {
      this.isTablet = true;
      this.isPhone = false;
    } else if(this.pixelDensity === 2 && (this.adjustedWidth >= 1920 || this.adjustedHeight >= 1920)) {
      this.isTablet = true;
      this.isPhone = false;
    } else {
      this.isTablet = false;
      this.isPhone = true;
    }
  }
  
  isIosOrAndroid() {
    if(Platform.OS === 'ios') {
      this.isIos = true;
      this.isAndroid = false;
    } else {
      this.isIos = false;
      this.isAndroid = true;
    }
  }

  /// Val added
 // baselength = 736;
baselength = 667;

  reflength() {
    const { width, height } = Dimensions.get('window');
    return Math.max(width, height);
  }
  refcal(value) {
    return value * this.reflength() / this.baselength;
  }
  
  calfortablet(value, ratio = 1) {
    return this.isTablet ? this.refcal(value*ratio) : value;
  }

  selectOrientation(obj) {
    /// key: portrait, landscape
    const { width, height } = Dimensions.get('window');
    return width > height ? obj['landscape'] : obj['portrait'];
  }

  select(obj) {
    /// key: tablet, phone
    return this.isTablet ? this.tablet(obj.tablet) : this.phone(obj.phone);
  }
  selectFixed(obj) {
    /// key: tablet, phone
    return this.isTablet ? obj.tablet : obj.phone;
  }
  tablet(obj, ratio = 1) {
    let objs = ['width', 'height', 'fontSize', 'borderRadius',
      'margin', 'marginVertical', 'marginHorizontal', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
      'padding', 'paddingVertical', 'paddingHorizontal', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
      'left', 'right', 'top', 'bottom',
      'lineHeight',
    ];

    objs.forEach( o => {
      obj[o] && (obj[o] = this.refcal(obj[o])*ratio);
      switch (o) {
        case 'fontSize':
          obj[o] && (obj[o] = Math.floor(obj[o]));
          break;
      }
    });

    return this.isTablet ? obj : null;
  }
  phone(obj) {
    return !this.isTablet ? obj : null;
  }
  both(obj, ratio = 1) {
    return this.isTablet ? this.tablet(obj, ratio) : this.phone(obj);
  }
}

module.exports = new DetectDeviceService();

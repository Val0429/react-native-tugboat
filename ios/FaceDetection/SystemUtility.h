//
//  SystemUtility.h
//  JustConnectPlusV2
//
//  Created by iOS.developer on 2017/9/7.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MediaPlayer/MediaPlayer.h>
#import <Photos/Photos.h>

@interface SystemUtility : NSObject {
  MPVolumeView* m_volumeView;
  UISlider* m_volumeViewSlider;
}

+ (instancetype) sharedInstance;
- (void) setSystemVolume:(float)vol;
- (float) systemVolume;
+ (PHAssetCollection*) createdCollection:(NSString*)albumName;
+ (BOOL) SaveImageToAlbum:(NSString*)albumName image:(UIImage*)image;
+ (void) setSystemBrightnessValue:(int)value;
+ (int) getSystemBrightnessValue;

@end

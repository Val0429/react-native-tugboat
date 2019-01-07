//
//  FaceDetectionView.h
//  FaceDetection
//
//  Created by iOS.developer on 2018/2/14.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>

@class FaceDetectionView;

@protocol FaceDetectionViewDelegate <NSObject>
- (void) sentNativeEvent:(FaceDetectionView*)view event:(NSMutableDictionary*)event;
@end

@interface FaceDetectionView : UIView {
  UIView *placeHolder;
  UIView *overlayView;
  UIImageView *imageviewtest;
}

@property (nonatomic, weak) id delegate;
@property (nonatomic, copy) RCTBubblingEventBlock onNativeCallback;

- (void) Start;
- (void) Stop;
- (void) SetFacingFront:(BOOL)isFacingFront;
- (void) EnableDebugInfo:(BOOL)isEnable;

@end

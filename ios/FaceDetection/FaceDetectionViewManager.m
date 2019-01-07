//
//  PreviewManager.m
//  FaceDetection
//
//  Created by iOS.developer on 2018/2/14.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "FaceDetectionViewManager.h"
#import <React/RCTUIManager.h>
#import "FaceDetectionView.h"
#import "React/RCTImageStoreManager.h"
#include <execinfo.h>


@interface FaceDetectionViewManager() <FaceDetectionViewDelegate>
@end

@implementation FaceDetectionViewManager {
  
}

RCT_EXPORT_MODULE();

RCT_EXPORT_VIEW_PROPERTY(onNativeCallback, RCTBubblingEventBlock);

- (void) sentNativeEvent:(FaceDetectionView*)view event:(NSMutableDictionary*)event
{
  if ([view isKindOfClass:[FaceDetectionView class]]) {
    if (!view.onNativeCallback)
      return;
    view.onNativeCallback(event);
  }
}

-(FaceDetectionView*)view
{
  FaceDetectionView *view = [FaceDetectionView new];
  view.delegate = self;
  
  return view;
}

- (FaceDetectionView*) getChannelViewById:(NSNumber*)reactTag viewRegistry:(NSDictionary<NSNumber *,UIView *>*) viewRegistry
{
  FaceDetectionView* pv = (FaceDetectionView*)viewRegistry[reactTag];
  
  if(![pv isKindOfClass:[FaceDetectionView class]]) {
    pv = nil;
    dispatch_async(dispatch_get_main_queue(), ^{
      NSString* msg = [[NSString alloc] initWithFormat:@"Invalid View ID: %d", [reactTag intValue]];
      UIAlertView* alert = [[UIAlertView alloc] initWithTitle:@"ERROR" message:msg delegate:nil cancelButtonTitle:@"Got it" otherButtonTitles:nil, nil];
      [alert show];
    });
  }
  
  return pv;
}

RCT_REMAP_METHOD(Start,
                 start_tag:(nonnull NSNumber*)reactTag
                 start_esolver:(RCTPromiseResolveBlock)resolve
                 start_rejecter:(RCTPromiseRejectBlock)reject) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    FaceDetectionView* view = [self getChannelViewById:reactTag viewRegistry:viewRegistry];
    if (!view) {
      reject(@"", @"Invalid viewId", nil);
      return;
    }
    
    [view Start];
    resolve(@(YES));
  }];
}

RCT_REMAP_METHOD(Stop,
                 stop_tag:(nonnull NSNumber*)reactTag
                 stop_esolver:(RCTPromiseResolveBlock)resolve
                 stop_rejecter:(RCTPromiseRejectBlock)reject) {
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    FaceDetectionView* view = [self getChannelViewById:reactTag viewRegistry:viewRegistry];
    if (!view) {
      reject(@"", @"Invalid viewId", nil);
      return;
    }
    
    [view Stop];
    resolve(@(YES));
  }];
}

RCT_REMAP_METHOD(SetFacingFront,
                 setfacing_tag:(nonnull NSNumber*)reactTag
                 setfacing_isFront:(BOOL)isFront
                 setfacing_esolver:(RCTPromiseResolveBlock)resolve
                 setfacing_rejecter:(RCTPromiseRejectBlock)reject) {
  
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    FaceDetectionView* view = [self getChannelViewById:reactTag viewRegistry:viewRegistry];
    if (!view) {
      reject(@"", @"Invalid viewId", nil);
      return;
    }
    
    [view SetFacingFront:isFront];
    resolve(@(YES));
  }];
}

RCT_REMAP_METHOD(EnableDebugInfo,
                 setfacing_tag:(nonnull NSNumber*)reactTag
                 setfacing_isEnable:(BOOL)enable
                 setfacing_esolver:(RCTPromiseResolveBlock)resolve
                 setfacing_rejecter:(RCTPromiseRejectBlock)reject) {
  
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    FaceDetectionView* view = [self getChannelViewById:reactTag viewRegistry:viewRegistry];
    if (!view) {
      reject(@"", @"Invalid viewId", nil);
      return;
    }
    
    [view EnableDebugInfo:enable];
    resolve(@(YES));
  }];
}

@end

//
//  SystemUtility.m
//  JustConnectPlusV2
//
//  Created by iOS.developer on 2017/9/7.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "SystemUtility.h"


@implementation SystemUtility

+ (instancetype) sharedInstance
{
  static SystemUtility *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[SystemUtility alloc] init];
  });
  return instance;
}

- (id) init
{
  self = [super init];
  if (self) {
    m_volumeView = [[MPVolumeView alloc] init];
    m_volumeViewSlider = nil;
    for (UIView* view in [m_volumeView subviews]) {
      if ([[[view class] description] isEqualToString:@"MPVolumeSlider"]) {
        m_volumeViewSlider = (UISlider*)view;
        break;
      }
    }
    
    [m_volumeView setShowsVolumeSlider:YES];
  }
  return self;
}

- (void)setSystemVolume:(float)vol
{
  [m_volumeViewSlider setValue:vol animated:YES];
}

- (float)systemVolume
{
  float ret = [m_volumeViewSlider value];
  return ret;
}

+ (PHAssetCollection*) createdCollection:(NSString*)albumName
{
  //  NSString* albumName = @"JustConnect+";
  PHFetchResult<PHAssetCollection *> *collections =
  [PHAssetCollection fetchAssetCollectionsWithType:PHAssetCollectionTypeAlbum
                                           subtype:PHAssetCollectionSubtypeAlbumRegular
                                           options:nil];
  for (PHAssetCollection *collection in collections) {
    if ([collection.localizedTitle isEqualToString:albumName])
      return collection;
  }
  
  __block NSString* createdCollectionId = nil;
  
    NSError* err = nil;
  [[PHPhotoLibrary sharedPhotoLibrary] performChangesAndWait:^{
    createdCollectionId = [PHAssetCollectionChangeRequest creationRequestForAssetCollectionWithTitle:albumName].placeholderForCreatedAssetCollection.localIdentifier;
  } error:&err];
  
  if (createdCollectionId == nil)
    return nil;
  
  return [PHAssetCollection fetchAssetCollectionsWithLocalIdentifiers:@[createdCollectionId] options:nil].firstObject;
}

+ (BOOL) SaveImageToAlbum:(NSString*)albumName image:(UIImage*)image
{
  BOOL bRet = NO;
  PHAssetCollection* collection = [self createdCollection:albumName];
  if (collection != nil) {
    NSError* error = nil;
    [[PHPhotoLibrary sharedPhotoLibrary] performChangesAndWait:^{
      __block PHObjectPlaceholder* targetObject =
          [PHAssetCreationRequest creationRequestForAssetFromImage:image].placeholderForCreatedAsset;
      [[PHAssetCollectionChangeRequest changeRequestForAssetCollection:collection] insertAssets:@[targetObject] atIndexes:[NSIndexSet indexSetWithIndex:0]];
      
    } error:&error];
    if (!error)
      bRet = YES;
  }
  return bRet;
}

+ (void) setSystemBrightnessValue:(int)value
{
  float mapping = value / 100.0;
  [[UIScreen mainScreen] setBrightness:mapping];
}

+ (int) getSystemBrightnessValue
{
  int value = [[UIScreen mainScreen] brightness] * 100;
  return value;
}

@end

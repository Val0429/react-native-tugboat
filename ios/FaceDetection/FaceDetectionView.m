//
//  FaceDetectionView.m
//  FaceDetection
//
//  Created by iOS.developer on 2018/2/14.
//  Copyright © 2018年 Facebook. All rights reserved.
//

@import AVFoundation;

#import "DSVisionTool.h"
#import "FaceDetectionView.h"
#import "React/UIView+React.h"
#import "DrawingUtility.h"
#import "SystemUtility.h"
#import "UIImage-Extensions.h"

#define PREFER_CHECK_TIME 3

@interface FaceDetectionView ()<AVCaptureVideoDataOutputSampleBufferDelegate> {
  long mLastUpdateTime;
  AVCaptureDevicePosition mCapturePosition;
  BOOL mShowDebugInfo;
}

@property (nonatomic, strong)NSMutableArray *layers;

// Video objects.
@property(nonatomic, strong) AVCaptureSession *session;
@property(nonatomic, strong) AVCaptureVideoDataOutput *videoDataOutput;
@property(nonatomic, strong) dispatch_queue_t videoDataOutputQueue;
@property(nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;
@property(nonatomic, assign) UIDeviceOrientation lastKnownDeviceOrientation;

// Detector.
//@property(nonatomic, strong) GMVDetector *faceDetector;

@end

@implementation FaceDetectionView {
  
}

@synthesize delegate = m_delegate;

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

- (id) initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    self.videoDataOutputQueue = dispatch_queue_create("VideoDataOutputQueue",
                                                      DISPATCH_QUEUE_SERIAL);
    mShowDebugInfo = NO;
    mCapturePosition = AVCaptureDevicePositionBack;
    
    placeHolder = [[UIView alloc] initWithFrame:self.bounds];
    overlayView = [[UIView alloc] initWithFrame:self.bounds];
    imageviewtest = [[UIImageView alloc] initWithFrame:self.bounds];

    placeHolder.userInteractionEnabled = NO;
    overlayView.userInteractionEnabled = NO;
    
    [placeHolder setContentMode:UIViewContentModeScaleAspectFill];
    [overlayView setContentMode:UIViewContentModeScaleAspectFill];
    
    [self addSubview:placeHolder];
    [self addSubview:overlayView];
    
//    [placeHolder setBackgroundColor:[UIColor redColor]];
//    [overlayView setBackgroundColor:[UIColor yellowColor]];
  }
  return self;
}

- (void) reactSetFrame:(CGRect)frame
{
  [super reactSetFrame:frame];
  
  self.frame = frame;
  
  placeHolder.frame = frame;
  placeHolder.center = CGPointMake(CGRectGetMidX(placeHolder.frame),
                                   CGRectGetMidY(placeHolder.frame));
  overlayView.frame = frame;
  overlayView.center = CGPointMake(CGRectGetMidX(overlayView.frame),
                                   CGRectGetMidY(overlayView.frame));
  imageviewtest.frame = frame;
  imageviewtest.center = CGPointMake(CGRectGetMidX(imageviewtest.frame),
                                     CGRectGetMidY(imageviewtest.frame));
  
  self.previewLayer.frame = frame;
  self.previewLayer.position = CGPointMake(CGRectGetMidX(self.previewLayer.frame),
                                           CGRectGetMidY(self.previewLayer.frame));
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
                                         duration:(NSTimeInterval)duration {
  // Camera rotation needs to be manually set when rotation changes.
  if (self.previewLayer) {
    if (toInterfaceOrientation == UIInterfaceOrientationPortrait) {
      self.previewLayer.connection.videoOrientation = AVCaptureVideoOrientationPortrait;
    } else if (toInterfaceOrientation == UIInterfaceOrientationPortraitUpsideDown) {
      self.previewLayer.connection.videoOrientation = AVCaptureVideoOrientationPortraitUpsideDown;
    } else if (toInterfaceOrientation == UIInterfaceOrientationLandscapeLeft) {
      self.previewLayer.connection.videoOrientation = AVCaptureVideoOrientationLandscapeLeft;
    } else if (toInterfaceOrientation == UIInterfaceOrientationLandscapeRight) {
      self.previewLayer.connection.videoOrientation = AVCaptureVideoOrientationLandscapeRight;
    }
  }
}

- (CGRect)scaledRect:(CGRect)rect
              xScale:(CGFloat)xscale
              yScale:(CGFloat)yscale
              offset:(CGPoint)offset {
  CGRect resultRect = CGRectMake(rect.origin.x * xscale,
                                 rect.origin.y * yscale,
                                 rect.size.width * xscale,
                                 rect.size.height * yscale);
  resultRect = CGRectOffset(resultRect, offset.x, offset.y);
  return resultRect;
}

- (CGPoint)scaledPoint:(CGPoint)point
                xScale:(CGFloat)xscale
                yScale:(CGFloat)yscale
                offset:(CGPoint)offset {
  CGPoint resultPoint = CGPointMake(point.x * xscale + offset.x, point.y * yscale + offset.y);
  return resultPoint;
}

- (void)setLastKnownDeviceOrientation:(UIDeviceOrientation)orientation {
  if (orientation != UIDeviceOrientationUnknown &&
      orientation != UIDeviceOrientationFaceUp &&
      orientation != UIDeviceOrientationFaceDown) {
    _lastKnownDeviceOrientation = orientation;
  }
}

/*
 #pragma mark - Navigation
 
 // In a storyboard-based application, you will often want to do a little preparation before navigation
 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
 // Get the new view controller using [segue destinationViewController].
 // Pass the selected object to the new view controller.
 }
 */

- (UIImage*) croppingImage:(UIImage*)image rect:(CGRect)rect {
  CGImageRef imageRef = CGImageCreateWithImageInRect([image CGImage], rect);
  UIImage* cropped = [UIImage imageWithCGImage:imageRef];
  CGImageRelease(imageRef);
  return cropped;
}

- (int) getRotateDegree {
  UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
  int degree = 0;
  if (deviceOrientation == UIDeviceOrientationPortrait)
    degree = 90;
  else if (deviceOrientation == UIDeviceOrientationLandscapeRight)
    degree = 180;
  else if (deviceOrientation == UIDeviceOrientationLandscapeLeft)
    degree = 0;
  
  return degree;
}

- (CGImageRef) imageFromSampleBuffer:(CMSampleBufferRef) sampleBuffer // Create a CGImageRef from sample buffer data
{
  CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  CVPixelBufferLockBaseAddress(imageBuffer,0);        // Lock the image buffer
  
  uint8_t *baseAddress = (uint8_t *)CVPixelBufferGetBaseAddressOfPlane(imageBuffer, 0);   // Get information of the image
  size_t bytesPerRow = CVPixelBufferGetBytesPerRow(imageBuffer);
  size_t width = CVPixelBufferGetWidth(imageBuffer);
  size_t height = CVPixelBufferGetHeight(imageBuffer);
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  
  CGContextRef newContext = CGBitmapContextCreate(baseAddress, width, height, 8, bytesPerRow, colorSpace, kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedFirst);
  CGImageRef newImage = CGBitmapContextCreateImage(newContext);
  CGContextRelease(newContext);
  
  CGColorSpaceRelease(colorSpace);
  CVPixelBufferUnlockBaseAddress(imageBuffer,0);
  /* CVBufferRelease(imageBuffer); */  // do not call this!
  
  return newImage;
}

- (void)captureOutput:(AVCaptureOutput *)captureOutput
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer
       fromConnection:(AVCaptureConnection *)connection {
  
  
//  {
//    CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
//    CFDictionaryRef attachments = CMCopyDictionaryOfAttachments(kCFAllocatorDefault, sampleBuffer, kCMAttachmentMode_ShouldPropagate);
//    CIImage* ciImage = [[CIImage alloc] initWithCVPixelBuffer:pixelBuffer options:(__bridge NSDictionary *)attachments];
//    if (attachments)
//      CFRelease(attachments);
//
//    UIInterfaceOrientation curOrientation = [[UIApplication sharedApplication] statusBarOrientation];
//
//    if (curOrientation == UIInterfaceOrientationLandscapeLeft)
//      ciImage = [ciImage imageByApplyingOrientation:3];
//    else if (curOrientation == UIInterfaceOrientationLandscapeRight)
//      ciImage = [ciImage imageByApplyingOrientation:1];
//    else if (curOrientation == UIInterfaceOrientationPortrait)
//      ciImage = [ciImage imageByApplyingOrientation:6];
//    else if (curOrientation == UIInterfaceOrientationPortraitUpsideDown)
//      ciImage = [ciImage imageByApplyingOrientation:8];
//
//    UIImage* detecImg = [UIImage imageWithCGImage:ciImage];
//    [self NotifyFaceDetected:detecImg uiImg:detecImg];
//  }
  
//  {
//
//    UIImage *image = [GMVUtility sampleBufferTo32RGBA:sampleBuffer];
//    AVCaptureDevicePosition devicePosition = mCapturePosition;
//
//    // Establish the image orientation.
//    UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
//    GMVImageOrientation orientation = [GMVUtility
//                                       imageOrientationFromOrientation:deviceOrientation
//                                       withCaptureDevicePosition:devicePosition
//                                       defaultDeviceOrientation:self.lastKnownDeviceOrientation];
//    NSDictionary *options = @{
//                              GMVDetectorImageOrientation : @(orientation)
//                              };
//    // Detect features using GMVDetector.
//    NSArray<GMVFaceFeature *> *faces = [self.faceDetector featuresInImage:image options:options];
//    //  NSLog(@"Detected %lu face(s).", (unsigned long)[faces count]);
//
//    // The video frames captured by the camera are a different size than the video preview.
//    // Calculates the scale factors and offset to properly display the features.
//    CMFormatDescriptionRef fdesc = CMSampleBufferGetFormatDescription(sampleBuffer);
//    CGRect clap = CMVideoFormatDescriptionGetCleanAperture(fdesc, false);
//    CGSize parentFrameSize = self.previewLayer.frame.size;
//
//    // Assume AVLayerVideoGravityResizeAspect
//    CGFloat cameraRatio = clap.size.width / clap.size.height;
//    CGFloat viewRatio = parentFrameSize.width / parentFrameSize.height;
//    CGFloat xScale = 1;
//    CGFloat yScale = 1;
//    CGRect videoBox = CGRectZero;
//    if (viewRatio > cameraRatio) {
//      videoBox.size.width = parentFrameSize.height * clap.size.width / clap.size.height;
//      videoBox.size.height = parentFrameSize.height;
//      videoBox.origin.x = (parentFrameSize.width - videoBox.size.width) / 2;
//      videoBox.origin.y = (videoBox.size.height - parentFrameSize.height) / 2;
//
//      xScale = videoBox.size.width / clap.size.width;
//      yScale = videoBox.size.height / clap.size.height;
//    } else {
//      videoBox.size.width = parentFrameSize.width;
//      videoBox.size.height = clap.size.width * (parentFrameSize.width / clap.size.height);
//      videoBox.origin.x = (videoBox.size.width - parentFrameSize.width) / 2;
//      videoBox.origin.y = (parentFrameSize.height - videoBox.size.height) / 2;
//
//      xScale = videoBox.size.width / clap.size.height;
//      yScale = videoBox.size.height / clap.size.width;
//    }
//
//    dispatch_sync(dispatch_get_main_queue(), ^{
//      // Remove previously added feature views.
//
//
//      // Display detected features in overlay.
//      int startX, startY, stopX, stopY, width, height;
//      for (GMVFaceFeature *face in faces) {
//
//        if (face.leftEyeOpenProbability < 0.3f || face.rightEyeOpenProbability < 0.3f)
//          continue;
//
//        CGRect faceRect = [self scaledRect:face.bounds
//                                    xScale:xScale
//                                    yScale:yScale
//                                    offset:videoBox.origin];
//
//        if (faceRect.origin.x < self.frame.origin.x ||
//            faceRect.origin.y < self.frame.origin.y ||
//            faceRect.origin.x + faceRect.size.width > self.frame.origin.x + self.frame.size.width ||
//            faceRect.origin.y + faceRect.size.height > self.frame.origin.y + self.frame.size.height)
//          continue;
//
//        if ([[NSDate date] timeIntervalSince1970] - mLastUpdateTime > PREFER_CHECK_TIME) {
//          UIImage* rotateImg = [image imageRotatedByDegrees:[self getRotateDegree]];
//
//          UIImage* croppedImg = nil;
//
//          startX = face.bounds.origin.x;
//          startY = face.bounds.origin.y;
//          stopX = face.bounds.origin.x + face.bounds.size.width;
//          stopY = face.bounds.origin.y + face.bounds.size.height;
//          width = face.bounds.size.width;
//          height = face.bounds.size.height;
//
//          int half_width = width>>1;
//          int half_height = height>>1;
//          startX -= half_width;
//          startY -= half_height;
//          stopX += half_width;
//          stopY += half_height;
//
//          if (startX < 0) startX = 0;
//          if (startY < 0) startY = 0;
//          if (stopX > rotateImg.size.width) stopX = rotateImg.size.width;
//          if (stopY > rotateImg.size.height) stopY = rotateImg.size.height;
//
//          width = stopX - startX;
//          height = stopY - startY;
//
//          CGRect cutRect = CGRectMake(startY, startY, width, height);
//          UIImage* uiImg = [rotateImg imageAtRect:cutRect];
//
//          if (mCapturePosition == AVCaptureDevicePositionBack)
//          {
//            croppedImg = [rotateImg imageAtRect:face.bounds];
//          }
//          else
//          {
//            croppedImg = [rotateImg imageAtRect:CGRectMake(rotateImg.size.width - (face.bounds.origin.x+face.bounds.size.width),
//                                                           face.bounds.origin.y,
//                                                           face.bounds.size.width,
//                                                           face.bounds.size.height)];
//
//          }
//          //        imageviewtest.frame = CGRectMake(0, 0, croppedImg.size.width, croppedImg.size.height);
//          //        imageviewtest.image = croppedImg;
//
//          [self NotifyFaceDetected:croppedImg uiImg:uiImg];
//
//          mLastUpdateTime = [[NSDate date] timeIntervalSince1970];
//        }
//      }
//    });
//
//
//    return;
//  }
  
  
  
  
  CVPixelBufferRef BufferRef = CMSampleBufferGetImageBuffer(sampleBuffer);
  VNDetectFaceRectanglesRequest *detectFaceRequest = [[VNDetectFaceRectanglesRequest alloc ]init];
  VNImageRequestHandler *detectFaceRequestHandler = [[VNImageRequestHandler alloc]initWithCVPixelBuffer:BufferRef options:@{}];
  
  [detectFaceRequestHandler performRequests:@[detectFaceRequest] error:nil];
  NSArray *results = detectFaceRequest.results;
  
  CGImageRef cgImage = [self imageFromSampleBuffer:sampleBuffer];
  UIImage *image = [UIImage imageWithCGImage: cgImage ];
  CGImageRelease( cgImage );
  
  UIImage* rotateImg = [image imageRotatedByDegrees:[self getRotateDegree] devicePosition:mCapturePosition];
//  [self NotifyFaceDetected:rotateImg uiImg:rotateImg];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
//    if (self.detectionType == DSDetectionTypeFaceRectangles) {
      //矩形
      for (CALayer *layer in self.layers) {
        [layer removeFromSuperlayer];
      }
      
//    }else if (self.detectionType == DSDetectionTypeFaceHat)
//    {
//      // 帽子
//      for (UIImageView *imageV in self.hats) {
//        [imageV removeFromSuperview];
//      }
//    }
    
    [self.layers removeAllObjects];
//    [self.hats removeAllObjects];
    
    for (VNFaceObservation *observation  in results) {

      
      CGRect oldRect = observation.boundingBox;
      CGFloat w = oldRect.size.width * image.size.width;
      CGFloat h = oldRect.size.height * image.size.height;
      CGFloat x = oldRect.origin.x * image.size.width;
      CGFloat y = image.size.height * (1 - oldRect.origin.y - oldRect.size.height);//image.size.height - (oldRect.origin.y * image.size.height) - h;
      
      
//      NSLog(@">>> %.0f, %.0f  -  %.0f, %.0f", x, y, w, h);
      // 添加矩形
      CGRect rect = CGRectMake(x, y, w, h);
//      CALayer *testLayer = [[CALayer alloc]init];
//      testLayer.borderWidth = 2;
//      testLayer.cornerRadius = 3;
//      testLayer.borderColor = [UIColor redColor].CGColor;
//      testLayer.frame = rect;
      
      UIImage* croppedImg = [image imageAtRect:rect];
      
      UIImage* rotateImg = [croppedImg imageRotatedByDegrees:[self getRotateDegree] devicePosition:self->mCapturePosition];
      
      CGFloat startX, startY, stopX, stopY, width, height;
      CGFloat half_width = w/2;
      CGFloat half_height = h/2;
      
      startX = x;
      startY = y;
      stopX = x + image.size.width;
      stopY = y + image.size.height;
      width = w;
      height = h;
      
      startX -= half_width;
      startY -= half_height;
      stopX += half_width;
      stopY += half_height;
      
      if (startX < 0) startX = 0;
      if (startY < 0) startY = 0;
      if (stopX > image.size.width) stopX = image.size.width;
      if (stopY > image.size.height) stopY = image.size.height;
      
      width = stopX - startX;
      height = stopY - startY;
      
      CGRect cutRect = CGRectMake(startY, startY, width, height);
      UIImage* cutImg = [image imageAtRect:cutRect];
      UIImage* uiImg = [cutImg imageRotatedByDegrees:[self getRotateDegree] devicePosition:self->mCapturePosition];
      
      [self NotifyFaceDetected:rotateImg uiImg:uiImg];
      
//      [self.layers addObject:testLayer];
      
      // 添加帽子
//      CGFloat hatWidth = w;
//      CGFloat hatHeight = h;
//      CGFloat hatX = rect.origin.x - hatWidth / 4 + 3;
//      CGFloat hatY = rect.origin.y -  hatHeight;
//      CGRect hatRect = CGRectMake(hatX, hatY, hatWidth, hatHeight);
      
//      UIImageView *hatImage = [[UIImageView alloc]initWithImage:[UIImage imageNamed:@"hat"]];
//      hatImage.frame = hatRect;
//      [self.hats addObject:hatImage];
    }
    
//    if (self.detectionType == DSDetectionTypeFaceRectangles) {
      //矩形
//      for (CALayer *layer in self.layers) {
//        [self->overlayView.layer addSublayer:layer];
//      }
    
//    }else if (self.detectionType == DSDetectionTypeFaceHat)
//    {
//      // 帽子
//      for (UIImageView *imageV in self.hats) {
//        [self.view addSubview:imageV];
//      }
//    }
  });
  
//  UIImage *image = [GMVUtility sampleBufferTo32RGBA:sampleBuffer];
//  AVCaptureDevicePosition devicePosition = mCapturePosition;
//
//  // Establish the image orientation.
//  UIDeviceOrientation deviceOrientation = [[UIDevice currentDevice] orientation];
//  GMVImageOrientation orientation = [GMVUtility
//                                     imageOrientationFromOrientation:deviceOrientation
//                                     withCaptureDevicePosition:devicePosition
//                                     defaultDeviceOrientation:self.lastKnownDeviceOrientation];
//  NSDictionary *options = @{
//                            GMVDetectorImageOrientation : @(orientation)
//                            };
//  // Detect features using GMVDetector.
//  NSArray<GMVFaceFeature *> *faces = [self.faceDetector featuresInImage:image options:options];
////  NSLog(@"Detected %lu face(s).", (unsigned long)[faces count]);
//
//  // The video frames captured by the camera are a different size than the video preview.
//  // Calculates the scale factors and offset to properly display the features.
//  CMFormatDescriptionRef fdesc = CMSampleBufferGetFormatDescription(sampleBuffer);
//  CGRect clap = CMVideoFormatDescriptionGetCleanAperture(fdesc, false);
//  CGSize parentFrameSize = self.previewLayer.frame.size;
//
//  // Assume AVLayerVideoGravityResizeAspect
//  CGFloat cameraRatio = clap.size.width / clap.size.height;
//  CGFloat viewRatio = parentFrameSize.width / parentFrameSize.height;
//  CGFloat xScale = 1;
//  CGFloat yScale = 1;
//  CGRect videoBox = CGRectZero;
//  if (viewRatio > cameraRatio) {
//    videoBox.size.width = parentFrameSize.height * clap.size.width / clap.size.height;
//    videoBox.size.height = parentFrameSize.height;
//    videoBox.origin.x = (parentFrameSize.width - videoBox.size.width) / 2;
//    videoBox.origin.y = (videoBox.size.height - parentFrameSize.height) / 2;
//
//    xScale = videoBox.size.width / clap.size.width;
//    yScale = videoBox.size.height / clap.size.height;
//  } else {
//    videoBox.size.width = parentFrameSize.width;
//    videoBox.size.height = clap.size.width * (parentFrameSize.width / clap.size.height);
//    videoBox.origin.x = (videoBox.size.width - parentFrameSize.width) / 2;
//    videoBox.origin.y = (parentFrameSize.height - videoBox.size.height) / 2;
//
//    xScale = videoBox.size.width / clap.size.height;
//    yScale = videoBox.size.height / clap.size.width;
//  }
//
//  dispatch_sync(dispatch_get_main_queue(), ^{
//    // Remove previously added feature views.
//    for (UIView *featureView in overlayView.subviews) {
//      [featureView removeFromSuperview];
//    }
//
//    // Display detected features in overlay.
//    int startX, startY, stopX, stopY, width, height;
//    for (GMVFaceFeature *face in faces) {
//
//      if (face.leftEyeOpenProbability < 0.3f || face.rightEyeOpenProbability < 0.3f)
//        continue;
//
//      CGRect faceRect = [self scaledRect:face.bounds
//                                  xScale:xScale
//                                  yScale:yScale
//                                  offset:videoBox.origin];
//
//      if (faceRect.origin.x < self.frame.origin.x ||
//          faceRect.origin.y < self.frame.origin.y ||
//          faceRect.origin.x + faceRect.size.width > self.frame.origin.x + self.frame.size.width ||
//          faceRect.origin.y + faceRect.size.height > self.frame.origin.y + self.frame.size.height)
//        continue;
//
//      if ([[NSDate date] timeIntervalSince1970] - mLastUpdateTime > PREFER_CHECK_TIME) {
//        UIImage* rotateImg = [image imageRotatedByDegrees:[self getRotateDegree]];
//
//        UIImage* croppedImg = nil;
//
//        startX = face.bounds.origin.x;
//        startY = face.bounds.origin.y;
//        stopX = face.bounds.origin.x + face.bounds.size.width;
//        stopY = face.bounds.origin.y + face.bounds.size.height;
//        width = face.bounds.size.width;
//        height = face.bounds.size.height;
//
//        int half_width = width>>1;
//        int half_height = height>>1;
//        startX -= half_width;
//        startY -= half_height;
//        stopX += half_width;
//        stopY += half_height;
//
//        if (startX < 0) startX = 0;
//        if (startY < 0) startY = 0;
//        if (stopX > rotateImg.size.width) stopX = rotateImg.size.width;
//        if (stopY > rotateImg.size.height) stopY = rotateImg.size.height;
//
//        width = stopX - startX;
//        height = stopY - startY;
//
//        CGRect cutRect = CGRectMake(startY, startY, width, height);
//        UIImage* uiImg = [rotateImg imageAtRect:cutRect];
//
//        if (mCapturePosition == AVCaptureDevicePositionBack)
//        {
//          croppedImg = [rotateImg imageAtRect:face.bounds];
//        }
//        else
//        {
//          croppedImg = [rotateImg imageAtRect:CGRectMake(rotateImg.size.width - (face.bounds.origin.x+face.bounds.size.width),
//                                                         face.bounds.origin.y,
//                                                         face.bounds.size.width,
//                                                         face.bounds.size.height)];
//
//        }
////        imageviewtest.frame = CGRectMake(0, 0, croppedImg.size.width, croppedImg.size.height);
////        imageviewtest.image = croppedImg;
//
//        [self NotifyFaceDetected:croppedImg uiImg:uiImg];
//
//        mLastUpdateTime = [[NSDate date] timeIntervalSince1970];
//      }
//
//      if (!mShowDebugInfo)
//        continue;
//
//      [DrawingUtility addRectangle:faceRect
//                            toView:overlayView
//                         withColor:[UIColor redColor]];
//
//      // Mouth
//      if (face.hasBottomMouthPosition) {
//        CGPoint point = [self scaledPoint:face.bottomMouthPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor greenColor]
//                              withRadius:5];
//      }
//      if (face.hasMouthPosition) {
//        CGPoint point = [self scaledPoint:face.mouthPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor greenColor]
//                              withRadius:10];
//      }
//      if (face.hasRightMouthPosition) {
//        CGPoint point = [self scaledPoint:face.rightMouthPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor greenColor]
//                              withRadius:5];
//      }
//      if (face.hasLeftMouthPosition) {
//        CGPoint point = [self scaledPoint:face.leftMouthPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor greenColor]
//                              withRadius:5];
//      }
//
//      // Nose
//      if (face.hasNoseBasePosition) {
//        CGPoint point = [self scaledPoint:face.noseBasePosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor darkGrayColor]
//                              withRadius:10];
//      }
//
//      // Eyes
//      if (face.hasLeftEyePosition) {
//        CGPoint point = [self scaledPoint:face.leftEyePosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor blueColor]
//                              withRadius:10];
//      }
//      if (face.hasRightEyePosition) {
//        CGPoint point = [self scaledPoint:face.rightEyePosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor blueColor]
//                              withRadius:10];
//      }
//
//      // Ears
//      if (face.hasLeftEarPosition) {
//        CGPoint point = [self scaledPoint:face.leftEarPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor purpleColor]
//                              withRadius:10];
//      }
//      if (face.hasRightEarPosition) {
//        CGPoint point = [self scaledPoint:face.rightEarPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor purpleColor]
//                              withRadius:10];
//      }
//
//      // Cheeks
//      if (face.hasLeftCheekPosition) {
//        CGPoint point = [self scaledPoint:face.leftCheekPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor magentaColor]
//                              withRadius:10];
//      }
//      if (face.hasRightCheekPosition) {
//        CGPoint point = [self scaledPoint:face.rightCheekPosition
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        [DrawingUtility addCircleAtPoint:point
//                                  toView:overlayView
//                               withColor:[UIColor magentaColor]
//                              withRadius:10];
//      }
//
//      // Tracking Id.
//      if (face.hasTrackingID) {
//        CGPoint point = [self scaledPoint:face.bounds.origin
//                                   xScale:xScale
//                                   yScale:yScale
//                                   offset:videoBox.origin];
//        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(point.x, point.y, 100, 20)];
//        label.text = [NSString stringWithFormat:@"id: %lu", (unsigned long)face.trackingID];
//        [overlayView addSubview:label];
//      }
//    }
//  });
}

- (void)cleanupVideoProcessing {
  if (self.videoDataOutput) {
    [self.session removeOutput:self.videoDataOutput];
  }
  self.videoDataOutput = nil;
}

- (void)cleanupCaptureSession {
  [self.session stopRunning];
  [self cleanupVideoProcessing];
  self.session = nil;
  [self.previewLayer removeFromSuperlayer];
}

- (void)setupVideoProcessing {
  self.videoDataOutput = [[AVCaptureVideoDataOutput alloc] init];
  NSDictionary *rgbOutputSettings = @{
                                      (__bridge NSString*)kCVPixelBufferPixelFormatTypeKey : @(kCVPixelFormatType_32BGRA)
                                      };
  [self.videoDataOutput setVideoSettings:rgbOutputSettings];
  
  if (![self.session canAddOutput:self.videoDataOutput]) {
    [self cleanupVideoProcessing];
    NSLog(@"Failed to setup video output");
    return;
  }
  [self.videoDataOutput setAlwaysDiscardsLateVideoFrames:YES];
  [self.videoDataOutput setSampleBufferDelegate:self queue:self.videoDataOutputQueue];
  [self.session addOutput:self.videoDataOutput];
}

- (void)setupCameraPreview {
  self.previewLayer = [[AVCaptureVideoPreviewLayer alloc] initWithSession:self.session];
  [self.previewLayer setBackgroundColor:[[UIColor whiteColor] CGColor]];
  [self.previewLayer setVideoGravity:AVLayerVideoGravityResizeAspectFill];
  CALayer *rootLayer = [placeHolder layer];
  [rootLayer setMasksToBounds:YES];
  [self.previewLayer setFrame:[rootLayer bounds]];
  [rootLayer addSublayer:self.previewLayer];
}

- (void)updateCameraSelection {
  [self.session beginConfiguration];
  
  // Remove old inputs
  NSArray *oldInputs = [self.session inputs];
  for (AVCaptureInput *oldInput in oldInputs) {
    [self.session removeInput:oldInput];
  }
  
  AVCaptureDevicePosition desiredPosition = mCapturePosition;
  AVCaptureDeviceInput *input = [self cameraForPosition:desiredPosition];
  if (!input) {
    // Failed, restore old inputs
    for (AVCaptureInput *oldInput in oldInputs) {
      [self.session addInput:oldInput];
    }
  } else {
    // Succeeded, set input and update connection states
    [self.session addInput:input];
  }
  [self.session commitConfiguration];
}

- (AVCaptureDeviceInput *)cameraForPosition:(AVCaptureDevicePosition)desiredPosition {
  for (AVCaptureDevice *device in [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo]) {
    if ([device position] == desiredPosition) {
      NSError *error = nil;
      AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:device
                                                                          error:&error];
      if ([self.session canAddInput:input]) {
        return input;
      }
    }
  }
  return nil;
}

- (void) Start {
  // Set up default camera settings.
  self.session = [[AVCaptureSession alloc] init];
  self.session.sessionPreset = AVCaptureSessionPresetMedium;

  [self updateCameraSelection];
  
  // Setup video processing pipeline.
  [self setupVideoProcessing];
  
  // Setup camera preview.
  [self setupCameraPreview];
  
  // Initialize the face detector.
//  NSDictionary *options = @{
//                            GMVDetectorFaceMinSize : @(0.3),
//                            GMVDetectorFaceTrackingEnabled : @(YES),
////                            GMVDetectorFaceMode : @(GMVDetectorFaceFastMode),
//                            GMVDetectorFaceLandmarkType : @(GMVDetectorFaceLandmarkAll)
//                            };
//  self.faceDetector = [GMVDetector detectorOfType:GMVDetectorTypeFace options:options];
  
  [self.session startRunning];
}

- (void) Stop {
  [self.session stopRunning];
}

- (void) SetFacingFront:(BOOL)isFacingFront {
  
  [self Stop];
  
  if (isFacingFront)
    mCapturePosition = AVCaptureDevicePositionFront;
  else
    mCapturePosition = AVCaptureDevicePositionBack;
  
  [self Start];
}

- (void) EnableDebugInfo:(BOOL)isEnable {
  mShowDebugInfo = isEnable;
}

- (BOOL) NotifyFaceDetected:(UIImage*)img uiImg:(UIImage*)img2 {
  BOOL ret = NO;
  
  NSData* raw_data = UIImagePNGRepresentation(img);
  NSData* base64Encoded = [raw_data base64EncodedDataWithOptions:0];
  NSString* result = [[NSString alloc] initWithData:base64Encoded encoding:NSUTF8StringEncoding];  
  
  NSData* raw_data2 = UIImagePNGRepresentation(img2);
  NSData* base64Encoded2 = [raw_data2 base64EncodedDataWithOptions:0];
  NSString* result2 = [[NSString alloc] initWithData:base64Encoded2 encoding:NSUTF8StringEncoding];
  
  NSMutableDictionary* dict = [[NSMutableDictionary alloc] init];
  [dict setObject:@"FaceDetected" forKey:@"caller"];
  [dict setObject:result forKey:@"image"];
  [dict setObject:result2 forKey:@"image2"];
  [self.delegate sentNativeEvent:self event:dict];
  
//  if ([SystemUtility SaveImageToAlbum:@"FaceTracker" image:croppedImg]) {
  
  return ret;
}

- (NSMutableArray *)layers
{
  if (!_layers) {
    _layers = [NSMutableArray array];
  }
  return _layers;
}

@end

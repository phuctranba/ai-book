#import "AppDelegate.h"
#import <Firebase.h>
#import "RNBootSplash.h" // <- add the header import
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>
#import <FBSDKCoreKit/FBSDKCoreKit-swift.h>
#import <FBAEMKit/FBAEMKit.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  [[FBSDKApplicationDelegate sharedInstance] application:application
                             didFinishLaunchingWithOptions:launchOptions];
  self.moduleName = @"ai_chat";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:self.window.rootViewController.view]; // <- initialization using the storyboard file name
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

- (BOOL)application:(UIApplication *)application
openURL:(NSURL *)url
options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  [FBAEMReporter configureWithNetworker:nil appID:@"530536282528491" reporter:nil]; // Replace {app-id} with your Facebook App id
  [FBAEMReporter enable];
  [FBAEMReporter handleURL:url];
  return [RCTLinkingManager application:application openURL:url options:options] || [[FBSDKApplicationDelegate sharedInstance]application:application openURL:url options:options];
}

@end

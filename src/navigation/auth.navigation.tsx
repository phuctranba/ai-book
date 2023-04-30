import React from 'react';

import { createStackNavigator, StackNavigationProp, TransitionPresets } from '@react-navigation/stack';
import LoginScreen from 'screens/login/login.screen';

export type AuthenticateStackList = {
  "NAVIGATION_LOGIN_SCREEN": undefined;
};

export type AuthenticateNavigationProp =
  StackNavigationProp<AuthenticateStackList>;

const NativeStack = createStackNavigator<AuthenticateStackList>();

/**
 * If you need to add normal screens, add it in Authenticate
 */
const AuthenticateNavigator = () => {
  return (
    <NativeStack.Navigator
      initialRouteName={"NAVIGATION_LOGIN_SCREEN"}
      screenOptions={{
        gestureEnabled: false,
        ...TransitionPresets.SlideFromRightIOS
      }}
    >
      <NativeStack.Screen
        name={"NAVIGATION_LOGIN_SCREEN"}
        component={LoginScreen}
        options={() => ({
          headerShown: false
        })}
      />

    </NativeStack.Navigator>
  );
};

export default AuthenticateNavigator;

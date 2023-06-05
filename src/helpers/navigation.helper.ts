import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef()

// @ts-ignore
const navigate = (name, params?) => {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
}

const goBack = () => {
  if (navigationRef.isReady()) {
    try {
      // @ts-ignore
      navigationRef.goBack();
    } catch (error) {
      replace("NAVIGATION_MAIN")
    }
  }
}

const getRouteName = () => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name
  }
  return ""
}

const getActiveRouteName = (state) => {
  const route = state?.routes?.[state.index];

  if (route?.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route?.name;
}

const replace = (name, params = {}) => {
  if (navigationRef.isReady() && getRouteName() !== name) {
    navigationRef.dispatch(StackActions.replace(name, params))
  }
}

export default {
  navigate,
  getRouteName,
  goBack,
  getActiveRouteName,
  replace
}

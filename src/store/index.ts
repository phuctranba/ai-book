import { combineReducers } from 'redux';
import home from './reducer/home.reducer.store';
import system from './reducer/system.reducer.store';
import user from './reducer/user.reducer.store';
import nativeAds from './reducer/nativeAds.reducer.store';
import control from './reducer/control.reducer.store';

/**
 * Reg and import store from here ...
 */

const rootReducer = combineReducers({
  system,
  home,
  user,
  nativeAds,
  control
});

export default rootReducer;

export type RootReducer = ReturnType<typeof rootReducer>

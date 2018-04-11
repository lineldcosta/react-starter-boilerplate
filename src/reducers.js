/**
 * The root reducer.
 */

import { combineReducers } from 'redux';
import routeReducer from 'react-router-redux/reducer';
import globalReducer from 'containers/App/reducer';

export default function createReducer(asyncReducers) {
  return combineReducers({
    route: routeReducer,
    global: globalReducer,
    ...asyncReducers,
  });
}

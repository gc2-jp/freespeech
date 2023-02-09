import { combineReducers } from 'redux-immutable';

import point from './point';
import purchases from './purchases';

const reducers = {
  point,
  purchases,
};

export default combineReducers(reducers);

import { Map as ImmutableMap } from 'immutable';

import { SET_PURCHASE_STATUS } from '../actions';

const initialState = ImmutableMap({
  enabled: false,
});

export default function gc2Ad(state = initialState, action) {
  switch (action.type) {
  case SET_PURCHASE_STATUS:
    return state.set('enabled', !action.purchased);
  default:
    return state;
  }
}

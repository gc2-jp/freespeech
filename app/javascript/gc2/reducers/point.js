import { Map as ImmutableMap } from 'immutable';

import {
  GET_POINT_STATUS_REQUEST,
  GET_POINT_STATUS_SUCCESS,
  GET_POINT_STATUS_FAILURE,
  POST_CUSTOM_MESSAGE_REQUEST,
  POST_CUSTOM_MESSAGE_SUCCESS,
  POST_CUSTOM_MESSAGE_FAILURE,
} from '../actions';

/**
 * @typedef PointDataState
 * @property {boolean} isFetching
 * @property {boolean} isPosted
 * @property {number} point
 * @property {Error|null} error
 */

const initialState = ImmutableMap({
  isFetching: false,
  isPosted: false,
  point: 0,
  error: null,
});

export default function point(state = initialState, action) {
  switch (action.type) {
  case GET_POINT_STATUS_REQUEST:
    return state.merge({
      isFetching: true,
      isPosted: false,
    });
  case GET_POINT_STATUS_SUCCESS:
    return state.merge({
      isFetching: false,
      point: action.point,
    });
  case GET_POINT_STATUS_FAILURE:
    return state.merge({
      isFetching: false,
      error: action.error,
    });
  case POST_CUSTOM_MESSAGE_REQUEST:
    return state.set('isFetching', true);
  case POST_CUSTOM_MESSAGE_SUCCESS:
    return state.merge({
      isFetching: false,
      isPosted: true,
      point: action.point,
    });
  case POST_CUSTOM_MESSAGE_FAILURE:
    return state.merge({
      isFetching: false,
      error: action.error,
    });
  default:
    return state;
  }
}

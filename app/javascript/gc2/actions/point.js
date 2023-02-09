import api from '../../mastodon/api';

const toSnake = (str) => str.split(/(?=[A-Z])/).join('_').toLowerCase();

/**
 * 
 * @param {Record<string, any>} params
 * @returns {Record<string, any>}
 */
const convertParams = (params) => Object.entries(params).reduce((p, [k, v]) => ({ ...p, [toSnake(k)]: v }), {});

export const GET_POINT_STATUS_REQUEST = 'GET_POINT_STATUS_REQUEST';
export const getPointStatusRequest = () => ({
  type: GET_POINT_STATUS_REQUEST,
});

export const GET_POINT_STATUS_SUCCESS = 'GET_POINT_STATUS_SUCCESS';
/**
 * @param {number} point
 * @returns
 */
export const getPointStatusSuccess = (point) => ({
  type: GET_POINT_STATUS_SUCCESS,
  point,
});

export const GET_POINT_STATUS_FAILURE = 'GET_POINT_STATUS_FAILURE';
export const getPointStatusFailure = (error) => ({
  type: GET_POINT_STATUS_FAILURE,
  error,
});

export function fetchPointStatus() {
  return async (dispatch, getState) => {
    try {
      dispatch(getPointStatusRequest());
      const response = await api(getState).get('/api/v1/gc2/account/point');
      dispatch(getPointStatusSuccess(response.data.point));
    } catch (e) {
      dispatch(getPointStatusFailure(e));
    }
  };
}

/**
 * Post Custom Message Actions
 */

export const POST_CUSTOM_MESSAGE_REQUEST = 'POST_CUSTOM_MESSAGE_REQUEST';
export const postCustomMessageRequest = () => ({
  type: POST_CUSTOM_MESSAGE_REQUEST,
});

export const POST_CUSTOM_MESSAGE_SUCCESS = 'POST_CUSTOM_MESSAGE_SUCCESS';
/**
 * @param {number} point
 * @returns
 */
export const postCustomMessageSuccess = (point) => ({
  type: POST_CUSTOM_MESSAGE_SUCCESS,
  point,
});

export const POST_CUSTOM_MESSAGE_FAILURE = 'POST_CUSTOM_MESSAGE_FAILURE';
export const postCustomMessageFailure = (error) => ({
  type: POST_CUSTOM_MESSAGE_FAILURE,
  error,
});

/**
 * @typedef PostCustomMessageParams
 * @property {string} roomId
 * @property {string} text
 * @property {number} point
 */

/**
 * @typedef PostCustomMessageResponse
 * @property {number} point
 */

/**
 * @param {PostCustomMessageParams} params
 */
export function postCustomMessage(params) {
  return async (dispatch, getState) => {
    try {
      dispatch(postCustomMessageRequest());
      /** @type {{ data: PostCustomMessageResponse}} */
      const response = await api(getState).post('/api/v1/gc2/livechat/message', convertParams(params));
      dispatch(postCustomMessageSuccess(response.data.point));
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(postCustomMessageSuccess(0));
      // dispatch(postCustomMessageFailure(new Error('test')));
    } catch (e) {
      dispatch(postCustomMessageFailure(e));
    }
  };
}

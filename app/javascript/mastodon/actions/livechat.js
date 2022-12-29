import api from 'mastodon/api';
import { showAlertForError } from 'mastodon/actions/alerts';
import resizeImage from '../utils/resize_image';

export const LIVECHAT_SET_TITLE = 'LIVECHAT_SET_TITLE';
export const LIVECHAT_CLEAR_ALL = 'LIVECHAT_CLEAR_ALL';
export const LIVECHAT_CLEAR_THUMBNAIL = 'LIVECHAT_CLEAR_THUMBNAIL';

export function setTitle(roomId, title, description, thumbnail, thumbnail_id, statusId) {
  return{
    type: LIVECHAT_SET_TITLE,
    roomId,
    title,
    description,
    thumbnail,
    thumbnail_id,
    statusId,
  };
};

export function clearRoomInfo() {
  return{
    type: LIVECHAT_CLEAR_ALL,
  };
};

export function clearThumbnail() {
  return{
    type: LIVECHAT_CLEAR_THUMBNAIL,
  };
};

// livechat_controller.rb#create
export const createRoom = (params, onSuccess, onFail) => (dispatch, getState) => {
  dispatch(clearRoomInfo());
  // dispatch(createRoomRequest());
  api(getState).post('/api/v1/livechat', params).then(({ data }) => {
    // dispatch(createRoomSuccess(data));
    if (onSuccess) onSuccess(data);
  }).catch(error => {
    // dispatch(createRoomFail(error));
    if (onFail) onFail(error);
    dispatch(showAlertForError(error));
  });
};

// livechat_controller.rb#update
export const updateRoom = (roomId, params) => (dispatch, getState) => {
  // dispatch(updateRoomRequest());
  api(getState).put(`/api/v1/livechat/${roomId}`, params).then(({ data }) => {
    console.log(data);
    // dispatch(updateRoomSuccess(data));
  }).catch(error => {
    console.error(error);
    // dispatch(updateRoomFail(error));
    dispatch(showAlertForError(error));
  });
};

// livechat_controller.rb#show
export const showRoom = (roomId, params) => (dispatch, getState) => {
  // dispatch(showRoomRequest());
  api(getState).get(`/api/v1/livechat/${roomId}`, params).then(({ data }) => {
    console.log(data);
    // dispatch(showRoomSuccess(data));
  }).catch(error => {
    console.error(error);
    // dispatch(showRoomFail(error));
    dispatch(showAlertForError(error));
  });
};

export const getAvailableRoom = (params, onSuccess, onFail) => (dispatch, getState) => {
  api(getState).get('/api/v1/livechat/available_room').then(({ data }) => {
    if (onSuccess) onSuccess(data);
  }).catch(error => {
    if (onFail) onFail(error);
    dispatch(showAlertForError(error, true));
  });
};

export const LIVECHAT_UPLOAD_REQUEST  = 'LIVECHAT_UPLOAD_REQUEST';
export const LIVECHAT_UPLOAD_SUCCESS  = 'LIVECHAT_UPLOAD_SUCCESS';
export const LIVECHAT_UPLOAD_FAIL     = 'LIVECHAT_UPLOAD_FAIL';
export const LIVECHAT_UPLOAD_PROGRESS = 'LIVECHAT_UPLOAD_PROGRESS';

export function uploadComposeRequest() {
  return {
    type: LIVECHAT_UPLOAD_REQUEST,
    skipLoading: true,
  };
};

export function uploadComposeProgress(loaded, total) {
  return {
    type: LIVECHAT_UPLOAD_PROGRESS,
    loaded: loaded,
    total: total,
  };
};

export function uploadComposeSuccess(media, file) {
  return {
    type: LIVECHAT_UPLOAD_SUCCESS,
    media: media,
    file: file,
    skipLoading: true,
  };
};

export function uploadComposeFail(error) {
  return {
    type: LIVECHAT_UPLOAD_FAIL,
    error: error,
    skipLoading: true,
  };
};

export function uploadCompose(files) {
  return function (dispatch, getState) {
    const roomId  = getState().getIn(['livechat', 'roomId']);
    const progress = new Array(files.length).fill(0);
    let total = Array.from(files).reduce((a, v) => a + v.size, 0);

    dispatch(uploadComposeRequest());

    for (const [i, f] of Array.from(files).entries()) {

      resizeImage(f).then(file => {
        const data = new FormData();
        data.append('file', file);
        // Account for disparity in size of original image and resized data
        total += file.size - f.size;

        return api(getState).post('/api/v2/media', data, {
          onUploadProgress: function({ loaded }){
            progress[i] = loaded;
            dispatch(uploadComposeProgress(progress.reduce((a, v) => a + v, 0), total));
          },
        }).then(({ status, data }) => {
          // If server-side processing of the media attachment has not completed yet,
          // poll the server until it is, before showing the media attachment as uploaded

          if (status === 200) {
            dispatch(updateRoom(roomId, { thumbnail: data.preview_url, thumbnail_id: data.id }));
            dispatch(uploadComposeSuccess(data, f));
          } else if (status === 202) {
            let tryCount = 1;
            const poll = () => {
              api(getState).get(`/api/v1/media/${data.id}`).then(response => {
                if (response.status === 200) {
                  dispatch(updateRoom(roomId, { thumbnail: data.preview_url, thumbnail_id: data.id }));
                  dispatch(uploadComposeSuccess(response.data, f));
                } else if (response.status === 206) {
                  let retryAfter = (Math.log2(tryCount) || 1) * 1000;
                  tryCount += 1;
                  setTimeout(() => poll(), retryAfter);
                }
              }).catch(error => dispatch(uploadComposeFail(error)));
            };

            poll();
          }
        });
      }).catch(error => dispatch(uploadComposeFail(error)));
    };
  };
};

export const getPushStreamUrl = (roomId, onSuccess, onFail) => (dispatch, getState) => {
  api(getState).get(`/api/v1/avl/push_stream_info/${roomId}`).then(({ data }) => {
    if (onSuccess) onSuccess(data);
  }).catch(error => {
    console.error(error);
    if (onFail) onFail(error);
  });
};

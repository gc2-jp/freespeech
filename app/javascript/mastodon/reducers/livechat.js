import {
  LIVECHAT_SET_TITLE,
  LIVECHAT_CLEAR_ALL,
  LIVECHAT_CLEAR_THUMBNAIL,
  LIVECHAT_UPLOAD_REQUEST,
  LIVECHAT_UPLOAD_SUCCESS,
  LIVECHAT_UPLOAD_FAIL,
  LIVECHAT_UPLOAD_PROGRESS,
} from '../actions/livechat';
import { Map as ImmutableMap } from 'immutable';
import uuid from '../uuid';

const initialState = ImmutableMap({
  // mounted: 0,
  // sensitive: false,
  // spoiler: false,
  // spoiler_text: '',
  // privacy: null,
  statusId: null,
  roomId: null,
  title: null,
  description: null,
  thumbnail: null,
  thumbnail_id: null,
  // text: '',
  // focusDate: null,
  // caretPosition: null,
  // preselectDate: null,
  // in_reply_to: null,
  // is_composing: false,
  // is_submitting: false,
  // is_changing_upload: false,
  is_uploading: false,
  progress: 0,
  // isUploadingThumbnail: false,
  // thumbnailProgress: 0,
  // media_attachments: ImmutableList(),
  // pending_media_attachments: 0,
  // poll: null,
  // suggestion_token: null,
  // suggestions: ImmutableList(),
  // default_privacy: 'public',
  // default_sensitive: false,
  // default_language: 'en',
  resetFileKey: Math.floor((Math.random() * 0x10000)),
  idempotencyKey: null,
  // tagHistory: ImmutableList(),
  // media_modal: ImmutableMap({
  //   id: null,
  //   description: '',
  //   focusX: 0,
  //   focusY: 0,
  //   dirty: false,
  // }),
});

export default function livechat(state = initialState, action) {
  switch(action.type) {
  case LIVECHAT_SET_TITLE:
    return state.withMutations(map => {
      map.set('roomId', action.roomId);
      map.set('title', action.title);
      map.set('description', action.description);
      map.set('thumbnail', action.thumbnail);
      map.set('thumbnail_id', action.thumbnail_id);
      map.set('statusId', action.statusId);
      map.set('idempotencyKey', uuid());
    });
  case LIVECHAT_CLEAR_ALL:
    return state.withMutations(map => {
      map.set('roomId', null);
      map.set('title', null);
      map.set('description', null);
      map.set('thumbnail', null);
      map.set('thumbnail_id', null);
      map.set('statusId', null);
      map.set('idempotencyKey', uuid());
    });
  case LIVECHAT_CLEAR_THUMBNAIL:
    return state.withMutations(map => {
      map.set('thumbnail', null);
      map.set('thumbnail_id', null);
      map.set('idempotencyKey', uuid());
    });
  case LIVECHAT_UPLOAD_REQUEST:
    return state.withMutations(map => {
      map.set('thumbnail', null);
      map.set('thumbnail_id', null);
      map.set('is_uploading', true);
    });
  case LIVECHAT_UPLOAD_SUCCESS:
    return state.withMutations(map => {
      map.set('is_uploading', false);
      map.set('resetFileKey', Math.floor((Math.random() * 0x10000)));
      map.set('idempotencyKey', uuid());
    });
  case LIVECHAT_UPLOAD_FAIL:
    return state.set('is_uploading', false);
  case LIVECHAT_UPLOAD_PROGRESS:
    return state.set('progress', Math.round((action.loaded / action.total) * 100));
  default:
    return state;
  }
};

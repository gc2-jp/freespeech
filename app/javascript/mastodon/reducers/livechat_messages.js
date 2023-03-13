import { Map as ImmutableMap } from 'immutable';
import { IMPORT_LIVECHAT_MESSAGE } from 'mastodon/actions/livechat_messages';

/** @typedef {Immutable.Record<import('mastodon/features/livechat/components/firebaseapp').Message>} Message */

/** @typedef {Immutable.Map<string, Message>} LivechatMessageState */

const initialState = ImmutableMap();

/**
 * @param {LivechatMessageState} state
 * @param {Message} message
 * @returns {LivechatMessageState}
 */
const importMessage = (state, message) => state.set(message.get('key'), message);

/**
 * @param {LivechatMessageState} state
 * @param {*} action
 * @returns {LivechatMessageState}
 */
export default function livechatMessages(state = initialState, action) {
  switch (action.type) {
  case IMPORT_LIVECHAT_MESSAGE:
    return importMessage(state, action.message);
  default:
    return state;
  }
}

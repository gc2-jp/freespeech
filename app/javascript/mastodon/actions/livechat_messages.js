export const IMPORT_LIVECHAT_MESSAGE = 'IMPORT_LIVECHAT_MESSAGE';

export function importMessage(message) {
  return { type: IMPORT_LIVECHAT_MESSAGE, message };
}

/* eslint-disable import/no-extraneous-dependencies */
import { firebaseDatabaseURL } from 'mastodon/initial_state';
import { initializeApp } from 'firebase/app';
import { getDatabase } from '@firebase/database';

export const firebaseApp = initializeApp({ databaseURL: firebaseDatabaseURL });
export const firebaseDb = getDatabase(firebaseApp);

export * from '@firebase/database';

/**
 * @typedef Room
 * @property {string} key
 * @property {string} user_id
 * @property {string} acct
 * @property {string} display_name
 * @property {string} avatar
 * @property {number} created_at
 * @property {number} published_at
 * @property {number} ping_at
 * @property {number} end_at
 * @property {string} title
 * @property {string} description
 * @property {string} description_html
 * @property {string} thumbnail
 * @property {string} thumbnail_id
 * @property {string} stream_name
 * @property {string} m3u8_pull_url
 * @property {string} rtmp_pull_url
 * @property {string} watching
 * @property {string} watched
 */

/**
 * @typedef Message
 * @property {string} key
 * @property {string} user_id
 * @property {string} acct
 * @property {string} display_name
 * @property {string} avatar
 * @property {number} created_at
 * @property {string} text
 */

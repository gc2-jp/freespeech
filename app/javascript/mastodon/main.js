import * as registerPushNotifications from './actions/push_notifications';
import { setupBrowserNotifications } from './actions/notifications';
import { default as Mastodon, store } from './containers/mastodon';
import React from 'react';
import ReactDOM from 'react-dom';
import ready from './ready';

const perf = require('./performance');

function main() {
  perf.start('main()');

  if (window.history && history.replaceState) {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    if (!(/^\/web($|\/)/).test(path)) {
      history.replaceState(null, document.title, `/web${path}`);
    }
  }

  ready(() => {
    const mountNode = document.getElementById('mastodon');
    const props = JSON.parse(mountNode.getAttribute('data-props'));

    ReactDOM.render(<Mastodon {...props} />, mountNode);
    store.dispatch(setupBrowserNotifications());
    if (process.env.NODE_ENV === 'production') {
      // avoid offline in dev mode because it's harder to debug
      require('offline-plugin/runtime').install();
      store.dispatch(registerPushNotifications.register());
    }
    perf.stop('main()');
  });
}

export default main;


const sleep = function(msec){
  return new Promise(function(resolve) {
    setTimeout(function() {resolve()}, 1000*msec);
  })
};

window.onload = async function() {
  let ComposeFormList = document.getElementsByClassName("compose-form");
  while (ComposeFormList.length == 0){
    sleep(1);
  }
  let AdElement = document.createElement("div");
  AdElement.classList.add('ad_ad1')
  ComposeFormList[0].appendChild(AdElement);
};
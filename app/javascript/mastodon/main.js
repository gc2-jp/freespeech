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

const AdList = {
  "ad_0":[
    {
      "link":"https://www.skyphone.jp/",
      "img":"/ad/skyphone.jp_250_50.jpg",
    },
    {
      "link":"https://erovideosearch.com/",
      "img":"/ad/erovideosearch.com_250_50.jpg",
    },
  ],
  "ad_1":[
    {
      "link":"https://www.skyphone.jp/",
      "img":"/ad/skyphone.jp_728_90.jpg",
    },
    {
      "link":"https://erovideosearch.com/",
      "img":"/ad/erovideosearch.com_728_90.jpg",
    },
  ],
};

(async () => {
  let ComposeFormList = document.getElementsByClassName("compose-form");
  while (ComposeFormList.length == 0){
    await sleep(0.1);
  }
  let AdElement = document.createElement("div");
  AdElement.id = "ad_0";
  AdElement.classList.add('EleAd0');
  ComposeFormList[0].appendChild(AdElement);

  let ad = AdList["ad_0"][Math.floor(Math.random() * AdList["ad_0"].length)];

  AdElement.innerHTML = `
    <div class='EleAd0_inner'>
      <a href="${ad["link"]}"><img src="${ad["img"]}"></a>
    </div>
  `;
})();

(async () => {
  let TweetListEleList = document.getElementsByClassName("item-list");
  while (TweetListEleList.length == 0){
    await sleep(0.1);
  }
  let TweetList = (TweetListEleList[0]).children;
  while (TweetList.length == 0){
    await sleep(0.1);
  }

  while (true){
    try{
      let AdIndex = 0;
      let TweetListEleList = document.getElementsByClassName("item-list");
      let TweetList = Array.from((TweetListEleList[0]).children);
      let count = 0;
      for (let index in TweetList){
        let EleTweet = TweetList[index];

        if (EleTweet.tagName.toLowerCase() != "article"){
          continue;
        }

        if (count%10 == 0){
          let AdElement = document.createElement("div");
          AdElement.id = `ad_1_${AdIndex}`;
          AdElement.classList.add(`EleAd1`);

          let ad = AdList["ad_1"][Math.floor(Math.random() * AdList["ad_1"].length)];

          AdElement.innerHTML = `
            <div class='EleAd1_inner'>
              <a href="${ad["link"]}"><img src="${ad["img"]}"></a>
            </div>
          `;
          EleTweet.before(AdElement);
          AdIndex = AdIndex + 1;
        }
        count = count + 1;
      }
      count = 0;
      while (count < 60){
        let AdEleList = document.getElementsByClassName("EleAd1");
        if (AdEleList.length == 0 && count >= 1){
          break;
        }
        count = count + 1;
        await sleep(1);
      }
      let EleAdList = Array.from(document.getElementsByClassName("EleAd1"));
      for (let index in EleAdList){
        let EleAd = EleAdList[index];

        EleAd.remove();
      }
    }catch(e){
      console.log(e);
    }finally{
      await sleep(0.1);
    }
  };
})();

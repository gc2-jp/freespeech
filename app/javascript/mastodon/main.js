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
  "ad_1":[
    {
      "pctag":`
        <div class='EleAd1_inner'>
         <iframe id='a2e8f4e0' name='a2e8f4e0' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=aa328861&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=aa328861' border='0' alt='' /></a></iframe>
         @Ad
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='ad05adf8' name='ad05adf8' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=af9f3ae1&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=af9f3ae1' border='0' alt='' /></a></iframe>
          @Ad
        </div>
      `,
      "EleAd":null,
    },
    {
      "pctag":`
        <div class='EleAd1_inner'>
          <iframe id='aab6f898' name='aab6f898' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=aeca92ee&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=aeca92ee' border='0' alt='' /></a></iframe>
          @Ad
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='aece51c1' name='aece51c1' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=ab7b2dc2&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=ab7b2dc2' border='0' alt='' /></a></iframe>
          @Ad
        </div>
      `,
       "EleAd":null,
    },
    {
      "pctag":`
        <div class='EleAd1_inner'>
          <iframe id='ad05adf8' name='ad05adf8' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=af9f3ae1&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=af9f3ae1' border='0' alt='' /></a></iframe>
          @Ad
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='ae7fc7d0' name='ae7fc7d0' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=a84994b6&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a84994b6' border='0' alt='' /></a></iframe>
          @Ad
        </div>
      `,
       "EleAd":null,
    },
  ],
};
(async () => {
  let TweetListEleList = document.getElementsByClassName("item-list");
  while (TweetListEleList.length == 0){
    await sleep(0.1);
  }
  let TweetList = (TweetListEleList[0]).children;
  while (TweetList.length == 0){
    await sleep(0.1);
  }



  //初期生成
  for (let index in AdList["ad_1"]){
    let AdData = AdList["ad_1"][index];

    let EleAd = document.createElement("div");
    EleAd.id = `ad_1_${index}`;
    EleAd.classList.add(`EleAd1`);
    if (window.innerWidth > 895){
     EleAd.innerHTML = AdData["pctag"];
    }else{
      EleAd.innerHTML = AdData["sptag"];
    }
    AdData["EleAd"] = EleAd;
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
          EleTweet.before(AdList["ad_1"][AdIndex]["EleAd"]);
          AdIndex = AdIndex + 1;
          if (AdList["ad_1"].length <= AdIndex){
            break;
          }
        }
        count = count + 1;
      }

      count = 0;
      while (count < 60){
        await sleep(1);
        let AdEleList = document.getElementsByClassName("EleAd1");
        if (AdEleList.length == 0 && count >= 1){
          break;
        }
        count = count + 1;
      }
    }catch(e){
      console.log(e);
    }finally{
      await sleep(0.1);
    };
  };
})();

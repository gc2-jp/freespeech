import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { adBaseUrl } from 'mastodon/initial_state';

const AdList = {
  "ad_0":[
    /*
    {
      "pctag":`
        <div class='EleAd0_inner'>
          <iframe id='acf3b41d' name='acf3b41d' src='${adBaseUrl}/delivery/afr.php?zoneid=8&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='234' height='60' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=ac5f4d45&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=8&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=ac5f4d45' border='0' alt='' /></a></iframe>
        </div>
      `,
    },
    {
      "pctag":`
        <div class='EleAd0_inner'>
          <iframe id='ae55b7ff' name='ae55b7ff' src='${adBaseUrl}/delivery/afr.php?zoneid=9&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='234' height='60' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=ab7db104&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=9&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=ab7db104' border='0' alt='' /></a></iframe>
        </div>
      `,
    },
    */
  ],
  "ad_1":[
    {
      "pctag":`
        <div class='EleAd1_inner'>
          <iframe id='a779d66f' name='a779d66f' src='${adBaseUrl}/delivery/afr.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=afd75643&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=afd75643' border='0' alt='' /></a></iframe>
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='afe1024c' name='afe1024c' src='${adBaseUrl}/delivery/afr.php?zoneid=5&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=a0067565&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=5&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a0067565' border='0' alt='' /></a></iframe>
        </div>
      `,
      "EleAd":null,
    },
    {
      "pctag":`
        <div class='EleAd1_inner'>
          <iframe id='ab4e71e7' name='ab4e71e7' src='${adBaseUrl}/delivery/afr.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=a5d49847&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a5d49847' border='0' alt='' /></a></iframe>
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='a3f1fdab' name='a3f1fdab' src='${adBaseUrl}/delivery/afr.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=a9bb456a&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a9bb456a' border='0' alt='' /></a></iframe>
        </div>
      `,
       "EleAd":null,
    },
    {
      "pctag":`
        <div class='EleAd1_inner'>
          <iframe id='a66cebdd' name='a66cebdd' src='${adBaseUrl}/delivery/afr.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=a171bc86&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a171bc86' border='0' alt='' /></a></iframe>
        </div>
      `,
      "sptag":`
        <div class='EleAd1_inner'>
          <iframe id='a30fc57a' name='a30fc57a' src='${adBaseUrl}/delivery/afr.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='${adBaseUrl}/delivery/ck.php?n=a179b21b&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='${adBaseUrl}/delivery/avw.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a179b21b' border='0' alt='' /></a></iframe>
        </div>
      `,
       "EleAd":null,
    },
  ],
};

class AdMonitor extends React.Component {

  static propTypes = {
    fetchSubscription: PropTypes.func,
    enabled: PropTypes.bool,
  };

  constructor(...args) {
    super(...args);
    this.setupAdElement();
  }

  componentDidMount() {
    const { fetchSubscription } = this.props;
    fetchSubscription();
    this.monitStatuses();
  }

  componentDidUpdate() {
    this.monitStatuses();
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return null;
  }

  setupAdElement() {
    for (let index in AdList["ad_1"]){
      const AdData = AdList["ad_1"][index];

      const EleAd = document.createElement("div");
      EleAd.id = `ad_1_${index}`;
      EleAd.classList.add(`EleAd1`);
      if (window.innerWidth > 895){
        EleAd.innerHTML = AdData["pctag"];
      }else{
        EleAd.innerHTML = AdData["sptag"];
      }

      const inner = EleAd.getElementsByClassName('EleAd1_inner').item(0);
      if (inner) {
        // inner.innerHTML = '<div class="gc2-dummy-ad"><div>TEST</div></div>';
        const footer = document.createElement('div');
        const onClick = e => {
          e.preventDefault();
          this.showAbout();
          return false;
        };
        footer.className = 'footer';
        inner.appendChild(footer);
        ReactDOM.render((
          <>
            <div className='title'>@Ad</div>
            <div className='description'>
              <a href='/about-ad' onClick={onClick}>広告表示について</a>
            </div>
          </>
        ), footer);
      }

      AdData["EleAd"] = EleAd;
    }
  }

  monitStatuses() {
    const { enabled } = this.props;
    clearInterval(this.intervalId);

    if (!enabled) return;

    this.intervalId = setInterval(() => {
      if (this.insertAdContent()) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          let AdEleList = document.getElementsByClassName("EleAd1");
          if (AdEleList.length === 0){
            clearInterval(this.intervalId);
            this.monitStatuses();
          }
        }, 1000);
      }
    }, 100);
  }

  insertAdContent() {
    let AdIndex = 0;
    let TweetListEleList = document.getElementsByClassName("item-list");
    if (TweetListEleList.length === 0) {
      return false;
    }
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
    return true;
  }

  showAbout() {
    const { history } = this.props;
    history.push('/about-ad');
  }

}

export default withRouter(AdMonitor);

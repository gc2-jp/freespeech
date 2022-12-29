import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'mastodon/components/icon';
import imageOBS from 'mastodon/../images/icon_obs.png';
import Button from 'mastodon/components/button';

export default
class LivechatRTMP extends React.Component {

  static contextTypes = {
    router: PropTypes.object,
  };

  handleRTMPClick = () => {
    this.context.router.history.push('/livechat/rtmp');
  }

  handleWebRTCClick = () => {
    this.context.router.history.push('/livechat/webrtc');
  }

  render () {
    return (
      <div className='livechat-choose'>
        <Button onClick={this.handleRTMPClick}>
          <img src={imageOBS} alt='' />
          <div>OBS Studio (RTMP)</div>
        </Button>
        <Button onClick={this.handleWebRTCClick}>
          <Icon id='chrome' className='icon' />
          <div>Browser (WebRTC)</div>
        </Button>
      </div>
    );
  }

}

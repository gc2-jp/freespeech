import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'mastodon/components/icon';
import imageOBS from 'mastodon/../images/icon_obs.png';
import Button from 'mastodon/components/button';
import { createRoom, getAvailableRoom } from 'mastodon/actions/livechat';
import { showAlert } from 'mastodon/actions/alerts';

export default @connect()
class LivechatStart extends React.Component {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  handleRTMPClick = () => {
    // first check is there is available ('not ended') room for current user
    this.props.dispatch(getAvailableRoom({},
      (room) => {
        this.context.router.history.push('/livechat/rtmp/' + room.key);
      },
      (err) => {
        // there is no available room so create a new one
        this.props.dispatch(createRoom({},
          (room) => {
            this.context.router.history.push('/livechat/rtmp/' + room.key);
          },
          (err) => {
            console.error('err=', err);
          },
        ));
      },
    ));
  }

  handleWebRTCClick = () => {
    // first check is there is available ('not ended') room for current user
    this.props.dispatch(getAvailableRoom({},
      (room) => {
        this.context.router.history.push('/livechat/webrtc/' + room.key);
      },
      (err) => {
        // there is no available room so create a new one
        this.props.dispatch(createRoom({},
          (room) => {
            this.context.router.history.push('/livechat/webrtc/' + room.key);
          },
          (err) => {
            console.error('err=', err);
          },
        ));
      },
    ));
  }

  render () {
    return (
      <div className='livechat-choose'>
        <Button onClick={this.handleRTMPClick}>
          <img src={imageOBS} alt=''/>
          <div>OBS Studio (RTMP)</div>
          <div>GC2Pub (ARTC)</div>
        </Button>
        <Button onClick={this.handleWebRTCClick}>
          <Icon id='chrome' className='icon' />
          <div>Browser (WebRTC)</div>
        </Button>
      </div>
    );
  }

}

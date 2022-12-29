import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { me } from 'mastodon/initial_state';
import TabsBar from '../../ui/components/tabs_bar';
import Button from 'mastodon/components/button';
import Icon from 'mastodon/components/icon';
import { makeGetStatus } from '../../../selectors';
import ChatArea from '../components/chatarea';
import { firebaseDb, ref, onValue, query, orderByChild, equalTo, update, serverTimestamp } from '../components/firebaseapp';
import Hls from 'hls.js';
import RelativeTimestamp from 'mastodon/components/relative_timestamp';
import { showRoom } from 'mastodon/actions/livechat';
import Avatar from 'mastodon/components/avatar';
import DisplayName from 'mastodon/components/display_name';
import { fetchStatus } from 'mastodon/actions/statuses';

const messages = defineMessages({
  heading: { id: 'column.livechat', defaultMessage: 'Livechat' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, props) => {
    const status = getStatus(state, { id: props.params.statusId });
    return {
      status,
      domain: state.getIn(['meta', 'domain']),
      myAccount: state.getIn(['accounts', me]),
    };
  };

  return mapStateToProps;
};

export default @injectIntl
@connect(makeMapStateToProps)
class LivechatViewer extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    myAccount: ImmutablePropTypes.map.isRequired,
    dispatch: PropTypes.func.isRequired,
    status: ImmutablePropTypes.map,
  };

  constructor(props) {
    super(props);
    this.state = {
      roomId: null,
      title: null,
      description: null,
      created_at: null,
      published_at: null,
      end_at: null,
      user_id: null,
      acct: null,
      avatar: null,
      display_name: null,
      m3u8_pull_url: null,
      m3u8_supported: null,
      watching: 0, // 現在の視聴者数
      watched: 0, // 過去を含むユニーク視聴者数
      player_initialized: false,
      hidden: true, // show_more or less
    };
  }

  componentDidMount = () => {
    this.initFirebase();
    this.props.dispatch(fetchStatus(this.props.params.statusId));
  }

  componentWillUnmount = () => {
    this.onValueUnsubscribe?.();
    this.onValueUnsubscribe = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.onDestroy();
  }

  initFirebase = () => {
    this.roomRef = query(ref(firebaseDb, 'room'), orderByChild('status_id'), equalTo(this.props.params.statusId));

    this.onValueUnsubscribe = onValue(this.roomRef, (snapshot) => {
      snapshot.forEach(c => {
        const roomId = c.key;
        const title = c.val().title;
        const description = c.val().description_html;
        const user_id = c.val().user_id;
        const acct = c.val().acct;
        const display_name = c.val().display_name;
        const avatar = c.val().avatar;
        const created_at = c.val().created_at;
        const published_at = c.val().published_at;
        const end_at = c.val().end_at;
        const m3u8_pull_url = c.val().m3u8_pull_url;
        const watching = c.val().watching ?? 0;
        const watched = c.val().watched ?? 0;
        const { player_initialized } = this.state;

        if (!player_initialized && published_at && !end_at) {
          queueMicrotask(() => {
            this.initHlsClient(m3u8_pull_url);
          });
        }

        if (player_initialized && published_at && end_at) {
          queueMicrotask(() => {
            this.stopHlsClient();
          });
        }

        this.setState({ roomId, title, description, created_at, published_at, end_at, user_id, acct, avatar, display_name, m3u8_pull_url, watching, watched });

        if(!this.pingInterval){
          this.props.dispatch(showRoom(roomId, {}));
          this.watchingRef = ref(firebaseDb, `watching/${roomId}/${this.props.myAccount.get('id')}`);
          this.pingInterval = setInterval(() => {
            update(this.watchingRef, {
              ping_at: serverTimestamp(),
              ping_at_str: (new Date()).toUTCString(),
            });
          }, 30 * 1000);
        }
      });
    });
  }

  initHlsClient = (m3u8_pull_url) => {
    if (this.videoDom) {
      if (this.videoDom.canPlayType('application/vnd.apple.mpegurl')) {
        // native HLS support
        this.videoDom.src = m3u8_pull_url;
        this.setState({ m3u8_supported: true, player_initialized: true });
      } else if (Hls.isSupported()) {
        // fallback to hls.js
        this.hls = new Hls();
        this.hls.loadSource(m3u8_pull_url);
        this.hls.attachMedia(this.videoDom);
        this.setState({ m3u8_supported: true, player_initialized: true });
      } else {
        this.setState({ m3u8_supported: false });
      }
    }
  }

  stopHlsClient = () => {
    if (this.videoDom) {
      if (this.videoDom.canPlayType('application/vnd.apple.mpegurl')) {
        // native HLS support
        this.videoDom.src = null;
        this.setState({ player_initialized: false });
      } else if (Hls.isSupported()) {
        // fallback to hls.js
        this.hls.destroy();
        this.setState({ player_initialized: false });
      }
    }
  }

  setVideoDom = (c) => {
    this.videoDom = c;
  }

  onDestroy = () => {
    if (Hls.isSupported() && this.hls) {
      this.hls.destroy();
    }
  }

  onBack = () => {
    this.context.router.history.push('/livechat');
  }

  handleAccountClick = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey) && this.context.router) {
      e.preventDefault();
      this.context.router.history.push(`/@${this.props.status.getIn(['account', 'acct'])}`);
    }
    e.stopPropagation();
  }

  handleShowMoreClick = (e) => {
    e.preventDefault();
    this.setState({ hidden: !this.state.hidden });
  }

  render() {
    const { status } = this.props;
    const { roomId, title, description, published_at, end_at, hidden } = this.state;

    const published_at_timestamp = new Date(published_at).toString();

    if (status === null || roomId === null) {
      return (
        <>
          {/* <TabsBar key='tabs' /> */}
        </>
      );
    }

    const toggleText = hidden ? <FormattedMessage id='status.show_more' defaultMessage='Show more' /> : <FormattedMessage id='status.show_less' defaultMessage='Show less' />;

    let watcher_description = '';
    if (end_at) {
      watcher_description = (
        <div className='row'>
          <div>{this.state.watching}人が視聴</div>
          <div>&nbsp;</div>
          <div><RelativeTimestamp timestamp={published_at_timestamp} />に配信済み</div>
        </div>
      );
    } else {
      watcher_description = (
        <div className='row'>
          <div>{this.state.watching}人が視聴中</div>
          <div>&nbsp;</div>
          <div><RelativeTimestamp timestamp={published_at_timestamp} />にライブ配信開始</div>
        </div>
      );
    }

    return (
      <>
        {/* <TabsBar key='tabs' /> */}
        <div className='livechat viewer'>
          <div className='info'>
            <div className='simple_form'>
              <div>
                <Button onClick={this.onBack}><Icon id='arrow-left' />&nbsp;ライブチャットに戻る</Button>
              </div>
            </div>
            <div className='player'><video className='video' ref={this.setVideoDom} controls autoPlay muted playsInline /></div>
            <div className='author'>
              <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='detailed-status__display-name'>
                <div className='detailed-status__display-avatar'><Avatar account={status.get('account')} size={48} /></div>
                <DisplayName account={status.get('account')} />
              </a>
            </div>
            <div className='status__content'><div className='status__content__text status__content__text--visible translate'><p>{title}</p></div></div>
            <div className={`description ${hidden ? 'compac_description' : ''}`}>
              {watcher_description}
              <div className='description_html' dangerouslySetInnerHTML={{ __html: description }} />
              <div className='show_more_wrap'>
                <span className='show_more_before'>&nbsp;&nbsp;</span>
                <button className='status__content__spoiler-link show_more' onClick={this.handleShowMoreClick}>{toggleText}</button>
              </div>
            </div>
          </div>
          <ChatArea roomId={roomId} />
        </div>
      </>
    );
  }

}

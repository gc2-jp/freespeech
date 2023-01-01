import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { me } from 'mastodon/initial_state';
import Button from 'mastodon/components/button';
import Icon from 'mastodon/components/icon';
import ChatArea from '../components/chatarea';
import { firebaseDb, ref, onValue, serverTimestamp } from '../components/firebaseapp';
import { setTitle, updateRoom, getPushStreamUrl } from 'mastodon/actions/livechat';
import { FormattedDate } from 'react-intl';
import { AliRTS } from 'aliyun-rts-sdk';
import UploadButtonContainer from '../containers/upload_button_container';
import UploadFormContainer from '../containers/upload_form_container';
import { showAlert } from 'mastodon/actions/alerts';

const mapStateToProps = state => {
  return {
    myAccount: state.getIn(['accounts', me]),
    statusId: state.getIn(['livechat', 'statusId'], null),
    is_uploading: state.getIn(['livechat', 'is_uploading']),
  };
};

const STORAGE_ITEM_CAMERA_MIC = 'storedCameraMic';

export default @connect(mapStateToProps)
class LivechatWebRTC extends React.Component {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    myAccount: ImmutablePropTypes.map.isRequired,
    statusId: PropTypes.string,
    is_uploading: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      title: '', // 入力フォームの値
      description: '', // 入力フォームの値
      thumbnail: null, // サムネイルURL
      thumbnail_id: null, // サムネイルのmedia_attachments ID
      title_on_firebase: '', // firebaseに保存されているタイトル
      description_on_firebase: '', // firebaseに保存されている説明文
      webrtc_push_url: null,
      published_at: null,
      ping_at: null,
      end_at: null,
      rtc_supported: null,
      selected_camera_id: null,
      selected_mic_id: null,
      camera_list: null,
      mic_list: null,
      local_stream_started: false,
      stream_video_enabled: true,
      stream_audio_enabled: true,
      m3u8_pull_url: null,
      watching: 0, // 現在の視聴者数
      watched: 0, // 過去を含むユニーク視聴者数
      publishing_started: false,
    };
  }

  componentDidMount = () => {
    this.getDeviceList();
    this.initFirebase();
    this.initRtsClient();

    window.addEventListener('beforeunload', this.beforeunloadpage);
  }

  componentDidUpdate() {
    if (!this.state.end_at) {
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', this.onpopstate);
    }
  }

  componentWillUnmount = () => {
    this.onValueUnsubscribe?.();
    this.onValueUnsubscribe = null;
    this.onCloseLocalStream();
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    window.removeEventListener('beforeunload', this.beforeunloadpage);
  }

  beforeunloadpage = e => {
    if (!this.state.end_at) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  onpopstate = () => {
    if (!this.state.end_at) {
      window.history.pushState(null, document.title, window.location.href);
    }
  };

  initFirebase = () => {
    this.roomRef = ref(firebaseDb, `room/${this.props.params.roomId}`);

    this.onValueUnsubscribe = onValue(this.roomRef, (snapshot) => {
      const m = snapshot.val();
      // FIXME データが存在しないときと、ルーム作成者ではないときは、別ページにリダイレクト
      if (m) {
        const title = m.title ?? '';
        const description = m.description ?? '';
        const thumbnail = m.thumbnail ?? null;
        const thumbnail_id = m.thumbnail_id ?? null;
        const published_at = m.published_at;
        const ping_at = m.ping_at;
        const end_at = m.end_at;
        const status_id = m.status_id ?? null;
        const m3u8_pull_url = m.m3u8_pull_url ?? null;
        const watching = m.watching ?? 0;
        const watched = m.watched ?? 0;
        const updateStates = { title_on_firebase: title, description_on_firebase: description, m3u8_pull_url, published_at, ping_at, end_at, watching, watched };
        if(this.state.title_on_firebase !== title){
          this.titleDom.value = title;
          updateStates.title = title;
        }
        if(this.state.description_on_firebase !== description){
          this.descriptionDom.value = description;
          updateStates.description = description;
        }
        if(!this.props.is_uploading){
          updateStates.thumbnail_id = thumbnail_id;
          updateStates.thumbnail = thumbnail;
          this.props.dispatch(setTitle(this.props.params.roomId, title, description, thumbnail, thumbnail_id, status_id)); // firebase to redux store
        }
        this.setState(updateStates);
      }
      queueMicrotask(() => {
        // 初回のデータが来るまでは編集不可
        // 入力内容に応じて高さを自動調整
        this.titleDom.disabled = false;
        this.titleDom.style.height = 'auto';
        this.titleDom.style.height = this.titleDom.scrollHeight + 'px';
        this.descriptionDom.disabled = false;
        this.descriptionDom.style.height = 'auto';
        this.descriptionDom.style.height = this.descriptionDom.scrollHeight + 'px';
      });
    });
    if(!this.pingInterval) {
      this.pingInterval = setInterval(() => {
        this.props.dispatch(updateRoom(this.props.params.roomId, { ping_at: serverTimestamp() }));
      }, 10 * 1000);
    }
  }

  initRtsClient = () => {
    this.aliRtsClient = AliRTS.createClient();
    this.aliRtsClient.isSupport({ isReceiveVideo: true }).then(() => {
      // RTC is supported in this browser
      this.setState({ rtc_supported: true });
    }).catch(err => {
      this.setState({ rtc_supported: false });
      this.props.dispatch(showAlert(err.errorCode, err.message));
    });
  }

  getDeviceList = async () => {
    var camera_list;
    var mic_list;
    var selected_camera_id;
    var selected_mic_id;
    var storedCameraMic;

    try {
      camera_list = await AliRTS.getCameraList();
    } catch (error) {
      this.props.dispatch(showAlert(error.code, error.reason));
    }

    try {
      mic_list = await AliRTS.getMicList();
    } catch (error) {
      this.props.dispatch(showAlert(error.code, error.reason));
    }

    const storedCameraMicObj = window.localStorage.getItem(STORAGE_ITEM_CAMERA_MIC);
    if (storedCameraMicObj) {
      storedCameraMic = JSON.parse(storedCameraMicObj);
    }

    if (storedCameraMic) {
      if (camera_list && !!storedCameraMic.cameraId && camera_list.some(el => el.deviceId === storedCameraMic.cameraId)) {
        selected_camera_id = storedCameraMic.cameraId;
      }
      if (mic_list && !!storedCameraMic.micId && mic_list.some(el => el.deviceId === storedCameraMic.micId)) {
        selected_mic_id = storedCameraMic.micId;
      }
    }

    if (camera_list && !selected_camera_id) {
      selected_camera_id = camera_list[0].deviceId;
    }

    if (mic_list && !selected_mic_id) {
      selected_mic_id = mic_list[0].deviceId;
    }

    this.setState({ camera_list, mic_list, selected_camera_id, selected_mic_id });
  }

  setTitleDom = (c) => {
    this.titleDom = c;
  }

  setDescriptionDom = (c) => {
    this.descriptionDom = c;
  }

  setVideoDom = (c) => {
    this.videoDom = c;
  }

  onTextChange = (e) => {
    if (e.target.name === 'title' || e.target.name === 'description') {
      this.setState({ [e.target.name]: e.target.value });
      queueMicrotask(() => {
        // 入力内容に応じて高さを自動調整
        this.titleDom.style.height = 'auto';
        this.titleDom.style.height = this.titleDom.scrollHeight + 'px';
        this.descriptionDom.style.height = 'auto';
        this.descriptionDom.style.height = this.descriptionDom.scrollHeight + 'px';
      });
    }
  }

  // タイトルは改行禁止
  // FIXME タイトルにコピペで改行が入力できるバグ
  // この関数を修正する場合は、日本語入力の確定エンターキーの動作確認を必ずすること
  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }

  // 保存ボタンクリックイベント firebaseにタイトルと説明文を保存 すでに公開済みの場合はトゥートも更新
  handleSaveClick = async () => {
    const param = {};
    if(this.state.title !== this.state.title_on_firebase){
      param.title = this.state.title;
    }
    if(this.state.description !== this.state.description_on_firebase){
      param.description = this.state.description;
    }
    this.props.dispatch(updateRoom(this.props.params.roomId, param));
  }

  onOpenLocalStream = async () => {
    const streamConfig = {
      audio: { deviceId: this.state.selected_mic_id },
      video: { deviceId: this.state.selected_camera_id },
      screen: false,
    };
    try {
      this.localStream = await AliRTS.createStream(streamConfig);
      this.localStream.play(this.videoDom);
      this.setState({ local_stream_started: true });

      const selectedCameraMic = {
        cameraId: this.state.selected_camera_id,
        micId: this.state.selected_mic_id,
      };
      window.localStorage.setItem(STORAGE_ITEM_CAMERA_MIC, JSON.stringify(selectedCameraMic));
    } catch (error) {
      this.props.dispatch(showAlert(error.errorCode, error.message));
    }
  }

  onCloseLocalStream = async () => {
    const stream = this.videoDom.srcObject;
    stream?.getTracks().forEach(t => t.stop());
    this.setState({ local_stream_started: false });
  }

  onToggleVideo = () => {
    this.enableDisableStreamTrack('video', !this.state.stream_video_enabled);
  }

  onToggleAudio = () => {
    this.enableDisableStreamTrack('audio', !this.state.stream_audio_enabled);
  }

  enableDisableStreamTrack = (trackKind, enabled) => {
    const stream = this.videoDom.srcObject;
    stream?.getTracks().forEach(track => {
      if (track.kind === trackKind) {
        track.enabled = enabled;
        if (trackKind==='video'){
          this.setState({ stream_video_enabled: enabled });
        }
        if (trackKind==='audio'){
          this.setState({ stream_audio_enabled: enabled });
        }
      }
    });
  }

  onScreenshot = () => {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var w = this.videoDom.offsetWidth;
    var h = this.videoDom.offsetHeight;
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    ctx.drawImage(this.videoDom, 0, 0, w, h);
    canvas.toBlob(function(blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'screenshot.' + new Date().toLocaleString() + '.jpg';
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/jpeg', 0.95);
  }

  // タイトル、詳細文が修正されている場合true
  isTitleModified = () => {
    let modified = !(this.state.title === this.state.title_on_firebase && this.state.description === this.state.description_on_firebase);
    return modified
  }

  // 公開ボタンクリックイベント // FIXME 2度押し対策
  onPublishStreamStart = async () => {
    if(this.isTitleModified()){
      this.handleSaveClick();
    }
    this.props.dispatch(getPushStreamUrl(this.props.params.roomId, this.onPublishStreamSuccess));
  }

  onPublishStreamSuccess = async (data) => {
    try {
      await this.aliRtsClient.publish(data.push_stream_url, this.localStream);
      if (!this.state.published_at) {
        this.props.dispatch(updateRoom(this.props.params.roomId, { published_at: Date.now() }));
      }
      window.addEventListener('beforeunload', this.beforeunloadpage);
      window.addEventListener('popstate', this.onpopstate);
      this.setState({ publishing_started: true });
    } catch (error) {
      this.props.dispatch(showAlert(error.errorCode, error.message));
    }
  }

  // 終了ボタンクリック ライブ停止 // FIXME 2度押し対策
  onPublishStreamStop = async () => {
    this.aliRtsClient.unpublish();
    this.props.dispatch(updateRoom(this.props.params.roomId, { end_at: Date.now() }));
    this.onCloseLocalStream();
  }

  onSelectCamera = (event) => {
    this.setState({ selected_camera_id: event.target.value });
  }
  onSelectMicrophone = (event) => {
    this.setState({ selected_mic_id: event.target.value });
  }

  onBackToHome = () => {
    this.context.router.history.push('/home');
  }

  render() {
    const { roomId } = this.props.params;
    let canStartPublishStream = this.state.title.length > 0 && this.state.description.length > 0 && this.state.local_stream_started && this.state.thumbnail?.length > 0;
    return (
      <div className='livechat'>
        <div className='info'>
          <div className='player'><video className='video reflect-x' ref={this.setVideoDom} autoPlay muted playsInline /></div>
          <div className='row marTopSmall'>
            {this.state.local_stream_started && <Button onClick={this.onToggleVideo} className='buttonSmall marRightSmall'><Icon id='video-camera' />&nbsp;{this.state.stream_video_enabled ? 'ビデオを無効にする' : 'ビデオを有効にする'}</Button>}
            {this.state.local_stream_started && <Button onClick={this.onToggleAudio} className='buttonSmall marRightSmall'><Icon id='microphone' />&nbsp;{this.state.stream_audio_enabled ? '音声を無効にする' : '音声を有効にする'}</Button>}
            {this.state.local_stream_started && <Button onClick={this.onScreenshot} className='buttonSmall marRightSmall'><Icon id='camera' />&nbsp;スクショ保存</Button>}
          </div>
          <div className='separator' />
          <div className='marTopSmall row'>
            <div>
              <div className='row'><label className='label'>ライブ配信開始日:</label> {this.state.published_at ? (<FormattedDate value={new Date(this.state.published_at)} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />) : (<>未配信</>)}</div>
              {this.state.published_at && <div className='row'><label className='label'>ライブ配信終了日:</label> {this.state.end_at ? (<FormattedDate value={new Date(this.state.end_at)} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />) : (<>未終了</>)}</div>}
            </div>
            <div className='spacer' />
            <div>
              <div className='row'><label className='label'>現在の視聴者数:</label> {this.state.watching}</div>
              <div className='row'><label className='label'>累計の視聴者数:</label> {this.state.watched}</div>
            </div>
          </div>
          <div className='separator' />
          <div className='simple_form camera'>
            <label>カメラ</label>
            {this.state.camera_list && <select className='select optional selectSmall' id='select_camera' onChange={this.onSelectCamera} value={this.state.selected_camera_id} disabled={this.state.local_stream_started}>
              {this.state.camera_list.map(deviceInfo => (
                <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
                  {deviceInfo.label}
                </option>
              ))}
            </select>}
          </div>
          <div className='simple_form mic'>
            <label>マイク</label>
            {this.state.mic_list && <select className='select optional selectSmall' id='select_microphone' onChange={this.onSelectMicrophone} value={this.state.selected_mic_id} disabled={this.state.local_stream_started}>
              {this.state.mic_list.map(deviceInfo => (
                <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
                  {deviceInfo.label}
                </option>
              ))}
            </select>}
          </div>
          <div className='buttons marTopSmall'>
            {!this.state.local_stream_started && <Button onClick={this.onOpenLocalStream} className='buttonSmall'>カメラを開く</Button>}
            {this.state.local_stream_started && <Button onClick={this.onCloseLocalStream} className='buttonSmall' disabled={this.state.published_at && !this.state.end_at}>カメラを閉じる</Button>}
          </div>
          <div className='separator' />
          <div className='simple_form marTopSmall'>
            <label htmlFor='title'>タイトル</label>
            <div className='label_input__wrapper'>
              <textarea id='title' rows='1' name='title' placeholder='タイトルを入力...' className='text optional textareaSmall' ref={this.setTitleDom} onChange={this.onTextChange} onKeyPress={this.onKeyPress} disabled />
            </div>
          </div>
          <div className='simple_form marTopSmall'>
            <label htmlFor='description'>説明文</label>
            <div className='label_input__wrapper'>
              <textarea id='description' rows='1' name='description' placeholder='説明を入力...' className='text optional textareaSmall scrolly' ref={this.setDescriptionDom} onChange={this.onTextChange} />
            </div>
          </div>
          <div className='buttons marTopSmall'>
            <Button className='start buttonSmall' onClick={this.handleSaveClick}  disabled={!this.isTitleModified()}><Icon id='cloud-upload' />&nbsp;タイトルと説明文を保存</Button>
          </div>
          <div className='separator' />
          <div className='thumbnail marTopSmall'>
            <div>サムネイル</div>
            <div className='compose-form nopadding'>
              <div className='compose-form__modifiers'>
                <UploadFormContainer />
              </div>
              <div className='compose-form__buttons-wrapper'>
                <div className='compose-form__buttons'>
                  <UploadButtonContainer />
                  {/* <DeleteButtonContainer /> */}
                </div>
              </div>
            </div>
          </div>
          <div className='marTopSmall'>
            <div>
              {(!this.state.published_at || (!this.state.publishing_started && this.state.published_at && !this.state.end_at)) && <Button className='start' disabled={!canStartPublishStream} onClick={this.onPublishStreamStart}>公開</Button>}
              {(this.state.published_at && !this.state.end_at) && <><Button className='negative marRightSmall' disabled={!!this.state.end_at} onClick={this.onPublishStreamStop}>終了</Button>←配信を終了して部屋を閉じるときは必ず「終了」をクリックしてください</>}
              {(!this.state.published_at || (this.state.published_at && this.state.end_at)) && <Button className='start' onClick={this.onBackToHome}><Icon id='arrow-left' />&nbsp;ホームに戻る</Button>}
            </div>
          </div>
        </div>
        <ChatArea roomId={roomId} />
      </div>
    );
  }

}

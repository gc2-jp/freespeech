import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { me } from 'mastodon/initial_state';
import Avatar from 'mastodon/components/avatar';
import Icon from 'mastodon/components/icon';
import PointTable from '../../../../gc2/lib/point';

import { firebaseDb, ref, push, onChildAdded, Message } from './firebaseapp';
import MessageCustomizeDialog from './message_customize_dialog';
import SpecialMessageList from './special_message_list';

function throttle(func, ms) {
  let lastTime = Date.now() - ms;
  return (...args) => {
    if ((lastTime + ms) < Date.now()) {
      lastTime = Date.now();
      func.apply(this, args);
    }
  };
}

function debounce(func, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      func.apply(this, args);
    }, ms);
  };
}

const mapStateToProps = state => {
  return {
    myAccount: state.getIn(['accounts', me]),
  };
};

export default @connect(mapStateToProps)
class ChatArea extends React.Component {

  static propTypes = {
    myAccount: ImmutablePropTypes.map.isRequired,
    roomId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      text : '',
      /** @type {Message[]} */
      msgs: ImmutableList([]),
      open: false,
      width: visualViewport.width,
    };
  }

  componentDidMount = ()=>{
    this.initFirebase();
    this.onResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
  }

  componentWillUnmount = ()=>{
    this.onChildAddedUnsubscribe?.();
    this.onChildAddedUnsubscribe = null;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
  }

  onResize = debounce(() => {
    const { width } = visualViewport;
    this.setState({ width });
    queueMicrotask(() => {
      if (width < 600) {
        document.querySelectorAll('.livechat-scroll')
          .forEach(elem => elem.insertBefore(document.querySelector('.livechat .info'), elem.firstChild));
      } else {
        document.querySelectorAll('.livechat')
          .forEach(elem => elem.insertBefore(document.querySelector('.livechat .info'), elem.firstChild));
      }
    });
  }, 100);

  onLivechatScroll = throttle(e => {
    /** @type {HTMLDivElement} */
    const elem = e.target;
    if (!elem) return;
    const threshold = 48;
    elem.querySelectorAll('.info').forEach(info => {
      const scroll = elem.scrollTop;
      info.className = info.className.split(/\s+/).filter(c => c !== 'is-fixed').join(' ');
      if (scroll >= threshold) {
        info.className += ' is-fixed';
      }
      elem.querySelectorAll('.author').forEach(author => {
        info.querySelectorAll('.player').forEach(player => {
          author.style.marginTop = scroll < threshold
            ? ''
            : player.getBoundingClientRect().height + 'px';
        });
      });
    });
  }, 100);

  initFirebase = ()=>{
    this.messagesRef = ref(firebaseDb, `messages/${this.props.roomId}`);

    this.onChildAddedUnsubscribe = onChildAdded( this.messagesRef, (snapshot) => {
      const m = snapshot.val();
      if(!m) return;
      /** @type {Message} */
      const message = {
        ...m,
        'key' : snapshot.key,
      };
      const MAX_MESSAGES = 100;
      let msgs = this.state.msgs.concat(message);
      if(Math.abs(this.messagesDom.scrollHeight - this.messagesDom.clientHeight - this.messagesDom.scrollTop) < 30){
        if(msgs.size > MAX_MESSAGES){
          msgs = msgs.slice(msgs.size - MAX_MESSAGES);
        }
        this.setState({ msgs });
        queueMicrotask(()=>{
          this.messagesDom.scrollTo(0, this.messagesDom.scrollHeight);
        });
      }else{
        this.setState({ msgs });
      }
      const ttl = PointTable.toExpiredAt(message) - Date.now();
      if (ttl > 0) {
        setTimeout(() => {
          this.setState({ ...msgs.filter(m => m.key !== snapshot.key) });
        }, ttl);
      }
    });
  }

  // チャット履歴欄のdom スクロール位置の調整に使用
  setMessagesDom = (c) => {
    this.messagesDom = c;
  }

  // チャット入力フォームのdom エンターキー入力後のクリアに使用
  setInputDom = (c) => {
    this.inputDom = c;
    if(c){
      this.inputDom.style.height = this.inputDom.scrollHeight + 'px';
    }
  }

  onTextChange = (e)=>{
    if (e.target.name === 'text') {
      // 入力内容に応じて高さを自動調整
      queueMicrotask(()=>{
        this.inputDom.style.height = 'auto';
        this.inputDom.style.height = this.inputDom.scrollHeight + 'px';
      });
      this.setState({
        'text': e.target.value,
      });
    }
  }

  onKeyDown = (e)=>{
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
    e.preventDefault();
    this.pushMessage();
  }


  onButtonClick = ()=>{
    if (this.state.text !== '') {
      this.pushMessage();
    } else {
      this.setState({ open: true });
    }
  }
  onCloseDialog = () => {
    this.setState({ open: false });
  }

  pushMessage = ()=>{
    if(this.state.text === '') {
      return;
    }
    /** @type {Message} */
    const message = {
      'user_id' : this.props.myAccount.get('id'),
      'acct' : this.props.myAccount.get('acct'),
      'display_name' : this.props.myAccount.get('display_name') || this.props.myAccount.get('username'),
      'avatar' : this.props.myAccount.get('avatar'),
      'created_at' : Date.now(),
      'text' : this.state.text,
      'point': 0,
    };
    push(this.messagesRef, message);
    // 入力フォームの高さを1行に戻す
    queueMicrotask(()=>{
      this.inputDom.value='';
      this.inputDom.style.height = 'auto';
      this.inputDom.style.height = this.inputDom.scrollHeight + 'px';
    });
    this.setState({
      'text': '',
    });
  }

  render () {
    const { roomId } = this.props;
    const messages = this.state.msgs;
    const specialMessages = messages.filter(PointTable.isSpecial);
    const chatMessages = messages.filter(({ text, point }) => !!text || point > 0);
    const hasText = this.state.text.length > 0;
    const buttonIconId = hasText ? 'paper-plane' : 'plus-circle';
    if (this.state.width < 600) {
      return (
        <>
          <div className='livechat-scroll' onScroll={this.onLivechatScroll}>
            <div className='messages-header'>チャット</div>
            <SpecialMessageList items={specialMessages} />
            <div className='messages' ref={this.setMessagesDom}>
              {chatMessages.map((m) => {
                return <MessageRow key={m.key} message={m} />;
              })}
            </div>
          </div>
          <div className='chatinput'>
            <div className='avatar'>
              <Avatar account={this.props.myAccount} size={24} />
            </div>
            <div className='chatinputsub'>
              <span className='display-name'>
                <bdi><strong className='display-name__html' dangerouslySetInnerHTML={{ __html: this.props.myAccount.get('display_name_html') }} /></bdi>
              </span>
              <div className='simple_form label_input__wrapper'>
                <textarea rows='1' name='text' placeholder='メッセージを入力...' className='text optional textareaSmall' ref={this.setInputDom} onChange={this.onTextChange} onKeyDown={this.onKeyDown} />
              </div>
            </div>
            <div className='buttons'>
              <button onClick={this.onButtonClick}><Icon id={buttonIconId} size={64} /></button>
            </div>
          </div>
          <MessageCustomizeDialog
            roomId={roomId}
            open={this.state.open}
            defaultMessage={this.state.text}
            onClose={this.onCloseDialog}
          />
        </>
      );
    }
    return (
      <div className='chatarea'>
        <div className='messages-header'>チャット</div>
        <SpecialMessageList items={specialMessages} />
        <div className='messages' ref={this.setMessagesDom}>
          {chatMessages.map((m) => {
            return <MessageRow key={m.key} message={m} />;
          })}
        </div>
        <div className='chatinput'>
          <div className='avatar'>
            <Avatar account={this.props.myAccount} size={24} />
          </div>
          <div className='chatinputsub'>
            <span className='display-name'>
              <bdi><strong className='display-name__html' dangerouslySetInnerHTML={{ __html: this.props.myAccount.get('display_name_html') }} /></bdi>
            </span>
            <div className='simple_form label_input__wrapper'>
              <textarea rows='1' name='text' placeholder='メッセージを入力...' className='text optional textareaSmall' ref={this.setInputDom} onChange={this.onTextChange} onKeyDown={this.onKeyDown} />
            </div>
          </div>
          <div className='buttons'>
            <button onClick={this.onButtonClick}><Icon id={buttonIconId} size={64} /></button>
          </div>
        </div>
        <MessageCustomizeDialog
          roomId={roomId}
          open={this.state.open}
          defaultMessage={this.state.text}
          onClose={this.onCloseDialog}
        />
      </div>
    );
  }

}

class MessageRow extends React.Component {

  static propTypes = {
    /** @type {Message} */
    message: PropTypes.object.isRequired,
  };

  render() {
    const size = 24;
    const style = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundSize: `${size}px ${size}px`,
      backgroundImage: `url(${this.props.message.avatar})`,
    };

    const { point, text } = this.props.message;
    const color = PointTable.toColorIndex(point);
    const body = !!text ? text : `${point.toLocaleString()} pt`;

    return (
      <div className='message'>
        <div className='avatar' style={style} />
        <p className='text'><bdi><strong className='display-name__html'>{this.props.message.display_name}</strong></bdi> <span className={`text-body text-body${color || '0'}`}>{body}</span></p>
      </div>
    );
  }

}

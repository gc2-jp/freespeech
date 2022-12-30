import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { me } from 'mastodon/initial_state';
import Avatar from 'mastodon/components/avatar';
import Icon from 'mastodon/components/icon';
import { firebaseDb, ref, push, onChildAdded, Message  } from './firebaseapp';

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
      msgs: ImmutableList([]),
    };
  }

  componentDidMount = ()=>{
    this.initFirebase();
  }

  componentWillUnmount = ()=>{
    this.onChildAddedUnsubscribe?.();
    this.onChildAddedUnsubscribe = null;
  }

  initFirebase = ()=>{
    this.messagesRef = ref(firebaseDb, `messages/${this.props.roomId}`);

    this.onChildAddedUnsubscribe = onChildAdded( this.messagesRef, (snapshot) => {
      const m = snapshot.val();
      if(!m) return;
      /** @type {Message} */
      const message = {
        'key' : snapshot.key,
        'user_id' : m.user_id,
        'acct' : m.acct,
        'display_name' : m.display_name,
        'avatar' : m.avatar,
        'created_at' : m.created_at,
        'text' : m.text,
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

  onKeyPress = (e)=>{
    // エンターキーで送信 他のイベントでは日本語入力と改行で問題あり
    if (e.key === 'Enter') {
      e.preventDefault();
      this.onButtonClick();
    }
  }

  onButtonClick = ()=>{
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
    return (
      <div className='chatarea'>
        <div className='header'>チャット</div>
        <div className='messages' ref={this.setMessagesDom}>
          {this.state.msgs.map((m) => {
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
              <textarea rows='1' name='text' placeholder='メッセージを入力...' className='text optional textareaSmall' ref={this.setInputDom} onChange={this.onTextChange} onKeyPress={this.onKeyPress} />
            </div>
          </div>
        </div>
        <div className='buttons'>
          <div className='space' />
          <Icon id='paper-plane' size={64} onClick={this.onButtonClick} />
        </div>
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

    return (
      <div className='message'>
        <div className='avatar' style={style} />
        <p className='text'><bdi><strong className='display-name__html'>{this.props.message.display_name}</strong></bdi> &nbsp; {this.props.message.text}</p>
      </div>
    );
  }

}

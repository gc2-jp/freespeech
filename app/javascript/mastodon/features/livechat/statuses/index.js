import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Column from '../../ui/components/column';
import ColumnHeader from '../../../components/column_header';
import { List as ImmutableList } from 'immutable';
import StatusList from '../../../components/status_list';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { firebaseDb, ref, onChildAdded, query, orderByChild, equalTo } from 'mastodon/features/livechat/components/firebaseapp';
import Icon from 'mastodon/components/icon';
import RelativeTimestamp from 'mastodon/components/relative_timestamp';
import { fetchStatus } from 'mastodon/actions/statuses';

const messages = defineMessages({
  heading: { id: 'column.livechat', defaultMessage: 'Livechat' },
});

const mapStateToProps = state => ({
});

export default @connect(mapStateToProps)
@injectIntl
class LivechatStatuses extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      rooms: ImmutableList([]),
      statusIds: ImmutableList([]),
      dataLoaded: false,
    };
  }

  componentDidMount = ()=>{
    const dataLoaded = false;
    this.setState({ dataLoaded });
    this.initFirebase();
  }

  componentWillUnmount = ()=>{
    this.onChildAddedUnsubscribe?.();
    this.onChildAddedUnsubscribe = null;
  }

  initFirebase = ()=>{
    this.roomRef = query(ref(firebaseDb, 'room'), orderByChild('end_at'), equalTo(null));
    this.onChildAddedUnsubscribe = onChildAdded( this.roomRef, (snapshot) => {
      const m = snapshot.val();
      if(!m || !m.status_id || m.end_at) return;
      /** @type {Room} */
      const room = {
        key : snapshot.key,
        user_id : m.user_id,
        acct : m.acct,
        display_name : m.display_name,
        avatar : m.avatar,
        created_at : m.created_at,
        published_at : m.published_at,
        ping_at : m.ping_at,
        end_at : m.end_at,
        title : m.title,
        description : m.description,
        thumbnail : m.thumbnail,
        status_id : m.status_id,
        watching : m.watching ?? 0,
        watched : m.watched ?? 0,
      };
      const rooms = this.state.rooms.unshift(room); // reverse sort
      const statusIds = this.state.statusIds.unshift(m.status_id); // reverse sort
      const dataLoaded = true;
      this.setState({ rooms, statusIds, dataLoaded });
      this.props.dispatch(fetchStatus(m.status_id));
    });
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  render () {
    const { intl } = this.props;

    // let content = '';
    // if(!this.state.dataLoaded){
    //   content = <FormattedMessage id='livechat_loading' defaultMessage='data loading ...' />;
    //   // FIXME 他のページと同じようにローディングアイコンを表示
    // } else if(this.state.rooms.size===0){
    //   content = <FormattedMessage id='empty_column.livechat_statuses' defaultMessage='no livechat now.' />;
    // } else {
    //   content = this.state.rooms.map((m) => {
    //     return <RoomRow key={m.key} room={m} />;
    //   });
    // }
    const emptyMessage = <FormattedMessage id='empty_column.livechat_statuses' defaultMessage='no livechat now.' />;

    return (
      <Column ref={this.setRef} label={intl.formatMessage(messages.heading)}>
        <ColumnHeader
          icon='address-card'
          title={intl.formatMessage(messages.heading)}
          onClick={this.handleHeaderClick}
          showBackButton
        />

        <StatusList
          statusIds={this.state.statusIds}
          scrollKey={`livechat_statuses-0`}
          trackScroll={true}
          hasMore={false}
          isLoading={false}
          onLoadMore={this.handleLoadMore}
          emptyMessage={emptyMessage}
          bindToDocument={false}
        />

        {/* <div className='scrollable'>
          <div className='item-list' role='feed'>
            {content}
          </div>
        </div> */}
      </Column>
    );
  }

}

class RoomRow extends React.Component {

  static propTypes = {
    /** @type {Room} */
    room: PropTypes.object.isRequired,
  };

  render() {
    const url = '/web/@' + this.props.room.acct + '/' + this.props.room.status_id + '/livechat';
    const style = {};
    const width = 485;
    style.height = width / (16/9);
    const style2 = {};
    style2.inset = 'auto';
    style2.width = '100%';
    style2.height = '100%';

    const size = 48;
    const avatar_style = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundSize: `${size}px ${size}px`,
      backgroundImage: `url(${this.props.room.avatar})`,
    };
    const visibilityIcon = { icon: 'globe', text: '公開' };

    const timestamp = new Date(this.props.room.published_at).toString();

    return (
      <div className='status__wrapper livechat-listing'>
        <a href={url} className='status__display-name'>
          <div className='status'>
            <div className='status__expand' role='presentation'>
              <div className='avatar status__avatar'>
                <div className='account__avatar' style={avatar_style} />
              </div>
            </div>
            <div className='status__info'>
              <span className='status__relative-time'>
                <span className='status__visibility-icon'><Icon id={visibilityIcon.icon} title={visibilityIcon.text} /></span>
                <RelativeTimestamp timestamp={timestamp} />
              </span>
              <p className=''><bdi><strong className='display-name__html'>{this.props.room.display_name}</strong></bdi></p>
              <div className='status__content status__content--with-action'>
                <div className='status__content__text status__content__text--visible translate'>
                  <p>{this.props.room.title}</p>
                </div>
              </div>
              <div className='status__content status__content--with-action'>
                <div className='status__content__text status__content__text--visible translate'>
                  <p>{this.props.room.watching}人が視聴中</p>
                </div>
              </div>
              <div className='media-gallery' style={style}>
                <div className='media-gallery__item' style={style2}>
                  <div className='media-gallery__item-thumbnail'><img src={this.props.room.thumbnail} alt='' /></div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

}

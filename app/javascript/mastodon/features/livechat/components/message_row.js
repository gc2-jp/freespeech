// @ts-check
/* eslint-disable react/prop-types */
import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import DropdownMenuContainer from 'mastodon/containers/dropdown_menu_container';
import { me } from 'mastodon/initial_state';
import { initBlockModal } from 'mastodon/actions/blocks';
import PointTable from '../../../../gc2/lib/point';

import { useCallback } from 'react';
import { initReport } from 'mastodon/actions/reports';
import { unblockAccount } from 'mastodon/actions/accounts';

/** @typedef {Immutable.Record<import('mastodon/interfaces').Relationship>} Relationship */
/** @typedef {Immutable.Record<import('mastodon/interfaces').Account>} Account */
/** @typedef {Immutable.Record<import('./firebaseapp').Message>} Message */

/**
 * @typedef MessageRowProps
 * @property {*} intl
 * @property {string} roomId
 * @property {Message} message
 */

const messages = defineMessages({
  action: { id: 'livechat.message.action', defaultMessage: 'Action' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  report: { id: 'livechat.message.report', defaultMessage: 'Report @{name}' },
  deleted: { id: 'livechat.message.deleted', defaultMessage: 'Message deleted' },
});

/**
 * @typedef MessageRowState
 * @property {Account} account
 * @property {Relationship} relationship
 */
/**
 * @param {Immutable.Map} state
 * @param {MessageRowProps} props
 */
const mapStateToProps = (state, { message }) => ({
  account: state.getIn(['accounts', message.get('user_id')]),
  relationship: state.getIn(['relationships', message.get('user_id')]),
});

/**
 * @typedef MessageRowDispatch
 * @property {(account: Account) => void} onBlock
 * @property {(account: Account) => void} onUnblock
 * @property {(account: Account) => void} onReport
 */

const mapDispatchToProps = (dispatch) => ({
  /** @param {Account} account */
  onBlock (account) {
    dispatch(initBlockModal(account));
  },
  /** @param {Account} account */
  onUnblock (account) {
    dispatch(unblockAccount(account.get('id')));
  },
  /** @param {Account} account */
  onReport (account) {
    dispatch(initReport(account));
  },
});

/**
 * @param {MessageRowState & MessageRowDispatch & MessageRowProps} props
 */
const MessageRow = ({ intl, relationship, account, message, onBlock, onUnblock, onReport }) => {
  const handleBlockClick = useCallback(() => {
    if (relationship && relationship.get('blocking')) {
      onUnblock(account);
    } else {
      onBlock(account);
    }
  }, [account, relationship]);

  const handleReport = useCallback(() => {
    onReport(account);
  }, [account]);

  const size = 24;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundSize: `${size}px ${size}px`,
    backgroundImage: `url(${message.get('avatar')})`,
  };

  const point = message.get('point');
  const text = message.get('text');
  const acct = message.get('acct');
  const color = PointTable.toColorIndex(point);
  const body = !!text ? text : `${point.toLocaleString()} pt`;
  const writtenByMe = message.get('user_id') === me;
  const menu = [];

  if (!writtenByMe) {
    if (relationship && relationship.get('blocking') ) {
      menu.push({ text: intl.formatMessage(messages.unblock, { name: acct }), action: handleBlockClick });
    } else {
      menu.push({ text: intl.formatMessage(messages.block, { name: acct }), action: handleBlockClick });
    }
    menu.push({ text: intl.formatMessage(messages.report, { name: acct }), action: handleReport });
  }

  return (
    <div className='message'>
      <div className='avatar' style={style} />
      <p className='text'><bdi><strong className='display-name__html'>{message.get('display_name')}</strong></bdi> <span className={`text-body text-body${color || '0'}`}>{body}</span></p>
      {menu.length > 0 && <div className='action'>
        <DropdownMenuContainer
          items={menu}
          icon='ellipsis-v'
          title={intl.formatMessage(messages.action)}
          size={18}
        />
      </div>}
    </div>
  );
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MessageRow));

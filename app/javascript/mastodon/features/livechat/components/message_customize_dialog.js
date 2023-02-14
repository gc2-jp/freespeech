import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import Avatar from 'mastodon/components/avatar';
import { me } from 'mastodon/initial_state';
import { fetchPointStatus, postCustomMessage, PostCustomMessageParams } from '../../../../gc2/actions/point';
import PointTable from '../../../../gc2/lib/point';
import { PointDataState } from '../../../../gc2/reducers/point';
import { CircularProgress } from '../../../components/loading_indicator';
import { createPortal } from 'react-dom';

function nicetime(value) {
  if (value >= 3600) {
    return Math.floor(value / 3600) + '時間';
  } else if (value >= 60) {
    return Math.floor(value / 60) + '分';
  } else {
    return value + '秒';
  }
}

const mapStateToProps = state => {
  return {
    myAccount: state.getIn(['accounts', me]),
    pointData: state.getIn(['gc2', 'point']).toJS(),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchPointStatus: () => dispatch(fetchPointStatus()),
  postCustomMessage: (params) => dispatch(postCustomMessage(params)),
});

/**
 * @typedef MessageCustomizeDialogProps
 * @property {PointDataState} pointData
 * @property {string} roomId
 * @property {boolean} open
 * @property {(result: { text: string, point: number }) => void} onClose
 * @property {() => void} fetchPointStatus
 * @property {(params: PostCustomMessageParams) => void} postCustomMessage
 */

/**
 * @param {MessageCustomizeDialogProps} param0
 */
const MessageCustomizeDialog = ({ myAccount, pointData, roomId, open, onClose, fetchPointStatus, postCustomMessage }) => {
  const self = useRef(null);
  const [message, setMessage] = useState('');
  const [index, setIndex] = useState(1);

  useEffect(() => {
    const elem = self.current;
    if ( open ) {
      elem.style.height = 'auto';
      const rect = elem.getBoundingClientRect();
      elem.style.height = '';
      setTimeout(() => elem.style.height = `${rect.height}px`, 10);
    } else {
      elem.style.height = '';
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    fetchPointStatus();
  }, [open]);
  useEffect(() => {
    if (pointData.isPosted) {
      setMessage('');
      onClose();
    }
  }, [pointData]);
  const handleChangeMessage = useCallback((e) => {
    setMessage(e.target.value);
  }, [message]);
  const handleSliderChange = useCallback((value) => {
    setIndex(value);
  }, [setIndex]);
  const handleSubmit = useCallback(() => {
    const text = message;
    const { point } = PointTable.get(index);
    // setMessage('');
    // onClose();
    // onClose({ text, point });
    postCustomMessage({ roomId, text, point });
  }, [roomId, message, index]);
  const handleClose = useCallback(() => {
    onClose();
  }, []);

  const color = index;
  const pointTable = PointTable.get(index);
  const time = pointTable.time;
  const remain = nicetime(time);
  const point = pointTable.point;
  const disabled = pointData.point < point || pointData.isFetching;
  const displayName = myAccount.get('display_name') || myAccount.get('username');
  const accountPoint = pointData.isFetching ? '-' : Number(pointData.point).toLocaleString();
  const textSize = message.length;
  const maxTextSize = pointTable.size;
  const loading = pointData.isFetching || pointData.isPosted;

  return (
    <div
      ref={self}
      className='message-customize-dialog'
    >
      <div className='message-customize-dialog-header'>
        <div className='title' />
        <div className='close' onClick={handleClose} role='button' tabIndex={0}>&times;</div>
      </div>
      <div className='content'>
        <div className='content-info'>
          <div className='remain'>表示時間：{remain}</div>
          <div className='point'>所有ポイント：{accountPoint} pt</div>
        </div>
        <div className={`product product-${color}`}>
          <div className='product-info'>
            <Avatar account={myAccount} size={24} />
            <div>
              <div className='username'>{displayName}</div>
              <div className='amount'>{point.toLocaleString()} pt</div>
            </div>
            <div className='size'>
              {textSize} / {maxTextSize}
            </div>
          </div>
          <input
            type='text'
            value={message}
            className='message'
            placeholder='ポイント数とメッセージは公開されます...'
            onChange={handleChangeMessage}
          />
          <div className='slider-wrapper'>
            <Slider
              defaultValue={1}
              min={0}
              max={PointTable.length - 1}
              dots
              onChange={handleSliderChange}
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled}
        >
          {loading ? <CircularProgress size={20} strokeWidth={4} /> : '送信'}
        </button>
      </div>
      <ErrorModal error={pointData.error}>
        <div className='error'>
          エラーが発生したため、この機能は利用できません
        </div>
      </ErrorModal>
    </div>
  );
};

MessageCustomizeDialog.propTypes = {
  // state
  myAccount: ImmutablePropTypes.map.isRequired,
  pointData: PropTypes.object.isRequired,
  // props
  roomId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchPointStatus: PropTypes.func.isRequired,
  postCustomMessage: PropTypes.func.isRequired,
};

const ErrorModal = ({ children, error }) => {
  const [open, setOpen] = useState(true);
  const handleInnerClick = useCallback(e => {
    e.stopPropagation();
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  useEffect(() => {
    setOpen(!!error);
  }, [error]);
  if (!open) return null;
  const classPrefix = 'gc2-error-modal';
  return createPortal(
    <div className={classPrefix} onClick={handleClose}>
      <div className={`${classPrefix}-inner`} onClick={handleInnerClick}>
        <div className={`${classPrefix}-header`}>
          <div className={`${classPrefix}-header-title`} />
          <div className={`${classPrefix}-header-close`} onClick={handleClose} role='button' tabIndex={0}>&times;</div>
        </div>
        <div className={`${classPrefix}-content`}>
          {children}
        </div>
      </div>
    </div>,
    document.querySelector('.ui'),
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageCustomizeDialog);

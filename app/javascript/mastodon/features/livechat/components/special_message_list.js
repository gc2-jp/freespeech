import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PointTable from 'gc2/lib/point';
import Icon from 'mastodon/components/icon';
import { Message } from './firebaseapp';

const isTouchable = typeof window.ontouchstart !== 'undefined' && 0 < navigator.maxTouchPoints;

/**
 * @typedef SpecialMessageListProps
 * @property {Message[]} items
 */
/**
 * @param {SpecialMessageListProps} param0
 */
const SpecialMessageList = ({ items }) => {
  const specialInnerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const leftArrowRef = useRef(null);
  const rightArrowRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = specialInnerRef.current;
      if (leftArrowRef.current) {
        leftArrowRef.current.style.opacity = scrollLeft === 0 ? '0' : '';
      }
      if (rightArrowRef.current) {
        rightArrowRef.current.style.opacity = (scrollLeft + clientWidth >= scrollWidth) ? '0' : '';
      }
    };
    if ( specialInnerRef.current ) {
      const { scrollWidth, clientWidth } = specialInnerRef.current;
      specialInnerRef.current.addEventListener('scroll', onScroll);
      const isShowArrow = !isTouchable && scrollWidth > clientWidth;
      if (leftArrowRef.current) leftArrowRef.current.style.display = isShowArrow ? '' : 'none';
      if (rightArrowRef.current) rightArrowRef.current.style.display = isShowArrow ? '' : 'none';
      specialInnerRef.current.scrollLeft = scrollWidth - clientWidth;
    }
    return () => specialInnerRef.current?.removeEventListener('scroll', onScroll);
  }, [items]);
  const handleLeftArrowClick = useCallback(() => {
    const { scrollLeft } = specialInnerRef.current;
    const messages = specialInnerRef.current?.querySelectorAll('.message');
    const actualLeft = leftArrowRef.current.getBoundingClientRect().width;
    let left = scrollLeft + actualLeft;
    for (let i = 0, n = messages.length; i < n; i += 1) {
      const m = messages[i];
      const { width } = m.getBoundingClientRect();
      if (m.offsetLeft + width > left) {
        specialInnerRef.current.scrollLeft -= width;
        break;
      }
    }
  }, [specialInnerRef, leftArrowRef]);
  const handleRightArrowClick = useCallback(() => {
    const { scrollLeft, clientWidth } = specialInnerRef.current;
    const messages = specialInnerRef.current?.querySelectorAll('.message');
    const arrowWidth = rightArrowRef.current.getBoundingClientRect().width;
    let right = scrollLeft + clientWidth - arrowWidth;
    for (let i = messages.length - 1, n = 0; i >= n; i -= 1) {
      const m = messages[i];
      const { width } = m.getBoundingClientRect();
      if (m.offsetLeft + width < right) {
        specialInnerRef.current.scrollLeft += width;
        break;
      }
    }
  }, [specialInnerRef, rightArrowRef]);

  if (!items.size) return null;

  return (
    <div className='special'>
      <div className='special-inner' ref={specialInnerRef}>
        {items.map(m => <SpecialMessageRow key={m.key} message={m} />)}
        <div ref={messagesEndRef} />
      </div>
      {
        !isTouchable && <div
          className='left-arrow'
          ref={leftArrowRef}
          onClick={handleLeftArrowClick}
          role='button'
          tabIndex={0}
        >
          <Icon id='arrow-left' size={32} />
        </div>
      }
      {
        !isTouchable && <div
          className='right-arrow'
          ref={rightArrowRef}
          onClick={handleRightArrowClick}
          role='button'
          tabIndex={0}
        >
          <Icon id='arrow-right' size={32} />
        </div>
      }
    </div>
  );
};

SpecialMessageList.propTypes = {
  items: ImmutablePropTypes.list.isRequired,
};

/**
 * @typedef SpecialMessageRowProps
 * @property {Message} message
 */

/**
 * @param {SpecialMessageRowProps} param0
 */
const SpecialMessageRow = ({ message }) => {
  const { avatar, point, text } = message;
  const [opacity, setOpacity] = useState('');
  const expiredAt = PointTable.toExpiredAt(message);
  const ttl = Math.max(expiredAt - Date.now() - 500, 0);
  useEffect(() => {
    if (ttl > 0) setTimeout(() => setOpacity('0'), ttl);
  }, []);
  const size = 24;
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundSize: `${size}px ${size}px`,
    backgroundImage: `url(${avatar})`,
  };
  const color = PointTable.toColorIndex(point);
  const body = text !== '' ? text : `${point.toLocaleString()} pt`;
  return (
    <div className='message' style={{ opacity }} title={`${point}: ${new Date(expiredAt).toLocaleString()}`}>
      <div className={`message-inner message-inner-special${color}`}>
        <div className='avatar' style={style} />
        <span>{body}</span>
      </div>
    </div>
  );
};

SpecialMessageRow.propTypes = {
  message: PropTypes.object.isRequired,
};

export default SpecialMessageList;

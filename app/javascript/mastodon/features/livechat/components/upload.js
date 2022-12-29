import React from 'react';
import PropTypes from 'prop-types';
import Motion from '../../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import ImmutablePureComponent from 'react-immutable-pure-component';

export default class Upload extends ImmutablePureComponent {

  static propTypes = {
    thumbnail: PropTypes.string,
  };

  render () {
    const x = 50;
    const y = 50;

    return (
      <div className='compose-form__upload' tabIndex='0' role='button'>
        <Motion defaultStyle={{ scale: 0.8 }} style={{ scale: spring(1, { stiffness: 180, damping: 12 }) }}>
          {({ scale }) => (
            <div className='compose-form__upload-thumbnail' style={{ transform: `scale(${scale})`, backgroundImage: `url(${this.props.thumbnail})`, backgroundPosition: `${x}% ${y}%` }} />
          )}
        </Motion>
      </div>
    );
  }

}

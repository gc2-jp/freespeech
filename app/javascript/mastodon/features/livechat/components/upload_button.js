import React from 'react';
import IconButton from '../../../components/icon_button';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  upload: { id: 'upload_form.thumbnail', defaultMessage: 'Change thumbnail' },
});

const iconStyle = {
  height: null,
  lineHeight: '27px',
};

export default
@injectIntl
class UploadButton extends ImmutablePureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    unavailable: PropTypes.bool,
    onSelectFile: PropTypes.func.isRequired,
    style: PropTypes.object,
    resetFileKey: PropTypes.number,
    intl: PropTypes.object.isRequired,
  };

  handleChange = (e) => {
    if (e.target.files.length > 0) {
      this.props.onSelectFile(e.target.files);
    }
  }

  handleClick = () => {
    this.fileElement.click();
  }

  setRef = (c) => {
    this.fileElement = c;
  }

  render () {
    const { intl, resetFileKey, unavailable, disabled } = this.props;

    const acceptContentTypes = ['.jpg', '.jpeg', '.png', '.gif', 'image/jpeg', 'image/png', 'image/gif'];

    if (unavailable) {
      return null;
    }

    const message = intl.formatMessage(messages.upload);

    return (
      <div className='compose-form__upload-button'>
        <IconButton icon='paperclip' title={message} disabled={disabled} onClick={this.handleClick} className='compose-form__upload-button-icon' size={18} inverted style={iconStyle} />
        <label>
          <span style={{ display: 'none' }}>{message}</span>
          <input
            key={resetFileKey}
            ref={this.setRef}
            type='file'
            accept={acceptContentTypes.join(',')}
            onChange={this.handleChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    );
  }

}

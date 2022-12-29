import React from 'react';
import IconButton from '../../../components/icon_button';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  undo: { id: 'upload_form.undo', defaultMessage: 'Delete' },
});

const iconStyle = {
  height: null,
  lineHeight: '27px',
};

export default
@injectIntl
class DeleteButton extends ImmutablePureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    unavailable: PropTypes.bool,
    onUndoAll: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleClick = () => {
    this.props.onUndoAll();
  }

  render () {
    const { intl, unavailable, disabled } = this.props;

    if (unavailable) {
      return null;
    }

    const message = intl.formatMessage(messages.undo);

    return (
      <div className='compose-form__delete-button'>
        <IconButton icon='trash-o' title={message} disabled={disabled} onClick={this.handleClick} className='compose-form__delete-button-icon' size={18} inverted style={iconStyle} />
        <label>
          <span style={{ display: 'none' }}>{message}</span>
        </label>
      </div>
    );
  }

}

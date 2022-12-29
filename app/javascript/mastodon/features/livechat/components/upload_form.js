import React from 'react';
import UploadProgressContainer from '../containers/upload_progress_container';
import ImmutablePureComponent from 'react-immutable-pure-component';
import UploadContainer from '../containers/upload_container';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

export default class UploadForm extends ImmutablePureComponent {

  static propTypes = {
    thumbnail: PropTypes.string,
  };

  render () {
    return (
      <div className='compose-form__upload-wrapper'>
        <UploadProgressContainer icon='upload' message={<FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />} />
        <div className='compose-form__uploads-wrapper'>
          {this.props.thumbnail && <UploadContainer />}
        </div>
      </div>
    );
  }

}

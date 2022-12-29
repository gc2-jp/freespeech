import { connect } from 'react-redux';
import UploadButton from '../components/upload_button';
import { uploadCompose } from '../../../actions/livechat';

const mapStateToProps = state => ({
  disabled: state.getIn(['livechat', 'is_uploading']),
  unavailable: false,
  resetFileKey: state.getIn(['livechat', 'resetFileKey']),
});

const mapDispatchToProps = dispatch => ({

  onSelectFile (files) {
    dispatch(uploadCompose(files));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);

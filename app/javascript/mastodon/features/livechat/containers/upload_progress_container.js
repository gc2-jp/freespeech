import { connect } from 'react-redux';
import UploadProgress from '../components/upload_progress';

const mapStateToProps = state => ({
  active: state.getIn(['livechat', 'is_uploading']),
  progress: state.getIn(['livechat', 'progress']),
});

export default connect(mapStateToProps)(UploadProgress);

import { connect } from 'react-redux';
import UploadForm from '../components/upload_form';

const mapStateToProps = state => ({
  thumbnail: state.getIn(['livechat', 'thumbnail']),
});

export default connect(mapStateToProps)(UploadForm);

import { connect } from 'react-redux';
import Upload from '../components/upload';

const mapStateToProps = state => ({
  thumbnail: state.getIn(['livechat', 'thumbnail']),
});

export default connect(mapStateToProps)(Upload);

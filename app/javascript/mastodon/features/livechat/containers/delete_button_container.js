import { connect } from 'react-redux';
import DeleteButton from '../components/delete_button';
import { clearThumbnail } from '../../../actions/livechat';

const mapStateToProps = state => ({
  disabled: state.getIn(['livechat', 'is_uploading']),
  unavailable: false,
});

const mapDispatchToProps = dispatch => ({

  onUndoAll () {
    dispatch(clearThumbnail());
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteButton);
